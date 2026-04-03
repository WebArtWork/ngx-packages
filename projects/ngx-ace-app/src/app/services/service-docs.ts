export interface ServiceMethodDoc {
	name: string;
	signature: string;
	description: string;
	details?: string[];
	example?: string;
	category?: string;
	docType?: 'Service' | 'Component' | 'Interface' | 'Type' | 'Const' | 'Directive';
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
		slug: 'ace',
		name: 'Ace',
		description:
			'Angular Ace editor feature with standalone providers, lazy mode/theme loading, and SSR-safe runtime setup.',
		summary:
			'ngx-ace wraps Ace in a focused Angular package. The component gives you signal-based inputs and two-way value binding, the directive exposes the raw editor instance when needed, and the loader keeps browser-only setup away from SSR.',
		highlights: [
			'Standalone bootstrap through provideNgxAce() for shared editor defaults.',
			'Lazy loading for Ace core, modes, and themes through ensureAce() and registration helpers.',
			'Browser-only initialization guarded with isPlatformBrowser() so server rendering remains safe.',
		],
		config: [
			'Use provideNgxAce() to register package-wide defaults such as mode, theme, worker usage, and renderer options.',
			'Mode and theme inputs accept either bare names like javascript/github or Ace paths like ace/mode/javascript.',
			'The directive forces useWorker = false unless explicitly enabled, which is a practical default for SSR-heavy apps.',
		],
		availableItems: [
			'ace-builds.d.ts',
			'provide-ngx-ace.ts',
			'ace.component.ts',
			'ace.component.html',
			'ace.component.scss',
			'ace.directive.ts',
			'ace.interfaces.ts',
			'ace.loader.ts',
			'ace.types.ts',
		],
		properties: [
			{
				name: 'provideNgxAce',
				signature: 'provideNgxAce(config: AceConfigInterface = {}): EnvironmentProviders',
				description:
					'Registers a default Ace configuration object once at the application level.',
				category: 'Bootstrap',
				docType: 'Const',
				sourceFile: 'provide-ngx-ace.ts',
				example: `import { provideNgxAce } from 'ngx-ace';

export const appConfig = {
\tproviders: [
\t\tprovideNgxAce({
\t\t\tmode: 'javascript',
\t\t\ttheme: 'github',
\t\t\tuseWorker: false,
\t\t}),
\t],
};`,
			},
			{
				name: 'provideAce',
				signature: 'provideAce(config?: AceConfigInterface): EnvironmentProviders',
				description:
					'Alias for provideNgxAce() kept for callers that prefer the shorter provider name.',
				category: 'Bootstrap',
				docType: 'Const',
				sourceFile: 'provide-ngx-ace.ts',
			},
			{
				name: 'ACE_CONFIG',
				signature: 'InjectionToken<AceConfigInterface>',
				description:
					'Injection token used internally by the directive to merge app defaults with per-instance config.',
				category: 'Configuration',
				docType: 'Const',
				sourceFile: 'ace.interfaces.ts',
			},
			{
				name: 'AceConfigInterface',
				signature: 'interface AceConfigInterface',
				description:
					'Main configuration contract covering editor behavior, renderer options, workers, typography, and autocomplete.',
				category: 'Configuration',
				docType: 'Interface',
				sourceFile: 'ace.interfaces.ts',
			},
			{
				name: 'AceConfig',
				signature: 'class AceConfig implements AceConfigInterface',
				description:
					'Small config utility that deep-merges nested option objects before they are passed into Ace.',
				category: 'Configuration',
				docType: 'Interface',
				sourceFile: 'ace.interfaces.ts',
			},
			{
				name: 'AceMode / AceTheme',
				signature: 'type AceMode = string / type AceTheme = string',
				description:
					'Public aliases used by the loader registration helpers and ensureAce() arguments.',
				category: 'Types',
				docType: 'Type',
				sourceFile: 'ace.types.ts',
			},
		],
		methods: [
			{
				name: 'AceComponent',
				signature: 'component <ace [(value)] [mode] [theme] [config] />',
				description:
					'Standalone component wrapper that wires component inputs and outputs to the underlying AceDirective.',
				details: [
					'Uses Angular signal inputs and model() for two-way value binding.',
					'Applies the initial value after view init so preloaded content reaches the editor instance.',
				],
				category: 'Components',
				docType: 'Component',
				sourceFile: 'ace.component.ts',
				example: `import { Component, signal } from '@angular/core';
import { AceComponent } from 'ngx-ace';

@Component({
\timports: [AceComponent],
\ttemplate: \`
\t\t<ace
\t\t\t[(value)]="code"
\t\t\t[mode]="'javascript'"
\t\t\t[theme]="'github'"
\t\t\t[config]="{ minLines: 12, showPrintMargin: false }"
\t\t></ace>
\t\`,
})
export class EditorDemoComponent {
\treadonly code = signal('const answer = 42;');
}`,
			},
			{
				name: 'AceDirective',
				signature: 'directive [ace]',
				description:
					'Low-level directive that creates the Ace instance, syncs option changes, and proxies editor events into Angular outputs.',
				details: [
					'Supports disabled, readOnly, mode, theme, and config inputs.',
					'Keeps a pending value until Ace is fully initialized, which avoids losing early writes.',
					'Exposes ace(), clear(), getValue(), and setValue() for direct integration code.',
				],
				category: 'Directives',
				docType: 'Directive',
				sourceFile: 'ace.directive.ts',
			},
			{
				name: 'ensureAce',
				signature: 'ensureAce(args: EnsureAceArgs): Promise<any | null>',
				description:
					'Loads Ace core plus the requested mode and theme on demand, returning null during SSR.',
				details: [
					'Modes and themes are cached after first load.',
					'Only registered loaders can be requested, which keeps bundle growth explicit.',
				],
				category: 'Loading',
				docType: 'Const',
				sourceFile: 'ace.loader.ts',
				example: `import { ensureAce, registerAceMode } from 'ngx-ace';

registerAceMode('json', () => import('ace-builds/src-noconflict/mode-json'));

await ensureAce({
\tplatformId,
\tmode: 'json',
\ttheme: 'github',
});`,
			},
			{
				name: 'registerAceMode',
				signature: 'registerAceMode(mode: AceMode, loader: () => Promise<unknown>): void',
				description:
					'Registers a lazy loader for an additional Ace mode that is not shipped in the package defaults.',
				category: 'Loading',
				docType: 'Const',
				sourceFile: 'ace.loader.ts',
			},
			{
				name: 'registerAceTheme',
				signature:
					'registerAceTheme(theme: AceTheme, loader: () => Promise<unknown>): void',
				description:
					'Registers a lazy loader for an additional Ace theme that is not shipped in the package defaults.',
				category: 'Loading',
				docType: 'Const',
				sourceFile: 'ace.loader.ts',
			},
			{
				name: 'disabled / readOnly',
				signature: 'signal inputs on component and directive',
				description:
					'Disabled mode removes interaction and cursor affordances, while readOnly keeps the editor interactive but non-editable.',
				category: 'State',
				docType: 'Component',
				sourceFile: 'ace.directive.ts',
			},
			{
				name: 'mode / theme normalization',
				signature: 'private normalization in AceDirective',
				description:
					'Incoming values are normalized to Ace paths, so either javascript or ace/mode/javascript works.',
				category: 'Configuration',
				docType: 'Directive',
				sourceFile: 'ace.directive.ts',
			},
			{
				name: 'change / focus / blur / selection outputs',
				signature: 'output() event emitters on component and directive',
				description:
					'Expose core editor and selection lifecycle events without forcing callers to subscribe directly to Ace internals.',
				category: 'Events',
				docType: 'Component',
				sourceFile: 'ace.component.ts',
			},
		],
		sections: [
			{
				title: 'Default bundled registrations',
				items: [
					'Modes: text and javascript.',
					'Themes: github and clouds.',
					'Additional modes and themes can be registered with registerAceMode() and registerAceTheme().',
				],
			},
			{
				title: 'SSR behavior',
				items: [
					'The directive exits early on the server and does not touch window, document, or Ace globals.',
					'ensureAce() returns null when not running in the browser.',
					'Initial values are buffered until the client-side editor instance becomes available.',
				],
			},
		],
		code: `import { Component, signal } from '@angular/core';
import { AceComponent, provideNgxAce } from 'ngx-ace';

export const appConfig = {
\tproviders: [
\t\tprovideNgxAce({
\t\t\tmode: 'javascript',
\t\t\ttheme: 'github',
\t\t\tuseWorker: false,
\t\t}),
\t],
};

@Component({
\timports: [AceComponent],
\ttemplate: \`
\t\t<ace
\t\t\t[(value)]="code"
\t\t\t[config]="{ minLines: 12, showPrintMargin: false }"
\t\t></ace>
\t\`,
})
export class DemoComponent {
\treadonly code = signal('console.log("ngx-ace");');
}`,
	},
];

export const serviceDocMap = new Map(serviceDocs.map(doc => [doc.slug, doc]));
