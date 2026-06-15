# @wawjs/ngx-core

Angular common package with shared services, pipes, directives, and app-level configuration.

`ngx-core` is SSR-safe and works with Angular Universal: browser-only APIs are guarded, and features that require a browser runtime activate only on the client.

## License

[MIT](LICENSE)

## Installation

```bash
npm i --save @wawjs/ngx-core
```

If your app also needs HTTP, CRUD, sockets, RTC, or datetime helpers, install the companion packages alongside `ngx-core`.

```bash
npm i --save @wawjs/ngx-http @wawjs/ngx-crud @wawjs/ngx-socket @wawjs/ngx-rtc @wawjs/ngx-datetime
```

## Usage

```ts
import { provideNgxCore } from '@wawjs/ngx-core';

export const appConfig = {
	providers: [provideNgxCore()],
};
```

`provideNgxCore()` is the preferred bootstrap API. It registers the shared config token and Angular `HttpClient` with `fetch` support.

## Configuration

You can pass an optional configuration object to `provideNgxCore()` to override library defaults.

```ts
import { provideNgxCore, type Config } from '@wawjs/ngx-core';

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
| `ngxResource` | Angular resource wrapper with optional StoreService-backed caching |
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
import { CoreService } from '@wawjs/ngx-core';

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
import { EmitterService } from '@wawjs/ngx-core';

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

For persisted async reads in components and signal-first services, prefer `ngxResource({ key, ... })` over direct `StoreService.getJson()`. Keep direct `getJson()` for imperative restore, migrations, queue replay, or one-off service initialization where a resource state object would add noise.

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
import { StoreService } from '@wawjs/ngx-core';

constructor(private storeService: StoreService) {}

async saveProfile() {
	await this.storeService.setJson('profile', {
		name: 'Den',
		role: 'dev',
	});
}
```

## Resource Helper

`ngxResource()` wraps Angular `resource()` for signal-based async reads. Without a `key`, it passes options directly to Angular. With a `key`, it uses `StoreService` to read and cache values, making it the preferred API over direct `StoreService.getJson()` for persisted async reads.

```ts
import { Component, computed, signal } from '@angular/core';
import { ngxResource } from '@wawjs/ngx-core';

interface Weather {
	city: string;
	temperature: number;
}

@Component({
	selector: 'app-weather',
	template: `
		@if (weather.hasValue()) {
			<p>{{ title() }}</p>
		} @else if (weather.error()) {
			<p>Could not load weather.</p>
		} @else {
			<p>Loading weather...</p>
		}
	`,
})
export class WeatherComponent {
	readonly city = signal('Volos');

	readonly weather = ngxResource<Weather, { city: string }>({
		key: ({ city }) => `weather:${city}`,
		params: () => ({ city: this.city() }),
		loader: async ({ params, abortSignal }) => {
			const response = await fetch(`/api/weather?city=${params.city}`, {
				signal: abortSignal,
			});

			return response.json();
		},
	});

	readonly title = computed(() => {
		if (!this.weather.hasValue()) return 'Loading...';

		return `${this.weather.value().city}: ${this.weather.value().temperature}`;
	});
}
```

Storage modes:

- `network-first` is the default. It loads fresh data, stores it, and falls back to the stored value if loading fails.
- `cache-first` returns the stored value when present and only calls the loader on a cache miss.
- `store-only` reads from `StoreService` and does not call a loader.

Always guard `value()` with `hasValue()` because Angular resources can throw when `value()` is read in an error state.

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
import { MetaService } from '@wawjs/ngx-core';

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
import { UtilService } from '@wawjs/ngx-core';

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
import { DomService } from '@wawjs/ngx-core';

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

It is SSR-safe and marks the view for check after emission.

## Related Packages

Some legacy features from the old all-in-one package now live in dedicated packages:

- `@wawjs/ngx-http`: `provideNgxHttp`, `HttpService`, `ngxHttpResource`, `NetworkService`
- `@wawjs/ngx-crud`: `provideNgxCrud`, `CrudService`, `CrudComponent`
- `@wawjs/ngx-socket`: `provideNgxSocket`, `SocketService`
- `@wawjs/ngx-rtc`: `provideNgxRtc`, `RtcService`
- `@wawjs/ngx-datetime`: `provideNgxDatetime`, `TimeService`

## AI Coding Agents

This package includes [AI.md](AI.md) with copyable instructions for Codex, Claude Code, Cursor, and other coding agents.

Copy this into the consuming project's `AGENTS.md`, `CLAUDE.md`, or equivalent file:

```md
- This Angular project uses `@wawjs/ngx-core` for shared services, directives, pipes, app configuration, metadata, storage, DOM helpers, and utility helpers.
- Import public APIs from `@wawjs/ngx-core`.
- Prefer bootstrapping with `provideNgxCore({...})` in application providers.
- Put library-wide configuration in `provideNgxCore()` instead of scattering it across components. Common config areas include `store` and `meta`, with shared `http` and `network` config available for companion packages.
- Prefer `ngxResource()` for generic signal-based async reads, adding `key` when the value should be read from or cached through `StoreService`.
- Prefer `ngxResource({ key })` over direct `StoreService.getJson()` for persisted async reads. Use direct `getJson()` only for imperative restore, migrations, queue replay, or one-off service initialization.
- Prefer `StoreService`, `MetaService`, `EmitterService`, `CoreService`, `DomService`, and `UtilService` when their built-in behavior matches the need.
- Prefer importing the specific standalone directives and pipes you need instead of wrapping the library in another shared abstraction.
- For metadata, prefer configuring defaults in `provideNgxCore({ meta: ... })` and using `MetaService` or route metadata. If route-driven updates are expected, prefer `meta.applyFromRoutes = true`; use `MetaGuard` only when that flow specifically needs a guard.
- Keep SSR-safe behavior intact. Do not add unguarded direct access to browser-only globals such as `window`, `document`, or storage when `@wawjs/ngx-core` already provides a guarded service for that area.
```
