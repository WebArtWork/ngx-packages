# AI Usage Guide for @wawjs/ngx-translate

Use this file as context for coding agents when an Angular project depends on `@wawjs/ngx-translate`.

## Agent Instructions

```md
- This Angular project uses `@wawjs/ngx-translate` for runtime language state and signal-based translations.
- Import public APIs from `@wawjs/ngx-translate`.
- Prefer bootstrapping with `provideTranslate({...})` when translations are needed, or `provideLanguage({...})` for language-only state.
- Register app translations with `provideTranslate(...)` and use `TranslateService` or `TranslateDirective` instead of creating a parallel translation bootstrap path.
- Translation payloads may be object maps, `Translate[]`, or compact string arrays; compact arrays are index-based and must match the default language array order.
- Use `[vars]="{ key: value }"` with `TranslateDirective` or `TranslateService.interpolate(...)` for `{{key}}` placeholder interpolation.
- Prefer `LanguageService` for active language state, validation, defaults, registry management, and persistence before adding app-specific language utilities.
- Keep SSR-safe behavior intact. Do not add unguarded direct access to browser storage for language persistence when the package already handles it.
```

## Common Setup

```ts
import { provideTranslate } from '@wawjs/ngx-translate';

export const appConfig = {
	providers: [
		provideTranslate({
			defaultLanguage: 'en',
			languages: ['en'],
			translations: {
				en: [
					{ sourceText: 'Save', text: 'Save' },
					{ sourceText: 'phrase', text: 'Phrase has counter {{count}}' },
				],
			},
		}),
	],
};
```

Compact array payloads are also valid when the default language array is the root source list:

```ts
provideTranslate({
	defaultLanguage: 'en',
	languages: ['en', 'ua'],
	translations: {
		en: ['Save', 'phrase'],
		ua: ['Зберегти', 'Фраза має лічильник {{count}}'],
	},
});
```

```html
<div translate="phrase" [vars]="{ count: 5 }"></div>
```

## Package Boundaries

- Use `@wawjs/ngx-translate` for language state and runtime translations.
- Keep translation registration centralized in providers, route/page extra JSON loading, or `TranslateService`.
