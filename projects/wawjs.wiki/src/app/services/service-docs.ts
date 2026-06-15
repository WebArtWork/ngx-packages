export interface ServiceMethodDoc {
	name: string;
	signature: string;
	description: string;
	details?: string[];
	example?: string;
	url?: string;
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

const _featureDocs: ServiceDoc[] = [
	{
		slug: 'waw',
		name: 'WAW Framework',
		description: 'Backend framework and package references for Web Art Work products.',
		summary: 'Start here for WAW backend packages, CLI tooling, and core framework repositories.',
		highlights: [
			'Backend framework entry point',
			'CLI package for project workflows',
			'Default backend API starter project',
			'Core and SEM package references',
		],
		availableItems: ['backend-links.ts'],
		methods: [
			{
				name: '@wawjs/cli',
				signature: 'https://www.npmjs.com/package/@wawjs/cli',
				url: 'https://www.npmjs.com/package/@wawjs/cli',
				description: 'NPM package for WAW command-line tooling and project automation.',
				details: ['Use this package as the public CLI reference until local docs are added.'],
				docType: 'Const',
				category: 'NPM',
				sourceFile: 'backend-links.ts',
			},
			{
				name: 'WebArtWork/waw',
				signature: 'https://github.com/WebArtWork/waw',
				url: 'https://github.com/WebArtWork/waw',
				description: 'Main WAW framework repository on GitHub.',
				details: ['This is the primary backend framework reference for new developers.'],
				docType: 'Const',
				category: 'GitHub',
				sourceFile: 'backend-links.ts',
			},
			{
				name: 'WebArtWork/waw-default',
				signature: 'https://github.com/WebArtWork/waw-default',
				url: 'https://github.com/WebArtWork/waw-default',
				description: 'Default project for starting a backend API with WAW.',
				details: ['Use this repository as the starter backend API project for new WAW services.'],
				docType: 'Const',
				category: 'GitHub',
				sourceFile: 'backend-links.ts',
			},
			{
				name: 'WebArtWork/waw-core',
				signature: 'https://github.com/WebArtWork/waw-core',
				url: 'https://github.com/WebArtWork/waw-core',
				description: 'Core backend package repository for shared WAW framework behavior.',
				details: ['Link here when a developer needs the backend core implementation.'],
				docType: 'Const',
				category: 'GitHub',
				sourceFile: 'backend-links.ts',
			},
			{
				name: 'WebArtWork/waw-sem',
				signature: 'https://github.com/WebArtWork/waw-sem',
				url: 'https://github.com/WebArtWork/waw-sem',
				description: 'SEM backend package repository in the WAW ecosystem.',
				details: ['Temporary external reference until this wiki owns local package docs.'],
				docType: 'Const',
				category: 'GitHub',
				sourceFile: 'backend-links.ts',
			},
		],
		sections: [
			{
				title: 'Purpose',
				items: [
					'Guide backend developers toward the current WAW package references.',
					'Replace these external links with local app-backed documentation over time.',
				],
			},
		],
		code: '',
	},
	{
		slug: 'ngx',
		name: 'Angular ngx',
		description: 'Angular package docs and demo applications for the @wawjs/ngx ecosystem.',
		summary: 'Start with core package docs, then open focused package apps for Angular implementation details.',
		highlights: [
			'Combined Angular package entry point',
			'Focused docs apps for every ngx package',
			'Live examples for package consumers',
		],
		availableItems: ['angular-apps.ts'],
		methods: [
			{
				name: 'ngx-core-app',
				signature: 'https://ngx-core.webart.work',
				url: 'https://ngx-core.webart.work',
				description: 'Shared Angular utilities, resources, metadata, storage, and base services.',
				docType: 'Component',
				category: 'Package app',
				sourceFile: 'angular-apps.ts',
			},
			{
				name: 'ngx-http-app',
				signature: 'https://ngx-http.webart.work',
				url: 'https://ngx-http.webart.work',
				description: 'HTTP helpers, signal resources, network state, and request patterns.',
				docType: 'Component',
				category: 'Package app',
				sourceFile: 'angular-apps.ts',
			},
			{
				name: 'ngx-crud-app',
				signature: 'https://ngx-crud.webart.work',
				url: 'https://ngx-crud.webart.work',
				description: 'CRUD flows, cached documents, offline queues, and data synchronization.',
				docType: 'Component',
				category: 'Package app',
				sourceFile: 'angular-apps.ts',
			},
			{
				name: 'ngx-ui-app',
				signature: 'https://ngx-ui.webart.work',
				url: 'https://ngx-ui.webart.work',
				description: 'Reusable UI components, themes, alerts, inputs, tables, and modals.',
				docType: 'Component',
				category: 'Package app',
				sourceFile: 'angular-apps.ts',
			},
			{
				name: 'ngx-form-app',
				signature: 'https://ngx-form.webart.work',
				url: 'https://ngx-form.webart.work',
				description: 'Dynamic forms, validation, form modals, and reusable form services.',
				docType: 'Component',
				category: 'Package app',
				sourceFile: 'angular-apps.ts',
			},
			{
				name: 'ngx-map-app',
				signature: 'https://ngx-map.webart.work',
				url: 'https://ngx-map.webart.work',
				description: 'Map rendering, address search, geocoding, and Google Maps integration.',
				docType: 'Component',
				category: 'Package app',
				sourceFile: 'angular-apps.ts',
			},
			{
				name: 'ngx-translate-app',
				signature: 'https://ngx-translate.webart.work',
				url: 'https://ngx-translate.webart.work',
				description: 'Translation providers, directives, language switching, and JSON formats.',
				docType: 'Component',
				category: 'Package app',
				sourceFile: 'angular-apps.ts',
			},
			{
				name: 'ngx-datetime-app',
				signature: 'https://ngx-datetime.webart.work',
				url: 'https://ngx-datetime.webart.work',
				description: 'Date and time picking, calendar behavior, and formatting utilities.',
				docType: 'Component',
				category: 'Package app',
				sourceFile: 'angular-apps.ts',
			},
			{
				name: 'ngx-socket-app',
				signature: 'https://ngx-socket.webart.work',
				url: 'https://ngx-socket.webart.work',
				description: 'Socket connections, real-time events, and messaging integration patterns.',
				docType: 'Component',
				category: 'Package app',
				sourceFile: 'angular-apps.ts',
			},
			{
				name: 'ngx-rtc-app',
				signature: 'https://ngx-rtc.webart.work',
				url: 'https://ngx-rtc.webart.work',
				description: 'WebRTC media handling, peer connections, streams, and browser safeguards.',
				docType: 'Component',
				category: 'Package app',
				sourceFile: 'angular-apps.ts',
			},
			{
				name: 'ngx-ace-app',
				signature: 'https://ngx-ace.webart.work',
				url: 'https://ngx-ace.webart.work',
				description: 'Ace editor setup, configuration, lazy loading, and code editing.',
				docType: 'Component',
				category: 'Package app',
				sourceFile: 'angular-apps.ts',
			},
			{
				name: 'ngx-fabric-app',
				signature: 'https://ngx-fabric.webart.work',
				url: 'https://ngx-fabric.webart.work',
				description: 'Fabric canvas editing, crop tools, and interactive image workflows.',
				docType: 'Component',
				category: 'Package app',
				sourceFile: 'angular-apps.ts',
			},
			{
				name: 'ngx-tinymce-app',
				signature: 'https://ngx-tinymce.webart.work',
				url: 'https://ngx-tinymce.webart.work',
				description: 'TinyMCE editor setup, reactive forms, and rich text configuration.',
				docType: 'Component',
				category: 'Package app',
				sourceFile: 'angular-apps.ts',
			},
		],
		sections: [
			{
				title: 'Purpose',
				items: [
					'Use ngx-core-app as the foundation entry point for new Angular developers.',
					'Use package apps when a developer needs focused implementation and setup examples.',
				],
			},
		],
		code: '',
	},
];

export const serviceDocs: ServiceDoc[] = _featureDocs;
export const serviceDocMap = new Map(serviceDocs.map(doc => [doc.slug, doc]));
