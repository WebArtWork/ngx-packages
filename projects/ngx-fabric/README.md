# @wawjs/ngx-fabric

`ngx-fabric` is the extracted Fabric canvas package for this workspace. It wraps Fabric.js in Angular-friendly component and directive APIs, plus a small provider for shared defaults.

## Install

```bash
npm i --save @wawjs/ngx-fabric
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
- `injectFabricCropModalService()` for lazy crop modal service loading with Angular `injectAsync()`
- `FABRIC_CONFIG`, `FabricConfigInterface`, `FabricConfig`, and `FabricEvents`

## Notes

- `disabled` swaps the live `Canvas` for `StaticCanvas`.
- `loadFromJSON()` is available through the directive reference and is also used by the component `data` input.
- Width and height fall back to the container size through `ResizeObserver`.
- Event outputs follow camelCase Angular bindings, for example `objectAdded` for Fabric's `object:added`.
- Prefer `injectFabricCropModalService()` for new crop actions so the crop modal service and component load only when the user opens the crop workflow.

## AI Coding Agents

This package includes [AI.md](AI.md) with copyable instructions for Codex, Claude Code, Cursor, and other coding agents.

Copy this into the consuming project's `AGENTS.md`, `CLAUDE.md`, or equivalent file:

```md
- This Angular project uses `@wawjs/ngx-fabric` for Fabric.js canvas integration and crop workflows.
- Import public APIs from `@wawjs/ngx-fabric`.
- Prefer `provideNgxFabric({...})` for shared canvas defaults.
- Prefer `FabricComponent`, `FabricDirective`, `FabricCropModalComponent`, `FabricCropModalService`, and `injectFabricCropModalService()` before adding duplicate wrappers.
- Prefer `injectFabricCropModalService()` for new on-demand crop buttons so Angular can lazy-load the crop modal path with `injectAsync()`.
- Keep browser-only canvas behavior SSR-safe.
```
