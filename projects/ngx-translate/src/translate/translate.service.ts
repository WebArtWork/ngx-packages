import { isPlatformBrowser } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { inject, Injectable, PLATFORM_ID, signal, WritableSignal } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { LanguageService } from '../language/language.service';
import {
	ProvideTranslateConfig,
	Translate,
	TranslateExtraLoadOptions,
} from './translate.interface';
import { Translates } from './translate.type';

@Injectable({ providedIn: 'root' })
export class TranslateService {
	private static readonly _DEFAULT_FOLDER = '/i18n/';

	private _http = inject(HttpClient);
	private readonly _isBrowser = isPlatformBrowser(inject(PLATFORM_ID));
	private _languageService = inject(LanguageService);
	readonly language = this._languageService.language;
	readonly defaultLanguage = this._languageService.defaultLanguage;
	private _config: Required<Pick<ProvideTranslateConfig, 'folder' | 'persistLanguage'>> &
		Omit<ProvideTranslateConfig, 'folder' | 'persistLanguage'> = {
		folder: TranslateService._DEFAULT_FOLDER,
		folders: [],
		persistLanguage: true,
	};
	private _translationsByLanguage = new Map<string, Translate[]>();
	private _loadingByLanguage = new Map<string, Promise<Translate[]>>();
	private _extraTranslationsByLanguageAndUrl = new Map<string, Map<string, Translate[]>>();

	/**
	 * Internal registry of translation signals.
	 *
	 * Each key (sourceText) maps to a WritableSignal<string>
	 * that always holds the current translated value.
	 *
	 * Example:
	 * {
	 *   "Hello": signal("Hola"),
	 *   "Save": signal("Guardar")
	 * }
	 */
	private _signalTranslates: Translates = {};

	constructor() {}

	async init(config: ProvideTranslateConfig = {}): Promise<void> {
		this._config = {
			...this._config,
			...config,
			folder: this._normalizeFolder(config.folder ?? this._config.folder),
			folders: this._normalizeFolders(config.folders ?? this._config.folders),
			persistLanguage: config.persistLanguage ?? this._config.persistLanguage,
		};

		await this._languageService.init({
			language: this._config.language,
			defaultLanguage: this._config.defaultLanguage,
			languages: this._config.languages,
			persistLanguage: this._config.persistLanguage,
		});

		const initialLanguage = this._languageService.language();

		if (initialLanguage) {
			await this.setLanguage(initialLanguage);
		}
	}

	async setLanguage(language: string): Promise<void> {
		const hasBeenSet = await this._languageService.setLanguage(language);

		if (!hasBeenSet) {
			return;
		}

		const nextLanguage = this._languageService.language();

		const translations = await this.loadTranslations(nextLanguage);

		this._applyTranslations(translations);
	}

	async loadTranslations(language: string): Promise<Translate[]> {
		const normalizedLanguage = (language || '').trim();

		if (!normalizedLanguage) {
			return [];
		}

		const cached = this._translationsByLanguage.get(normalizedLanguage);

		if (cached) {
			return [...cached];
		}

		const existingLoad = this._loadingByLanguage.get(normalizedLanguage);

		if (existingLoad) {
			return existingLoad;
		}

		const loadPromise = this._loadLanguageInternal(normalizedLanguage).finally(() => {
			this._loadingByLanguage.delete(normalizedLanguage);
		});

		this._loadingByLanguage.set(normalizedLanguage, loadPromise);

		return loadPromise;
	}

	async loadExtraTranslations(
		paths: string[],
		options: TranslateExtraLoadOptions = {},
	): Promise<Translate[]> {
		const language = (options.language || this._languageService.language() || '').trim();

		if (!language) {
			return [];
		}

		const baseTranslations = options.replace
			? []
			: (this._translationsByLanguage.get(language) || []).map(translation => ({ ...translation }));

		if (!this._isBrowser || !Array.isArray(paths) || !paths.length) {
			this._translationsByLanguage.set(language, [...baseTranslations]);

			if (this._languageService.language() === language) {
				this._applyTranslations(baseTranslations);
			}

			return [...baseTranslations];
		}

		const resolvedUrls = paths
			.map(path => this._resolveExtraPath(path, language))
			.filter(path => !!path);
		const loaded = await this._loadExtraTranslationsFromUrls(
			Array.from(new Set(resolvedUrls)),
			language,
			options.forceReload === true,
		);
		const merged = this._mergeTranslations(baseTranslations, loaded);

		this._translationsByLanguage.set(language, merged.map(translation => ({ ...translation })));

		if (this._languageService.language() === language) {
			this._applyTranslations(merged);
		}

		return [...merged];
	}

