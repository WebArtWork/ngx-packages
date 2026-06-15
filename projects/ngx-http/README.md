# @wawjs/ngx-http

Angular HTTP and connectivity package from Web Art Work.

`ngx-http` extracts the HTTP client wrapper and network monitoring features from the older all-in-one package into a focused Angular package.

## License

[MIT](LICENSE)

## Installation

```bash
npm i --save @wawjs/ngx-http
```

## Usage

```ts
import { provideNgxHttp } from '@wawjs/ngx-http';

export const appConfig = {
	providers: [
		provideNgxHttp({
			http: {
				url: 'https://api.example.com',
				headers: {
					'X-App': 'docs',
				},
			},
			network: {
				endpoints: ['https://api.example.com/ping'],
				intervalMs: 30000,
				timeoutMs: 2500,
				goodLatencyMs: 300,
				maxConsecutiveFails: 3,
			},
		}),
	],
};
```

`provideNgxHttp()` registers the package config token and Angular `HttpClient` with `fetch` support.

## Available Features

| Name | Description |
| --- | --- |
| `HttpService` | Shared HTTP layer with base URL, persistent headers, callback compatibility, and observable APIs |
| `ngxHttpResource` | Signal-based read helper built on Angular `httpResource()` with ngx-http base URL and headers |
| `NetworkService` | Signal-based connectivity status and latency checks |
| `provideNgxHttp` | Environment provider for HTTP and network configuration |
| `HttpConfig`, `NetworkConfig`, `NetworkStatus`, `Config` | Public configuration and typing helpers |

## Http Service

`HttpService` wraps Angular `HttpClient` with shared URL/header management and supports both legacy callback usage and observable flows.

For new HTTP GET/read behavior outside `ngx-crud`, prefer `ngxHttpResource()` over `HttpService.get()` so the read exposes Angular resource loading/error/value state and reacts to signal dependencies. Keep `HttpService.get()` for imperative workflows, legacy callbacks, Observable composition, request locking, and existing CRUD internals.

### Configuration and headers

- `setUrl(url: string)`
- `removeUrl()`
- `set(key: string, value: string | number | Array<string | number>)`
- `header(key: string)`
- `remove(key: string)`

### Requests

- `post(url, doc, callback?, opts?)`
- `put(url, doc, callback?, opts?)`
- `patch(url, doc, callback?, opts?)`
- `delete(url, callback?, opts?)`
- `get(url, callback?, opts?)`

### Lock helpers

- `clearLocked()`
- `lock()`
- `unlock()`

Example:

```ts
import { HttpService } from '@wawjs/ngx-http';

constructor(private httpService: HttpService) {}

ngOnInit() {
	this.httpService.setUrl('https://api.example.com');
	this.httpService.set('Authorization', 'Bearer token');
}

loadProfile() {
	this.httpService.get('/profile').subscribe(profile => {
		console.log(profile);
	});
}
```

## HTTP Resource

`ngxHttpResource()` wraps Angular `httpResource()` for signal-based reads. It uses the current `HttpService` base URL and shared headers, including runtime values set with `setUrl()` and `set()`. Use it as the default for new non-CRUD HTTP GET/read code.

```ts
import { Component, input } from '@angular/core';
import { ngxHttpResource } from '@wawjs/ngx-http';

interface User {
	_id: string;
	name: string;
	email: string;
}

@Component({
	selector: 'app-user-card',
	template: `
		@if (user.hasValue()) {
			<h2>{{ user.value().name }}</h2>
			<p>{{ user.value().email }}</p>
		} @else if (user.error()) {
			<p>Could not load user.</p>
		} @else if (user.isLoading()) {
			<p>Loading...</p>
		}
	`,
})
export class UserCardComponent {
	readonly userId = input.required<string>();

	readonly user = ngxHttpResource<User>(() => `/users/${this.userId()}`);
}
```

Use the request-object form for params, headers, transfer cache, timeout, or other Angular `HttpResourceRequest` options:

```ts
readonly users = ngxHttpResource<User[]>(() => ({
	url: '/users',
	params: { page: this.page() },
}));
```

Always guard `value()` with `hasValue()` because Angular resources can throw when `value()` is read in an error state.

## Network Service

`NetworkService` monitors connectivity using Angular signals and periodic endpoint probes.

### Public signals

- `status`: `good | poor | none`
- `latencyMs`: measured latency or `null`
- `isOnline`: browser online state as a signal

### Methods

- `recheckNow(): Promise<void>`

Example:

```ts
import { NetworkService } from '@wawjs/ngx-http';

constructor(private networkService: NetworkService) {}

async ngOnInit() {
	await this.networkService.recheckNow();
	console.log(this.networkService.status());
}
```

## AI Coding Agents

This package includes [AI.md](AI.md) with copyable instructions for Codex, Claude Code, Cursor, and other coding agents.

Copy this into the consuming project's `AGENTS.md`, `CLAUDE.md`, or equivalent file:

```md
- This Angular project uses `@wawjs/ngx-http` for API calls and network monitoring.
- Import public APIs from `@wawjs/ngx-http`.
- Prefer bootstrapping with `provideNgxHttp({...})` in application providers.
- Put shared API base URL, default headers, and network probe settings in `provideNgxHttp()` instead of scattering them across components.
- Prefer `ngxHttpResource()` for new HTTP GET/read behavior outside `ngx-crud`; use `HttpService` for mutations, legacy callbacks, request locks, existing CRUD internals, and observable flows.
- Prefer `NetworkService` for connectivity state and latency checks before adding duplicate online/offline utilities.
- Keep SSR-safe behavior intact. Do not add unguarded browser-only network logic when `@wawjs/ngx-http` already provides the needed abstraction.
```
