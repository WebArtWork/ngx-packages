# Repository Guide

This is a multi-project Angular workspace for the `@wawjs/ngx-*` package family. Treat it as a monorepo of publishable Angular libraries plus website/demo applications for those libraries.

## Project Model

Projects under `projects/` fall into two groups:

- `ngx-*` projects without the `-app` suffix are publishable node module packages.
- `ngx-*-app` projects are websites, demos, and documentation apps for the matching package.
- `ngx-app` is a combined workspace app that can compose multiple packages.
- `wawjs.wiki` is a site project, not a publishable package.

Current library packages:

- `ngx-core`: shared Angular utilities, SSR-safe services, directives, pipes, DOM helpers, metadata, storage, emitter, and base app configuration.
- `ngx-http`: HTTP and network package built on top of `ngx-core`.
- `ngx-crud`: CRUD/data-flow package built on top of `ngx-core` and `ngx-http`.
- `ngx-ui`: reusable UI components and services such as buttons, inputs, select, modal, alert, table, file, material, burger, theme, and theme icon.
- `ngx-form`: dynamic form components, form services, and form modals. It depends on `ngx-ui`, `ngx-core`, `ngx-crud`, and `ngx-http`.
- `ngx-map`: map, address, and geocoding components/services. It depends on `ngx-ui`, `ngx-core`, `ngx-http`, and Angular Google Maps.
- `ngx-translate`: translation providers, service, pipe, and directive.
- `ngx-datetime`: date/time utilities.
- `ngx-socket`: socket integration.
- `ngx-rtc`: WebRTC/media integration.
- `ngx-ace`: Ace editor integration.
- `ngx-fabric`: Fabric canvas integration.
- `ngx-tinymce`: TinyMCE integration.

When changing a package, also consider its matching `*-app` because those apps are the live examples and integration checks for package consumers.

## Package Import Rules

Inside publishable libraries, import other workspace libraries through their published package names:

```ts
import { ModalService } from '@wawjs/ngx-ui';
import { StoreService } from '@wawjs/ngx-core';
```

Do not import another package through its source path, `dist` path, or local bare alias such as `ngx-ui` from a library source file. Local relative imports are fine only inside the same package.

Application projects may import from local aliases such as `ngx-ui`, `ngx-core`, or `ngx-map` when they are intended to consume source during local development. Libraries should use `@wawjs/ngx-*`.

If a library imports from another `@wawjs/ngx-*` package, update that library's `package.json` with a matching `peerDependencies` entry. Internal WAW package versions should use the current workspace range style, for example:

```json
"@wawjs/ngx-ui": ">=21.3.3"
```

Examples:

- If any package uses `ModalService`, `InputComponent`, `ButtonComponent`, `AlertService`, `ThemeService`, or other UI exports, it must import them from `@wawjs/ngx-ui` and declare `@wawjs/ngx-ui`.
- If any package uses `FormService`, form components, or form modals, it must import them from `@wawjs/ngx-form` and declare `@wawjs/ngx-form`.
- If any package uses `MapComponent`, `AddressComponent`, `MapService`, or map providers, it must import them from `@wawjs/ngx-map` and declare `@wawjs/ngx-map`.

Keep public APIs complete. If a symbol is intended for consumers or another package, export it from that package's `public-api.ts`.

Keep package documentation complete. When a publishable package's setup, public API, examples, dependencies, SSR behavior, or expected usage changes, update that package's `README.md` and `AI.md` in the same change.

## Package Boundaries

Keep package responsibilities clear:

- UI primitives and UI services belong in `ngx-ui`.
- Dynamic form logic belongs in `ngx-form`.
- Map/address/geocoding logic belongs in `ngx-map`.
- Generic storage, DOM, metadata, platform, emitter, utility, and SSR-safe base services belong in `ngx-core`.
- HTTP request behavior belongs in `ngx-http`.
- Offline-aware CRUD/data behavior belongs in `ngx-crud`.
- Translation behavior belongs in `ngx-translate`.

