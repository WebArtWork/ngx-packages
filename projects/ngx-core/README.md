# ngx-core

Angular common package with shared services, pipes, directives, and app-level configuration.

`ngx-core` is SSR-safe and works with Angular Universal: browser-only APIs are guarded, and features that require a browser runtime activate only on the client.

## License

[MIT](LICENSE)

## Installation

```bash
npm i --save ngx-core
```

If your app also needs HTTP, CRUD, sockets, RTC, or datetime helpers, install the companion packages alongside `ngx-core`.

```bash
npm i --save ngx-http ngx-crud ngx-socket ngx-rtc ngx-datetime
```

## Usage

```ts
import { provideNgxCore } from 'ngx-core';

export const appConfig = {
	providers: [provideNgxCore()],
};
```

`provideNgxCore()` is the preferred bootstrap API. It registers the shared config token and Angular `HttpClient` with `fetch` support.

## Configuration

You can pass an optional configuration object to `provideNgxCore()` to override library defaults.

```ts
import { provideNgxCore, type Config } from 'ngx-core';

export const appConfig = {
	providers: [
		provideNgxCore({
			store: { prefix: 'waStore' },
			meta: {
				useTitleSuffix: false,
				applyFromRoutes: true,
				defaults: {
					title: 'My app',
					description: 'Shared Angular app',
					links: {},
				},
			},
			// Shared config consumed by companion packages when installed
			http: { url: 'https://api.example.com', headers: {} },
			network: {},
		} satisfies Config),
	],
};
```

## Available Features

| Name | Description |
| --- | --- |
| `CoreService` | Shared utility helpers, platform detection, UUID/device helpers, locks, and signal helpers |
| `UtilService` | Form state helpers, validation, CSS variable persistence, and sample data generators |
| `DomService` | Dynamic component creation and DOM attachment helpers |
| `EmitterService` | Lightweight event bus and task completion signaling |
| `StoreService` | Async storage wrapper with JSON helpers and prefix support |
| `MetaService` | Route-aware title/meta/link management |
| `MetaGuard` | Optional guard for route-driven metadata flows |
| `ClickOutsideDirective` | Standalone outside-click directive |
| Pipes | `arr`, `mongodate`, `number`, `pagination`, `safe`, `search`, `splice`, `split` |

## Core Service

`CoreService` contains general-purpose helpers used across Angular apps.

### Platform and device helpers

- SSR-safe initialization for client-only behavior
- `deviceID` generation and persistence
- device detection with `detectDevice()`, `isMobile()`, `isTablet()`, `isWeb()`, `isAndroid()`, `isIos()`
- responsive viewport signal with `viewport`, `isViewportMobile`, `isViewportTablet`, and `isViewportDesktop`

### Utility methods

- `UUID(): string`
- `ota(obj, holder?): any[]`
- `splice(removeArray, fromArray, compareField?): any[]`
- `ids2id(...args): string`
- `afterWhile(doc, cb?, time?): void`
- `copy(from, to): void`

### Version and lock helpers

- `setAppVersion(appVersion: string): void`
- `setDateVersion(dateVersion: string): void`
- `setVersion(): void`
- `lock(which: string): void`
- `unlock(which: string): void`
- `onUnlock(which: string): Promise<void>`
- `locked(which: string): boolean`

### Signal helpers

- `toSignal(document, signalFields?)`
- `toSignalsArray(arr, signalFields?)`
- `pushSignal(signals, item, signalFields?)`
- `removeSignalByField(signals, value, field?)`
- `findSignalByField(signals, value, field?)`
- `updateSignalByField(signals, value, updater, field)`
- `trackBySignalField(field)`

Example:

```ts
import { CoreService } from 'ngx-core';

constructor(private coreService: CoreService) {}

ngOnInit() {
	this.coreService.setAppVersion('1.2.3');
	this.coreService.afterWhile('save-draft', () => {
		console.log('Delayed callback');
	}, 500);
}
```

## Emitter Service

`EmitterService` provides a lightweight event bus and completion signaling built on Angular Signals and RxJS.

### Events

- `emit(id: string, data?: any): void`
- `on<T = any>(id: string): Observable<T>`
- `off(id: string): void`
- `offAll(): void`
- `has(id: string): boolean`

### Completion tasks

- `complete<T = any>(task: string, value?: T): void`
- `clearCompleted(task: string): void`
- `completed(task: string): any | undefined`
- `isCompleted(task: string): boolean`
- `onComplete(tasks, opts?): Observable<any | any[]>`

Example:

```ts
import { EmitterService } from 'ngx-core';

constructor(private emitterService: EmitterService) {}

ngOnInit() {
	this.emitterService.on<string>('user:login').subscribe(uid => {
		console.log('Logged in:', uid);
	});
}

login(uid: string) {
	this.emitterService.emit('user:login', uid);
}
```

## Store Service

