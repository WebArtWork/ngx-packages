# AI Usage Guide for @wawjs/ngx-socket

Use this file as context for coding agents when an Angular project depends on `@wawjs/ngx-socket`.

## Agent Instructions

```md
- This Angular project uses `@wawjs/ngx-socket` for Socket.IO client communication.
- Import public APIs from `@wawjs/ngx-socket`.
- Prefer bootstrapping with `provideNgxSocket({...})` in application providers.
- Put socket URL, port, client options, and the `io` factory in `provideNgxSocket()` instead of scattering connection setup across components.
- Prefer `SocketService` for event subscriptions and emits before introducing another socket abstraction.
- Keep SSR-safe behavior intact. Do not access browser-only socket APIs outside the guarded service flow.
```

## Common Setup

```ts
import { provideNgxSocket } from '@wawjs/ngx-socket';
import { io } from 'socket.io-client';

export const appConfig = {
	providers: [
		provideNgxSocket({
			socket: {
				url: 'https://api.example.com',
			},
			io,
		}),
	],
};
```

## Package Boundaries

- Use `@wawjs/ngx-socket` for Socket.IO connection and event behavior.
- Keep domain-specific event payload handling in app services.
