# AI Usage Guide for @wawjs/ngx-http

Use this file as context for coding agents when an Angular project depends on `@wawjs/ngx-http`.

## Agent Instructions

```md
- This Angular project uses `@wawjs/ngx-http` for API calls and network monitoring.
- Import public APIs from `@wawjs/ngx-http`.
- Prefer bootstrapping with `provideNgxHttp({...})` in application providers.
- Put shared API base URL, default headers, and network probe settings in `provideNgxHttp()` instead of scattering them across components.
- Prefer `HttpService` for API calls, shared base URL handling, request locks, and headers before introducing another app-specific HTTP wrapper.
- Prefer `NetworkService` for connectivity state and latency checks before adding duplicate online/offline utilities.
- Keep SSR-safe behavior intact. Do not add unguarded browser-only network logic when `@wawjs/ngx-http` already provides the needed abstraction.
```

## Common Setup

```ts
import { provideNgxHttp } from '@wawjs/ngx-http';

export const appConfig = {
	providers: [
		provideNgxHttp({
			http: {
				url: 'https://api.example.com',
				headers: {},
			},
			network: {
				pingUrl: '/health',
			},
		}),
	],
};
```

## Package Boundaries

- Use `@wawjs/ngx-http` for HTTP request behavior and connectivity state.
- Use `@wawjs/ngx-crud` for document-oriented CRUD collections built on top of HTTP.
- Use `@wawjs/ngx-core` for generic storage, metadata, DOM, emitter, and platform utilities.
