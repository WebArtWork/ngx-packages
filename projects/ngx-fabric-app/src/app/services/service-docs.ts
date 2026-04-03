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
		slug: 'fabric',
		name: 'Fabric',
		description:
			'Angular Fabric.js wrapper with component and directive APIs, shared defaults, and canvas event bindings.',
		summary:
			'ngx-fabric isolates the Fabric canvas feature into a focused Angular package. It gives teams a simple component for common canvas use cases, a lower-level directive for direct instance access, and a provider for shared runtime defaults.',
		highlights: [
			'Standalone bootstrap through provideNgxFabric() for app-wide canvas defaults.',
			'Supports both interactive Canvas and read-only StaticCanvas through the disabled input.',
			'Maps Fabric canvas events to Angular outputs in camelCase form and keeps sizing synced with ResizeObserver.',
		],
		config: [
			'Use provideNgxFabric() to register package-wide Fabric canvas defaults such as selection styling, drawing mode, cursors, or stacking behavior.',
			'Per-instance [fabric] config still overrides provided defaults.',
			'Width and height can be passed explicitly, or left unset so the directive tracks the container size.',
		],
		availableItems: [
			'provide-ngx-fabric.ts',
			'fabric.component.ts',
			'fabric.component.html',
			'fabric.component.scss',
			'fabric.directive.ts',
			'fabric.interfaces.ts',
		],
		properties: [
			{
				name: 'provideNgxFabric',
				signature:
					'provideNgxFabric(config: FabricConfigInterface = {}): EnvironmentProviders',
				description:
					'Registers a default Fabric configuration object once at the application level.',
				category: 'Bootstrap',
				docType: 'Const',
				sourceFile: 'provide-ngx-fabric.ts',
				example: `import { provideNgxFabric } from 'ngx-fabric';

export const appConfig = {
\tproviders: [
\t\tprovideNgxFabric({
\t\t\tselectionColor: 'rgba(37, 99, 235, 0.16)',
\t\t\trenderOnAddRemove: true,
\t\t\tpreserveObjectStacking: true,
\t\t}),
\t],
};`,
			},
			{
				name: 'provideFabric',
				signature: 'provideFabric(config?: FabricConfigInterface): EnvironmentProviders',
				description:
					'Alias for provideNgxFabric() kept for callers that prefer the shorter provider name.',
				category: 'Bootstrap',
				docType: 'Const',
				sourceFile: 'provide-ngx-fabric.ts',
			},
			{
				name: 'FABRIC_CONFIG',
				signature: 'InjectionToken<FabricConfigInterface>',
				description:
					'Injection token used internally by the directive to merge app defaults with per-instance config.',
				category: 'Configuration',
				docType: 'Const',
				sourceFile: 'fabric.interfaces.ts',
			},
			{
				name: 'FabricConfigInterface',
				signature: 'interface FabricConfigInterface',
				description:
					'Main configuration contract covering Fabric canvas flags such as selection, cursors, drawing mode, overlay, stacking, and rendering behavior.',
				category: 'Configuration',
				docType: 'Interface',
				sourceFile: 'fabric.interfaces.ts',
			},
			{
				name: 'FabricConfig',
				signature: 'class FabricConfig implements FabricConfigInterface',
				description:
					'Small config helper that copies incoming defaults and per-instance options onto a mutable object before creating the canvas.',
				category: 'Configuration',
				docType: 'Interface',
				sourceFile: 'fabric.interfaces.ts',
			},
			{
				name: 'FabricEvent / FabricEvents',
				signature: 'type FabricEvent / const FabricEvents: FabricEvent[]',
				description:
					'Exports that define the supported Angular output names proxied from the underlying Fabric canvas.',
				category: 'Events',
				docType: 'Type',
				sourceFile: 'fabric.interfaces.ts',
			},
		],
		methods: [
			{
				name: 'FabricComponent',
				signature: 'component <fabric [config] [data] [zoom] [disabled] />',
				description:
					'Template-friendly wrapper that proxies inputs and outputs to the underlying FabricDirective.',
				details: [
					'Loads JSON data after view init so preloaded state reaches the canvas instance.',
					'Emits dataLoaded once the supplied JSON has been applied.',
					'useFabricClass adds the default host class for the bundled wrapper styles.',
				],
				category: 'Components',
				docType: 'Component',
				sourceFile: 'fabric.component.ts',
			},
			{
				name: 'FabricDirective',
				signature: 'directive [fabric]',
				description:
					'Low-level directive that creates the Fabric instance, syncs config changes, and proxies canvas events into Angular outputs.',
				details: [
					'Creates Canvas when interactive and StaticCanvas when disabled is true.',
					'Re-initializes when the config object changes or disabled mode toggles.',
					'Exposes fabric(), clear(), render(), setZoom(), setWidth(), setHeight(), and loadFromJSON() for direct integration code.',
				],
				category: 'Directives',
				docType: 'Directive',
				sourceFile: 'fabric.directive.ts',
			},
			{
				name: 'data input / dataLoaded output',
				signature: 'component input/output pair',
				description:
					'Accepts Fabric JSON data and emits the live canvas instance once the payload has been loaded.',
				category: 'Data loading',
				docType: 'Component',
				sourceFile: 'fabric.component.ts',
			},
			{
				name: 'disabled',
				signature: 'boolean input on component and directive',
				description:
					'Switches between interactive Canvas and read-only StaticCanvas without changing the calling template shape.',
				category: 'State',
				docType: 'Directive',
				sourceFile: 'fabric.directive.ts',
			},
			{
				name: 'Fabric output events',
				signature: 'drop, objectAdded, selectionCreated, beforeTransform, mouseMove, ...',
				description:
					'Expose common Fabric canvas lifecycle, pointer, object, and selection events through Angular outputs.',
				details: [
					'Event names use camelCase bindings instead of Fabric colon notation.',
					'Both lowercase and camelCase mouse event aliases are supported by the wrapper surface.',
				],
				category: 'Events',
				docType: 'Directive',
				sourceFile: 'fabric.directive.ts',
			},
			{
				name: 'loadFromJSON',
				signature:
					'loadFromJSON(json: object, callback?: () => boolean | void, reviverOpt?: unknown): void',
				description:
					'Populates the Fabric canvas from JSON and renders automatically unless the callback returns false.',
				category: 'Data loading',
				docType: 'Directive',
				sourceFile: 'fabric.directive.ts',
			},
			{
				name: 'fabric',
				signature: 'fabric(): Canvas | StaticCanvas | null',
				description:
					'Returns the current underlying Fabric instance so callers can use the native API when needed.',
				category: 'Direct access',
				docType: 'Directive',
				sourceFile: 'fabric.directive.ts',
			},
			{
				name: 'clear / render',
				signature: 'clear(): void / render(): void',
				description:
					'Utility helpers for wiping the canvas and forcing a re-render from Angular code.',
				category: 'Helpers',
				docType: 'Directive',
				sourceFile: 'fabric.directive.ts',
			},
			{
				name: 'setZoom / setWidth / setHeight',
				signature: 'dimension and zoom helpers',
				description:
					'Updates runtime canvas zoom and dimensions while remembering the last explicit values across re-initialization.',
				category: 'Helpers',
				docType: 'Directive',
				sourceFile: 'fabric.directive.ts',
			},
		],
		sections: [
			{
				title: 'Runtime behavior',
				items: [
					'The directive merges provided defaults with per-instance config before creating the canvas.',
					'ResizeObserver keeps width and height synced to the container when explicit dimensions are not supplied.',
					'Config diffs trigger a controlled re-initialization so Fabric receives the new canvas options.',
				],
			},
			{
				title: 'Practical usage notes',
				items: [
					'Use the component when you mainly need a canvas in a template and optional JSON hydration.',
					'Use the directive when you want direct access to the Fabric instance or custom host markup.',
					'For broader Fabric APIs such as object classes and drawing tools, call into the native instance returned by fabric().',
				],
			},
		],
		code: `import { Component } from '@angular/core';
import { FabricComponent, provideNgxFabric } from 'ngx-fabric';

export const appConfig = {
\tproviders: [
\t\tprovideNgxFabric({
\t\t\tselectionColor: 'rgba(37, 99, 235, 0.16)',
\t\t\trenderOnAddRemove: true,
\t\t\tpreserveObjectStacking: true,
\t\t}),
\t],
};

@Component({
\timports: [FabricComponent],
\ttemplate: \`
\t\t<fabric
\t\t\t[config]="{ selection: true }"
\t\t\t[data]="canvasJson"
\t\t\t[disabled]="false"
\t\t></fabric>
\t\`,
})
export class DemoComponent {
\treadonly canvasJson = {
\t\tversion: '7.0.0',
\t\tobjects: [],
\t};
}`,
	},
];

export const serviceDocMap = new Map(serviceDocs.map(doc => [doc.slug, doc]));
