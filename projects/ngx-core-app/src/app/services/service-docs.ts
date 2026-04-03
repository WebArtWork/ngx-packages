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

const _SERVICE_DOC_ORDER = [
	'core-service',
	'dom-service',
	'emitter-service',
	'store-service',
	'meta-service',
	'network-service',
	'http-service',
	'crud-service',
	'translate-service',
	'language',
] as const;

const _serviceDocOrderMap: ReadonlyMap<string, number> = new Map(
	_SERVICE_DOC_ORDER.map((slug, index) => [slug, index] as const),
);

const _serviceDocs: ServiceDoc[] = [
	{
		slug: 'core-service',
		name: 'CoreService',
		description:
			'Low-level SSR-safe helpers for ids, copy, viewport, device, locks, and signals.',
		summary:
			'CoreService is the base utility layer used by the library itself. It wraps browser-sensitive detection, document-independent helpers, and signal utilities that other services build on.',
		highlights: [
			'Generates a persistent device id on the client and a temporary id on the server.',
			'Detects device type and responsive viewport using guarded browser APIs.',
			'Provides object copying, debounce-like afterWhile(), lock management, and signal helpers.',
		],
		availableItems: [
			'core.prototype.ts',
			'core.service.ts',
			'core.type.ts',
			'config.interface.ts',
			'click-outside.directive.ts',
			'arr.pipe.ts',
			'mongodate.pipe.ts',
			'number.pipe.ts',
			'pagination.pipe.ts',
			'safe.pipe.ts',
			'search.pipe.ts',
			'splice.pipe.ts',
			'split.pipe.ts',
			'util.service.ts',
		],
		config: [
			'No explicit provideNgxCore() config is required.',
			'Browser-only features such as device detection and viewport listeners run only on the client.',
		],
		properties: [
			{
				name: 'Config',
				signature: 'interface Config',
				description:
					'Root configuration contract used by provideNgxCore() for store, meta, http, and network settings.',
				category: 'Configuration',
				docType: 'Interface',
				sourceFile: 'config.interface.ts',
				example: `import { provideNgxCore, type Config } from 'ngx-core';

const config: Config = {
\thttp: { url: '/api', headers: { 'X-App': 'docs' } },
\tmeta: { applyFromRoutes: true },
};

export const appConfig = {
\tproviders: [provideNgxCore(config)],
};`,
			},
			{
				name: 'CONFIG_TOKEN',
				signature: 'InjectionToken<Config>',
				description:
					'Injection token used internally and by advanced consumers to read the resolved ngx-core configuration.',
				category: 'Configuration',
				docType: 'Const',
				sourceFile: 'config.interface.ts',
			},
			{
				name: 'DEFAULT_CONFIG',
				signature: 'const DEFAULT_CONFIG: Config',
				description:
					'Default library configuration used when provideNgxCore() is called without overrides.',
				category: 'Configuration',
				docType: 'Const',
				sourceFile: 'config.interface.ts',
			},
			{
				name: 'Viewport',
				signature: "type Viewport = 'mobile' | 'tablet' | 'desktop'",
				description:
					'Responsive breakpoint union used by CoreService viewport signals and related helpers.',
				category: 'Types',
				docType: 'Type',
				sourceFile: 'core.type.ts',
			},
			{
				name: 'deviceID',
				signature: 'deviceID: string',
				description:
					'Stable per-device identifier persisted to localStorage when available.',
				category: 'Device and viewport',
				sourceFile: 'core.service.ts',
				example: `import { CoreService } from 'ngx-core';

constructor(private _coreService: CoreService) {}

ngOnInit() {
\tconsole.log('device id', this._coreService.deviceID);
}`,
			},
			{
				name: 'device',
				signature: "device: '' | 'Windows Phone' | 'Android' | 'iOS' | 'Web'",
				description: 'Detected platform classification after detectDevice().',
				category: 'Device and viewport',
				sourceFile: 'core.service.ts',
				example: `import { CoreService } from 'ngx-core';

constructor(private _coreService: CoreService) {}

ngOnInit() {
\tthis._coreService.detectDevice();
\tconsole.log('platform', this._coreService.device);
}`,
			},
			{
				name: 'viewport',
				signature: "viewport: Signal<'mobile' | 'tablet' | 'desktop'>",
				description: 'Responsive breakpoint signal driven by matchMedia listeners.',
				category: 'Device and viewport',
				sourceFile: 'core.service.ts',
				example: `import { CoreService } from 'ngx-core';

readonly coreService = inject(CoreService);

ngOnInit() {
\tthis.coreService.detectViewport();
}

viewportLabel() {
\treturn this.coreService.viewport();
}`,
			},
			{
				name: 'isViewportMobile / Tablet / Desktop',
				signature: 'computed signals',
				description: 'Convenience computed signals derived from viewport().',
				category: 'Device and viewport',
				sourceFile: 'core.service.ts',
				example: `import { CoreService } from 'ngx-core';

readonly coreService = inject(CoreService);

isCompactLayout() {
\treturn this.coreService.isViewportMobile() || this.coreService.isViewportTablet();
}`,
			},
			{
				name: 'version / appVersion / dateVersion',
				signature: 'string fields',
				description: 'Simple version state for combining app and date versions.',
				category: 'Versioning',
				sourceFile: 'core.service.ts',
				example: `import { CoreService } from 'ngx-core';

constructor(private _coreService: CoreService) {}

setBuildInfo() {
\tthis._coreService.setAppVersion('1.4.0');
\tthis._coreService.setDateVersion('2026-03-21');
\tconsole.log(this._coreService.version);
}`,
			},
		],
		methods: [
			{
				name: 'capitalize',
				signature: 'String.prototype.capitalize(): string',
				description:
					'Prototype augmentation that uppercases the first character and lowercases the remainder of a string.',
				category: 'Prototype helpers',
				docType: 'Const',
				sourceFile: 'core.prototype.ts',
				example: `import 'ngx-core';

const label = 'hELLo'.capitalize();
console.log(label); // Hello`,
			},
			{
				name: 'UUID',
				signature: 'UUID(): string',
				description: 'Generates a UUID v4-like identifier using Math.random().',
				details: [
					'Good for local ids and general runtime identifiers, not for cryptographic use.',
				],
				category: 'Data helpers',
				sourceFile: 'core.service.ts',
				example: `import { CoreService } from 'ngx-core';

constructor(private _coreService: CoreService) {}

createDraft() {
\treturn { _id: this._coreService.UUID(), title: 'Untitled' };
}`,
			},
			{
				name: 'ota',
				signature: 'ota(obj: any, holder = false): any[]',
				description: 'Converts an object to an array of values or keys.',
				details: [
					'Returns the input unchanged for arrays and an empty array for non-objects.',
				],
				category: 'Data helpers',
				sourceFile: 'core.service.ts',
			},
			{
				name: 'splice',
				signature:
					"splice(removeArray: any[], fromArray: any[], compareField = '_id'): any[]",
				description:
					'Removes items from one array when their compareField exists in another array.',
				category: 'Data helpers',
				sourceFile: 'core.service.ts',
			},
			{
				name: 'ids2id',
				signature: 'ids2id(...args: string[]): string',
				description: 'Creates a deterministic combined id by sorting ids and joining them.',
				category: 'Data helpers',
				sourceFile: 'core.service.ts',
			},
			{
				name: 'ClickOutsideDirective',
				signature: "directive [clickOutside] => output<MouseEvent>('clickOutside')",
				description:
					'Standalone directive that emits when a pointer event happens outside the host element.',
				details: [
					'Uses a document-level pointerdown listener and marks the view for check to stay safe with OnPush and zoneless apps.',
				],
				category: 'Directives',
				docType: 'Const',
				sourceFile: 'click-outside.directive.ts',
				example: `<section class="panel" (clickOutside)="closePanel()">
  <p>Click anywhere outside this panel to close it.</p>
</section>`,
			},
			{
				name: 'afterWhile',
				signature:
					'afterWhile(doc: string | object | (() => void), cb?: () => void, time = 1000): void',
				description:
					'Debounce-like helper that delays a callback and resets the timer if called again.',
				details: [
					'Can key the timer by string, store it on an object, or default to a shared "common" key.',
				],
				category: 'Flow control',
				sourceFile: 'core.service.ts',
				example: `import { CoreService } from 'ngx-core';

constructor(private _coreService: CoreService) {}

queueSave(doc: { _id: string }) {
\tthis._coreService.afterWhile(doc._id, () => {
\t\tconsole.log('save once user stops typing');
\t}, 400);
}`,
			},
			{
				name: 'UtilService',
				signature: 'class UtilService',
				description:
					'General-purpose utility service for validation, generated data, CSS variable persistence, and shared form signals.',
				details: [
					'Persists local CSS custom properties and reapplies them on startup.',
					'Exposes formSignal() for shared mutable form state without adding a separate store.',
				],
				category: 'Utilities',
				docType: 'Service',
				sourceFile: 'util.service.ts',
				example: `import { UtilService } from 'ngx-core';

private readonly _utilService = inject(UtilService);

themeForm = this._utilService.formSignal<{ accent?: string }>('theme');

applyTheme() {
\tthis._utilService.setCss({ '--accent': '#14532d' }, { local: true });
}`,
			},
			{
				name: 'copy',
				signature: 'copy(from: any, to: any): void',
				description:
					'Recursively copies plain object data while preserving arrays, dates, and null values.',
				category: 'Data helpers',
				sourceFile: 'core.service.ts',
			},
			{
				name: 'detectDevice',
				signature: 'detectDevice(): void',
				description: 'Updates device based on the current user agent.',
				category: 'Device and viewport',
				sourceFile: 'core.service.ts',
				example: `import { CoreService } from 'ngx-core';

constructor(private _coreService: CoreService) {}

ngOnInit() {
\tthis._coreService.detectDevice();

\tif (this._coreService.isIos()) {
\t\tconsole.log('show iOS-specific hint');
\t}
}`,
			},
			{
				name: 'isMobile / isTablet / isWeb / isAndroid / isIos',
				signature: 'boolean helpers',
				description: 'Convenience methods for checking the detected device classification.',
				category: 'Device and viewport',
				sourceFile: 'core.service.ts',
			},
			{
				name: 'detectViewport',
				signature: 'detectViewport(): void',
				description:
					'Starts responsive breakpoint tracking with automatic cleanup on service destroy.',
				category: 'Device and viewport',
				sourceFile: 'core.service.ts',
				example: `import { CoreService } from 'ngx-core';

readonly coreService = inject(CoreService);

ngOnInit() {
\tthis.coreService.detectViewport();
}`,
			},
			{
				name: 'setVersion / setAppVersion / setDateVersion',
				signature: 'version setters',
				description:
					'Build and update a combined version string from appVersion and dateVersion.',
				category: 'Versioning',
				sourceFile: 'core.service.ts',
			},
			{
				name: 'lock / unlock / onUnlock / locked',
				signature: 'resource locking helpers',
				description:
					'Coordinate async workflows by locking named resources and awaiting their release.',
				category: 'Flow control',
				sourceFile: 'core.service.ts',
			},
			{
				name: 'toSignal / toSignalsArray',
				signature: 'toSignal(document, signalFields?) / toSignalsArray(arr, signalFields?)',
				description:
					'Wrap plain objects or arrays into Angular signals, optionally using a field-mapper object to expose selected properties as nested signals.',
				category: 'Signals',
				sourceFile: 'core.service.ts',
				example: `import { CoreService } from 'ngx-core';

constructor(private _coreService: CoreService) {}

user = this._coreService.toSignal({
\tname: 'Anna',
\tstatus: 'active',
}, {
\tstatus: doc => doc.status,
});

updateStatus() {
\tthis.user().status.set('invited');
}`,
			},
			{
				name: 'pushSignal / removeSignalByField / findSignalByField / updateSignalByField / trackBySignalField',
				signature: 'signal collection helpers',
				description:
					'Manage arrays of document signals without re-implementing common lookup and update logic.',
				category: 'Signals',
				sourceFile: 'core.service.ts',
			},
			{
				name: 'ArrPipe',
				signature: 'arr: string | object | array -> any[]',
				description:
					'Converts strings or objects into arrays for template iteration, optionally returning keys or values only.',
				category: 'Pipes',
				docType: 'Const',
				sourceFile: 'arr.pipe.ts',
				example: `@for (entry of settings | arr; track entry.prop) {
  <dt>{{ entry.prop }}</dt>
  <dd>{{ entry.value }}</dd>
}`,
			},
			{
				name: 'MongodatePipe',
				signature: 'mongodate(_id: unknown): Date',
				description:
					'Builds a JavaScript Date from the timestamp portion of a MongoDB ObjectId-like value.',
				category: 'Pipes',
				docType: 'Const',
				sourceFile: 'mongodate.pipe.ts',
			},
			{
				name: 'NumberPipe',
				signature: 'number(value: unknown): number',
				description:
					'Coerces arbitrary input to a number and falls back to 0 when conversion fails.',
				category: 'Pipes',
				docType: 'Const',
				sourceFile: 'number.pipe.ts',
			},
			{
				name: 'PaginationPipe',
				signature: 'page(arr, config, sort, search?): any[]',
				description:
					'Slices an array for the active page and optionally sorts it before returning the page window.',
				details: [
					'Mutates copied entries by adding a num field with the 1-based row index.',
				],
				category: 'Pipes',
				docType: 'Const',
				sourceFile: 'pagination.pipe.ts',
			},
			{
				name: 'SafePipe',
				signature: 'safe(value: unknown): SafeResourceUrl',
				description:
					'Wraps a value with DomSanitizer.bypassSecurityTrustResourceUrl for trusted resource URLs.',
				category: 'Pipes',
				docType: 'Const',
				sourceFile: 'safe.pipe.ts',
			},
			{
				name: 'SearchPipe',
				signature: 'search(items, query?, fields?, limit?, ignore?): T[]',
				description:
					'Filters arrays or object maps by text query, field paths, or signal-backed query input.',
				details: [
					'Supports nested paths like status.name and can treat a numeric fields argument as the result limit.',
				],
				category: 'Pipes',
				docType: 'Const',
				sourceFile: 'search.pipe.ts',
				example: `<article *ngFor="let project of projects | search: query() : 'name owner.name' : 10">
  {{ project.name }}
</article>`,
			},
			{
				name: 'SplicePipe',
				signature: 'splice(from, which, refresh?): any[]',
				description:
					'Removes or keeps matching records between two collections, usually comparing by _id.',
				category: 'Pipes',
				docType: 'Const',
				sourceFile: 'splice.pipe.ts',
			},
			{
				name: 'SplitPipe',
				signature: "split(value: string, index = 0, divider = ':'): string",
				description:
					'Splits a string by a delimiter and returns the requested segment or an empty string.',
				category: 'Pipes',
				docType: 'Const',
				sourceFile: 'split.pipe.ts',
			},
		],
		code: `import { CoreService } from 'ngx-core';

constructor(private _coreService: CoreService) {}

queueSave(doc: { _id: string }) {
\tthis._coreService.afterWhile(doc._id, () => {
\t\tconsole.log('save once user stops typing');
\t}, 400);
}`,
	},
	{
		slug: 'dom-service',
		name: 'DomService',
		description:
			'Dynamically creates Angular components and attaches them to the DOM in an SSR-safe way.',
		summary:
			'DomService is the library feature for runtime component mounting. It creates component instances with Angular createComponent(), projects inputs onto them, attaches their views to the application, and only appends DOM nodes when running in the browser.',
		highlights: [
			'Supports attaching a component by target element id or directly to a supplied HTMLElement.',
			'Returns both the native element and ComponentRef so the caller can manage the mounted instance.',
			'Guards browser-only DOM appends so the service stays safe during SSR.',
		],
		config: [
			'No provideNgxCore() configuration is required.',
			'DOM insertion happens only in the browser; on the server the component can still be created and referenced.',
			'appendComponent() supports a providedIn key to ensure only one mounted instance exists for a given logical slot.',
		],
		availableItems: ['dom.service.ts', 'dom.interface.ts'],
		methods: [
			{
				name: 'appendById',
				signature:
					'appendById<T>(component: Type<T>, options: Partial<T> = {}, id: string): DomComponent<T>',
				description:
					'Creates a component, applies input values, and appends it to the element with the given id.',
				category: 'Mounting',
				sourceFile: 'dom.service.ts',
				example: `import { DomService } from 'ngx-core';

private readonly _domService = inject(DomService);

openBanner() {
\tthis._domService.appendById(NotificationComponent, {
\t\tmessage: 'Saved',
\t}, 'page-banner');
}`,
			},
			{
				name: 'appendComponent',
				signature:
					'appendComponent<T>(component: Type<T>, options: Partial<T & { providedIn?: string }> = {}, element?: HTMLElement): DomComponent<T> | void',
				description:
					'Creates and appends a component to a supplied element or to document.body by default.',
				details: [
					'When options.providedIn is set, only one active component with that key can exist at a time.',
					'Returns void when the providedIn slot is already occupied.',
				],
				category: 'Mounting',
				sourceFile: 'dom.service.ts',
			},
			{
				name: 'getComponentRef',
				signature:
					'getComponentRef<T>(component: Type<T>, options: Partial<T> = {}): ComponentRef<T>',
				description:
					'Creates a component instance, applies inputs, attaches its view, and returns only the ComponentRef.',
				category: 'Creation',
				sourceFile: 'dom.service.ts',
			},
			{
				name: 'removeComponent',
				signature:
					'removeComponent<T>(componentRef: ComponentRef<T>, providedIn?: string): void',
				description:
					'Detaches a previously attached view, destroys the component, and clears any providedIn lock.',
				category: 'Cleanup',
				sourceFile: 'dom.service.ts',
			},
			{
				name: 'DomComponent',
				signature:
					'interface DomComponent<T> { nativeElement: HTMLElement; componentRef: ComponentRef<T>; remove: () => void; }',
				description:
					'Return contract used by appendById() and appendComponent() for mounted components.',
				category: 'Contracts',
				docType: 'Interface',
				sourceFile: 'dom.interface.ts',
			},
		],
		sections: [
			{
				title: 'Feature role',
				items: [
					'Use DomService when a feature needs runtime-mounted Angular UI such as toasts, overlays, dialogs, or page-level banners.',
					'The service handles component creation, application view attachment, and cleanup in one place.',
					'SSR safety comes from guarding browser-only appendChild calls behind platform checks.',
				],
			},
		],
		code: `import { DomService } from 'ngx-core';

private readonly _domService = inject(DomService);

showToast() {
\tconst mounted = this._domService.appendComponent(ToastComponent, {
\t\tmessage: 'Profile updated',
\t\tprovidedIn: 'profile-toast',
\t});

\tmounted?.remove();
}`,
	},
	{
		slug: 'http-service',
		name: 'HttpService',
		description:
			'Shared base URL, header management, callbacks, and Observable requests on top of HttpClient.',
		summary:
			'HttpService wraps Angular HttpClient with shared URL and header state, retry-aware error hooks, optional response shaping, and a simple request lock to serialize calls when needed.',
		highlights: [
			'Supports get/post/put/patch/delete with both callback and Observable usage.',
			'Persists base URL and headers in localStorage on the client.',
			'Can reject responses through acceptance(), reshape payloads through replace(), and extract only specific fields.',
		],
		config: [
			'Configure defaults with provideNgxCore({ http: { url, headers } }).',
			'Client-side overrides persist in localStorage under ngx-core-http.url and ngx-core-http.headers.',
			'errors is a global array of callbacks invoked for every request failure.',
		],
		availableItems: ['http.service.ts', 'http.interface.ts'],
		properties: [
			{
				name: 'url',
				signature: 'url: string',
				description: 'Current base URL prepended to relative request paths.',
				category: 'State',
				sourceFile: 'http.service.ts',
			},
			{
				name: 'locked',
				signature: 'locked: boolean',
				description:
					'When true, requests queue until unlock() unless opts.skipLock is set.',
				category: 'State',
				sourceFile: 'http.service.ts',
			},
			{
				name: 'errors',
				signature: '((err: HttpErrorResponse, retry?: () => void) => {})[]',
				description:
					'Global error hooks triggered in addition to per-request opts.err callbacks.',
				category: 'State',
				sourceFile: 'http.service.ts',
			},
			{
				name: 'HttpConfig',
				signature: 'interface HttpConfig',
				description:
					'Configuration contract used by provideNgxCore({ http }) for the default base URL and shared headers.',
				category: 'Contracts',
				docType: 'Interface',
				sourceFile: 'http.interface.ts',
			},
			{
				name: 'HttpHeaderType / DEFAULT_HTTP_CONFIG',
				signature: 'HTTP header type alias and default config const',
				description:
					'Exported HTTP helper types and defaults used by HttpService configuration.',
				category: 'Contracts',
				docType: 'Type',
				sourceFile: 'http.interface.ts',
			},
		],
		methods: [
			{
				name: 'setUrl',
				signature: 'setUrl(url: string): void',
				description: 'Sets the base URL and persists it in the browser.',
				category: 'Configuration',
				sourceFile: 'http.service.ts',
			},
			{
				name: 'removeUrl',
				signature: 'removeUrl(): void',
				description: 'Clears the runtime override and falls back to configured url.',
				category: 'Configuration',
				sourceFile: 'http.service.ts',
			},
			{
				name: 'set',
				signature: 'set(key: any, value: any): void',
				description: 'Adds or updates a shared HTTP header and persists it in the browser.',
				category: 'Headers',
				sourceFile: 'http.service.ts',
			},
			{
				name: 'header',
				signature: 'header(key: any): any',
				description: 'Reads the current value for a shared header.',
				category: 'Headers',
				sourceFile: 'http.service.ts',
			},
			{
				name: 'remove',
				signature: 'remove(key: any): void',
				description:
					'Deletes a shared header and updates the in-memory HttpHeaders instance.',
				category: 'Headers',
				sourceFile: 'http.service.ts',
			},
			{
				name: 'post / put / patch / delete / get',
				signature: 'request helpers returning Observable<any>',
				description:
					'Execute HTTP requests against the current base URL using shared headers.',
				details: [
					'Each helper accepts a legacy callback and an opts object.',
					'opts.err can handle failures for one call.',
					'opts.url can override the base URL per request.',
					'opts.skipLock bypasses service-level locking.',
					'opts.acceptance(resp) can reject a successful HTTP response as invalid.',
					'opts.replace(item) mutates the payload or nested payload at opts.data.',
					'opts.fields limits the response payload to selected fields.',
				],
				category: 'Requests',
				sourceFile: 'http.service.ts',
			},
			{
				name: 'clearLocked',
				signature: 'clearLocked(): void',
				description: 'Cancels queued retry timers created while the service was locked.',
				category: 'Locking',
				sourceFile: 'http.service.ts',
			},
			{
				name: 'lock / unlock',
				signature: 'lock(): void / unlock(): void',
				description: 'Pause or resume requests globally within this service instance.',
				category: 'Locking',
				sourceFile: 'http.service.ts',
			},
		],
		sections: [
			{
				title: 'Opts object',
				items: [
					'err(err): per-request error callback.',
					'acceptance(resp): reject unexpected payloads even when the HTTP status was successful.',
					'replace(item): mutate returned object(s) before subscribers receive them.',
					'fields: build a reduced object containing only the listed fields.',
					'data: dot-path pointing at the nested response object/array used by replace and fields.',
					'skipLock: ignore the locked flag for a specific request.',
					'url: temporary base URL override.',
				],
			},
		],
		code: `import { HttpService } from 'ngx-core';

constructor(private _httpService: HttpService) {}

loadProjects() {
\tthis._httpService.set('Authorization', 'Bearer token');
\treturn this._httpService.get('/projects', (resp) => console.log(resp), {
\t\tacceptance: (resp) => Array.isArray(resp),
\t});
}`,
	},
	{
		slug: 'rtc-service',
		name: 'RtcService',
		description:
			'SSR-guarded WebRTC helper for local media, peer creation, and offer/answer negotiation.',
		summary:
			'RtcService centralizes common WebRTC setup in one injectable feature. It initializes local camera and microphone access, keeps peer connections keyed by caller-defined ids, and wraps the core offer/answer flow without exposing browser-only APIs directly to every component.',
		highlights: [
			'Guards browser-only WebRTC access and throws clearly during SSR.',
			'Stores one local MediaStream and reuses its tracks across created peers.',
			'Covers the basic signaling lifecycle: peer creation, offers, answers, remote answers, ICE candidates, and cleanup.',
		],
		config: [
			'No provideNgxCore() configuration is required.',
			'This service does not implement signaling transport; pair it with HttpService or another channel to exchange offers, answers, and ICE candidates.',
			'Browser permissions for camera and microphone are requested when initLocalStream() runs.',
		],
		availableItems: ['rtc.service.ts'],
		methods: [
			{
				name: 'initLocalStream',
				signature: 'initLocalStream(): Promise<MediaStream>',
				description:
					'Requests camera and microphone access once and caches the local stream for later peer setup.',
				details: [
					'Throws during SSR because navigator.mediaDevices is browser-only.',
					'Subsequent calls return the existing stream instead of prompting again.',
				],
				category: 'Media',
				sourceFile: 'rtc.service.ts',
				example: `import { RtcService } from 'ngx-core';

private readonly _rtcService = inject(RtcService);

async startPreview() {
\tconst stream = await this._rtcService.initLocalStream();
\tthis.localVideo.nativeElement.srcObject = stream;
}`,
			},
			{
				name: 'createPeer',
				signature: 'createPeer(id: string): Promise<RTCPeerConnection>',
				description:
					'Creates a peer connection for the supplied id and attaches any initialized local tracks.',
				details: [
					'Call initLocalStream() first when the peer should publish local audio/video.',
				],
				category: 'Peers',
				sourceFile: 'rtc.service.ts',
			},
			{
				name: 'getPeer',
				signature: 'getPeer(id: string): RTCPeerConnection | undefined',
				description: 'Returns the stored peer connection for an id when it exists.',
				category: 'Peers',
				sourceFile: 'rtc.service.ts',
			},
			{
				name: 'createOffer',
				signature: 'createOffer(id: string): Promise<RTCSessionDescriptionInit>',
				description:
					'Builds an SDP offer for an existing peer and stores it as the local description.',
				category: 'Signaling',
				sourceFile: 'rtc.service.ts',
			},
			{
				name: 'createAnswer',
				signature:
					'createAnswer(id: string, offer: RTCSessionDescriptionInit): Promise<RTCSessionDescriptionInit>',
				description:
					'Applies a remote offer to an existing peer, generates an SDP answer, and stores it as the local description.',
				category: 'Signaling',
				sourceFile: 'rtc.service.ts',
			},
			{
				name: 'setRemoteAnswer',
				signature:
					'setRemoteAnswer(id: string, answer: RTCSessionDescriptionInit): Promise<void>',
				description:
					'Applies the remote SDP answer to the matching peer connection after offer creation.',
				category: 'Signaling',
				sourceFile: 'rtc.service.ts',
			},
			{
				name: 'addIceCandidate',
				signature: 'addIceCandidate(id: string, candidate: RTCIceCandidateInit): void',
				description: 'Adds a remote ICE candidate to the matching peer when available.',
				category: 'Signaling',
				sourceFile: 'rtc.service.ts',
			},
			{
				name: 'getLocalStream',
				signature: 'getLocalStream(): MediaStream | null',
				description: 'Returns the cached local media stream or null when not initialized.',
				category: 'Media',
				sourceFile: 'rtc.service.ts',
			},
			{
				name: 'closePeer',
				signature: 'closePeer(id: string): void',
				description:
					'Closes one peer connection and removes it from the internal peer map.',
				category: 'Cleanup',
				sourceFile: 'rtc.service.ts',
			},
			{
				name: 'closeAll',
				signature: 'closeAll(): void',
				description:
					'Closes every tracked peer and stops all tracks on the local media stream.',
				category: 'Cleanup',
				sourceFile: 'rtc.service.ts',
			},
		],
		sections: [
			{
				title: 'Feature role',
				items: [
					'Use RtcService to keep WebRTC browser APIs behind one SSR-safe Angular service.',
					'The service handles peer/media primitives only; your app still needs a signaling path to exchange SDP and ICE payloads.',
					'Provide your own signaling companion when peers need real-time negotiation events.',
				],
			},
		],
		code: `import { RtcService } from 'ngx-core';

private readonly _rtcService = inject(RtcService);

async connect(id: string) {
\tawait this._rtcService.initLocalStream();
\tawait this._rtcService.createPeer(id);

\tconst offer = await this._rtcService.createOffer(id);
\t// send offer through your signaling channel
\tconsole.log(offer);
}`,
	},
	{
		slug: 'store-service',
		name: 'StoreService',
		description:
			'Async-first persistence wrapper for localStorage or a custom storage provider.',
		summary:
			'StoreService keeps storage access behind one SSR-safe API. It can use the built-in localStorage implementation or delegate to custom set/get/remove/clear handlers provided through config.',
		highlights: [
			'Works with strings and JSON payloads.',
			'Supports success/error callbacks plus Promise-based consumption.',
			'Can auto-clear broken JSON payloads and return a default fallback.',
		],
		config: [
			'Set a global prefix with provideNgxCore({ store: { prefix: "waStore" } }).',
			'Provide custom store.set/get/remove/clear handlers to back the service with another persistence layer.',
			'setPrefix() adds an additional runtime prefix on top of the configured prefix.',
		],
		availableItems: ['store.service.ts', 'store.interface.ts'],
		properties: [
			{
				name: 'StoreOptions',
				signature: 'interface StoreOptions<T = unknown>',
				description:
					'Shared options contract for store reads and writes, including callbacks and JSON fallback behavior.',
				details: ['Supports onSuccess, onError, defaultValue, and clearOnError.'],
				category: 'Contracts',
				docType: 'Interface',
				sourceFile: 'store.interface.ts',
			},
			{
				name: 'StoreConfig',
				signature: 'interface StoreConfig',
				description:
					'Configuration contract passed through provideNgxCore() for storage prefixing and custom persistence handlers.',
				category: 'Contracts',
				docType: 'Interface',
				sourceFile: 'store.interface.ts',
			},
		],
		methods: [
			{
				name: 'setPrefix',
				signature: 'setPrefix(prefix: string): void',
				description: 'Adds a runtime prefix applied after any configured prefix.',
				category: 'Configuration',
				sourceFile: 'store.service.ts',
			},
			{
				name: 'set',
				signature:
					'set(key: string, value: string, options?: StoreOptions): Promise<boolean>',
				description: 'Stores a raw string value.',
				details: [
					'Returns true on success, false on failure, and is SSR-safe when no browser storage exists.',
				],
				category: 'Storage',
				sourceFile: 'store.service.ts',
			},
			{
				name: 'get',
				signature:
					'get(key: string, options?: StoreOptions<string>): Promise<string | null>',
				description: 'Reads a raw string value and returns null when it does not exist.',
				category: 'Storage',
				sourceFile: 'store.service.ts',
			},
			{
				name: 'setJson',
				signature:
					'setJson<T>(key: string, value: T, options?: StoreOptions): Promise<boolean>',
				description: 'Serializes and stores structured JSON data.',
				category: 'JSON',
				sourceFile: 'store.service.ts',
			},
			{
				name: 'getJson',
				signature: 'getJson<T>(key: string, options?: StoreOptions<T>): Promise<T | null>',
				description: 'Reads and parses JSON with fallback and optional auto-healing.',
				details: [
					'clearOnError defaults to true and removes malformed JSON automatically.',
					'defaultValue is returned when storage is missing or parsing fails.',
				],
				category: 'JSON',
				sourceFile: 'store.service.ts',
			},
			{
				name: 'remove',
				signature: 'remove(key: string, options?: StoreOptions): Promise<boolean>',
				description: 'Deletes one storage key.',
				category: 'Storage',
				sourceFile: 'store.service.ts',
			},
			{
				name: 'clear',
				signature: 'clear(options?: StoreOptions): Promise<boolean>',
				description: 'Clears the entire storage provider.',
				category: 'Storage',
				sourceFile: 'store.service.ts',
			},
		],
		sections: [
			{
				title: 'StoreOptions',
				items: [
					'onSuccess(value?): callback invoked after successful completion.',
					'onError(error): callback invoked when the operation fails.',
					'defaultValue: fallback used by getJson().',
					'clearOnError: controls whether malformed JSON is removed.',
				],
			},
		],
		code: `import { StoreService } from 'ngx-core';

constructor(private _storeService: StoreService) {}

async saveSettings() {
\tawait this._storeService.setJson('settings', { compact: true, mode: 'dark' });
\treturn this._storeService.getJson('settings', { defaultValue: {} });
}`,
	},
	{
		slug: 'meta-service',
		name: 'MetaService',
		description: 'Centralized page meta handling for route-driven and manual SEO updates.',
		summary:
			'MetaService owns the page title and managed meta tags so single-page navigation does not leak stale SEO state across routes.',
		highlights: [
			'Can auto-apply route data.meta on every NavigationEnd.',
			'Generates standard, Open Graph, Twitter, and itemprop variants from a small input model.',
			'Manages canonical and other link tags without duplicates.',
		],
		config: [
			'Recommended setup: provideNgxCore({ meta: { applyFromRoutes: true, defaults: { ... } } }).',
			'useTitleSuffix appends defaults.titleSuffix or page.titleSuffix to page titles.',
			'defaults.links are stored in config, but link tags are intentionally managed separately through setLink().',
		],
		availableItems: [
			'meta.service.ts',
			'meta.interface.ts',
			'meta.type.ts',
			'meta.const.ts',
			'meta.guard.ts',
		],
		properties: [
			{
				name: 'MetaPage',
				signature: 'interface MetaPage',
				description:
					'Per-page metadata input for titles, descriptions, robots, images, and update controls.',
				category: 'Contracts',
				docType: 'Interface',
				sourceFile: 'meta.interface.ts',
			},
			{
				name: 'MetaDefaults',
				signature: 'interface MetaDefaults',
				description:
					'Default metadata values applied by MetaService when individual page fields are missing.',
				category: 'Contracts',
				docType: 'Interface',
				sourceFile: 'meta.interface.ts',
			},
			{
				name: 'MetaConfig',
				signature: 'interface MetaConfig',
				description:
					'Configuration contract used by provideNgxCore({ meta }) for route-driven updates and default SEO values.',
				category: 'Contracts',
				docType: 'Interface',
				sourceFile: 'meta.interface.ts',
			},
			{
				name: 'TagAttr',
				signature: "type TagAttr = 'name' | 'property' | 'itemprop'",
				description:
					'Type alias describing the supported meta-tag attribute families generated by MetaService.',
				category: 'Contracts',
				docType: 'Type',
				sourceFile: 'meta.type.ts',
			},
			{
				name: 'isDefined',
				signature: 'const isDefined(val: unknown): val is Exclude<unknown, undefined>',
				description:
					'Helper const used by the meta feature to distinguish missing values from intentionally provided empty values.',
				category: 'Helpers',
				docType: 'Const',
				sourceFile: 'meta.const.ts',
			},
		],
		methods: [
			{
				name: 'setDefaults',
				signature: 'setDefaults(defaults: MetaDefaults): void',
				description: 'Merges new defaults into the existing meta configuration.',
				category: 'Configuration',
				sourceFile: 'meta.service.ts',
			},
			{
				name: 'applyMeta',
				signature: 'applyMeta(page?: MetaPage): void',
				description:
					'Applies title, description, image, and robots metadata for the current page.',
				details: [
					'Removes previously managed tags first to prevent stale metadata.',
					'Uses defaults as fallbacks for missing page values.',
					'Skips all work when page.disableUpdate is true.',
				],
				category: 'Updates',
				sourceFile: 'meta.service.ts',
			},
			{
				name: 'reset',
				signature: 'reset(): void',
				description: 'Clears managed tags and reapplies defaults-only metadata.',
				category: 'Updates',
				sourceFile: 'meta.service.ts',
			},
			{
				name: 'setLink',
				signature: 'setLink(links: Record<string, string>): void',
				description:
					'Creates or updates canonical and other link rel tags without duplication.',
				category: 'Links',
				sourceFile: 'meta.service.ts',
			},
			{
				name: 'resetLinks',
				signature: 'resetLinks(): void',
				description: 'Removes only the link tags previously managed via setLink().',
				category: 'Links',
				sourceFile: 'meta.service.ts',
			},
			{
				name: 'MetaGuard',
				signature: 'class MetaGuard',
				description:
					'Route guard variant that applies metadata during navigation for apps that still prefer guard-driven SEO updates.',
				category: 'Routing',
				docType: 'Service',
				sourceFile: 'meta.guard.ts',
			},
		],
		sections: [
			{
				title: 'Meta inputs',
				items: [
					'MetaPage: title, titleSuffix, description, image, index, robots, disableUpdate.',
					'MetaDefaults: same content fields plus links for canonical/alternate defaults.',
					'robots wins over index when both are present.',
					'When applyFromRoutes is enabled, the service reads data.meta from the deepest active route.',
				],
			},
			{
				title: 'Generated tags',
				items: [
					'Title updates: <title>, itemprop="name", og:title, twitter:title.',
					'Description updates: description, itemprop="description", og:description, twitter:description.',
					'Image updates: itemprop="image", og:image, twitter:image:src.',
					'Robots updates: name="robots".',
				],
			},
		],
		code: `provideNgxCore({
\tmeta: {
\t\tapplyFromRoutes: true,
\t\tuseTitleSuffix: true,
\t\tdefaults: {
\t\t\ttitle: 'ngx-core',
\t\t\ttitleSuffix: ' | Web Art Work',
\t\t\tdescription: 'Angular utility library',
\t\t},
\t},
});`,
	},
	{
		slug: 'crud-service',
		name: 'CrudService',
		description:
			'Reusable document data layer with local cache, signals, offline queueing, and lifecycle hooks.',
		summary:
			'CrudService is the heaviest abstraction in the library. Extend it for document collections that need cached reads, create/update/delete calls, offline retries, filtered list projections, and signal-based access patterns.',
		highlights: [
			'Restores cached docs from storage and replays pending mutations when the app comes back online.',
			'Exposes Observable workflows plus per-document and per-query Angular signals.',
			'Supports lifecycle middleware hooks before and after every CRUD operation.',
		],
		config: [
			'CrudConfig controls collection name, identity field, appId injection, unauthorized cache behavior, replace(doc) normalization, and signalFields.',
			'By default the collection URL is /api/<name> with get/create/fetch/update/unique/delete endpoints.',
			'When unauthorized is false, cache restore is tied to the current waw_user id in localStorage.',
		],
		availableItems: ['crud.service.ts', 'crud.interface.ts', 'crud.component.ts'],
		properties: [
			{
				name: 'loaded',
				signature: 'Observable<unknown>',
				description: 'Completes when cached documents are restored from storage.',
				category: 'Lifecycle',
				docType: 'Service',
				sourceFile: 'crud.service.ts',
			},
			{
				name: 'getted',
				signature: 'Observable<unknown>',
				description: 'Completes after the first full get() without page pagination.',
				category: 'Lifecycle',
				docType: 'Service',
				sourceFile: 'crud.service.ts',
			},
			{
				name: 'documents',
				signature: 'protected documents = signal<Signal<Document>[]>([])',
				description:
					'CrudComponent stores the currently displayed document signals here for table and list rendering.',
				category: 'Component state',
				docType: 'Component',
				sourceFile: 'crud.component.ts',
			},
			{
				name: 'page / perPage / configType',
				signature: 'pagination and mode fields',
				description:
					'CrudComponent tracks pagination state and whether it loads from the server or local memory.',
				category: 'Component state',
				docType: 'Component',
				sourceFile: 'crud.component.ts',
			},
			{
				name: 'CrudDocument',
				signature: 'interface CrudDocument<Document>',
				description:
					'Base document contract with identity, ordering, and offline mutation metadata used by CrudService.',
				details: [
					'Includes _id, _localId, appId, order, __modified, __deleted, and __options.',
					'Use it as the base generic constraint for your app document model.',
				],
				category: 'Interfaces',
				docType: 'Interface',
				sourceFile: 'crud.interface.ts',
			},
			{
				name: 'CrudOptions',
				signature: 'interface CrudOptions<Document>',
				description:
					'Options passed into CRUD operations for callbacks and request naming.',
				details: ['Supports name, callback, and errCallback.'],
				category: 'Interfaces',
				docType: 'Interface',
				sourceFile: 'crud.interface.ts',
			},
			{
				name: 'CrudServiceInterface',
				signature: 'interface CrudServiceInterface<Document>',
				description: 'Contract that CrudComponent expects from a CRUD-backed data service.',
				category: 'Interfaces',
				docType: 'Interface',
				sourceFile: 'crud.interface.ts',
			},
			{
				name: 'TableConfig / TableConfigButton',
				signature: 'table configuration interfaces',
				description:
					'Describe row actions, header buttons, pagination handlers, and CRUD callbacks used by CrudComponent UIs.',
				category: 'Interfaces',
				docType: 'Interface',
				sourceFile: 'crud.interface.ts',
			},
			{
				name: 'CrudConfig / GetConfig',
				signature: 'configuration interfaces',
				description:
					'Define the CrudService constructor config and read-query options for collection requests.',
				category: 'Interfaces',
				docType: 'Interface',
				sourceFile: 'crud.interface.ts',
			},
		],
		methods: [
			{
				name: 'restoreDocs',
				signature: 'restoreDocs(): Promise<void>',
				description:
					'Loads cached docs, hydrates memory, and replays pending create/update/unique/delete work.',
				category: 'Lifecycle',
				docType: 'Service',
				sourceFile: 'crud.service.ts',
			},
			{
				name: 'setDocs / getDocs / getDoc / clearDocs',
				signature: 'cache management helpers',
				description: 'Persist, retrieve, or reset the local in-memory document cache.',
				category: 'Cache',
				docType: 'Service',
				sourceFile: 'crud.service.ts',
			},
			{
				name: 'addDoc / addDocs',
				signature: 'addDoc(doc: Document): void / addDocs(docs: Document[]): void',
				description: 'Insert or merge documents into the cache and keep signals in sync.',
				category: 'Cache',
				docType: 'Service',
				sourceFile: 'crud.service.ts',
			},
			{
				name: 'new',
				signature: 'new(doc?: Document): Document',
				description: 'Creates a local-first document with _localId and mutation flags.',
				category: 'Documents',
				docType: 'Service',
				sourceFile: 'crud.service.ts',
			},
			{
				name: 'doc',
				signature: 'doc(_id: string): Document',
				description:
					'Returns a cached document, creates a placeholder if missing, and fetches the server copy in the background.',
				category: 'Documents',
				docType: 'Service',
				sourceFile: 'crud.service.ts',
			},
			{
				name: 'setPerPage',
				signature: 'setPerPage(_perPage: number): void',
				description: 'Controls skip/limit generation for paginated get() calls.',
				category: 'Pagination',
				docType: 'Service',
				sourceFile: 'crud.service.ts',
			},
			{
				name: 'get',
				signature:
					'get(config?: GetConfig, options?: CrudOptions<Document>): Observable<Document[]>',
				description:
					'Fetches collection documents, fills the cache, emits collection events, and supports pagination.',
				category: 'Requests',
				docType: 'Service',
				sourceFile: 'crud.service.ts',
			},
			{
				name: 'create',
				signature:
					'create(doc: Document, options?: CrudOptions<Document>): Observable<Document>',
				description:
					'Creates a document, stores local intent first, and retries automatically when offline.',
				category: 'Requests',
				docType: 'Service',
				sourceFile: 'crud.service.ts',
			},
			{
				name: 'fetch',
				signature:
					'fetch(query?: object, options?: CrudOptions<Document>): Observable<Document>',
				description: 'Fetches one document by query and merges it into the cache.',
				category: 'Requests',
				docType: 'Service',
				sourceFile: 'crud.service.ts',
			},
			{
				name: 'updateAfterWhile',
				signature:
					'updateAfterWhile(doc: Document, options?: CrudOptions<Document>): Observable<Document>',
				description:
					'Debounces update() through CoreService.afterWhile() for typing-heavy flows.',
				category: 'Requests',
				docType: 'Service',
				sourceFile: 'crud.service.ts',
			},
			{
				name: 'update',
				signature:
					'update(doc: Document, options?: CrudOptions<Document>): Observable<Document>',
				description:
					'Marks the document modified, posts to /update, clears the modification mark on success, and syncs signals.',
				category: 'Requests',
				docType: 'Service',
				sourceFile: 'crud.service.ts',
			},
			{
				name: 'unique',
				signature:
					'unique(doc: Document, options?: CrudOptions<Document>): Observable<Document>',
				description:
					'Runs a unique-field style update through /unique and stores the returned field value on the document.',
				category: 'Requests',
				docType: 'Service',
				sourceFile: 'crud.service.ts',
			},
			{
				name: 'delete',
				signature:
					'delete(doc: Document, options?: CrudOptions<Document>): Observable<Document>',
				description:
					'Marks the document deleted, queues offline if needed, and removes it from the cache on success.',
				category: 'Requests',
				docType: 'Service',
				sourceFile: 'crud.service.ts',
			},
			{
				name: 'getSignal / getSignals / getFieldSignals / removeSignals',
				signature: 'signal helpers',
				description:
					'Expose per-document signals, field/value grouped signals, and cache cleanup for signal instances.',
				category: 'Signals',
				docType: 'Service',
				sourceFile: 'crud.service.ts',
			},
			{
				name: 'filteredDocuments',
				signature: 'filteredDocuments(storeObjectOrArray, config): () => void',
				description:
					'Registers a live projection callback for arrays or grouped maps of documents.',
				details: [
					'Supports grouping by a field name or a custom field resolver.',
					'Supports valid(), sort(), and filtered() callbacks.',
					'Triggered whenever _filterDocuments() runs after cache mutations.',
				],
				category: 'Signals',
				docType: 'Service',
				sourceFile: 'crud.service.ts',
			},
			{
				name: 'before*/after* hooks',
				signature:
					'beforeCreate, afterCreate, beforeUpdate, afterUpdate, beforeUnique, afterUnique, beforeDelete, afterDelete, beforeFetch, afterFetch',
				description:
					'Override these in child services to normalize input, inject context, or react after server success.',
				category: 'Extensibility',
				docType: 'Service',
				sourceFile: 'crud.service.ts',
			},
			{
				name: 'setDocuments',
				signature: "setDocuments(page = this.page, query = ''): Promise<void>",
				description:
					'CrudComponent loads rows for the current page and updates its internal documents signal.',
				category: 'Loading and pagination',
				docType: 'Component',
				sourceFile: 'crud.component.ts',
			},
			{
				name: 'setDocumentsQuery / localDocumentsFilter / getOptions',
				signature: 'customization hooks',
				description:
					'CrudComponent lets feature components customize list queries, local filtering, and CRUD request options.',
				category: 'Customization hooks',
				docType: 'Component',
				sourceFile: 'crud.component.ts',
			},
			{
				name: 'create / update / delete / mutateUrl',
				signature: 'modal and mutation handlers',
				description:
					'CrudComponent wires modal workflows to create, update, delete, and unique-url actions.',
				category: 'Mutations',
				docType: 'Component',
				sourceFile: 'crud.component.ts',
			},
			{
				name: 'bulkManagement',
				signature: 'bulkManagement(isCreateFlow = true): () => void',
				description:
					'Handles batch create and batch update flows through modalDocs() and the CRUD service.',
				category: 'Mutations',
				docType: 'Component',
				sourceFile: 'crud.component.ts',
			},
			{
				name: 'moveUp / allowSort',
				signature: 'sorting helpers',
				description:
					'Provide optional manual ordering controls for list views backed by an `order` field.',
				category: 'List controls',
				docType: 'Component',
				sourceFile: 'crud.component.ts',
			},
			{
				name: 'getConfig',
				signature: 'getConfig(): TableConfig<Document>',
				description:
					'Builds the action and pagination configuration consumed by CRUD table UIs.',
				category: 'List controls',
				docType: 'Component',
				sourceFile: 'crud.component.ts',
			},
		],
		sections: [
			{
				title: 'Events emitted through EmitterService',
				items: [
					'<name>_loaded after cached restore.',
					'<name>_getted after initial full get().',
					'<name>_filtered after filteredDocuments projections recompute.',
					'<name>_get, _create, _update, _unique, _delete, _list, _changed during CRUD workflows.',
					'Responds to global wipe by clearing docs and to wacom_online by replaying queued operations.',
				],
			},
			{
				title: 'Offline behavior',
				items: [
					'create/update/unique/delete queue themselves when NetworkService reports offline.',
					'Pending changes are persisted to storage in __modified / __deleted / __options.',
					'When connectivity returns, the constructor drains queued callbacks registered in _onOnline.',
				],
			},
		],
		code: `import { CrudService, type CrudDocument } from 'ngx-core';

interface Project extends CrudDocument<Project> {
\t_id?: string;
\tname?: string;
}

export class ProjectService extends CrudService<Project> {
\tconstructor() {
\t\tsuper({ name: 'project' });
\t}
}`,
	},
	{
		slug: 'emitter-service',
		name: 'EmitterService',
		description:
			'Hot event channels and task-completion coordination built on signals and RxJS.',
		summary:
			'EmitterService acts as a small app-wide bus. It is useful for loose coupling between services, route workflows, and bootstrap steps without adding a larger state system.',
		highlights: [
			'emit()/on() creates Subject-like event channels with no replay on subscribe.',
			'complete()/onComplete() tracks one-off tasks separately from event channels.',
			'Supports waiting for all or any of several tasks, plus timeout and AbortSignal cancellation.',
		],
		availableItems: ['emitter.service.ts'],
		methods: [
			{
				name: 'emit',
				signature: 'emit<T>(id: string, data?: T): void',
				description: 'Publishes an event on a named hot channel.',
				category: 'Events',
				sourceFile: 'emitter.service.ts',
			},
			{
				name: 'on',
				signature: 'on<T>(id: string): Observable<T>',
				description:
					'Subscribes to a named channel. Existing value is not replayed to new subscribers.',
				category: 'Events',
				sourceFile: 'emitter.service.ts',
			},
			{
				name: 'off / offAll',
				signature: 'off(id: string): void / offAll(): void',
				description:
					'Completes channels and removes their internal signal, closer, and stream state.',
				category: 'Events',
				sourceFile: 'emitter.service.ts',
			},
			{
				name: 'has',
				signature: 'has(id: string): boolean',
				description: 'Checks whether an event channel has been created.',
				category: 'Events',
				sourceFile: 'emitter.service.ts',
			},
			{
				name: 'complete',
				signature: 'complete<T>(task: string, value: T = true): void',
				description: 'Marks a named task as completed with a payload.',
				category: 'Completions',
				sourceFile: 'emitter.service.ts',
			},
			{
				name: 'clearCompleted / completed / isCompleted',
				signature: 'task completion helpers',
				description: 'Reset and inspect the current completion state for a task.',
				category: 'Completions',
				sourceFile: 'emitter.service.ts',
			},
			{
				name: 'onComplete',
				signature:
					"onComplete(tasks: string | string[], opts?: { mode?: 'all' | 'any'; timeoutMs?: number; abort?: AbortSignal; }): Observable<any | any[]>",
				description: 'Waits for one or more tasks to be completed.',
				details: [
					'Single task waits for the first completed payload.',
					'mode: "any" resolves on the first completed task from the list.',
					'Default mode waits for all tasks and returns combineLatest-style payloads.',
				],
				category: 'Completions',
				sourceFile: 'emitter.service.ts',
			},
		],
		code: `import { EmitterService } from 'ngx-core';

constructor(private _emitterService: EmitterService) {}

ngOnInit() {
\tthis._emitterService.on('user:login').subscribe((user) => console.log(user));
}

markReady() {
\tthis._emitterService.complete('bootstrap:ready');
}`,
	},
	{
		slug: 'network-service',
		name: 'NetworkService',
		description: 'Signal-driven connectivity classification with active endpoint probing.',
		summary:
			'NetworkService does more than mirror navigator.onLine. It periodically pings configured endpoints, measures latency, classifies the result as good/poor/none, and emits online/offline events for the rest of the library.',
		highlights: [
			'Tracks status, latencyMs, and isOnline as Angular signals.',
			'Combines browser online/offline events with active fetch-based checks.',
			'Emits wacom_online and wacom_offline through EmitterService when classification changes.',
		],
		config: [
			'Configure with provideNgxCore({ network: { endpoints, timeoutMs, intervalMs, goodLatencyMs, maxConsecutiveFails } }).',
			'endpoints are checked in order until one responds successfully.',
			'Public fallback endpoints use no-cors mode unless the URL contains api.webart.work.',
		],
		availableItems: ['network.service.ts', 'network.interface.ts'],
		properties: [
			{
				name: 'status',
				signature: "readonly Signal<'good' | 'poor' | 'none'>",
				description:
					'Connectivity classification based on browser state and measured latency.',
				category: 'State',
				sourceFile: 'network.service.ts',
			},
			{
				name: 'latencyMs',
				signature: 'readonly Signal<number | null>',
				description:
					'Measured latency for the first reachable endpoint or null when no check succeeded.',
				category: 'State',
				sourceFile: 'network.service.ts',
			},
			{
				name: 'isOnline',
				signature: 'readonly Signal<boolean>',
				description:
					'Current online state, influenced by browser online/offline events and successful checks.',
				category: 'State',
				sourceFile: 'network.service.ts',
			},
			{
				name: 'NetworkConfig',
				signature: 'interface NetworkConfig',
				description:
					'Configuration contract for endpoint probing cadence, timeouts, and classification thresholds.',
				category: 'Contracts',
				docType: 'Interface',
				sourceFile: 'network.interface.ts',
			},
			{
				name: 'NetworkStatus / DEFAULT_NETWORK_CONFIG / NETWORK_CONFIG',
				signature: 'status type, defaults const, and injection token',
				description:
					'Exports that define network status values and the default/injectable network configuration.',
				category: 'Contracts',
				docType: 'Const',
				sourceFile: 'network.interface.ts',
			},
		],
		methods: [
			{
				name: 'recheckNow',
				signature: 'recheckNow(): Promise<void>',
				description:
					'Immediately probes endpoints, updates latency, and recalculates the connectivity classification.',
				category: 'Checks',
				sourceFile: 'network.service.ts',
			},
		],
		sections: [
			{
				title: 'Classification rules',
				items: [
					'none when browser is offline or failures reach maxConsecutiveFails.',
					'good when latency is available and <= goodLatencyMs.',
					'poor when the browser is online but latency is slow or unavailable without reaching none.',
				],
			},
			{
				title: 'Runtime behavior',
				items: [
					'Binds online/offline browser events.',
					'Listens to navigator.connection change when available.',
					'Runs one check on startup and continues polling on an interval.',
				],
			},
		],
		code: `provideNgxCore({
\tnetwork: {
\t\tintervalMs: 15000,
\t\tgoodLatencyMs: 250,
\t\tendpoints: ['https://api.webart.work/ping'],
\t},
});`,
	},
	{
		slug: 'language',
		name: 'Language',
		description:
			'Standalone language selection, registry, and persistence feature used by translate.',
		summary:
			'Language owns available language definitions, default and current language resolution, validation, and optional persistence. Translate depends on it for language state instead of embedding that logic directly.',
		highlights: [
			'Keeps language bootstrap separate from translation loading and signal updates.',
			'Resolves defaults, validates available codes, and persists the current language when enabled.',
			'Can be configured directly through provideLanguage() or indirectly through provideTranslate().',
		],
		config: [
			'Use provideLanguage({ language, defaultLanguage, languages, persistLanguage }) for standalone setup.',
			'provideTranslate() accepts the same language config and forwards it to LanguageService.',
			'Language persistence is stored through StoreService under the translate.language key.',
		],
		availableItems: [
			'provide-language.ts',
			'language.service.ts',
			'language.interface.ts',
			'language.const.ts',
		],
		methods: [
			{
				name: 'provideLanguage / provideLanguages',
				signature: 'provideLanguage(config?: ProvideLanguageConfig): EnvironmentProviders',
				description: 'Registers LanguageService initialization during app bootstrap.',
				category: 'Providers',
				sourceFile: 'provide-language.ts',
				example: `import { provideLanguage } from 'ngx-translate';

export const appConfig = {
\tproviders: [
\t\tprovideLanguage({
\t\t\tdefaultLanguage: 'en',
\t\t\tlanguages: ['en', 'de', 'fr'],
\t\t}),
\t],
};`,
			},
			{
				name: 'init',
				signature: 'init(config?: ProvideLanguageConfig): Promise<void>',
				description:
					'Resolves available languages, default language, stored language, and the initial active language.',
				category: 'Lifecycle',
				sourceFile: 'language.service.ts',
			},
			{
				name: 'language / defaultLanguage',
				signature: 'language(): string / defaultLanguage(): string',
				description: 'Returns the current and fallback language codes.',
				category: 'State',
				sourceFile: 'language.service.ts',
			},
			{
				name: 'languages / allLanguages',
				signature: 'languages(): Language[] / allLanguages(): Language[]',
				description: 'Returns configured languages or the built-in defaults catalogue.',
				category: 'State',
				sourceFile: 'language.service.ts',
			},
			{
				name: 'getLanguage / hasLanguage',
				signature: 'lookup helpers',
				description:
					'Reads one configured language by code and validates whether a language is available.',
				category: 'Lookup',
				sourceFile: 'language.service.ts',
			},
			{
				name: 'setLanguages',
				signature:
					'setLanguages(languages: readonly LanguageInput[], syncCurrentLanguage = true): void',
				description:
					'Replaces the configured language list and optionally syncs the active language to a valid fallback.',
				category: 'State',
				sourceFile: 'language.service.ts',
			},
			{
				name: 'setLanguage',
				signature: 'setLanguage(code: string): Promise<boolean>',
				description:
					'Validates and applies the active language, then persists it when enabled.',
				category: 'State',
				sourceFile: 'language.service.ts',
				example: `import { LanguageService } from 'ngx-translate';

private readonly _languageService = inject(LanguageService);

async switchLanguage(code: string) {
\tconst changed = await this._languageService.setLanguage(code);
\tif (changed) {
\t\tconsole.log('language updated', this._languageService.language());
\t}
}`,
			},
			{
				name: 'Language',
				signature:
					'interface Language { code: string; name: string; nativeName?: string; }',
				description:
					'Represents one normalized language definition used by the feature and translation runtime.',
				category: 'Contracts',
				docType: 'Interface',
				sourceFile: 'language.interface.ts',
			},
			{
				name: 'LanguageInput',
				signature: 'type LanguageInput = string | Language',
				description:
					'Allows configuration to use either a language code string or a full language object.',
				category: 'Contracts',
				docType: 'Type',
				sourceFile: 'language.interface.ts',
			},
			{
				name: 'ProvideLanguageConfig',
				signature:
					'interface ProvideLanguageConfig { language?; defaultLanguage?; languages?; persistLanguage?; }',
				description:
					'Bootstrap options consumed by provideLanguage() and LanguageService.init().',
				category: 'Contracts',
				docType: 'Interface',
				sourceFile: 'language.interface.ts',
			},
			{
				name: 'DEFAULT_LANGUAGES',
				signature: 'const DEFAULT_LANGUAGES: Language[]',
				description:
					'Built-in language catalogue used as the default fallback and for resolving known language metadata.',
				category: 'Defaults',
				docType: 'Const',
				sourceFile: 'language.const.ts',
			},
		],
		sections: [
			{
				title: 'Feature role',
				items: [
					'LanguageService owns current language state and valid language definitions.',
					'provideLanguage() bootstraps the feature without requiring TranslateService.',
					'TranslateService injects LanguageService and reacts to language changes to load translation payloads.',
				],
			},
		],
		code: `import { LanguageService, provideLanguage } from 'ngx-translate';

export const appConfig = {
\tproviders: [provideLanguage({ defaultLanguage: 'en' })],
};

readonly languageService = inject(LanguageService);

async setGerman() {
\tawait this.languageService.setLanguage('de');
}`,
	},
	{
		slug: 'translate-service',
		name: 'TranslateService',
		description:
			'Runtime translation registry backed by signals and integrated with the separate Language feature.',
		summary:
			'TranslateService is the library runtime i18n layer. It exposes a signal per source text, loads language-specific translation payloads, and updates the UI reactively while delegating current-language state to LanguageService.',
		highlights: [
			'translate(text) lazily creates a signal that falls back to the source text.',
			'setMany() resets missing translations back to source text and updates the provided ones.',
			'setLanguage() switches through LanguageService, lazy-loads payloads, and applies them without stale cross-language state.',
		],
		config: [
			'Register translation bootstrap with provideTranslate({ language, defaultLanguage, translations?, folder? }).',
			'With folder mode, language files are loaded as /i18n/{lang}.json by default.',
			'Language selection is handled by the Language feature and reused here.',
			'This service manages runtime translation state; the translate pipe and directive build on top of it.',
		],
		availableItems: [
			'provide-translate.ts',
			'translate.service.ts',
			'translate.interface.ts',
			'translate.type.ts',
			'translate.directive.ts',
			'translate.pipe.ts',
		],
		methods: [
			{
				name: 'translate',
				signature: 'translate(text: string): WritableSignal<string>',
				description:
					'Returns the translation signal for a source text, creating it lazily if needed.',
			},
			{
				name: 'setLanguage',
				signature: 'setLanguage(language: string): Promise<void>',
				description:
					'Switches current language, lazy-loads the translation payload, and applies it reactively.',
			},
			{
				name: 'loadTranslations',
				signature: 'loadTranslations(language: string): Promise<Translate[]>',
				description:
					'Loads translation payload for a language from inline config or JSON file loader and caches it per language.',
			},
			{
				name: 'setMany',
				signature: 'setMany(translations: Translate[]): void',
				description: 'Bulk-replaces translations for the current language.',
				details: [
					'Existing signals not present in the new set reset to their original source text.',
					'Provided translations update their matching signals.',
				],
			},
			{
				name: 'setOne',
				signature: 'setOne(translation: Translate): void',
				description: 'Updates one translation entry and persists the new state.',
			},
			{
				name: 'get',
				signature: 'get(): Translates',
				description: 'Returns the internal sourceText -> WritableSignal<string> registry.',
			},
		],
		sections: [
			{
				title: 'Bootstrap behavior',
				items: [
					'Initial language resolves from language ?? stored language (optional) ?? defaultLanguage.',
					'If inline translations exist for a language they are used directly; otherwise the file loader is used.',
					'Missing language files fail safely and translations fall back to source text.',
					'Signals are created lazily; there is no need to pre-register every possible text.',
				],
			},
		],
		code: `import { TranslateService } from 'ngx-translate';

private readonly _translateService = inject(TranslateService);

title = this._translateService.translate('Create project');

switchLanguage() {
	void this._translateService.setLanguage('es');
}`,
	},
];

const _VISIBLE_SERVICE_DOCS = _serviceDocs.filter(
	doc =>
		doc.slug !== 'translate-service' &&
		doc.slug !== 'language' &&
		doc.slug !== 'http-service' &&
		doc.slug !== 'network-service' &&
		doc.slug !== 'crud-service' &&
		doc.slug !== 'rtc-service',
);

export const serviceDocs: ServiceDoc[] = [..._VISIBLE_SERVICE_DOCS].sort((a, b) => {
	const aIndex = _serviceDocOrderMap.get(a.slug) ?? Number.MAX_SAFE_INTEGER;
	const bIndex = _serviceDocOrderMap.get(b.slug) ?? Number.MAX_SAFE_INTEGER;
	return aIndex - bIndex;
});

export const serviceDocMap = new Map(serviceDocs.map(doc => [doc.slug, doc]));
