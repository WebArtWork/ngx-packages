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

const _featureNames = [
	'core',
	'ui',
	'translate',
	'http',
	'socket',
	'crud',
	'rtc',
	'datetime',
	'ace',
	'fabric',
	'tinymce',
] as const;

const _toTitle = (value: string): string => value.replace(/\b\w/g, letter => letter.toUpperCase());

const _toDoc = (feature: (typeof _featureNames)[number]): ServiceDoc => {
	const title = _toTitle(feature);
	const fileName = `${feature}.feature.ts`;

	return {
		slug: feature,
		name: title,
		description: `${title} feature placeholder for ngx-app.`,
		summary: `${title} is scaffolded in ngx-app and currently points to an empty placeholder file.`,
		highlights: [
			'Route and navigation are already wired.',
			'The placeholder file exists and is ready for the next implementation pass.',
			'No feature-specific API is documented yet.',
		],
		config: [
			'Keep app-wide configuration in provideNgxCore() where possible.',
			'Fill in this feature after the scaffold review is complete.',
		],
		availableItems: [fileName],
		methods: [
			{
				name: 'Pending implementation',
				signature: `${title} feature`,
				description: `Implementation details for ${title} will be added later.`,
				category: 'Status',
				docType: 'Const',
				sourceFile: fileName,
				example: '',
			},
		],
		sections: [
			{
				title: 'Next step',
				items: [
					`Add the ${title} feature implementation in ${fileName}.`,
					'Expand the route page once real APIs or UI are defined.',
				],
			},
		],
		code: '',
	};
};

export const serviceDocs: ServiceDoc[] = _featureNames.map(_toDoc);

export const serviceDocMap = new Map(serviceDocs.map(doc => [doc.slug, doc]));
