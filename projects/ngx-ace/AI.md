# AI Usage Guide for @wawjs/ngx-ace

Use this file as context for coding agents when an Angular project depends on `@wawjs/ngx-ace`.

## Agent Instructions

```md
- This Angular project uses `@wawjs/ngx-ace` for Ace editor integration.
- Import public APIs from `@wawjs/ngx-ace`.
- Prefer bootstrapping editor defaults with `provideNgxAce({...})` in application providers.
- Prefer `AceComponent` for template-friendly editor embedding and `AceDirective` for direct editor instance control.
- Use `registerAceMode()` and `registerAceTheme()` for lazy mode/theme registration instead of loading unnecessary Ace assets globally.
- Keep browser-only editor behavior SSR-safe. Do not access Ace globals directly during server rendering.
```

## Common Setup

```ts
import { provideNgxAce } from '@wawjs/ngx-ace';

export const appConfig = {
	providers: [
		provideNgxAce({
			mode: 'javascript',
			theme: 'github',
			useWorker: false,
		}),
	],
};
```

## Package Boundaries

- Use `@wawjs/ngx-ace` for Ace editor components, directives, config, and lazy registration helpers.
- Keep language-specific editor behavior in the consuming app.
