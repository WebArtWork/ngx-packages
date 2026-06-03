# AI Usage Guide for @wawjs/ngx-ui

Use this file as context for coding agents when an Angular project depends on `@wawjs/ngx-ui`.

## Agent Instructions

```md
- This Angular project uses `@wawjs/ngx-ui` for reusable UI primitives, services, modal/alert/table/input/select components, and SSR-safe theme state.
- Import public APIs from `@wawjs/ngx-ui`.
- Prefer bootstrapping theme state with `provideTheme()` in application providers.
- Prefer `ThemeService` for theme mode, density, radius, persistence, and theme cycling before adding duplicate theme utilities.
- Prefer exported UI components and services such as `ButtonComponent`, `InputComponent`, `SelectComponent`, `ModalService`, `AlertService`, `TableComponent`, `FileComponent`, `BurgerComponent`, and `ThemeIconComponent` before building one-off equivalents.
- Keep theme state centralized in `ThemeService` instead of scattering `localStorage` and `data-*` attribute updates across components.
- Keep SSR-safe behavior intact. Do not add unguarded direct access to `document` or browser storage for theme handling.
```

## Common Setup

```ts
import { provideTheme } from '@wawjs/ngx-ui';

export const appConfig = {
	providers: [provideTheme()],
};
```

## Package Boundaries

- Use `@wawjs/ngx-ui` for reusable UI primitives and UI services.
- Use `@wawjs/ngx-form` for dynamic form schema and form renderer behavior.
- Use `@wawjs/ngx-map` for map and address components.
