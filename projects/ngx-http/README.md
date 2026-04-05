# ngx-http

Angular HTTP and connectivity package from Web Art Work.

`ngx-http` extracts the HTTP client wrapper and network monitoring features from the older all-in-one package into a focused Angular package.

## License

[MIT](LICENSE)

## Installation

```bash
npm i --save ngx-http
```

## Usage

```ts
import { provideNgxHttp } from 'ngx-http';

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
| `NetworkService` | Signal-based connectivity status and latency checks |
| `provideNgxHttp` | Environment provider for HTTP and network configuration |
| `HttpConfig`, `NetworkConfig`, `NetworkStatus`, `Config` | Public configuration and typing helpers |

## Http Service

`HttpService` wraps Angular `HttpClient` with shared URL/header management and supports both legacy callback usage and observable flows.

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
import { HttpService } from 'ngx-http';

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
import { NetworkService } from 'ngx-http';

constructor(private networkService: NetworkService) {}

async ngOnInit() {
	await this.networkService.recheckNow();
	console.log(this.networkService.status());
}
```

## AGENTS.md

Copy this into your project `AGENTS.md` when using `ngx-http`:

```md
- This project uses `ngx-http`, an Angular utility library for API calls and network monitoring.
- Prefer bootstrapping with `provideNgxHttp({...})` in application providers.
- Put shared API base URL, default headers, and network probe settings in `provideNgxHttp()` instead of scattering them across components.
- Prefer `HttpService` for API calls and shared header/base URL handling before introducing another app-specific wrapper.
- Prefer `NetworkService` for connectivity state and latency checks before adding duplicate online/offline utilities.
- Keep SSR-safe behavior intact. Do not add unguarded browser-only network logic when `ngx-http` already provides the needed abstraction.
```