Prefer composing an existing package over duplicating utilities in an app or another package. If code naturally belongs to a shared package, move it there and wire dependencies explicitly.

Avoid circular package dependencies. A lower-level package should not import a higher-level package only for convenience. For example, `ngx-core` must stay independent of UI/form/map packages.

## Angular Style

This workspace uses Angular 21 and standalone APIs.

Use standalone components/directives/pipes. Do not add NgModules for new code unless maintaining an existing legacy surface. Do not set `standalone: true` in decorators because it is the default in modern Angular.

Prefer:

- `input()`, `output()`, and `model()` for new component APIs.
- Signals and `computed()` for local state.
- `inject()` for dependency injection in new code.
- `@Service()` for root-provided singleton services.
- Native control flow in templates (`@if`, `@for`, `@switch`).
- Angular 22 template spread and short arrow functions for local UI glue only, such as composing class arrays or toggling a signal. Keep filtering, sorting, async work, and workflow decisions in TypeScript.
- Grouped `@case` blocks and `@default never;` when a template switches over a closed union type.
- Reactive forms for new form-heavy behavior.

Avoid:

- Adding broad shared wrapper modules.
- Setting explicit `changeDetection` for the Angular 22 default mode. Use `ChangeDetectionStrategy.Eager` only when eager change detection is explicitly required.
- `@Injectable({ providedIn: 'root' })` for plain root singleton services; reserve `@Injectable()` for guards or deeper DI configuration.
- Using `ngClass` or `ngStyle` where class/style bindings are enough.
- Introducing untyped `any` unless the surrounding public API already requires it.
- Large unrelated refactors during focused package work.

Some older packages still use decorators such as `@Input()`, `@Output()`, `@HostBinding()`, or `@ViewChild()`. When touching those files, preserve public compatibility unless the task is explicitly a modernization pass.

## Naming Conventions

Private variables and private functions should start with `_`.

Injected services and class-based dependencies should use the class name in lower camel case:

```ts
private readonly _themeService = inject(ThemeService);
private readonly _modalService = inject(ModalService);
```

In abstract base classes or older shared API surfaces, keep the established double-underscore convention when it is already part of the inheritance pattern.

Prefer clear WAW/ngx names for exported configuration and providers:

- `provideNgxCore(...)`
- `provideNgxHttp(...)`
- `provideNgxCrud(...)`
- `provideNgxForm(...)`
- `provideNgxMap(...)`
- `provideTheme(...)`
- `provideTranslate(...)`

## SSR And Browser Safety

Most packages are intended to be SSR-safe. Do not add unguarded direct access to browser-only globals:

- `window`
- `document`
- `navigator`
- `localStorage`
- `sessionStorage`
- `performance`
- media devices
- WebRTC APIs
- Google Maps browser APIs

Guard browser-only behavior with Angular platform checks or existing guarded services. Prefer `isPlatformBrowser(inject(PLATFORM_ID))`, `DOCUMENT`, `DomService`, `StoreService`, or package-specific services that already handle SSR boundaries.

For persisted async reads, prefer `ngxResource({ key, ... })` from `@wawjs/ngx-core` over direct `StoreService.getJson()` so reads expose Angular resource loading/error/value state and can use StoreService-backed caching consistently. Use direct `StoreService.getJson()` only for imperative restore, migrations, queue replay, or one-off service initialization where a resource state object would make the flow less clear.

For new HTTP GET/read behavior outside `ngx-crud`, prefer `ngxHttpResource()` from `@wawjs/ngx-http` over `HttpService.get()` so reads expose Angular resource loading/error/value state and react to signal dependencies. Keep `HttpService.get()` for imperative workflows, legacy callbacks, Observable composition, request locking, and existing CRUD internals.

When adding a component that depends on browser-only libraries, ensure server rendering can instantiate the component without throwing.

