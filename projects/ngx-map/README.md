# @wawjs/ngx-map

Angular map and address components from Web Art Work.

`ngx-map` extracts the BOS map toolkit into a standalone Angular package built on `@angular/google-maps`, `@wawjs/ngx-http`, and the input/modal primitives from `@wawjs/ngx-ui`.

## Installation

```bash
npm i --save @wawjs/ngx-map @angular/google-maps
```

Configure the Google Maps JavaScript API in your application as required by `@angular/google-maps`.

## Usage

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

```html
<lib-map [height]="'360px'" [zoom]="13" />

<lib-address
	label="Address"
	placeholder="Search address..."
	[(address)]="address"
	(wChange)="onAddress($event)"
/>
```

## Available Features

| Name               | Description                                                                      |
| ------------------ | -------------------------------------------------------------------------------- |
| `MapComponent`     | Google Maps wrapper with markers, map clicks, and optional click-to-place marker |
| `AddressComponent` | Address search input with Photon predictions and an accessible, labeled pick-from-map button/modal |
| `MapService`       | Forward and reverse geocoding through a Photon-compatible backend proxy          |
| `provideNgxMap`    | Environment provider for map package defaults                                    |

## Configuration

| Option                 | Default               | Description                                         |
| ---------------------- | --------------------- | --------------------------------------------------- |
| `photonUrl`            | `/api/proton`         | Backend Photon proxy base URL                       |
| `predictionLimit`      | `7`                   | Maximum prediction count for forward geocoding      |
| `lastCenterStorageKey` | `waw_map_last_center` | Browser storage key for the last selected center    |
| `resolveUserLocation`  | `true`                | Whether `MapComponent` attempts browser geolocation |

## Accessibility

- `AddressComponent` renders its map-picker trigger as a real `<button type="button" aria-label="Pick location on the map">` (not an icon-only, unlabeled click handler), so it has a keyboard-operable, screen-reader-friendly accessible name.
- The pick-from-map modal (`PickerComponent`) shows a visible instruction ("Click a location on the map to select it.") so the click-only map interaction has a textual equivalent for assistive technology users.
- `PickerComponent`/`AddressComponent`'s map modal is opened through `@wawjs/ngx-ui`'s `ModalService`, which already provides `role="dialog"`, focus trapping, and Escape-to-close.

## License

[MIT](LICENSE)

## AI Coding Agents

This package includes [AI.md](AI.md) with copyable instructions for Codex, Claude Code, Cursor, and other coding agents.

Copy this into the consuming project's `AGENTS.md`, `CLAUDE.md`, or equivalent file:

```md
- This Angular project uses `@wawjs/ngx-map` for Google Maps wrappers, address search, geocoding, and reverse geocoding.
- Import public APIs from `@wawjs/ngx-map`.
- Prefer `provideNgxMap({...})` for package configuration.
- Prefer `MapComponent`, `AddressComponent`, and `MapService` before adding custom map/address/geocoding implementations.
- Keep Google Maps, geolocation, and browser storage access SSR-safe.
```
