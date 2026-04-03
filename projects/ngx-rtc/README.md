# ngx-rtc

`ngx-rtc` extracts the `RtcService` feature from `ngx-core` into a focused Angular package.

## Installation

```bash
npm i --save ngx-rtc
```

## Usage

```ts
import { provideNgxRtc } from 'ngx-rtc';

export const appConfig = {
	providers: [provideNgxRtc()],
};
```

## Exports

- `provideNgxRtc`
- `RtcService`
- `Config`
