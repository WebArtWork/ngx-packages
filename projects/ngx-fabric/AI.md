# AI Usage Guide for @wawjs/ngx-fabric

Use this file as context for coding agents when an Angular project depends on `@wawjs/ngx-fabric`.

## Agent Instructions

```md
- This Angular project uses `@wawjs/ngx-fabric` for Fabric.js canvas integration, Angular-friendly canvas components/directives, and crop modal helpers.
- Import public APIs from `@wawjs/ngx-fabric`.
- Prefer bootstrapping canvas defaults with `provideNgxFabric({...})` in application providers.
- Prefer `FabricComponent` for template-level canvas usage and `FabricDirective` for direct Fabric canvas control.
- Prefer `FabricCropModalComponent` and `FabricCropModalService` for crop workflows before adding duplicate crop modals.
- Prefer `injectFabricCropModalService()` for new on-demand crop actions. It wraps Angular `injectAsync()` so the crop modal service/component path is loaded only when the user opens the crop workflow.
- Keep browser-only canvas behavior SSR-safe. Do not access Fabric globals, canvas APIs, `window`, or `document` directly during server rendering.
```

## Common Setup

```ts
import { provideNgxFabric } from '@wawjs/ngx-fabric';

export const appConfig = {
	providers: [
		provideNgxFabric({
			renderOnAddRemove: true,
			preserveObjectStacking: true,
		}),
	],
};
```

## Package Boundaries

- Use `@wawjs/ngx-fabric` for Fabric canvas and crop workflows.
- Keep app-specific drawing tools and object models in the consuming app.