	async loadExtraTranslation(
		path: string,
		options: TranslateExtraLoadOptions = {},
	): Promise<Translate[]> {
		return this.loadExtraTranslations([path], options);
	}

	/**
	 * Returns a reactive translation signal for the given source text.
	 *
	 * If a signal for this key does not exist yet,
	 * it is lazily created with the source text as its initial value.
	 *
	 * This ensures:
	 * - The UI immediately renders the original text.
	 * - When translations are later loaded, the signal updates automatically.
	 *
	 * @param text - The source text used as the translation key.
	 * @returns A WritableSignal<string> containing the translated value.
	 */
	translate(text: string): WritableSignal<string> {
		if (!this._signalTranslates[text]) {
			const language = this._languageService.language();
			const currentTranslation = language
				? this._translationsByLanguage
						.get(language)
						?.find(translation => translation.sourceText === text)?.text
				: undefined;

			this._signalTranslates[text] = signal(currentTranslation || text);
		}

		return this._signalTranslates[text];
	}

	/**
	 * Replaces translations in bulk.
	 *
	 * Behavior:
	 * 1. Any existing signal not present in the new translations
	 *    is reset to its original source text (fallback behavior).
	 * 2. Provided translations update their corresponding signals.
	 *
	 * This is typically used when switching language.
	 *
	 * Important:
	 * Signals must already exist (created via `translate()`)
	 * before calling this method.
	 *
	 * @param translations - Array of translation objects
	 * containing sourceText and translated text.
	 */
	setMany(translations: Translate[]) {
		this._applyTranslations(translations);

		const language = this._languageService.language();

		if (language) {
			this._translationsByLanguage.set(
				language,
				translations.map(translation => ({ ...translation })),
			);
		}
	}

	/**
	 * Updates a single translation entry.
	 *
	 * This method updates the existing signal for a given source text.
	 * Typically used for dynamic or incremental translation updates.
	 *
	 * Important:
	 * The signal must already exist (created via `translate()`),
	 * otherwise this will throw an error.
	 *
	 * @param translation - Translate object containing
	 * sourceText and translated text.
	 */
	setOne(translation: Translate) {
		this._setTranslation(translation.sourceText, translation.text);

		const language = this._languageService.language();

		if (!language) {
			return;
		}

		const currentTranslations = this._translationsByLanguage.get(language) || [];
		const existingIndex = currentTranslations.findIndex(
			item => item.sourceText === translation.sourceText,
		);

		if (existingIndex >= 0) {
			currentTranslations[existingIndex] = { ...translation };
		} else {
			currentTranslations.push({ ...translation });
		}

		this._translationsByLanguage.set(language, currentTranslations);
	}

	/**
	 * Returns the internal translation signal registry.
	 *
	 * Useful for debugging, inspection, or tooling.
	 *
	 * @returns A record mapping sourceText keys to WritableSignal<string>.
	 */
	get(): Translates {
		return this._signalTranslates;
	}

	private _applyTranslations(translations: Translate[]) {
		const sourceSet = new Set(translations.map(translation => translation.sourceText));

		for (const sourceText in this._signalTranslates) {
			if (!sourceSet.has(sourceText)) {
				this._signalTranslates[sourceText].set(sourceText);
			}
		}

		for (const translation of translations) {
			this._setTranslation(translation.sourceText, translation.text);
		}
	}

	private async _loadLanguageInternal(language: string): Promise<Translate[]> {
		const inlineTranslations = this._config.translations?.[language];
		const fileUrls = this._createLanguageUrls(language);
		const fileTranslations = this._isBrowser
			? await this._loadTranslationsFromUrls(fileUrls, language)
			: [];
		const mergedWithFiles = this._mergeTranslations([], fileTranslations);
		const normalizedInline = Array.isArray(inlineTranslations)
			? inlineTranslations.map(translation => ({ ...translation }))
			: [];
		const merged = this._mergeTranslations(mergedWithFiles, normalizedInline);

		this._translationsByLanguage.set(language, merged.map(translation => ({ ...translation })));

		return [...merged];
	}

	private _createLanguageUrls(language: string): string[] {
		const urls: string[] = [];

		if (this._config.folder) {
			urls.push(`${this._normalizeFolder(this._config.folder)}${language}.json`);
		}

		for (const folder of this._config.folders || []) {
			urls.push(`${this._normalizeFolder(folder)}${language}.json`);
		}

		return Array.from(new Set(urls));
	}

