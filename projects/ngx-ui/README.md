# @wawjs/ngx-ui

Angular UI primitives, modal and alert services, and an SSR-safe design token system by Web Art Work.

`ngx-ui` provides standalone components and services for application UI. Current code is fully self-contained: component visuals live in BEM SCSS and read CSS custom properties, so consumers do not need Tailwind CSS or another utility framework for package styling.

## License

[MIT](LICENSE)

## Installation

```bash
npm i --save @wawjs/ngx-ui
```

## Quick Setup

Add `provideNgxUi()` or `provideTheme()` to application providers.

```ts
import { provideNgxUi } from '@wawjs/ngx-ui';

export const appConfig = {
	providers: [
		provideNgxUi({
			mode: 'light',
			modes: ['light', 'dark'],
			density: 'comfortable',
			radius: 'rounded',
			tokens: {
				ffBase: "'Inter', system-ui, sans-serif",
				radiusBtn: '8px',
				radiusCard: '16px',
			},
			lightTokens: {
				primary: '#2563eb',
				primaryHover: '#1d4ed8',
				bgSecondary: '#ffffff',
				textPrimary: '#0f172a',
				border: '#e2e8f0',
			},
			darkTokens: {
				primary: '#3b82f6',
				primaryHover: '#2563eb',
				bgSecondary: '#1e293b',
				textPrimary: '#f1f5f9',
				border: '#334155',
			},
		}),
	],
};
```

`ThemeService` restores persisted theme values on the browser, writes `data-mode`, `data-density`, and `data-radius` to `<html>`, and applies resolved token values as CSS custom properties.

## CSS Baseline For SSR

For SSR or CSS-only defaults, include the packaged stylesheet before app styles:

```json
"styles": [
	"node_modules/@wawjs/ngx-ui/styles.css",
	"src/styles.scss"
]
```

The stylesheet defines the same built-in defaults as `ThemeService` using `:root`, `[data-mode]`, `[data-density]`, and `[data-radius]` selectors. App styles can still override any token afterward.

## What Changed Since 22.0.0

Version `22.0.0` was primarily a theme-state package with UI exports that still depended on utility-class styling in rendered markup. The current code adds:

- BEM SCSS for the UI components, with `ViewEncapsulation.None` so styles apply predictably in consuming apps.
- `ThemeTokens`, `TOKEN_VAR_MAP`, and default token exports for colors, shadows, spacing, radius, motion, alerts, and burger geometry.
- Runtime token application through `ThemeService`.
- A packaged `styles.css` static token baseline for SSR and CSS-only setups.
- `provideNgxUi()` as the package-level setup alias for `provideTheme()`.

## ThemeConfig

| Property | Type | Default | Description |
| --- | --- | --- | --- |
| `mode` | `ThemeMode` | `'dark'` | Initial mode. |
| `modes` | `ThemeMode[]` | `['light', 'dark']` | Modes used by `nextTheme()`. |
| `density` | `ThemeDensity` | `'comfortable'` | Initial density. |
| `densities` | `ThemeDensity[]` | `['comfortable', 'compact']` | Densities used by `nextTheme()`. |
| `radius` | `ThemeRadius` | `'rounded'` | Initial radius mode. |
| `radiuses` | `ThemeRadius[]` | `['rounded', 'square']` | Radius modes used by `nextTheme()`. |
| `persist` | `boolean` | `true` | Persist state in `localStorage` on the browser. |
| `storageKeys` | `Partial<ThemeStorageKeys>` | built in | Overrides persisted storage keys. |
| `tokens` | `ThemeTokens` | none | Overrides applied for every mode, density, and radius. |
| `lightTokens` / `darkTokens` | `ThemeTokens` | none | Mode-specific overrides. |
| `comfortableTokens` / `compactTokens` | `ThemeTokens` | none | Density-specific overrides. |
| `roundedTokens` / `squareTokens` | `ThemeTokens` | none | Radius-specific overrides. |

Token precedence is: built-in defaults, `tokens`, mode tokens, density tokens, radius tokens.

## ThemeTokens

Primary token groups:

| Group | Keys |
| --- | --- |
| Colors | `primary`, `primaryHover`, `secondary`, `secondaryHover`, `textPrimary`, `textSecondary`, `textMuted`, `placeholder`, `bgPrimary`, `bgSecondary`, `bgTertiary`, `border`, `danger`, `onDanger`, `onPrimary` |
| Effects | `focusRing`, `shadowSm`, `shadowMd` |
| Typography and motion | `ffBase`, `letterSpacing`, `motion`, `motionFast`, `easing` |
| Spacing | `sp1`, `sp2`, `sp3`, `sp4`, `sp5`, `sp6` |
| Radius | `radius`, `radiusCard`, `radiusBtn`, `radiusPill`, `bRadius`, `bRadiusCard` |
| Burger | `burgerSize`, `barW`, `barH`, `barGap` |
| Alerts | `alertInfoBg`, `alertSuccessBg`, `alertWarningBg`, `alertErrorBg`, `alertQuestionBg`, `alertInfoBar`, `alertSuccessBar`, `alertWarningBar`, `alertErrorBar`, `alertQuestionBar` |

