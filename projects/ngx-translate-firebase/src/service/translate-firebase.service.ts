import { isPlatformBrowser } from '@angular/common';
import { PLATFORM_ID, Service, computed, effect, inject, signal } from '@angular/core';
import { LanguageService, TranslateService } from '@wawjs/ngx-translate';
import {
	TRANSLATE_FIREBASE_CONFIG,
	TranslateFirebaseEntry,
	TranslateFirebaseFirestore,
} from './translate-firebase.interface';

const DEFAULT_COLLECTION = 'translations';

/**
 * CRUD for the custom translations in Firestore, and the glue that lays them over `TranslateService`.
 *
 * A custom text is applied with `TranslateService.setOne()`, which only touches its own key, so texts of
 * other keys (including the ones a page loads later with `loadExtraTranslations`) are left alone.
 */
@Service()
export class TranslateFirebaseService {
	private readonly _config = inject(TRANSLATE_FIREBASE_CONFIG);
	private readonly _translate = inject(TranslateService);
	private readonly _languageService = inject(LanguageService);
	private readonly _isBrowser = isPlatformBrowser(inject(PLATFORM_ID));

	/** All custom translations, sorted by source text. */
	readonly entries = signal<TranslateFirebaseEntry[]>([]);
	readonly isLoaded = signal(false);

	/** Texts of the translation files (without custom ones): language code, then source text. */
	readonly fileTexts = signal<Record<string, Record<string, string>>>({});

	/** Every key that exists in the translation files of any language, sorted. */
	readonly fileKeys = computed(() =>
		[...new Set(Object.values(this.fileTexts()).flatMap((texts) => Object.keys(texts)))].sort((a, b) =>
			a.localeCompare(b),
		),
	);

	private _loading?: Promise<void>;
	private _fileLoading?: Promise<void>;
	private _applyRun = 0;

	/** Source texts that currently carry a custom text, by language. */
	private readonly _overridden = new Map<string, Set<string>>();

	constructor() {
		effect(() => {
			const entries = this.entries();
			const language = this._languageService.language();

			if (!this.isLoaded() || !language) return;

			void this._apply(language, entries);
		});
	}

	/** Reads all custom translations once. Safe to call again; failures leave the list empty. */
	load(): Promise<void> {
		return (this._loading ??= this._read()
			.catch(() => undefined)
			.then(() => this.isLoaded.set(true)));
	}

	/** Reads the custom translations again. */
	reload(): Promise<void> {
		this._loading = undefined;

		return this.load();
	}

	/** Loads the texts of the translation files (and the configured folders) for every language. */
	loadFileTexts(): Promise<void> {
		return (this._fileLoading ??= this._readFileTexts().catch(() => {
			this._fileLoading = undefined;
		}));
	}

	/** What the translation files say for one key, per language code. */
	filesFor(sourceText: string): Record<string, string> {
		const result: Record<string, string> = {};

		for (const [language, texts] of Object.entries(this.fileTexts())) {
			if (texts[sourceText] !== undefined) result[language] = texts[sourceText];
		}

		return result;
	}

	async add(sourceText: string, translations: Record<string, string> = {}): Promise<void> {
		const text = sourceText.trim();

		if (!text || this.entries().some((entry) => entry.sourceText === text)) return;

		const fs = await this._firestore();
		const clean = this._clean(translations);
		const ref = await fs.addDoc(fs.collection(fs.db, this._collection), {
			sourceText: text,
			translations: clean,
		});

		this.entries.update((entries) =>
			this._sorted([...entries, { id: ref.id, sourceText: text, translations: clean }]),
		);
	}

	async save(entry: TranslateFirebaseEntry): Promise<void> {
		const fs = await this._firestore();
		const translations = this._clean(entry.translations);

		await fs.setDoc(fs.doc(fs.db, this._collection, entry.id), {
			sourceText: entry.sourceText,
			translations,
		});

		this.entries.update((entries) =>
			entries.map((item) => (item.id === entry.id ? { ...entry, translations } : item)),
		);
	}

	/** Adds the entry, or updates the one that already has this source text. */
	async upsert(sourceText: string, translations: Record<string, string>): Promise<void> {
		const text = sourceText.trim();
		const existing = this.entries().find((entry) => entry.sourceText === text);

		if (existing) {
			await this.save({ ...existing, translations });
		} else {
			await this.add(text, translations);
		}
	}

	async remove(id: string): Promise<void> {
		const fs = await this._firestore();

		await fs.deleteDoc(fs.doc(fs.db, this._collection, id));

		this.entries.update((entries) => entries.filter((entry) => entry.id !== id));
	}

	private get _collection(): string {
		return this._config.collection || DEFAULT_COLLECTION;
	}

	private async _firestore(): Promise<TranslateFirebaseFirestore> {
		await this._config.ready?.();

		return this._config.firestore();
	}

	private async _read(): Promise<void> {
		if (!this._isBrowser) return;

		const fs = await this._firestore();
		const snapshot = await fs.getDocs(fs.collection(fs.db, this._collection));
		const entries = snapshot.docs
			.map((item) => {
				const data = item.data() as Partial<TranslateFirebaseEntry>;

				return {
					id: item.id,
					sourceText: typeof data.sourceText === 'string' ? data.sourceText : '',
					translations:
						data.translations && typeof data.translations === 'object' ? data.translations : {},
				};
			})
			.filter((entry) => entry.sourceText);

		this.entries.set(this._sorted(entries));
	}

	private async _readFileTexts(): Promise<void> {
		const result: Record<string, Record<string, string>> = {};

		await Promise.all(
			this._languageService.languages().map(async (language) => {
				const items = await this._translate.getFileTranslations(language.code, {
					extraPaths: this._config.folders,
				});

				result[language.code] = Object.fromEntries(items.map((item) => [item.sourceText, item.text]));
			}),
		);

		this.fileTexts.set(result);
	}

	/** Lays the custom texts of one language over the translation files. */
	private async _apply(language: string, entries: TranslateFirebaseEntry[]): Promise<void> {
		const run = ++this._applyRun;

		// Same promise TranslateService.setLanguage() waits for, so its own apply runs first.
		await this._translate.loadTranslations(language);

		const files = new Map(
			(await this._translate.getFileTranslations(language, { extraPaths: this._config.folders })).map(
				(item) => [item.sourceText, item.text],
			),
		);

		// A newer change (another language, another edit) started while the files were loading.
		if (run !== this._applyRun) return;

		const custom = new Map<string, string>();

		for (const entry of entries) {
			const text = entry.translations[language]?.trim();

			if (text) custom.set(entry.sourceText, text);
		}

		// Custom texts that were removed fall back to the file text (or to the key itself).
		for (const key of this._overridden.get(language) ?? []) {
			if (!custom.has(key)) this._translate.setOne({ sourceText: key, text: files.get(key) ?? key });
		}

		for (const [sourceText, text] of custom) {
			this._translate.setOne({ sourceText, text });
		}

		this._overridden.set(language, new Set(custom.keys()));
	}

	private _clean(translations: Record<string, string>): Record<string, string> {
		return Object.fromEntries(Object.entries(translations).filter(([, text]) => text?.trim()));
	}

	private _sorted(entries: TranslateFirebaseEntry[]): TranslateFirebaseEntry[] {
		return [...entries].sort((a, b) => a.sourceText.localeCompare(b.sourceText));
	}
}
