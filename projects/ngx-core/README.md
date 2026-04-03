# ngx-core

`ngx-core` is the shared Angular utility package for the remaining core features: app utilities, DOM helpers, store, meta, and emitter.

`HttpService` and `NetworkService` have moved to `ngx-http`. `CrudService` and `CrudComponent` have moved to `ngx-crud`.
`RtcService` has moved to `ngx-rtc`.
`TimeService` has moved to `ngx-datetime`.

## Installation

```bash
npm i --save ngx-core
```

Add the extracted packages you need alongside `ngx-core`.

```bash
npm i --save ngx-http
npm i --save ngx-crud
npm i --save ngx-rtc
npm i --save ngx-datetime
```

## Usage

```ts
import { provideNgxCore } from 'ngx-core';

export const appConfig = {
	providers: [provideNgxCore()],
};
```

## Available features

- `CoreService`, `UtilService`, and reusable pipes/directives
- `DomService`
- `EmitterService`
- `StoreService`
- `MetaService` and `MetaGuard`

## Related package

Use `ngx-http` for:

- `provideNgxHttp`
- `HttpService`
- `NetworkService`

Use `ngx-crud` for:

- `provideNgxCrud`
- `CrudService`
- `CrudComponent`

Use `ngx-socket` for:

- `provideNgxSocket`
- `SocketService`

Use `ngx-rtc` for:

- `provideNgxRtc`
- `RtcService`

Use `ngx-datetime` for:

- `provideNgxDatetime`
- `TimeService`
