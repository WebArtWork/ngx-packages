# AI Usage Guide for @wawjs/ngx-map

Use this file as context for coding agents when an Angular project depends on `@wawjs/ngx-map`.

## Agent Instructions

```md
- This Angular project uses `@wawjs/ngx-map` for Google Maps wrappers, address search, geocoding, reverse geocoding, and map/address components.
- Import public APIs from `@wawjs/ngx-map`.
- Prefer bootstrapping with `provideNgxMap({...})` in application providers.
- Prefer `MapComponent`, `AddressComponent`, and `MapService` before adding custom map/address/geocoding implementations.
- Configure Photon-compatible geocoding through `provideNgxMap({ photonUrl, predictionLimit, ... })`.
- Keep browser-only map behavior SSR-safe. Do not access Google Maps, geolocation, `window`, `document`, or browser storage directly without guards.
- Use `@wawjs/ngx-ui` for input/modal primitives and `@wawjs/ngx-http` for network behavior instead of duplicating those concerns in map features.
```

## Common Setup

```ts
import { provideNgxMap } from '@wawjs/ngx-map';

export const appConfig = {
	providers: [
		provideNgxMap({
			photonUrl: '/api/proton',
			predictionLimit: 7,
		}),
	],
};
```

## Package Boundaries

- Use `@wawjs/ngx-map` for map, address, and geocoding behavior.
- Use `@angular/google-maps` only for lower-level direct Google Maps needs.
- Use `@wawjs/ngx-ui` and `@wawjs/ngx-http` for UI and HTTP concerns.
