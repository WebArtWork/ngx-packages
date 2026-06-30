import { InjectionToken } from '@angular/core';
import { ThemeDensity, ThemeMode, ThemeRadius } from './theme.type';
import { ThemeTokens } from './theme.tokens';

export interface ThemeStorageKeys {
	mode: string;
	density: string;
	radius: string;
	index: string;
}

export interface ThemeConfig {
	mode?: ThemeMode;
	modes?: ThemeMode[];
	density?: ThemeDensity;
	densities?: ThemeDensity[];
	radius?: ThemeRadius;
	radiuses?: ThemeRadius[];
	persist?: boolean;
	storageKeys?: Partial<ThemeStorageKeys>;
	/** Token overrides applied regardless of mode, density, or radius */
	tokens?: ThemeTokens;
	/** Token overrides applied when mode is 'light' */
	lightTokens?: ThemeTokens;
	/** Token overrides applied when mode is 'dark' */
	darkTokens?: ThemeTokens;
	/** Token overrides applied when density is 'comfortable' */
	comfortableTokens?: ThemeTokens;
	/** Token overrides applied when density is 'compact' */
	compactTokens?: ThemeTokens;
	/** Token overrides applied when radius is 'rounded' */
	roundedTokens?: ThemeTokens;
	/** Token overrides applied when radius is 'square' */
	squareTokens?: ThemeTokens;
}

export const DEFAULT_THEME_STORAGE_KEYS: ThemeStorageKeys = {
	mode: 'theme.mode',
	density: 'theme.density',
	radius: 'theme.radius',
	index: 'theme.index',
};

export const DEFAULT_THEME_CONFIG: ThemeConfig = {
	mode: 'dark',
	modes: ['light', 'dark'],
	density: 'comfortable',
	densities: ['comfortable', 'compact'],
	radius: 'rounded',
	radiuses: ['rounded', 'square'],
	persist: true,
	storageKeys: DEFAULT_THEME_STORAGE_KEYS,
};

export const THEME_CONFIG = new InjectionToken<ThemeConfig>('THEME_CONFIG');
