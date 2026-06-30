import { DOCUMENT, isPlatformBrowser } from '@angular/common';
import { PLATFORM_ID, Service, inject, signal } from '@angular/core';
import {
	DEFAULT_THEME_CONFIG,
	DEFAULT_THEME_STORAGE_KEYS,
	THEME_CONFIG,
	ThemeConfig,
	ThemeStorageKeys,
} from './theme.interface';
import {
	DEFAULT_COMFORTABLE_TOKENS,
	DEFAULT_COMPACT_TOKENS,
	DEFAULT_DARK_TOKENS,
	DEFAULT_LIGHT_TOKENS,
	DEFAULT_ROUNDED_TOKENS,
	DEFAULT_SQUARE_TOKENS,
	DEFAULT_STATIC_TOKENS,
	TOKEN_VAR_MAP,
	ThemeTokens,
} from './theme.tokens';
import { ThemeDensity, ThemeMode, ThemeRadius } from './theme.type';

@Service()
export class ThemeService {
	private readonly _doc = inject(DOCUMENT);
	private readonly _isBrowser = isPlatformBrowser(inject(PLATFORM_ID));
	private readonly _config = this._resolveConfig(
		inject<ThemeConfig | null>(THEME_CONFIG, { optional: true }),
	);

	mode = signal<ThemeMode | undefined>(undefined);
	modes = signal<ThemeMode[]>(this._config.modes || []);
	setMode(mode: ThemeMode) {
		if (this._isBrowser) {
			this._doc.documentElement.dataset['mode'] = mode;

			if (this._config.persist) {
				localStorage.setItem(this._config.storageKeys.mode, mode);
			}
		}
		this.mode.set(mode);
		this._applyCurrentTokens();
	}

	density = signal<ThemeDensity | undefined>(undefined);
	densities = signal<ThemeDensity[]>(this._config.densities || []);
	setDensity(density: ThemeDensity) {
		if (this._isBrowser) {
			this._doc.documentElement.dataset['density'] = density;

			if (this._config.persist) {
				localStorage.setItem(this._config.storageKeys.density, density);
			}
		}
		this.density.set(density);
		this._applyCurrentTokens();
	}

	radius = signal<ThemeRadius | undefined>(undefined);
	radiuses = signal<ThemeRadius[]>(this._config.radiuses || []);
	setRadius(radius: ThemeRadius) {
		if (this._isBrowser) {
			this._doc.documentElement.dataset['radius'] = radius;

			if (this._config.persist) {
				localStorage.setItem(this._config.storageKeys.radius, radius);
			}
		}
		this.radius.set(radius);
		this._applyCurrentTokens();
	}

	themeIndex = signal<number>(0);
	nextTheme() {
		const modes = this.modes().length;
		const densities = this.densities().length;
		const radiuses = this.radiuses().length;

		const maxIndex = modes * densities * radiuses;

		const nextIndex = (this.themeIndex() + 1) % maxIndex;
		this.themeIndex.set(nextIndex);

		const block = densities * radiuses;

		const modeIndex = Math.floor(nextIndex / block);
		const rem = nextIndex % block;
		const densityIndex = Math.floor(rem / radiuses);
		const radiusIndex = rem % radiuses;

		this.setMode(this.modes()[modeIndex] as ThemeMode);
		this.setDensity(this.densities()[densityIndex] as ThemeDensity);
		this.setRadius(this.radiuses()[radiusIndex] as ThemeRadius);

		if (this._isBrowser && this._config.persist) {
			localStorage.setItem(this._config.storageKeys.index, String(nextIndex));
		}
	}

	init() {
		const mode =
			this._isBrowser && this._config.persist
				? (localStorage.getItem(this._config.storageKeys.mode) as ThemeMode) ||
					this._config.mode
				: this._config.mode;
		const density =
			this._isBrowser && this._config.persist
				? (localStorage.getItem(this._config.storageKeys.density) as ThemeDensity) ||
					this._config.density
				: this._config.density;
		const radius =
			this._isBrowser && this._config.persist
				? (localStorage.getItem(this._config.storageKeys.radius) as ThemeRadius) ||
					this._config.radius
				: this._config.radius;

		this.mode.set(mode);
		this.density.set(density);
		this.radius.set(radius);

		this.themeIndex.set(
			this._isBrowser && this._config.persist
				? Number(localStorage.getItem(this._config.storageKeys.index)) || 0
				: 0,
		);

		if (this._isBrowser) {
			this._doc.documentElement.dataset['mode'] = mode;
			this._doc.documentElement.dataset['density'] = density;
			this._doc.documentElement.dataset['radius'] = radius;
		}

		this._applyCurrentTokens();
	}

	/**
	 * Merges default tokens with any config overrides and writes them to
	 * document.documentElement as inline CSS custom properties.
	 * Inline style on :root is overridable per-element via normal CSS:
	 *   .my-section { --c-primary: hotpink; }
	 */
	private _applyCurrentTokens(): void {
		if (!this._isBrowser) return;

		const mode = this.mode();
		const density = this.density();
		const radius = this.radius();

		const merged: ThemeTokens = {
			// 1. static (font, motion) — never change
			...DEFAULT_STATIC_TOKENS,
			// 2. mode color defaults
			...(mode === 'light' ? DEFAULT_LIGHT_TOKENS : DEFAULT_DARK_TOKENS),
			// 3. density spacing defaults
			...(density === 'compact' ? DEFAULT_COMPACT_TOKENS : DEFAULT_COMFORTABLE_TOKENS),
			// 4. radius defaults
			...(radius === 'square' ? DEFAULT_SQUARE_TOKENS : DEFAULT_ROUNDED_TOKENS),
			// 5. global config overrides (highest base priority)
			...(this._config.tokens ?? {}),
			// 6. mode-specific config overrides
			...(mode === 'light' ? (this._config.lightTokens ?? {}) : (this._config.darkTokens ?? {})),
			// 7. density-specific config overrides
			...(density === 'compact'
				? (this._config.compactTokens ?? {})
				: (this._config.comfortableTokens ?? {})),
			// 8. radius-specific config overrides
			...(radius === 'square'
				? (this._config.squareTokens ?? {})
				: (this._config.roundedTokens ?? {})),
		};

		const root = this._doc.documentElement;
		for (const key of Object.keys(merged) as Array<keyof ThemeTokens>) {
			const cssVar = TOKEN_VAR_MAP[key];
			const value = merged[key];
			if (cssVar && value !== undefined) {
				root.style.setProperty(cssVar, value);
			}
		}
	}

	private _resolveConfig(config: ThemeConfig | null): Required<ThemeConfig> & {
		storageKeys: ThemeStorageKeys;
	} {
		return {
			...DEFAULT_THEME_CONFIG,
			...(config || {}),
			storageKeys: {
				...DEFAULT_THEME_STORAGE_KEYS,
				...(DEFAULT_THEME_CONFIG.storageKeys || {}),
				...(config?.storageKeys || {}),
			},
		} as Required<ThemeConfig> & { storageKeys: ThemeStorageKeys };
	}
}
