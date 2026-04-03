# ngx-translate

Angular language and runtime translation package from Web Art Work.

`ngx-translate` is SSR-safe and focused on two features only:

- `LanguageService` plus `provideLanguage(...)` for active language state, defaults, registry management, and optional persistence
- `TranslateService` plus `provideTranslate(...)`, `TranslatePipe`, and `TranslateDirective` for signal-based runtime translations

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
			languages: ['en', 'ua'],
			folder: '/i18n/',
		}),
	],
};
```

## Language-only bootstrap

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

## Translate service

```ts
import { inject } from '@angular/core';
import { TranslateService } from 'ngx-translate';

const _translateService = inject(TranslateService);

const title = _translateService.translate('Create project');

void _translateService.setLanguage('ua');
```

## Notes

- Language persistence uses guarded browser storage access and is skipped during SSR.
- Translation payloads can come from inline config or `/i18n/{language}.json` files.
- Missing translations safely fall back to the source text.
