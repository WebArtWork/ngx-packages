# AI Usage Guide for @wawjs/ngx-tinymce

Use this file as context for coding agents when an Angular project depends on `@wawjs/ngx-tinymce`.

## Agent Instructions

```md
- This Angular project uses `@wawjs/ngx-tinymce` for TinyMCE editor integration.
- Import public APIs from `@wawjs/ngx-tinymce`.
- Prefer bootstrapping editor defaults with `provideNgxTinymce({...})` in application providers.
- Prefer `TinymceComponent` for form-friendly editor embedding before adding another TinyMCE wrapper.
- Configure TinyMCE asset loading with `baseURL` and `fileName`; per-instance `config` inputs should override provider defaults only for local needs.
- Keep browser-only editor behavior SSR-safe. Do not access TinyMCE globals directly during server rendering.
```

## Common Setup

```ts
import { provideNgxTinymce } from '@wawjs/ngx-tinymce';

export const appConfig = {
	providers: [
		provideNgxTinymce({
			baseURL: '/assets/tinymce/',
			fileName: 'tinymce.min.js',
			config: {
				menubar: false,
			},
		}),
	],
};
```

## Package Boundaries

- Use `@wawjs/ngx-tinymce` for TinyMCE loading, config, and Angular component integration.
- Keep content-specific editor configuration in the consuming app when it is not a package default.