`StoreService` provides an async-first API for storage access. It uses `localStorage` by default, supports custom storage adapters through config, and safely handles JSON values.

### Methods

- `setPrefix(prefix: string): void`
- `set(key: string, value: string, options?): Promise<boolean>`
- `get(key: string, options?): Promise<string | null>`
- `setJson<T>(key: string, value: T, options?): Promise<boolean>`
- `getJson<T>(key: string, options?): Promise<T | null>`
- `remove(key: string, options?): Promise<boolean>`
- `clear(options?): Promise<boolean>`

Example:

```ts
import { StoreService } from 'ngx-core';

constructor(private storeService: StoreService) {}

async saveProfile() {
	await this.storeService.setJson('profile', {
		name: 'Den',
		role: 'dev',
	});
}
```

## Meta Service

`MetaService` manages title, meta tags, and link tags for SPA navigation.

### Highlights

- route-driven metadata via `data.meta`
- automatic reset of managed tags between route changes
- generated Open Graph, Twitter, and `itemprop` variants
- optional defaults configured in `provideNgxCore({ meta: ... })`
- explicit link management through `setLink(...)`

### Methods

- `setDefaults(defaults): void`
- `applyMeta(page?): void`
- `reset(): void`
- `setLink(links): void`
- `resetLinks(): void`

Example:

```ts
import { MetaService } from 'ngx-core';

constructor(private metaService: MetaService) {}

ngOnInit() {
	this.metaService.applyMeta({
		title: 'Dashboard',
		description: 'Overview of the current workspace',
		index: true,
	});
}
```

Route metadata example:

```ts
{
	path: 'about',
	loadComponent: () => import('./about.component'),
	data: {
		meta: {
			title: 'About',
			description: 'About this app',
		},
	},
}
```

## Util Service

`UtilService` contains UI and validation helpers.

### Features

- form state access with `formSignal(id)` and `form(id)`
- validation with `valid(value, kind, extra)`
- password strength via `level(value)`
- persisted CSS variable helpers: `setCss`, `getCss`, `cssSignal`, `removeCss`
- generators: `arr(len, type)` and `text(length)`

Example:

```ts
import { UtilService } from 'ngx-core';

constructor(private utilService: UtilService) {}

isValidEmail(email: string) {
	return this.utilService.valid(email, 'email');
}
```

## Dom Service

`DomService` helps create and attach Angular components dynamically.

### Methods

- `appendById(component, options, id)`
- `appendComponent(component, options?, element?)`
- `getComponentRef(component, options?)`
- `removeComponent(componentRef, providedIn?)`

Example:

```ts
import { DomService } from 'ngx-core';

constructor(private domService: DomService) {}

open(component: any) {
	return this.domService.appendComponent(component, {
		providedIn: 'modal',
	});
}
```

## ClickOutside Directive

`ClickOutsideDirective` emits when a pointer interaction happens outside the host element.

```html
<div (clickOutside)="closePanel()"></div>
```

It is SSR-safe and marks OnPush components for check after emission.

## Related Packages

Some legacy features from the old all-in-one package now live in dedicated packages:

- `ngx-http`: `provideNgxHttp`, `HttpService`, `NetworkService`
- `ngx-crud`: `provideNgxCrud`, `CrudService`, `CrudComponent`
- `ngx-socket`: `provideNgxSocket`, `SocketService`
- `ngx-rtc`: `provideNgxRtc`, `RtcService`
- `ngx-datetime`: `provideNgxDatetime`, `TimeService`

## AGENTS.md

Copy this into your project `AGENTS.md` when using `ngx-core`:

```md
- This project uses `ngx-core`, an Angular utility library for shared services, directives, pipes, and app-level configuration.
- Prefer bootstrapping with `provideNgxCore({...})` in application providers.
- Put library-wide configuration in `provideNgxCore()` instead of scattering it across components. Common config areas include `store` and `meta`, with shared `http` and `network` config available for companion packages.
- Prefer the library services before adding duplicate app utilities:
  - `StoreService` for persisted local storage values.
  - `MetaService` for title, description, robots, image, and link tags.
  - `EmitterService`, `CoreService`, `DomService`, and `UtilService` when their built-in behavior matches the need.
- Prefer importing the specific ngx-core directives and pipes you need instead of wrapping the whole library again in another shared abstraction.
- For metadata, prefer configuring defaults in `provideNgxCore({ meta: ... })` and using `MetaService` or route metadata. If route-driven updates are expected, prefer `meta.applyFromRoutes = true`; use `MetaGuard` only when that flow specifically needs a guard.
- Keep SSR-safe behavior intact. Do not add unguarded direct access to browser-only globals such as `window`, `document`, or storage when ngx-core already provides a guarded service for that area.
- When changing app behavior, prefer configuring or composing ngx-core services first before modifying library source.
- Common reusable building blocks exported by the library include `clickOutside` and array/search/safe/pagination-style pipes.
```
