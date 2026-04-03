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

const _SERVICE_DOC_ORDER = ['language', 'translate-service'] as const;

const _serviceDocOrderMap: ReadonlyMap<string, number> = new Map(
	_SERVICE_DOC_ORDER.map((slug, index) => [slug, index] as const),
);

const _serviceDocs: ServiceDoc[] = [
	{
		slug: 'language',
		name: 'Language',
		description:
			'Standalone language selection, registry, and persistence feature used by ngx-translate runtime i18n.',
		summary:
			'LanguageService owns the active language, the available language registry, default resolution, validation, and optional persistence. It can be used on its own or as the state layer that TranslateService builds on.',
		highlights: [
			'Works independently when you need language state without translation payloads.',
			'Normalizes codes, validates configured languages, and applies sensible fallbacks.',
			'Persists the active language with guarded browser storage access so SSR stays safe.',
		],
		config: [
			'Use provideLanguage({ language, defaultLanguage, languages, persistLanguage }) for language-only bootstrap.',
			'provideTranslate() accepts the same language config and forwards it to LanguageService.',
			'Persisted language is stored under the translate.language key when persistence is enabled.',
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
	providers: [
		provideLanguage({
			defaultLanguage: 'en',
			languages: ['en', 'de', 'fr'],
		}),
	],
};`,
			},
			{
				name: 'init',
				signature: 'init(config?: ProvideLanguageConfig): Promise<void>',
				description:
					'Resolves available languages, the default language, persisted language, and the initial active language.',
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
					'Reads one configured language by code and checks whether a language is available.',
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
	const changed = await this._languageService.setLanguage(code);

	if (changed) {
		console.log('language updated', this._languageService.language());
	}
}`,
			},
			{
				name: 'Language',
				signature:
					'interface Language { code: string; name: string; nativeName?: string; }',
				description: 'Normalized language definition used by both Language and Translate.',
				category: 'Contracts',
				docType: 'Interface',
				sourceFile: 'language.interface.ts',
			},
			{
				name: 'LanguageInput',
				signature: 'type LanguageInput = string | Language',
				description:
					'Allows configuration to use either a language code or a full language object.',
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
					'Built-in language catalogue used as the default fallback and known metadata source.',
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
	providers: [provideLanguage({ defaultLanguage: 'en' })],
};

readonly languageService = inject(LanguageService);

async setGerman() {
	await this.languageService.setLanguage('de');
}`,
	},
	{
		slug: 'translate-service',
		name: 'TranslateService',
		description:
			'Runtime translation registry backed by signals and integrated with the Language feature.',
		summary:
			'TranslateService exposes a signal per source text, loads language-specific translation payloads, and updates the UI reactively while delegating active-language state to LanguageService.',
		highlights: [
			'translate(text) lazily creates a signal that falls back to the source text.',
			'setLanguage() switches through LanguageService, lazy-loads payloads, and applies them without stale state.',
			'Works with inline translations or JSON files such as /i18n/en.json.',
		],
		config: [
			'Register bootstrap with provideTranslate({ language, defaultLanguage, translations?, folder? }).',
			'With folder mode, language files are loaded as /i18n/{lang}.json by default.',
			'Language selection is handled by the Language feature and reused here.',
			'The translate pipe and directive both build on top of this runtime service.',
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
				name: 'provideTranslate / provideTranslation',
				signature:
					'provideTranslate(config?: ProvideTranslateConfig): EnvironmentProviders',
				description: 'Registers TranslateService initialization during app bootstrap.',
				category: 'Providers',
				sourceFile: 'provide-translate.ts',
				example: `import { provideTranslate } from 'ngx-translate';

export const appConfig = {
	providers: [
		provideTranslate({
			defaultLanguage: 'en',
			languages: ['en', 'ua'],
			folder: '/i18n/',
		}),
	],
};`,
			},
			{
				name: 'translate',
				signature: 'translate(text: string): WritableSignal<string>',
				description:
					'Returns the translation signal for a source text, creating it lazily if needed.',
				sourceFile: 'translate.service.ts',
			},
			{
				name: 'setLanguage',
				signature: 'setLanguage(language: string): Promise<void>',
				description:
					'Switches current language, lazy-loads the translation payload, and applies it reactively.',
				sourceFile: 'translate.service.ts',
			},
			{
				name: 'loadTranslations',
				signature: 'loadTranslations(language: string): Promise<Translate[]>',
				description:
					'Loads a language payload from inline config or the JSON file loader and caches it per language.',
				sourceFile: 'translate.service.ts',
			},
			{
				name: 'setMany',
				signature: 'setMany(translations: Translate[]): void',
				description: 'Bulk-replaces translations for the current language.',
				details: [
					'Existing signals not present in the new set reset to their original source text.',
					'Provided translations update their matching signals.',
				],
				sourceFile: 'translate.service.ts',
			},
			{
				name: 'setOne',
				signature: 'setOne(translation: Translate): void',
				description: 'Updates one translation entry and persists the new state.',
				sourceFile: 'translate.service.ts',
			},
			{
				name: 'get',
				signature: 'get(): Translates',
				description: 'Returns the internal sourceText to WritableSignal registry.',
				sourceFile: 'translate.service.ts',
			},
			{
				name: 'Translate',
				signature: 'interface Translate { sourceText: string; text: string; }',
				description: 'One translation entry for a specific source text.',
				category: 'Contracts',
				docType: 'Interface',
				sourceFile: 'translate.interface.ts',
			},
			{
				name: 'ProvideTranslateConfig',
				signature:
					'interface ProvideTranslateConfig extends TranslateFileLoaderConfig, ProvideLanguageConfig',
				description:
					'Bootstrap options for language setup, inline translations, and file loading.',
				category: 'Contracts',
				docType: 'Interface',
				sourceFile: 'translate.interface.ts',
			},
			{
				name: 'Translates',
				signature: 'type Translates = Record<string, WritableSignal<string>>',
				description: 'Internal map of source text keys to reactive translation signals.',
				category: 'Contracts',
				docType: 'Type',
				sourceFile: 'translate.type.ts',
			},
		],
		sections: [
			{
				title: 'Bootstrap behavior',
				items: [
					'Initial language resolves from language ?? stored language ?? defaultLanguage.',
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

export const serviceDocs: ServiceDoc[] = [..._serviceDocs].sort((a, b) => {
	const aIndex = _serviceDocOrderMap.get(a.slug) ?? Number.MAX_SAFE_INTEGER;
	const bIndex = _serviceDocOrderMap.get(b.slug) ?? Number.MAX_SAFE_INTEGER;
	return aIndex - bIndex;
});

export const serviceDocMap = new Map(serviceDocs.map(doc => [doc.slug, doc]));
