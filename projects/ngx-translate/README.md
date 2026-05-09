# ngx-translate

Angular language and runtime translation package from Web Art Work.

`ngx-translate` is SSR-safe and focused on two features:

- `LanguageService` plus `provideLanguage(...)` for active language state, defaults, registry management, and optional persistence
- `TranslateService` plus `provideTranslate(...)`, `TranslatePipe`, and `TranslateDirective` for signal-based runtime translations

## License

[MIT](LICENSE)

## Installation

```bash
npm i --save ngx-translate
```

## Usage

```ts
import { provideTranslate } from 'ngx-translate';

export const appConfig = {
	providers: [
		provideTranslate({
			defaultLanguage: 'en',
			language: 'en',
			languages: ['en', 'ua'],
			folder: '/i18n/',
			folders: ['/i18n/articles/', '/i18n/common/'],
		}),
	],
};
```

## Language-Only Bootstrap

```ts
import { provideLanguage } from 'ngx-translate';

export const appConfig = {
	providers: [
		provideLanguage({
			defaultLanguage: 'en',
			languages: ['en', 'de', 'fr'],
		}),
	],
};
```

## Available Features

| Name                                                                                        | Description                                                             |
| ------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------- |
| `LanguageService`                                                                           | Active language state, registry management, validation, and persistence |
| `TranslateService`                                                                          | Signal-based runtime translation loading and updates                    |
| `TranslatePipe`                                                                             | Template pipe for reactive runtime translations                         |
| `TranslateDirective`                                                                        | Directive that translates explicit or inline text                       |
| `provideLanguage`, `provideTranslate`                                                       | Environment providers for bootstrap                                     |
| `Language`, `LanguageInput`, `ProvideLanguageConfig`, `ProvideTranslateConfig`, `Translate` | Public types                                                            |

## Language Service

`LanguageService` manages the active language, default language, available languages, and optional persistence.

### Methods

- `init(config?)`
- `language(): string`
- `defaultLanguage(): string`
- `allLanguages(): Language[]`
- `languages(): Language[]`
- `getLanguage(code: string)`
- `hasLanguage(code: string): boolean`
- `setLanguages(languages, syncCurrentLanguage?)`
- `setLanguage(code: string): Promise<boolean>`

## Translate Service

`TranslateService` manages runtime translations and updates translation signals reactively.

### Features

- inline translations through config
- file loading from `/i18n/{language}.json`
- optional multi-folder loading such as `/i18n/common/{language}.json` and `/i18n/articles/{language}.json`
- signal-based translation updates
- source-text fallback when no translation exists
- optional persisted language selection

### Methods

- `init(config?)`
- `language()`
- `defaultLanguage()`
- `setLanguage(language: string)`
- `loadTranslations(language: string)`
- `loadExtraTranslations(paths: string[], options?)`
- `loadExtraTranslation(path: string, options?)`
- `translate(text: string)`
- `setMany(translations: Translate[])`
- `setOne(translation: Translate)`
- `get()`

Example:

```ts
import { inject } from '@angular/core';
import { TranslateService } from 'ngx-translate';

const _translateService = inject(TranslateService);

const title = _translateService.translate('Create project');

void _translateService.setLanguage('ua');
```

## Route/Page Extra JSON Bundles

You can merge additional JSON translation files for a specific page without replacing the base language file.

```ts
import { ActivatedRoute } from '@angular/router';
import { inject } from '@angular/core';
import { TranslateService } from 'ngx-translate';

const _route = inject(ActivatedRoute);
const _translateService = inject(TranslateService);

const slug = _route.snapshot.paramMap.get('slug') || '';

await _translateService.loadExtraTranslations(['/i18n/articles/', `/i18n/article/${slug}`]);

await _translateService.loadExtraTranslation('/i18n/articles/');
```

Notes:

- For folder-style paths, `/{language}.json` is appended automatically.
- `{language}` and `:language` placeholders are replaced automatically.
- Existing translations are kept by default and then overridden by later files.
- Extra translation URLs are cached per language and are not fetched again on repeat calls.
- Pass `replace: true` to replace cached translations for that language with only the loaded files.
- Pass `forceReload: true` to refetch URLs that were already cached.

## Translate Pipe

```html
<h1>{{ 'Create project' | translate }}</h1>
```

## Translate Directive

```html
<h1 translate>Create project</h1>
<button translate>Save</button>
<h2 translate="Create project"></h2>
```

## Notes

- Language persistence uses guarded browser storage access and is skipped during SSR.
- Translation payloads can come from inline config, `folder`, `folders`, and route/page extra JSON files.
- Missing translations safely fall back to the source text.

## AGENTS.md

Copy this into your project `AGENTS.md` when using `ngx-translate`:

```md
- This project uses `ngx-translate`, an Angular utility library for runtime language and translation management.
- Prefer bootstrapping with `provideTranslate({...})` when translations are needed, or `provideLanguage({...})` for language-only state.
- Register app translations with `provideTranslate(...)` and use `TranslateService`, `TranslatePipe`, or `TranslateDirective` instead of creating a parallel translation bootstrap path.
- Prefer `LanguageService` for active language state, validation, defaults, and persistence before adding app-specific language utilities.
- Keep SSR-safe behavior intact. Do not add unguarded direct access to browser storage for language persistence when the package already handles it.
```