## Styling

Keep component styles local and small. Use existing CSS variables and design tokens when available, especially from `ngx-ui` demos and theme styles.

For publishable libraries, be careful with external stylesheet resolution. If ng-packagr has trouble resolving a component stylesheet on Windows, inline small component styles in the `styles` array rather than adding build workarounds.

Do not introduce global styles from a library unless that is the explicit purpose of the package.

## Configuration And Providers

Prefer provider functions for package setup in apps:

```ts
provideNgxCore({ ... })
provideNgxHttp({ ... })
provideNgxCrud({ ... })
provideNgxForm({ ... })
provideNgxMap({ ... })
provideTheme({ ... })
provideTranslate({ ... })
```

Put package-wide defaults in providers instead of scattering constants across components. Keep optional package configuration in the package's `config.interface.ts` and provider file.

For metadata, prefer `provideNgxCore({ meta: ... })`, route metadata, and `MetaService`. If route-driven updates are expected, prefer `meta.applyFromRoutes = true`; use a guard only when a guard is genuinely needed.

For translations, register app translations with `provideTranslate(...)` and use `TranslateDirective` or `TranslateService`.

## Build And Verification

Use the root scripts:

```bash
npm run build:libs
npm run build:apps
npm run publish:dry-run
```

For focused checks:

```bash
npx ng build ngx-ui
npx ng build ngx-form
npx ng build ngx-map
npx ng build ngx-ui-app --configuration development
```

On Windows, prefer `npm.cmd` / `npx.cmd` when invoking commands directly from PowerShell.

Before finishing package-boundary work, verify:

- Every non-app library import from `@wawjs/ngx-*` has a matching dependency or peer dependency.
- Newly moved symbols are exported from the owning package's `public-api.ts`.
- The owning package's `README.md` and `AI.md` describe any changed setup, public APIs, examples, dependencies, or agent guidance.
- Matching `*-app` examples still import from the correct package.
- `npm run build:libs` passes when package boundaries changed.
- If app-facing behavior changed, build the matching `*-app`.

## Publishing Scripts

The publish flow is controlled by `scripts/publish.mjs`. It builds libraries, publishes `dist/<package>`, and bumps versions unless `--dry-run` or `--no-bump` is used.

When adding a new package, update:

- `angular.json`
- root `package.json` scripts if it has an app
- root `tsconfig.json` paths
- `scripts/build-libs.mjs`
- `scripts/build-apps.mjs` if it has a website app
- `scripts/publish.mjs`
- package `public-api.ts`
- package `package.json`
- package `README.md`
- package `AI.md`
- package `ng-package.json` assets if new publishable documentation files are added
- matching `*-app` demo/docs project

## Working With Apps

`*-app` projects are websites for the packages. They should demonstrate real package usage, not contain duplicate implementations of package features.

When an app needs behavior that belongs in a library, prefer adding it to the library and consuming it from the app. Keep demos realistic enough to catch integration problems.

Apps can compose multiple packages. For example, a map demo may use `ngx-map` plus `ngx-ui` theme providers; a form demo may use `ngx-form`, `ngx-ui`, `ngx-crud`, and `ngx-http`.

## Change Discipline

Keep edits scoped to the requested package or integration path. Do not move code between packages unless the package boundary requires it.

Do not revert unrelated local changes. This repo often has multiple package edits in progress.

When changing package APIs:

- Preserve backward compatibility unless the task explicitly allows a breaking change.
- Export new public symbols deliberately.
- Update the package `README.md` with current install/import/setup examples and consumer-facing usage notes.
- Update the package `AI.md` with current coding-agent guidance, package boundaries, SSR notes, and preferred APIs.
- Update demos/docs in the matching app.
- Update peer dependencies.
- Run focused builds first, then `npm run build:libs` when boundaries changed.

When in doubt, prefer clear package ownership and explicit dependencies over hidden coupling.
