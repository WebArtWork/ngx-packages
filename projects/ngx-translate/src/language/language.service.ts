import { isPlatformBrowser } from '@angular/common';
import { inject, Injectable, PLATFORM_ID, signal } from '@angular/core';
import { DEFAULT_LANGUAGES } from './language.const';
import { Language, LanguageInput, ProvideLanguageConfig } from './language.interface';

@Injectable({ providedIn: 'root' })
export class LanguageService {
	private readonly _isBrowser = isPlatformBrowser(inject(PLATFORM_ID));
	private static readonly _LANGUAGE_STORE_KEY = 'translate.language';

	private _language = signal('');
	private _defaultLanguage = signal('');
	private _languages = signal<Language[]>([...DEFAULT_LANGUAGES]);
	private _config: Required<Pick<ProvideLanguageConfig, 'persistLanguage'>> &
		Omit<ProvideLanguageConfig, 'persistLanguage'> = {
		persistLanguage: true,
	};

	async init(config: ProvideLanguageConfig = {}): Promise<void> {
		this._config = {
			...this._config,
			...config,
			persistLanguage: config.persistLanguage ?? this._config.persistLanguage,
		};

		this.setLanguages(config.languages ?? this._languages(), false);

		if (this._config.defaultLanguage) {
			this._defaultLanguage.set(this._normalizeCode(this._config.defaultLanguage));
		}

		const storedLanguage = this._config.persistLanguage ? this._getStoredLanguage() : null;

		const initialLanguage =
			this._config.language ||
			storedLanguage ||
			this._config.defaultLanguage ||
			this._languages()[0]?.code ||
			'';

		if (initialLanguage) {
			await this.setLanguage(initialLanguage);
		}
	}

	language(): string {
		return this._language();
	}

	defaultLanguage(): string {
		return this._defaultLanguage();
	}

	allLanguages(): Language[] {
		return DEFAULT_LANGUAGES.map(language => ({ ...language }));
	}

	languages(): Language[] {
		return this._languages().map(language => ({ ...language }));
	}

	getLanguage(code: string): Language | undefined {
		const normalizedCode = this._normalizeCode(code);

		return this._languages().find(language => language.code === normalizedCode);
	}

	hasLanguage(code: string): boolean {
		return !!this.getLanguage(code);
	}

	setLanguages(languages: readonly LanguageInput[], syncCurrentLanguage = true): void {
		const resolvedLanguages = this._resolveLanguages(languages);

		this._languages.set(resolvedLanguages.length ? resolvedLanguages : [...DEFAULT_LANGUAGES]);

		if (!syncCurrentLanguage) {
			return;
		}

		const currentLanguage = this._language();

		if (currentLanguage && this.hasLanguage(currentLanguage)) {
			return;
		}

		const fallbackLanguage =
			this._defaultLanguage() && this.hasLanguage(this._defaultLanguage())
				? this._defaultLanguage()
				: this._languages()[0]?.code || '';

		if (fallbackLanguage) {
			void this.setLanguage(fallbackLanguage);
		}
	}

	async setLanguage(code: string): Promise<boolean> {
		const normalizedCode = this._normalizeCode(code);

		if (!normalizedCode || !this.hasLanguage(normalizedCode)) {
			return false;
		}

		this._language.set(normalizedCode);

		if (this._config.persistLanguage) {
			this._setStoredLanguage(normalizedCode);
		}

		return true;
	}

	private _resolveLanguages(languages: readonly LanguageInput[]): Language[] {
		const resolved = new Map<string, Language>();

		for (const language of languages) {
			const normalizedLanguage = this._resolveLanguage(language);

			if (!normalizedLanguage) {
				continue;
			}

			resolved.set(normalizedLanguage.code, normalizedLanguage);
		}

		return Array.from(resolved.values());
	}

	private _resolveLanguage(language: LanguageInput): Language | null {
		if (typeof language === 'string') {
			const normalizedCode = this._normalizeCode(language);
			const knownLanguage = DEFAULT_LANGUAGES.find(item => item.code === normalizedCode);

			return knownLanguage ? { ...knownLanguage } : null;
		}

		const normalizedCode = this._normalizeCode(language.code);

		if (!normalizedCode) {
			return null;
		}

		const knownLanguage = DEFAULT_LANGUAGES.find(item => item.code === normalizedCode);

		return {
			...(knownLanguage || {}),
			...language,
			code: normalizedCode,
		};
	}

	private _normalizeCode(code: string): string {
		return (code || '').trim().toLowerCase();
	}

	private _getStoredLanguage(): string | null {
		if (!this._isBrowser) {
			return null;
		}

		try {
			return localStorage.getItem(LanguageService._LANGUAGE_STORE_KEY);
		} catch (error) {
			console.warn('[ngx-translate:language] Failed to read persisted language.', error);
			return null;
		}
	}

	private _setStoredLanguage(language: string): void {
		if (!this._isBrowser) {
			return;
		}

		try {
			localStorage.setItem(LanguageService._LANGUAGE_STORE_KEY, language);
		} catch (error) {
			console.warn('[ngx-translate:language] Failed to persist language.', error);
		}
	}
}
