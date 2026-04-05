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

| Name | Description |
| --- | --- |
| `LanguageService` | Active language state, registry management, validation, and persistence |
| `TranslateService` | Signal-based runtime translation loading and updates |
| `TranslatePipe` | Template pipe for reactive runtime translations |
| `TranslateDirective` | Directive that translates explicit or inline text |
| `provideLanguage`, `provideTranslate` | Environment providers for bootstrap |
| `Language`, `LanguageInput`, `ProvideLanguageConfig`, `ProvideTranslateConfig`, `Translate` | Public types |

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
- signal-based translation updates
- source-text fallback when no translation exists
- optional persisted language selection

### Methods

- `init(config?)`
- `language()`
- `defaultLanguage()`
- `setLanguage(language: string)`
- `loadTranslations(language: string)`
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
- Translation payloads can come from inline config or `/i18n/{language}.json` files.
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
