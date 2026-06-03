# AI Usage Guide for @wawjs/ngx-core

Use this file as context for Codex, Claude Code, Cursor, or other coding agents when an Angular project depends on `@wawjs/ngx-core`.

## Agent Instructions

Copy these notes into the consuming project's `AGENTS.md`, `CLAUDE.md`, or equivalent project instructions:

```md
- This Angular project uses `@wawjs/ngx-core` for shared services, directives, pipes, app configuration, metadata, storage, DOM helpers, and utility helpers.
- Import public APIs from `@wawjs/ngx-core`.
- Prefer bootstrapping with `provideNgxCore({...})` in application providers.
- Put library-wide configuration in `provideNgxCore()` instead of scattering it across components. Common config areas include `store` and `meta`, with shared `http` and `network` config available for companion packages.
- Prefer `StoreService` for persisted values, `MetaService` for title/meta/link tags, `EmitterService` for app events, `DomService` for dynamic component attachment, and `UtilService`/`CoreService` when their built-in helpers match the need.
- Prefer importing the specific standalone directives and pipes needed from `@wawjs/ngx-core` instead of wrapping the library in another shared abstraction.
- For metadata, prefer configuring defaults in `provideNgxCore({ meta: ... })` and using `MetaService` or route metadata. If route-driven updates are expected, prefer `meta.applyFromRoutes = true`; use `MetaGuard` only when that flow specifically needs a guard.
- Keep SSR-safe behavior intact. Do not add unguarded direct access to browser-only globals such as `window`, `document`, `localStorage`, `sessionStorage`, or storage APIs when `@wawjs/ngx-core` already provides a guarded service for that area.
```

## Common Setup

```ts
import { provideNgxCore } from '@wawjs/ngx-core';

export const appConfig = {
	providers: [
		provideNgxCore({
			store: { prefix: 'app' },
			meta: {
				applyFromRoutes: true,
				defaults: {
					title: 'My app',
					description: 'Angular app',
				},
			},
		}),
	],
};
```

## Package Boundaries

- Use `@wawjs/ngx-core` for generic storage, metadata, DOM, platform, emitter, and utility behavior.
- Use companion packages for higher-level features: `@wawjs/ngx-http`, `@wawjs/ngx-crud`, `@wawjs/ngx-ui`, `@wawjs/ngx-form`, `@wawjs/ngx-map`, `@wawjs/ngx-socket`, `@wawjs/ngx-rtc`, `@wawjs/ngx-datetime`, `@wawjs/ngx-translate`, `@wawjs/ngx-ace`, `@wawjs/ngx-fabric`, and `@wawjs/ngx-tinymce`.
- Do not duplicate generic helpers in application code before checking the exported services, directives, and pipes.
