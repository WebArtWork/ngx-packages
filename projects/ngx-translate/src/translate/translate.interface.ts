import { ProvideLanguageConfig } from '../language/language.interface';

export interface Translate {
	sourceText: string;
	text: string;
}

export type TranslateConfigTranslations = Record<string, Translate[]>;

export interface TranslateFileLoaderConfig {
	folder?: string;
	folders?: string[];
}

export interface TranslateExtraLoadOptions {
	language?: string;
	replace?: boolean;
	forceReload?: boolean;
}

export interface ProvideTranslateConfig extends TranslateFileLoaderConfig, ProvideLanguageConfig {
	translations?: TranslateConfigTranslations;
}
