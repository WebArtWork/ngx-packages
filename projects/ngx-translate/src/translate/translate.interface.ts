import { ProvideLanguageConfig } from '../language/language.interface';

export interface Translate {
	sourceText: string;
	text: string;
}

export type TranslateVars = Record<string, unknown>;

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

export type TranslateDirectiveConfig = Record<string, string>;

export type TranslateDirectiveValue = string | TranslateDirectiveConfig;

export interface ProvideTranslateConfig extends TranslateFileLoaderConfig, ProvideLanguageConfig {
	translations?: TranslateConfigTranslations;
}
