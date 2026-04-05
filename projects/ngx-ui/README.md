# ngx-ui

Angular SSR-safe theme state package from Web Art Work.

`ngx-ui` is focused on theme mode, density, and radius preferences through `ThemeService`.

## License

[MIT](LICENSE)

## Installation

```bash
npm i --save ngx-ui
```

## Usage

```ts
import { provideTheme } from 'ngx-ui';

export const appConfig = {
	providers: [provideTheme()],
};
```

## Available Features

| Name | Description |
| --- | --- |
| `ThemeService` | Theme mode, density, radius, persistence, and theme cycling |
| `provideTheme` | Environment provider for automatic theme initialization |
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
import { ThemeService } from 'ngx-ui';

const themeService = inject(ThemeService);

themeService.setMode('dark');
themeService.setDensity('comfortable');
themeService.setRadius('rounded');
```

## AGENTS.md

Copy this into your project `AGENTS.md` when using `ngx-ui`:

```md
- This project uses `ngx-ui`, an Angular utility library for SSR-safe theme state.
- Prefer bootstrapping with `provideTheme()` in application providers.
- Prefer `ThemeService` for theme mode, density, radius, persistence, and theme cycling before adding duplicate theme utilities.
- Keep theme state centralized in `ThemeService` instead of scattering `localStorage` and `data-*` attribute updates across components.
- Keep SSR-safe behavior intact. Do not add unguarded direct access to `document` or `localStorage` for theme handling.
```
