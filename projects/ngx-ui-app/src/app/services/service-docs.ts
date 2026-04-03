export interface ServiceMethodDoc {
	name: string;
	signature: string;
	description: string;
	details?: string[];
	example?: string;
	category?: string;
	docType?: 'Service' | 'Component' | 'Interface' | 'Type' | 'Const';
	sourceFile?: string;
}

export interface ServiceSectionDoc {
	title: string;
	items: string[];
	example?: string;
}

export interface ServiceDoc {
	slug: string;
	name: string;
	description: string;
	summary: string;
	highlights: string[];
	config?: string[];
	availableItems?: string[];
	properties?: ServiceMethodDoc[];
	methods: ServiceMethodDoc[];
	sections?: ServiceSectionDoc[];
	code: string;
}

export const serviceDocs: ServiceDoc[] = [
	{
		slug: 'theme-service',
		name: 'ThemeService',
		description:
			'SSR-safe theme state for mode, density, and radius with provider-based initialization.',
		summary:
			'ThemeService owns document-level appearance state for Angular applications. It persists values in localStorage when available, applies data attributes to the html element in the browser, and exposes Angular signals for mode, density, radius, and the active combination index.',
		highlights: [
			'Initializes once through provideTheme() so components do not need to call init() manually.',
			'Applies data-mode, data-density, and data-radius on the document root in the browser.',
			'Persists selected values to localStorage and restores them on the next visit.',
		],
		config: [
			'Use provideTheme() once in application providers.',
			'Default values are dark mode, comfortable density, and rounded radius.',
			'Use html[data-mode], html[data-density], and html[data-radius] selectors in app styles.',
		],
		availableItems: ['provide-theme.ts', 'theme.service.ts', 'theme.type.ts'],
		properties: [
			{
				name: 'mode / density / radius',
				signature: 'signals for current theme state',
				description:
					'Reactive values that expose the active mode, spacing density, and radius style.',
				category: 'State',
				sourceFile: 'theme.service.ts',
			},
			{
				name: 'modes / densities / radiuses',
				signature: 'signals for supported option lists',
				description:
					'Available values used by setMode(), setDensity(), setRadius(), and nextTheme().',
				category: 'State',
				sourceFile: 'theme.service.ts',
			},
			{
				name: 'themeIndex',
				signature: 'Signal<number>',
				description:
					'Linear index for the current mode/density/radius combination used by nextTheme().',
				category: 'State',
				sourceFile: 'theme.service.ts',
			},
			{
				name: 'ThemeMode / ThemeDensity / ThemeRadius',
				signature: 'theme option types',
				description:
					'Type aliases that describe supported mode, density, and radius values.',
				category: 'Types',
				docType: 'Type',
				sourceFile: 'theme.type.ts',
			},
		],
		methods: [
			{
				name: 'provideTheme',
				signature: 'provideTheme(): EnvironmentProviders',
				description:
					'Registers an environment initializer that injects ThemeService and runs init() during app bootstrap.',
				category: 'Providers',
				sourceFile: 'provide-theme.ts',
				example: `import { provideTheme } from 'ngx-ui';

export const appConfig = {
\tproviders: [provideTheme()],
};`,
			},
			{
				name: 'setMode',
				signature: "setMode(mode: 'light' | 'dark'): void",
				description:
					'Updates the mode signal, html data-mode attribute, and persisted localStorage value.',
				category: 'State',
				sourceFile: 'theme.service.ts',
			},
			{
				name: 'setDensity',
				signature: "setDensity(density: 'comfortable' | 'compact'): void",
				description:
					'Updates the density signal, html data-density attribute, and persisted localStorage value.',
				category: 'State',
				sourceFile: 'theme.service.ts',
			},
			{
				name: 'setRadius',
				signature: "setRadius(radius: 'rounded' | 'square'): void",
				description:
					'Updates the radius signal, html data-radius attribute, and persisted localStorage value.',
				category: 'State',
				sourceFile: 'theme.service.ts',
			},
			{
				name: 'nextTheme',
				signature: 'nextTheme(): void',
				description:
					'Cycles through every mode, density, and radius combination and persists the resulting themeIndex.',
				category: 'State',
				sourceFile: 'theme.service.ts',
			},
			{
				name: 'init',
				signature: 'init(): void',
				description:
					'Loads persisted values and applies them to the document root when the app runs in the browser.',
				details: [
					'Fallback mode is dark when theme.mode is missing.',
					'Fallback density is comfortable and fallback radius is rounded.',
				],
				category: 'Lifecycle',
				sourceFile: 'theme.service.ts',
			},
			{
				name: 'Theme toggle example',
				signature: 'component usage',
				description:
					'Switch between light and dark modes by reading the current signal and calling setMode().',
				category: 'Usage',
				sourceFile: 'theme.service.ts',
				example: `import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { ThemeService } from 'ngx-ui';

@Component({
\tselector: 'app-theme-toggle',
\ttemplate: '<button type="button" (click)=\"toggleTheme()\">Toggle theme</button>',
\tchangeDetection: ChangeDetectionStrategy.OnPush,
})
export class ThemeToggleComponent {
\treadonly themeService = inject(ThemeService);

\ttoggleTheme() {
\t\tconst nextMode = this.themeService.mode() === 'light' ? 'dark' : 'light';
\t\tthis.themeService.setMode(nextMode);
\t}
}`,
			},
			{
				name: 'Early mode script',
				signature: 'small head script before Angular bootstraps',
				description:
					'Prevents initial theme blink by applying the saved mode before the Angular app renders.',
				category: 'Usage',
				example: `<script>
\t(() => {
\t\ttry {
\t\t\tconst mode = localStorage.getItem('theme.mode') || 'dark';
\t\t\tdocument.documentElement.dataset.mode = mode;
\t\t} catch {
\t\t\tdocument.documentElement.dataset.mode = 'dark';
\t\t}
\t})();
</script>`,
			},
		],
		sections: [
			{
				title: 'Feature role',
				items: [
					'ThemeService owns appearance state instead of duplicating localStorage and document dataset logic in components.',
					'provideTheme() keeps initialization close to bootstrap and consistent with standalone Angular apps.',
					'The feature is SSR-safe because document writes and storage access are guarded behind browser checks.',
				],
			},
			{
				title: 'CSS integration',
				items: [
					'Use html[data-mode="light"] and html[data-mode="dark"] for top-level CSS variables.',
					'Use density and radius data attributes to tune spacing and corner systems globally.',
					'Pair the feature with app-specific CSS variables rather than hard-coding colors in components.',
				],
			},
		],
		code: `import { ThemeService, provideTheme } from 'ngx-ui';

export const appConfig = {
\tproviders: [provideTheme()],
};

readonly themeService = inject(ThemeService);

toggleTheme() {
\tconst nextMode = this.themeService.mode() === 'light' ? 'dark' : 'light';
\tthis.themeService.setMode(nextMode);
}`,
	},
];

export const serviceDocMap = new Map(serviceDocs.map(doc => [doc.slug, doc]));
