# Changelog

All notable changes to the `@wawjs` package family are documented here.

Versions follow the Angular major version cycle. Patch releases, such as `22.0.1`, track changes within a major release.

## [22.0.1] - 2026-06-30

### @wawjs/ngx-ui - CSS Architecture And Design Token System

This release is a significant overhaul of `ngx-ui`, making the library self-contained and usable in Angular projects without requiring Tailwind CSS or another utility framework in the host app.

#### Breaking Changes

- Tailwind CSS utility classes were removed from library templates and TypeScript style constants. Host apps that depended on utility classes appearing in library-rendered HTML should target the documented BEM roots or override CSS custom properties instead.

#### New Design Token System

`ThemeService` now writes resolved CSS custom properties to `document.documentElement` at startup and re-applies them after `setMode()`, `setDensity()`, and `setRadius()`.

New exports from `@wawjs/ngx-ui`:

| Export | Description |
| --- | --- |
| `ThemeTokens` | Typed design token interface. |
| `TOKEN_VAR_MAP` | Maps each `ThemeTokens` key to its CSS custom property name. |
| `DEFAULT_LIGHT_TOKENS` | Built-in light-mode color, surface, shadow, and alert defaults. |
| `DEFAULT_DARK_TOKENS` | Built-in dark-mode color, surface, shadow, and alert defaults. |
| `DEFAULT_COMFORTABLE_TOKENS` | Comfortable-density spacing scale. |
| `DEFAULT_COMPACT_TOKENS` | Compact-density spacing scale. |
| `DEFAULT_ROUNDED_TOKENS` | Rounded-radius values. |
| `DEFAULT_SQUARE_TOKENS` | Square-radius values. |
| `DEFAULT_STATIC_TOKENS` | Mode-invariant font, motion, easing, and burger geometry defaults. |

Extended `ThemeConfig` optional properties:

| Property | Applied when |
| --- | --- |
| `tokens` | Always. |
| `lightTokens` | Mode is `'light'`. |
| `darkTokens` | Mode is `'dark'`. |
| `comfortableTokens` | Density is `'comfortable'`. |
| `compactTokens` | Density is `'compact'`. |
| `roundedTokens` | Radius is `'rounded'`. |
| `squareTokens` | Radius is `'square'`. |

`styles.css` is now a distributable asset. For SSR or CSS-only setups, import `node_modules/@wawjs/ngx-ui/styles.css` in `angular.json` before app styles. It provides defaults for every CSS token used by the package through `:root`, `[data-mode]`, `[data-density]`, and `[data-radius]` selectors.

#### New BEM Component Styles

All UI components now have self-contained BEM SCSS and `ViewEncapsulation.None`.

| Export | Selector / usage | BEM root |
| --- | --- | --- |
| `ButtonComponent` / `ButtonDirective` | `<wbutton>` / `button[wbutton]` | `.wbutton` |
| `InputComponent` | `<winput>` | `.winput` |
| `SelectComponent` | `<wselect>` | `.wselect` |
| `FileComponent` | `<ngx-file>` | `.wfile` |
| `TableComponent` | `<wtable>` | `.wtable` |
| `MaterialComponent` | `<material-icon>` | `.mi` |
| `BurgerComponent` | `<icon-burger>` | `.burger` |
| `ThemeComponent` | `<icon-theme>` | `.icon-theme` |
| `ModalService` | programmatic modal | `.wawjs-modal` |
| `AlertService` | programmatic alert | `.walert` |

#### Bug Fixes

- Modal panel classes now always include the base modal content class when a custom `panelClass` is supplied.
- Alert text colors now use tokens instead of hardcoded slate values.
- Alert backgrounds and progress bars are tokenized and have defaults in both `theme.tokens.ts` and `styles.css`.
- Input checkbox and radio marks use `--c-on-primary`.
- Select removed a dangling `_search` class binding.
- Button, modal, and alert styles no longer rely on `!important` overrides.
- `AlertComponent` and `ModalComponent` import `ButtonDirective` where `(wClick)` is used.
- `ButtonStylesComponent` loads the shared button stylesheet instead of an incomplete inline style block.
- Local demo apps now include `projects/ngx-ui/styles.css` before their app stylesheet so package token defaults are present during SSR and before theme initialization.

### All Other Packages - Version Bump

`ngx-core`, `ngx-translate`, `ngx-http`, `ngx-crud`, `ngx-socket`, `ngx-rtc`, `ngx-datetime`, `ngx-ace`, `ngx-fabric`, `ngx-tinymce`, `ngx-form`, and `ngx-map` were bumped to `22.0.1` to stay in sync.

## [22.0.0] - Prior Release

Angular 22 baseline. All packages targeted Angular 22 peer dependencies. `ngx-ui` still documented a theme-state-focused package surface; the 22.0.1 work adds the self-contained component style and token baseline.
