# AI Usage Guide for @wawjs/ngx-ui

Use this file as context for coding agents when an Angular project depends on `@wawjs/ngx-ui`.

## Agent Instructions

```md
- This Angular project uses `@wawjs/ngx-ui` for UI components, modal/alert services, theme state, and CSS design tokens.
- Import public APIs from `@wawjs/ngx-ui`; do not import from package source paths, `dist`, or local aliases inside publishable libraries.
- Bootstrap apps with `provideNgxUi(config)` or `provideTheme(config)` in application providers.
- Use `ThemeService` for mode, density, radius, persistence, and theme cycling. Do not scatter `localStorage`, `document.documentElement.dataset`, or `style.setProperty` calls for theme handling.
- `ThemeService` writes token custom properties such as `--c-primary`, `--sp-3`, and `--radius-btn` to `document.documentElement` during browser initialization and theme changes.
- For SSR or CSS-only defaults, import `node_modules/@wawjs/ngx-ui/styles.css` in `angular.json` styles before app styles.
- Keep `projects/ngx-ui/src/theme/theme.tokens.ts` and `projects/ngx-ui/styles.css` synchronized whenever token defaults or token keys change.
- All styled components use BEM SCSS and `ViewEncapsulation.None`. Prefer CSS custom property overrides on app-owned ancestors over direct internal class overrides.
- Prefer package components/services before one-off equivalents: `ButtonComponent`, `ButtonDirective`, `InputComponent`, `SelectComponent`, `FileComponent`, `TableComponent`, `MaterialComponent`, `BurgerComponent`, `ThemeComponent`, `ModalService`, and `AlertService`.
- Use the actual selectors: `<wbutton>`, `button[wbutton]`, `<winput>`, `<wselect>`, `<ngx-file>`, `<wtable>`, `<material-icon>`, `<icon-burger>`, and `<icon-theme>`.
- Include `<wbutton-styles />` once when an app uses only `ButtonDirective` without rendering `ButtonComponent`.
- Keep SSR safety intact. Theme token injection must stay guarded with Angular platform checks; do not add unguarded `window`, `document`, or browser storage access.
```

## Common Setup

```ts
import { provideNgxUi } from '@wawjs/ngx-ui';

export const appConfig = {
	providers: [
		provideNgxUi({
			mode: 'dark',
			modes: ['light', 'dark'],
			density: 'comfortable',
			radius: 'rounded',
		}),
	],
};
```

## Token Setup

```json
"styles": [
	"node_modules/@wawjs/ngx-ui/styles.css",
	"src/styles.scss"
]
```

Override tokens through `ThemeConfig` for runtime theme-aware values:

```ts
provideNgxUi({
	tokens: {
		ffBase: "'Inter', system-ui, sans-serif",
		radiusBtn: '8px',
	},
	lightTokens: {
		primary: '#2563eb',
		bgSecondary: '#ffffff',
		textPrimary: '#0f172a',
	},
	darkTokens: {
		primary: '#3b82f6',
		bgSecondary: '#1e293b',
		textPrimary: '#f1f5f9',
	},
});
```

Override tokens through CSS for local sections:

```css
.billing-page {
	--c-primary: #14b8a6;
	--radius-card: 10px;
}
```

## Current Public Surface Compared With 22.0.0

The released `22.0.0` package was primarily theme state plus UI exports. Current code adds BEM SCSS, runtime design token injection, `ThemeTokens`, default token exports, `TOKEN_VAR_MAP`, and a packaged `styles.css` token baseline.

When documenting or changing this package, mention both the runtime provider path and the static CSS path.

## Component Map

| Export | Selector / usage | BEM root |
| --- | --- | --- |
| `ButtonComponent` | `<wbutton>` | `.wbutton` |
| `ButtonDirective` | `<button wbutton>` / `<a wbutton>` | `.wbutton` |
| `ButtonStylesComponent` | `<wbutton-styles>` | `.wbutton` styles |
| `InputComponent` | `<winput>` | `.winput` |
| `SelectComponent` | `<wselect>` | `.wselect` |
| `FileComponent` | `<ngx-file>` | `.wfile` |
| `TableComponent` | `<wtable>` | `.wtable` |
| `MaterialComponent` | `<material-icon>` | `.mi` |
| `BurgerComponent` | `<icon-burger>` | `.burger` |
| `ThemeComponent` | `<icon-theme>` | `.icon-theme` |
| `ModalService` | programmatic modal | `.wawjs-modal` |
| `AlertService` | programmatic alert | `.walert` |

## Package Boundaries

- `@wawjs/ngx-ui`: UI primitives, UI services, theme state, and CSS token defaults.
- `@wawjs/ngx-form`: dynamic form schema and renderer behavior; depends on `ngx-ui`.
- `@wawjs/ngx-map`: map and address components; depends on `ngx-ui`.
- `@wawjs/ngx-core`: shared SSR-safe utilities; must not depend on UI packages.
- `@wawjs/ngx-http`: HTTP and resource helpers; must not depend on UI packages.
