# ngx-socket

`ngx-socket` extracts the `SocketService` feature from `ngx-core` into a focused Angular package.

## Installation

```bash
npm i --save ngx-socket
```

## Usage

```ts
import { provideNgxSocket } from 'ngx-socket';

export const appConfig = {
	providers: [provideNgxSocket()],
};
```

## Exports

- `provideNgxSocket`
- `SocketService`
- `SocketConfig`
- `Config`
