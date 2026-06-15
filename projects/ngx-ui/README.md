# @wawjs/ngx-ui

Angular SSR-safe theme state package from Web Art Work.

`ngx-ui` is focused on configurable theme mode, density, and radius preferences through `ThemeService`.

## License

[MIT](LICENSE)

## Installation

```bash
npm i --save @wawjs/ngx-ui
```

## Usage

```ts
import { provideTheme } from '@wawjs/ngx-ui';

export const appConfig = {
	providers: [
		provideTheme({
			mode: 'dark',
			modes: ['light', 'dark'],
			density: 'comfortable',
			radius: 'rounded',
		}),
	],
};
```

## Available Features

| Name | Description |
| --- | --- |
| `ThemeService` | Theme mode, density, radius, persistence, and theme cycling |
| `provideTheme` | Environment provider for automatic theme initialization |
| `provideNgxUi` | Alias for `provideTheme()` following the package provider naming convention |
| `ThemeConfig`, `THEME_CONFIG`, `DEFAULT_THEME_CONFIG` | Provider configuration helpers |
| `ThemeMode`, `ThemeDensity`, `ThemeRadius` | Public theme types |

## Theme Service

`ThemeService` restores persisted values on the client, applies `data-mode`, `data-density`, and `data-radius` to the document root, and stays SSR-safe by guarding browser-only APIs.

### Signals and state

- `mode`
- `modes`
- `density`
- `densities`
- `radius`
- `radiuses`
- `themeIndex`

### Methods

- `setMode(mode: ThemeMode)`
- `setDensity(density: ThemeDensity)`
- `setRadius(radius: ThemeRadius)`
- `nextTheme()`
- `init()`

Example:

```ts
import { inject } from '@angular/core';
import { ThemeService } from '@wawjs/ngx-ui';

const themeService = inject(ThemeService);

themeService.setMode('dark');
themeService.setDensity('comfortable');
themeService.setRadius('rounded');
```

## AI Coding Agents

This package includes [AI.md](AI.md) with copyable instructions for Codex, Claude Code, Cursor, and other coding agents.

Copy this into the consuming project's `AGENTS.md`, `CLAUDE.md`, or equivalent file:

```md
- This Angular project uses `@wawjs/ngx-ui` for reusable UI primitives, services, modal/alert/table/input/select components, and SSR-safe theme state.
- Import public APIs from `@wawjs/ngx-ui`.
- Prefer bootstrapping with `provideTheme()` in application providers.
- Prefer `ThemeService` for theme mode, density, radius, persistence, and theme cycling before adding duplicate theme utilities.
- Prefer exported UI components and services before building one-off equivalents.
- Use Angular 22 template spread and short arrow functions only for local UI glue, such as class composition and signal toggles.
- Use grouped `@case` blocks and `@default never;` when a template switches over a closed union type owned by the component.
- Keep theme state centralized in `ThemeService` instead of scattering `localStorage` and `data-*` attribute updates across components.
- Keep SSR-safe behavior intact. Do not add unguarded direct access to `document` or `localStorage` for theme handling.
```
