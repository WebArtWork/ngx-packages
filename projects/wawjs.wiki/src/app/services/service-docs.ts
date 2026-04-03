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

const _featureDocs: ServiceDoc[] = [
	{
		slug: 'waw',
		name: 'waw',
		description: 'Placeholder feature entry for waw.',
		summary: 'Reserved space for the future waw feature.',
		highlights: ['Empty file scaffolded', 'Route ready', 'Details to be added later'],
		availableItems: ['waw.ts'],
		methods: [],
		sections: [
			{
				title: 'Status',
				items: ['This feature is currently an empty placeholder file.'],
			},
		],
		code: '',
	},
	{
		slug: 'ngx',
		name: 'ngx',
		description: 'Placeholder feature entry for ngx.',
		summary: 'Reserved space for the future ngx feature.',
		highlights: ['Empty file scaffolded', 'Route ready', 'Details to be added later'],
		availableItems: ['ngx.ts'],
		methods: [],
		sections: [
			{
				title: 'Status',
				items: ['This feature is currently an empty placeholder file.'],
			},
		],
		code: '',
	},
	{
		slug: 'react',
		name: 'react',
		description: 'Placeholder feature entry for react.',
		summary: 'Reserved space for the future react feature.',
		highlights: ['Empty file scaffolded', 'Route ready', 'Details to be added later'],
		availableItems: ['react.ts'],
		methods: [],
		sections: [
			{
				title: 'Status',
				items: ['This feature is currently an empty placeholder file.'],
			},
		],
		code: '',
	},
	{
		slug: 'vue',
		name: 'vue',
		description: 'Placeholder feature entry for vue.',
		summary: 'Reserved space for the future vue feature.',
		highlights: ['Empty file scaffolded', 'Route ready', 'Details to be added later'],
		availableItems: ['vue.ts'],
		methods: [],
		sections: [
			{
				title: 'Status',
				items: ['This feature is currently an empty placeholder file.'],
			},
		],
		code: '',
	},
];

export const serviceDocs: ServiceDoc[] = _featureDocs;
export const serviceDocMap = new Map(serviceDocs.map(doc => [doc.slug, doc]));
