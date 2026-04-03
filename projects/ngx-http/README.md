# ngx-http

`ngx-http` extracts the `HttpService` and `NetworkService` features from `ngx-core` into a focused Angular package.

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
			},
		}),
	],
};
```

## Exports

- `provideNgxHttp`
- `HttpService`
- `HttpConfig`
- `NetworkService`
- `NetworkConfig`
- `NetworkStatus`
