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
		slug: 'tinymce',
		name: 'Tinymce',
		description:
			'Angular TinyMCE feature with standalone providers, lazy script loading, form integration, and SSR-safe runtime setup.',
		summary:
			'ngx-tinymce wraps TinyMCE in a focused Angular package. The component exposes signal-based inputs, ControlValueAccessor support, and a ready event while the provider centralizes script-path and default-editor configuration.',
		highlights: [
			'Standalone bootstrap through provideNgxTinymce() for shared editor defaults.',
			'Lazy TinyMCE script loading with browser-only guards so SSR remains safe.',
			'Classic textarea mode and inline mode share the same component API.',
		],
		config: [
			'Use provideNgxTinymce() to register package-wide defaults such as baseURL, fileName, delay, and TinyMCE init options.',
			'Per-instance [config] values merge over the provider defaults.',
			'By default the component expects TinyMCE assets under ./assets/tinymce/tinymce.min.js unless you override baseURL or fileName.',
		],
		availableItems: ['provide-ngx-tinymce.ts', 'tinymce.interface.ts', 'tinymce.component.ts'],
		properties: [
			{
				name: 'provideNgxTinymce',
				signature: 'provideNgxTinymce(config: TinymceConfig = {}): EnvironmentProviders',
				description: 'Registers TinyMCE defaults once at the application level.',
				category: 'Bootstrap',
				docType: 'Const',
				sourceFile: 'provide-ngx-tinymce.ts',
				example: `import { provideNgxTinymce } from 'ngx-tinymce';

export const appConfig = {
\tproviders: [
\t\tprovideNgxTinymce({
\t\t\tbaseURL: '/assets/tinymce/',
\t\t\tconfig: {
\t\t\t\tmenubar: false,
\t\t\t},
\t\t}),
\t],
};`,
			},
			{
				name: 'provideTinymce',
				signature: 'provideTinymce(config?: TinymceConfig): EnvironmentProviders',
				description:
					'Alias for provideNgxTinymce() kept for callers that prefer the shorter provider name.',
				category: 'Bootstrap',
				docType: 'Const',
				sourceFile: 'provide-ngx-tinymce.ts',
			},
			{
				name: 'TINYMCE_CONFIG',
				signature: 'InjectionToken<TinymceConfig>',
				description:
					'Injection token used internally by the component to read the resolved default configuration.',
				category: 'Configuration',
				docType: 'Const',
				sourceFile: 'tinymce.interface.ts',
			},
			{
				name: 'TinymceConfig',
				signature: 'interface TinymceConfig { baseURL?; fileName?; config?; delay?; }',
				description:
					'Top-level configuration contract for script loading and default editor options.',
				category: 'Configuration',
				docType: 'Interface',
				sourceFile: 'tinymce.interface.ts',
			},
			{
				name: 'TinymceInitOptions',
				signature: 'interface TinymceInitOptions',
				description:
					'Typed wrapper for TinyMCE init options used by the package without forcing a hard dependency on TinyMCE typings.',
				category: 'Configuration',
				docType: 'Interface',
				sourceFile: 'tinymce.interface.ts',
			},
			{
				name: 'TinymceEditor',
				signature: 'interface TinymceEditor',
				description:
					'Minimal public editor instance contract used for ready callbacks and instance access.',
				category: 'Runtime',
				docType: 'Interface',
				sourceFile: 'tinymce.interface.ts',
			},
		],
		methods: [
			{
				name: 'TinymceComponent',
				signature: 'component <tinymce [(ngModel)] [config] [inline] [disabled] [delay] />',
				description:
					'Standalone component wrapper that initializes TinyMCE on demand and keeps its content synchronized with Angular forms.',
				details: [
					'Supports classic textarea mode by default and inline mode when [inline]="true".',
					'Re-initializes the editor when the config input changes, which keeps runtime option changes predictable.',
					'Exposes a ready event with the resolved editor instance.',
				],
				category: 'Components',
				docType: 'Component',
				sourceFile: 'tinymce.component.ts',
				example: `import { Component, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { TinymceComponent } from 'ngx-tinymce';

@Component({
\timports: [FormsModule, TinymceComponent],
\ttemplate: \`
\t\t<tinymce
\t\t\t[(ngModel)]="content"
\t\t\t[config]="editorConfig()"
\t\t\t(ready)="onReady()"
\t\t></tinymce>
\t\`,
})
export class EditorDemoComponent {
\treadonly content = signal('<p>Hello TinyMCE</p>');
\treadonly editorConfig = signal({
\t\tmenubar: false,
\t\tplugins: 'lists link code',
\t\ttoolbar: 'undo redo | bold italic | code',
\t});

\tonReady() {
\t\tconsole.log('editor ready');
\t}
}`,
			},
			{
				name: 'config / inline / placeholder / disabled / delay',
				signature: 'signal inputs on TinymceComponent',
				description:
					'Configure instance-specific editor options, inline rendering, placeholder text, readonly state, and delayed initialization.',
				category: 'Inputs',
				docType: 'Component',
				sourceFile: 'tinymce.component.ts',
			},
			{
				name: 'loading',
				signature: 'input<string | TemplateRef | null>',
				description:
					'Lets callers replace the default loading label with plain text or a custom template while the script/editor boots.',
				category: 'Inputs',
				docType: 'Component',
				sourceFile: 'tinymce.component.ts',
			},
			{
				name: 'ready',
				signature: 'output<TinymceEditor>()',
				description:
					'Emits once the TinyMCE instance has initialized and the initial value has been applied.',
				category: 'Outputs',
				docType: 'Component',
				sourceFile: 'tinymce.component.ts',
			},
			{
				name: 'instance',
				signature: 'get instance(): TinymceEditor | undefined | null',
				description:
					'Returns the active TinyMCE editor instance when the component has already initialized.',
				category: 'Runtime',
				docType: 'Component',
				sourceFile: 'tinymce.component.ts',
			},
			{
				name: 'writeValue / registerOnChange / registerOnTouched / setDisabledState',
				signature: 'ControlValueAccessor methods',
				description:
					'Enables template-driven and reactive form integration without extra adapters.',
				category: 'Forms',
				docType: 'Component',
				sourceFile: 'tinymce.component.ts',
			},
		],
		sections: [
			{
				title: 'Runtime behavior',
				items: [
					'The TinyMCE script is injected only in the browser and reused across component instances.',
					'The provider config is merged with per-instance config before calling tinymce.init().',
					'Disabled state is synchronized through TinyMCE readonly/design mode APIs.',
				],
			},
			{
				title: 'Typical setup',
				items: [
					'Host TinyMCE assets under /assets/tinymce/ or point baseURL to a CDN path.',
					'Register global editor defaults with provideNgxTinymce() at bootstrap.',
					'Use TinymceComponent directly where rich text editing is needed.',
				],
			},
		],
		code: `import { provideNgxTinymce } from 'ngx-tinymce';

export const appConfig = {
\tproviders: [
\t\tprovideNgxTinymce({
\t\t\tbaseURL: '/assets/tinymce/',
\t\t\tconfig: {
\t\t\t\tmenubar: false,
\t\t\t\tplugins: 'lists link table code',
\t\t\t\ttoolbar: 'undo redo | bold italic | bullist numlist | code',
\t\t\t},
\t\t}),
\t],
};`,
	},
];

export const serviceDocMap = new Map(serviceDocs.map(doc => [doc.slug, doc]));