	private async _loadTranslationsFromUrls(urls: string[], language: string): Promise<Translate[]> {
		if (!urls.length) {
			return [];
		}

		const payloadsByUrl = await this._loadTranslationPayloadsByUrl(urls, language);
		const translations: Translate[] = [];

		for (let i = 0; i < urls.length; i++) {
			const url = urls[i];
			translations.push(...(payloadsByUrl.get(url) || []));
		}

		return translations;
	}

	private async _loadExtraTranslationsFromUrls(
		urls: string[],
		language: string,
		forceReload: boolean,
	): Promise<Translate[]> {
		if (!urls.length) {
			return [];
		}

		const cacheByUrl = this._getExtraTranslationsCacheByUrl(language);
		const urlsToFetch = forceReload ? [...urls] : urls.filter(url => !cacheByUrl.has(url));

		if (urlsToFetch.length) {
			const loadedByUrl = await this._loadTranslationPayloadsByUrl(urlsToFetch, language);

			for (const [url, translations] of loadedByUrl.entries()) {
				cacheByUrl.set(url, translations.map(translation => ({ ...translation })));
			}
		}

		const translations: Translate[] = [];

		for (const url of urls) {
			translations.push(...(cacheByUrl.get(url) || []));
		}

		return translations;
	}

	private async _loadTranslationPayloadsByUrl(
		urls: string[],
		language: string,
	): Promise<Map<string, Translate[]>> {
		const results = await Promise.allSettled(
			urls.map(url => firstValueFrom(this._http.get<Record<string, string>>(url))),
		);
		const payloadsByUrl = new Map<string, Translate[]>();

		for (let i = 0; i < results.length; i++) {
			const result = results[i];
			const url = urls[i];

			if (result.status === 'fulfilled') {
				payloadsByUrl.set(url, this._mapJsonToTranslations(result.value || {}));
			} else {
				console.warn(
					`[ngx-translate:translate] Failed to load translations for "${language}" from "${url}".`,
					result.reason,
				);
				payloadsByUrl.set(url, []);
			}
		}

		return payloadsByUrl;
	}

	private _getExtraTranslationsCacheByUrl(language: string): Map<string, Translate[]> {
		let byUrl = this._extraTranslationsByLanguageAndUrl.get(language);

		if (!byUrl) {
			byUrl = new Map<string, Translate[]>();
			this._extraTranslationsByLanguageAndUrl.set(language, byUrl);
		}

		return byUrl;
	}

	private _mergeTranslations(base: Translate[], extra: Translate[]): Translate[] {
		const map = new Map<string, string>();

		for (const translation of base) {
			map.set(translation.sourceText, translation.text);
		}

		for (const translation of extra) {
			map.set(translation.sourceText, translation.text);
		}

		const merged: Translate[] = [];

		for (const [sourceText, text] of map.entries()) {
			merged.push({ sourceText, text });
		}

		return merged;
	}

	private _mapJsonToTranslations(payload: Record<string, string>): Translate[] {
		const translations: Translate[] = [];

		for (const sourceText in payload) {
			translations.push({
				sourceText,
				text: payload[sourceText],
			});
		}

		return translations;
	}

	private _normalizeFolder(folder: string): string {
		const normalized = (folder || '').trim();

		if (!normalized) {
			return TranslateService._DEFAULT_FOLDER;
		}

		return normalized.endsWith('/') ? normalized : `${normalized}/`;
	}

	private _normalizeFolders(folders?: string[]): string[] {
		if (!Array.isArray(folders)) {
			return [];
		}

		const normalized: string[] = [];

		for (const folder of folders) {
			const next = (folder || '').trim();

			if (!next) {
				continue;
			}

			normalized.push(this._normalizeFolder(next));
		}

		return Array.from(new Set(normalized));
	}

	private _resolveExtraPath(path: string, language: string): string {
		const resolved = this._resolveLanguageInPath(path, language).trim();

		if (!resolved) {
			return '';
		}

		if (resolved.endsWith('.json')) {
			return resolved;
		}

		const folder = this._normalizeFolder(resolved);

		return `${folder}${language}.json`;
	}

	private _resolveLanguageInPath(path: string, language: string): string {
		return (path || '')
			.replace(/\{\s*language\s*\}/g, language)
			.replace(/:language\b/g, language);
	}

	private _setTranslation(sourceText: string, text: string) {
		if (!this._signalTranslates[sourceText]) {
			this._signalTranslates[sourceText] = signal(sourceText);
		}

		this._signalTranslates[sourceText].set(text);
	}
}
