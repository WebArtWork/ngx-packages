# ngx-fabric

`ngx-fabric` is the extracted Fabric canvas package for this workspace. It wraps Fabric.js in Angular-friendly component and directive APIs, plus a small provider for shared defaults.

## Install

```bash
npm i --save ngx-fabric
```

## Bootstrap

```ts
import { provideNgxFabric } from '@wawjs/ngx-fabric';

export const appConfig = {
	providers: [
		provideNgxFabric({
			selectionColor: 'rgba(37, 99, 235, 0.16)',
			renderOnAddRemove: true,
			preserveObjectStacking: true,
		}),
	],
};
```

## What It Includes

- `FabricComponent` for template-level canvas usage with JSON loading support
- `FabricDirective` for direct canvas instance control
- `provideNgxFabric()` for app-wide Fabric defaults
- `FABRIC_CONFIG`, `FabricConfigInterface`, `FabricConfig`, and `FabricEvents`

## Notes

- `disabled` swaps the live `Canvas` for `StaticCanvas`.
- `loadFromJSON()` is available through the directive reference and is also used by the component `data` input.
- Width and height fall back to the container size through `ResizeObserver`.
- Event outputs follow camelCase Angular bindings, for example `objectAdded` for Fabric's `object:added`.
