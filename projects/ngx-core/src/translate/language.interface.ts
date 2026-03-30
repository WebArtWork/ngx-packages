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
}
