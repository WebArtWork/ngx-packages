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

const _SERVICE_DOC_ORDER = ['http-service', 'network-service'] as const;

const _serviceDocOrderMap: ReadonlyMap<string, number> = new Map(
	_SERVICE_DOC_ORDER.map((slug, index) => [slug, index] as const),
);

const _serviceDocs: ServiceDoc[] = [
	{
		slug: 'http-service',
		name: 'HttpService',
		description:
			'Shared HTTP wrapper with base URL, shared headers, and legacy callback support.',
		summary:
			'HttpService centralizes request setup for Angular apps. It stores a base URL, keeps shared headers in sync, supports GET/POST/PUT/PATCH/DELETE helpers, and still works with legacy callback flows while returning Observables.',
		highlights: [
			'Keeps base URL and shared headers in one injectable service.',
			'Persists client-side overrides in localStorage under ngx-http.url and ngx-http.headers.',
			'Returns Observables while still supporting callback-style consumers.',
		],
		config: [
			'Configure the package with provideNgxHttp({ http: { url, headers }, network: { ... } }).',
			'provideNgxHttp() also registers Angular HttpClient with fetch support and DI interceptors.',
		],
		availableItems: [
			'config.interface.ts',
			'provide-ngx-http.ts',
			'http.interface.ts',
			'http.service.ts',
		],
		properties: [
			{
				name: 'Config',
				signature: 'interface Config',
				description:
					'Package-wide configuration contract for the extracted http and network features.',
				category: 'Configuration',
				docType: 'Interface',
				sourceFile: 'config.interface.ts',
			},
			{
				name: 'CONFIG_TOKEN',
				signature: 'InjectionToken<Config>',
				description:
					'Injection token used internally to read resolved ngx-http configuration.',
				category: 'Configuration',
				docType: 'Const',
				sourceFile: 'config.interface.ts',
			},
			{
				name: 'DEFAULT_CONFIG',
				signature: 'const DEFAULT_CONFIG: Config',
				description:
					'Default ngx-http configuration used when provideNgxHttp() is called without overrides.',
				category: 'Configuration',
				docType: 'Const',
				sourceFile: 'config.interface.ts',
			},
			{
				name: 'HttpConfig',
				signature: 'interface HttpConfig',
				description: 'Configuration contract for the shared base URL and default headers.',
				category: 'Configuration',
				docType: 'Interface',
				sourceFile: 'http.interface.ts',
			},
			{
				name: 'HttpHeaderType',
				signature: 'type HttpHeaderType = string | number | (string | number)[]',
				description:
					'Accepted header value types used by HttpConfig and HttpService.set().',
				category: 'Configuration',
				docType: 'Type',
				sourceFile: 'http.interface.ts',
			},
			{
				name: 'url',
				signature: 'url: string',
				description: 'Current base URL prepended to request paths.',
				category: 'State',
				sourceFile: 'http.service.ts',
			},
			{
				name: 'errors',
				signature: '((err: HttpErrorResponse, retry?: () => void) => {})[]',
				description:
					'Global request error callbacks that can observe failures and trigger retries.',
				category: 'State',
				sourceFile: 'http.service.ts',
			},
		],
		methods: [
			{
				name: 'provideNgxHttp',
				signature: 'provideNgxHttp(config?: Config): EnvironmentProviders',
				description:
					'Registers the ngx-http config token and Angular HttpClient providers.',
				category: 'Bootstrap',
				docType: 'Const',
				sourceFile: 'provide-ngx-http.ts',
				example: `import { provideNgxHttp } from 'ngx-http';

export const appConfig = {
\tproviders: [
\t\tprovideNgxHttp({
\t\t\thttp: { url: '/api', headers: { 'X-App': 'docs' } },
\t\t}),
\t],
};`,
			},
			{
				name: 'setUrl',
				signature: 'setUrl(url: string): void',
				description: 'Sets the shared request base URL and persists it on the client.',
				category: 'Configuration',
				sourceFile: 'http.service.ts',
			},
			{
				name: 'removeUrl',
				signature: 'removeUrl(): void',
				description: 'Restores the configured default URL and clears the client override.',
				category: 'Configuration',
				sourceFile: 'http.service.ts',
			},
			{
				name: 'set / header / remove',
				signature: 'header helpers',
				description: 'Add, read, and remove shared headers used by every request.',
				category: 'Headers',
				sourceFile: 'http.service.ts',
			},
			{
				name: 'post / put / patch / delete / get',
				signature: 'request helpers returning Observable<any>',
				description: 'Perform HTTP requests through the shared base URL and headers.',
				details: [
					'Each helper supports a legacy callback as the third argument.',
					'Options can override error handling, acceptance checks, field extraction, and request locking.',
				],
				category: 'Requests',
				sourceFile: 'http.service.ts',
				example: `import { HttpService } from 'ngx-http';

constructor(private _httpService: HttpService) {}

loadProjects() {
\treturn this._httpService.get('/projects', (resp) => console.log(resp));
}`,
			},
			{
				name: 'lock / unlock / clearLocked',
				signature: 'request lock helpers',
				description:
					'Coordinate request bursts by delaying new calls until the service is unlocked.',
				category: 'Flow control',
				sourceFile: 'http.service.ts',
			},
		],
		sections: [
			{
				title: 'Feature role',
				items: [
					'Use HttpService when an app wants one place to manage API base URL and shared headers.',
					'The service preserves compatibility with older callback-based code without dropping Observable support.',
					'Client-side overrides are persisted so debug or tenant-specific API targets survive reloads.',
				],
			},
		],
		code: `import { provideNgxHttp } from 'ngx-http';

export const appConfig = {
\tproviders: [
\t\tprovideNgxHttp({
\t\t\thttp: { url: 'https://api.example.com' },
\t\t}),
\t],
};`,
	},
	{
		slug: 'network-service',
		name: 'NetworkService',
		description: 'Signal-driven connectivity classification with active endpoint probing.',
		summary:
			'NetworkService combines browser online/offline signals with active endpoint checks. It measures latency, classifies connectivity as good, poor, or none, and exposes the result through Angular signals for the rest of the app.',
		highlights: [
			'Tracks status, latencyMs, and isOnline as Angular signals.',
			'Probes configured endpoints on startup and on an interval.',
			'Works with browser online/offline events instead of relying only on navigator.onLine.',
		],
		config: [
			'Configure endpoint probing with provideNgxHttp({ network: { endpoints, timeoutMs, intervalMs, goodLatencyMs, maxConsecutiveFails } }).',
			'Endpoints are checked in order until one succeeds.',
		],
		availableItems: [
			'config.interface.ts',
			'provide-ngx-http.ts',
			'network.interface.ts',
			'network.service.ts',
		],
		properties: [
			{
				name: 'NetworkConfig',
				signature: 'interface NetworkConfig',
				description:
					'Configuration contract for endpoint lists, timeouts, latency thresholds, and failure tolerance.',
				category: 'Configuration',
				docType: 'Interface',
				sourceFile: 'network.interface.ts',
			},
			{
				name: 'NetworkStatus',
				signature: "type NetworkStatus = 'good' | 'poor' | 'none'",
				description: 'Connectivity classification exposed by the service.',
				category: 'Configuration',
				docType: 'Type',
				sourceFile: 'network.interface.ts',
			},
			{
				name: 'DEFAULT_NETWORK_CONFIG',
				signature: 'const DEFAULT_NETWORK_CONFIG: NetworkConfig',
				description: 'Built-in fallback endpoints and polling defaults.',
				category: 'Configuration',
				docType: 'Const',
				sourceFile: 'network.interface.ts',
			},
			{
				name: 'NETWORK_CONFIG',
				signature: 'InjectionToken<NetworkConfig>',
				description: 'Exported token for the default network config contract.',
				category: 'Configuration',
				docType: 'Const',
				sourceFile: 'network.interface.ts',
			},
			{
				name: 'status',
				signature: "readonly Signal<'good' | 'poor' | 'none'>",
				description: 'Current connectivity classification.',
				category: 'State',
				sourceFile: 'network.service.ts',
			},
			{
				name: 'latencyMs',
				signature: 'readonly Signal<number | null>',
				description: 'Measured latency to the first reachable endpoint.',
				category: 'State',
				sourceFile: 'network.service.ts',
			},
			{
				name: 'isOnline',
				signature: 'readonly Signal<boolean>',
				description: 'Browser-level online status enriched by the active probe result.',
				category: 'State',
				sourceFile: 'network.service.ts',
			},
		],
		methods: [
			{
				name: 'provideNgxHttp',
				signature: 'provideNgxHttp(config?: Config): EnvironmentProviders',
				description:
					'Registers the shared config consumed by NetworkService and HttpService.',
				category: 'Bootstrap',
				docType: 'Const',
				sourceFile: 'provide-ngx-http.ts',
			},
			{
				name: 'recheckNow',
				signature: 'recheckNow(): Promise<void>',
				description:
					'Immediately probes the configured endpoints and refreshes all exposed signals.',
				category: 'Checks',
				sourceFile: 'network.service.ts',
				example: `import { NetworkService } from 'ngx-http';

constructor(private _networkService: NetworkService) {}

async refreshStatus() {
\tawait this._networkService.recheckNow();
\tconsole.log(this._networkService.status(), this._networkService.latencyMs());
}`,
			},
		],
		sections: [
			{
				title: 'Classification rules',
				items: [
					'none when the browser is offline or failures reach maxConsecutiveFails.',
					'good when latency is available and less than or equal to goodLatencyMs.',
					'poor when the browser reports online but latency is slow or missing without reaching none.',
				],
			},
			{
				title: 'Runtime behavior',
				items: [
					'Binds online/offline browser events.',
					'Performs one startup check and keeps polling on the configured interval.',
					'Uses fetch with timeout control and no-store semantics to avoid cached probe results.',
				],
			},
		],
		code: `import { provideNgxHttp } from 'ngx-http';

export const appConfig = {
\tproviders: [
\t\tprovideNgxHttp({
\t\t\tnetwork: {
\t\t\t\tintervalMs: 15000,
\t\t\t\tgoodLatencyMs: 250,
\t\t\t\tendpoints: ['https://api.example.com/ping'],
\t\t\t},
\t\t}),
\t],
};`,
	},
];

export const serviceDocs: ServiceDoc[] = [..._serviceDocs].sort((a, b) => {
	const aIndex = _serviceDocOrderMap.get(a.slug) ?? Number.MAX_SAFE_INTEGER;
	const bIndex = _serviceDocOrderMap.get(b.slug) ?? Number.MAX_SAFE_INTEGER;
	return aIndex - bIndex;
});

export const serviceDocMap = new Map(serviceDocs.map(doc => [doc.slug, doc]));
