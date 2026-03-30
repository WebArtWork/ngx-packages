import { ProvideLanguageConfig } from './language.interface';

export interface Translate {
	sourceText: string;
	text: string;
}

export type TranslateConfigTranslations = Record<string, Translate[]>;

export interface TranslateFileLoaderConfig {
	folder?: string;
}

export interface ProvideTranslateConfig extends TranslateFileLoaderConfig, ProvideLanguageConfig {
	translations?: TranslateConfigTranslations;
}
