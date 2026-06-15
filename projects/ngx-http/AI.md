# AI Usage Guide for @wawjs/ngx-http

Use this file as context for coding agents when an Angular project depends on `@wawjs/ngx-http`.

## Agent Instructions

```md
- This Angular project uses `@wawjs/ngx-http` for API calls and network monitoring.
- Import public APIs from `@wawjs/ngx-http`.
- Prefer bootstrapping with `provideNgxHttp({...})` in application providers.
- Put shared API base URL, default headers, and network probe settings in `provideNgxHttp()` instead of scattering them across components.
- Prefer `ngxHttpResource()` for new signal-based HTTP GET/read behavior outside `ngx-crud`. Guard `resource.value()` with `resource.hasValue()` in templates and code.
- Do not rewrite existing CRUD internals or imperative service flows just to use resources, but when adding a new `HttpService.get()` outside CRUD, strongly prefer `ngxHttpResource()` instead.
- Prefer `HttpService` for mutations, legacy callbacks, request locks, observable flows, shared base URL handling, and headers before introducing another app-specific HTTP wrapper.
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
- Use `ngxHttpResource()` for Angular 22 signal-based HTTP reads that should follow the configured ngx-http base URL and shared headers.
- Use `HttpService.get()` directly only when code needs an immediate Observable/Promise-style imperative workflow rather than a signal/resource read model.
- Use `@wawjs/ngx-crud` for document-oriented CRUD collections built on top of HTTP.
- Use `@wawjs/ngx-core` for generic storage, metadata, DOM, emitter, and platform utilities.