CSS custom property names are exported in `TOKEN_VAR_MAP`. Examples:

```ts
import { TOKEN_VAR_MAP } from '@wawjs/ngx-ui';

TOKEN_VAR_MAP.primary; // "--c-primary"
TOKEN_VAR_MAP.radiusBtn; // "--radius-btn"
```

## ThemeService

```ts
import { inject } from '@angular/core';
import { ThemeService } from '@wawjs/ngx-ui';

const theme = inject(ThemeService);

theme.setMode('dark');
theme.setDensity('compact');
theme.setRadius('square');
theme.nextTheme();
```

Public state:

| Member | Description |
| --- | --- |
| `mode`, `density`, `radius` | Current theme signals. |
| `modes`, `densities`, `radiuses` | Available option signals. |
| `themeIndex` | Current index for `nextTheme()` cycling. |
| `setMode()`, `setDensity()`, `setRadius()` | Set one theme dimension and re-apply tokens. |
| `nextTheme()` | Cycles through mode, density, and radius combinations. |
| `init()` | Restores persisted state and applies attributes/tokens. Called by the provider. |

## Components And Services

| Export | Selector / usage | BEM root |
| --- | --- | --- |
| `ButtonComponent` | `<wbutton>` | `.wbutton` |
| `ButtonDirective` | `<button wbutton>` / `<a wbutton>` | `.wbutton` |
| `ButtonStylesComponent` | `<wbutton-styles>` | injects `.wbutton` styles |
| `InputComponent` | `<winput>` | `.winput` |
| `SelectComponent` | `<wselect>` | `.wselect` |
| `FileComponent` | `<ngx-file>` | `.wfile` |
| `TableComponent` | `<wtable>` | `.wtable` |
| `MaterialComponent` | `<material-icon>` | `.mi` |
| `BurgerComponent` | `<icon-burger>` | `.burger` |
| `ThemeComponent` | `<icon-theme>` | `.icon-theme` |
| `ModalService` | programmatic modals | `.wawjs-modal` |
| `AlertService` | programmatic alerts | `.walert` |

### Buttons

```html
<wbutton type="primary" (wClick)="save()">Save</wbutton>
<button wbutton type="secondary" (wClick)="cancel()">Cancel</button>
<a wbutton type="link" href="/docs">Docs</a>
```

When using only `ButtonDirective`, render `<wbutton-styles />` once in the app shell so the directive styles are present.

### Inputs

```html
<winput label="Email" type="email" [(wModel)]="email" />
<winput label="Message" type="textarea" [(wModel)]="message" />
<winput label="I agree" type="checkbox" [(wModel)]="agreed" />
```

### Select

```html
<wselect label="Country" [items]="countries" [(wModel)]="countryId" />
<wselect label="Tags" [items]="tags" [multiple]="true" [searchable]="true" [(wModel)]="tagIds" />
```

### File

```html
<ngx-file label="Upload" [multiple]="true" [(wFiles)]="files" />
```

### Modal

```ts
import { inject } from '@angular/core';
import { ModalService } from '@wawjs/ngx-ui';

const modal = inject(ModalService);

modal.show({
	component: DetailsComponent,
	size: 'mid',
	panelClass: 'details-modal',
});
```

### Alert

```ts
import { inject } from '@angular/core';
import { AlertService } from '@wawjs/ngx-ui';

const alert = inject(AlertService);

alert.show({ text: 'Changes saved', type: 'success', timeout: 3000 });
alert.question({
	text: 'Delete this item?',
	buttons: [{ text: 'Delete', callback: () => remove() }],
});
```

### Theme Icon And Burger

```html
<icon-theme [showText]="true" />
<icon-burger state="three-lines" (updated)="toggleMenu()" />
```

## Styling Guidance

CSS custom properties cascade. Override tokens at any container boundary:

```css
.settings-panel {
	--c-primary: #14b8a6;
	--c-bg-secondary: #ffffff;
	--radius-card: 10px;
}
```

Prefer token overrides over targeting internal BEM elements. If a direct style override is needed, scope it through a parent selector owned by the app.

## AI Coding Agents

This package includes [AI.md](AI.md) with copyable guidance for Codex, Claude Code, Cursor, Copilot, and other coding agents.
