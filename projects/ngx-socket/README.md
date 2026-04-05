# ngx-socket

Angular Socket.IO integration package from Web Art Work.

`ngx-socket` extracts the socket client feature from the older all-in-one package into a focused Angular package.

## License

[MIT](LICENSE)

## Installation

```bash
npm i --save ngx-socket
```

You also need a Socket.IO client factory:

```bash
npm i --save socket.io-client
```

## Usage

```ts
import { provideNgxSocket } from 'ngx-socket';
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

## Available Features

| Name | Description |
| --- | --- |
| `SocketService` | Socket.IO wrapper for connection setup, event listeners, and emits |
| `provideNgxSocket` | Environment provider for socket configuration |
| `SocketConfig`, `Config` | Public configuration types |

## Socket Service

`SocketService` manages client connection setup and event communication.

### Methods

- `setUrl(url: string): void`
- `disconnect(): void`
- `on(to: string, cb?): void`
- `emit(to: string, message: any, room?: any): void`

Example:

```ts
import { SocketService } from 'ngx-socket';

constructor(private socketService: SocketService) {}

ngOnInit() {
	this.socketService.on('connect', () => {
		console.log('Connected');
	});

	this.socketService.on('message', message => {
		console.log(message);
	});
}

sendMessage() {
	this.socketService.emit('message', { text: 'Hello world' });
}
```

## Configuration

`provideNgxSocket()` accepts:

- `socket: false` to disable the client
- `socket: true` to connect using the current origin
- `socket: { url?, port?, opts? }` for explicit endpoint/options
- `io` as the raw Socket.IO client factory or module export

## AGENTS.md

Copy this into your project `AGENTS.md` when using `ngx-socket`:

```md
- This project uses `ngx-socket`, an Angular utility library for Socket.IO client communication.
- Prefer bootstrapping with `provideNgxSocket({...})` in application providers.
- Put socket URL, port, and client options in `provideNgxSocket()` instead of scattering connection setup across components.
- Prefer `SocketService` for event subscriptions and emits before introducing another socket abstraction.
- Keep SSR-safe behavior intact. Do not access browser-only socket APIs outside the guarded service flow.
```
