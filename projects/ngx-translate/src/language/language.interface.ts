import { LanguageDetector } from './language-detector';

export interface Language {
	code: string;
	name: string;
	nativeName?: string;
}

export type LanguageInput = string | Language;

export interface ProvideLanguageConfig {
	language?: string;
	defaultLanguage?: string;
	languages?: readonly LanguageInput[];
	persistLanguage?: boolean;
	/**
	 * Auto-detects the initial language from device/browser signals when no
	 * explicit `language` and no persisted language are available.
	 *
	 * - `true` uses the default detector order: `['browser', 'timezone']`.
	 * - Pass an explicit array to control order/inclusion, mixing built-in
	 *   detector names with custom detector functions.
	 * - A detected code is only used if it matches a configured language.
	 *
	 * Defaults to `false` (disabled).
	 */
	detectLanguage?: boolean | readonly LanguageDetector[];
}
