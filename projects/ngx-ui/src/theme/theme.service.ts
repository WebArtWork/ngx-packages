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

/** `id` of the `<style>` element that holds the package default tokens. */
const THEME_DEFAULTS_STYLE_ID = 'wtheme-defaults';

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

	/** CSS variables this service has written inline, so stale ones can be removed. */
	private _appliedVars = new Set<string>();

	/**
	 * Writes the package defaults for the current mode/density/radius into a zero-specificity
	 * `<style>` element, and the tokens passed through `provideNgxUi({...})` to
	 * document.documentElement as inline CSS custom properties.
	 *
	 * The defaults are not written inline: an inline copy would override the app's own stylesheet
	 * (for example `src/styles/_theme.scss`). Under `:where(:root)` every app rule wins, and apps
	 * without any token stylesheet still get them. Inline style on :root is still overridable per
	 * element:
	 *   .my-section { --c-primary: hotpink; }
	 */
	private _applyCurrentTokens(): void {
		if (!this._isBrowser) return;

		const mode = this.mode();
		const density = this.density();
		const radius = this.radius();

		this._writeDefaultTokens({
			// static (font, motion), then mode colors, density spacing and radius defaults
			...DEFAULT_STATIC_TOKENS,
			...(mode === 'light' ? DEFAULT_LIGHT_TOKENS : DEFAULT_DARK_TOKENS),
			...(density === 'compact' ? DEFAULT_COMPACT_TOKENS : DEFAULT_COMFORTABLE_TOKENS),
			...(radius === 'square' ? DEFAULT_SQUARE_TOKENS : DEFAULT_ROUNDED_TOKENS),
		});

		const configured: ThemeTokens = {
			// 1. global config overrides
			...(this._config.tokens ?? {}),
			// 2. mode-specific config overrides
			...(mode === 'light' ? (this._config.lightTokens ?? {}) : (this._config.darkTokens ?? {})),
			// 3. density-specific config overrides
			...(density === 'compact'
				? (this._config.compactTokens ?? {})
				: (this._config.comfortableTokens ?? {})),
			// 4. radius-specific config overrides
			...(radius === 'square'
				? (this._config.squareTokens ?? {})
				: (this._config.roundedTokens ?? {})),
		};

		const root = this._doc.documentElement;
		const nextVars = new Set<string>();

		for (const key of Object.keys(configured) as Array<keyof ThemeTokens>) {
			const cssVar = TOKEN_VAR_MAP[key];
			const value = configured[key];
			if (cssVar && value !== undefined) {
				root.style.setProperty(cssVar, value);
				nextVars.add(cssVar);
			}
		}

		// A token configured only for the previous mode/density/radius falls back to the stylesheets.
		for (const cssVar of this._appliedVars) {
			if (!nextVars.has(cssVar)) {
				root.style.removeProperty(cssVar);
			}
		}
		this._appliedVars = nextVars;
	}

	/**
	 * Puts the package defaults into `<style id="wtheme-defaults">` at the start of <head>. The
	 * `:where(:root)` selector has zero specificity, so any `:root`, `html` or `[data-mode]` rule
	 * from the app or `@wawjs/ngx-ui/styles.css` overrides it.
	 */
	private _writeDefaultTokens(tokens: ThemeTokens): void {
		const head = this._doc.head;
		if (!head) return;

		let style = this._doc.getElementById(THEME_DEFAULTS_STYLE_ID) as HTMLStyleElement | null;
		if (!style) {
			style = this._doc.createElement('style');
			style.id = THEME_DEFAULTS_STYLE_ID;
			head.insertBefore(style, head.firstChild);
		}

		const declarations: string[] = [];
		for (const key of Object.keys(tokens) as Array<keyof ThemeTokens>) {
			const cssVar = TOKEN_VAR_MAP[key];
			const value = tokens[key];
			if (cssVar && value !== undefined) {
				declarations.push(`${cssVar}:${value}`);
			}
		}

		style.textContent = `:where(:root){${declarations.join(';')}}`;
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
