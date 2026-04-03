# ngx-datetime

`ngx-datetime` extracts the `TimeService` feature from `ngx-core` into a focused Angular package for date and time helpers.

## Installation

```bash
npm i --save ngx-datetime
```

## Usage

```ts
import { provideNgxDatetime } from 'ngx-datetime';

export const appConfig = {
	providers: [provideNgxDatetime()],
};
```

## Exports

- `provideNgxDatetime`
- `TimeService`
