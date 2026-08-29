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
- Prefer package components/services before one-off equivalents: `ButtonDirective` (not `ButtonComponent`, deprecated), `InputComponent`, `LinkComponent`, `SelectComponent`, `FileComponent`, `TableComponent`, `MaterialComponent`, `BurgerComponent`, `ThemeComponent`, `ModalService`, `AlertService`, `TagComponent`, `BadgeComponent`, `AvatarComponent`, `SpinnerComponent`, `ChipComponent`, `BreadcrumbComponent`, `AccordionComponent`/`AccordionPanelComponent`, `TabsComponent`/`TabPanelComponent`, `CardComponent`, `MenuComponent`/`MenubarComponent`, `TooltipDirective`, `ConfirmService`/`ConfirmPopupDirective`, `DividerComponent`, `ProgressBarComponent`, `ToggleComponent`, `MeterGroupComponent`, `TimelineComponent`, `OrderListComponent`, `ChartComponent`, and `EditorComponent`.
- Use the actual selectors: `button[wbutton]`/`a[wbutton]` (native-tag directive; `<wbutton>` still works but is deprecated), `<winput>`, `<wlink>`, `<wselect>`, `<ngx-file>`, `<wtable>`, `<material-icon>`, `<icon-burger>`, `<icon-theme>`, `<wtag>`, `<wbadge>`, `<wavatar>`, `<wspinner>`, `<wchip>`, `<wbreadcrumb>`, `<waccordion>`/`<waccordion-panel>`, `<wtabs>`/`<wtab>`, `<wcard>`, `<wmenu>`/`<wmenubar>`, `[wtooltip]`, `[wconfirmPopup]`, `<wdivider>`, `<wprogressbar>`, `<wtoggle>`, `<wmetergroup>`, `<wtimeline>`, `<worderlist>`, `<wchart>`, and `<weditor>`.
- `ChartComponent` (`<wchart>`) wraps Chart.js. `chart.js` is an **optional peer dependency** of `@wawjs/ngx-ui` — only required in an app if `ChartComponent` is actually used.
- `EditorComponent` (`<weditor>`) is a lightweight `contenteditable`-based editor for basic bold/italic/list formatting only. For a full-featured rich text editor, use `@wawjs/ngx-tinymce` instead — do not extend `EditorComponent` to add plugin/media/table support.
- New UI primitives that wrap a single native interactive element (`button`, `a`, `input`, `select`, `textarea`) with no real structural composition must be directives applied to that element, not components wrapping it — see `ButtonDirective`, `TooltipDirective`, and `ConfirmPopupDirective`. Only genuinely composite widgets (a control plus label/error, a dropdown, a data table, etc.) should be components.
- Use `<wlink>` for display-only email, phone, URL, SMS, WhatsApp, or custom links. It renders a semantic anchor and derives `mailto:`, `tel:`, `https:`, `sms:`, or WhatsApp targets; do not wrap links in labels or add hidden inputs unless a real form contract needs one.
- Include `<wbutton-styles />` once when an app uses only `ButtonDirective` without rendering `ButtonComponent`.
- Keep SSR safety intact. Theme token injection must stay guarded with Angular platform checks; do not add unguarded `window`, `document`, or browser storage access.
- An accessibility pass (WCAG 2.2 AA / EN 301 549 / WAI-ARIA APG) has been applied across most of this package: `Modal`/`ConfirmDialog` (focus trap via `@angular/cdk/a11y`'s `FocusTrapFactory`, focus restore, Escape-to-close, `role`/`aria-modal`), `Select` (combobox/listbox pattern with `aria-activedescendant`), `Menu`/`Menubar` (full keyboard nav), `Tabs`/`Accordion` (roving tabindex, `aria-controls` pairing), `Table` (keyboard-operable sort/row-actions/page-size), `Input` (`aria-invalid`/`aria-describedby`/`aria-required`), `Tooltip`/`ConfirmPopup` (`role="tooltip"`, Escape, focus return), `Alert` (`role="alert"`/`"status"`, pause-on-focus), `Burger`/`ThemeComponent` (real keyboard-operable toggles), and `Chart` (visually-hidden data-table fallback). `@angular/cdk` and `@angular/aria` are peer dependencies of this package; `@angular/aria`'s headless patterns are reserved for future composite-widget work since its 22.1.2 release has no `dialog` pattern (Modal instead uses `@angular/cdk/a11y` directly). A Vitest-based unit-test setup exists (`npm run test:ui` from the workspace root) with `axe-core` wired in via `src/testing/axe.ts`'s `expectNoA11yViolations()` helper — add a `.spec.ts` alongside any component you touch and reuse that helper rather than hand-rolling axe setup. Using this package does not by itself make a consuming application legally accessibility-compliant — that also depends on the app's content, structure, and usage.
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
| `ButtonComponent` | `<wbutton>` — deprecated, use `ButtonDirective` | `.wbutton` |
| `ButtonDirective` | `<button wbutton>` / `<a wbutton>` | `.wbutton` |
| `ButtonStylesComponent` | `<wbutton-styles>` | `.wbutton` styles |
| `InputComponent` | `<winput>` | `.winput` |
| `LinkComponent` | `<wlink>` | `.wlink` |
| `SelectComponent` | `<wselect>` | `.wselect` |
| `FileComponent` | `<ngx-file>` | `.wfile` |
| `TableComponent` | `<wtable>` | `.wtable` |
| `MaterialComponent` | `<material-icon>` | `.mi` |
| `BurgerComponent` | `<icon-burger>` | `.burger` |
| `ThemeComponent` | `<icon-theme>` | `.icon-theme` |
| `ModalService` | programmatic modal | `.wawjs-modal` |
| `AlertService` | programmatic alert | `.walert` |
| `TagComponent` | `<wtag>` | `.wtag` |
| `BadgeComponent` | `<wbadge>` | `.wbadge` |
| `AvatarComponent` | `<wavatar>` | `.wavatar` |
| `SpinnerComponent` | `<wspinner>` | `.wspinner` |
| `ChipComponent` | `<wchip>` | `.wchip` |
| `BreadcrumbComponent` | `<wbreadcrumb>` | `.wbreadcrumb` |
| `AccordionComponent` / `AccordionPanelComponent` | `<waccordion>` / `<waccordion-panel>` | `.waccordion` |
| `TabsComponent` / `TabPanelComponent` | `<wtabs>` / `<wtab>` | `.wtabs` |
| `CardComponent` | `<wcard>` | `.wcard` |
| `MenuComponent` / `MenuItemComponent` / `MenubarComponent` | `<wmenu>` / `<wmenu-item>` / `<wmenubar>` | `.wmenu` / `.wmenubar` |
| `TooltipDirective` / `TooltipStylesComponent` | `[wtooltip]` / `<wtooltip-styles>` | `.wtooltip` |
| `ConfirmService` / `ConfirmDialogComponent` | programmatic confirm modal | `.wconfirm` |
| `ConfirmPopupDirective` / `ConfirmPopupStylesComponent` | `[wconfirmPopup]` / `<wconfirm-popup-styles>` | `.wconfirm-popup` |
| `DividerComponent` | `<wdivider>` | `.wdivider` |
| `ProgressBarComponent` | `<wprogressbar>` | `.wprogressbar` |
| `ToggleComponent` | `<wtoggle>` | `.wtoggle` |
| `MeterGroupComponent` | `<wmetergroup>` | `.wmetergroup` |
| `TimelineComponent` | `<wtimeline>` | `.wtimeline` |
| `OrderListComponent` | `<worderlist>` | `.worderlist` |
| `ChartComponent` | `<wchart>` — needs `chart.js` (optional peer dep) | `.wchart` |
| `EditorComponent` | `<weditor>` — lightweight only, see note above | `.weditor` |

## Package Boundaries

- `@wawjs/ngx-ui`: UI primitives, UI services, theme state, and CSS token defaults.
- `@wawjs/ngx-form`: dynamic form schema and renderer behavior; depends on `ngx-ui`.
- `@wawjs/ngx-map`: map and address components; depends on `ngx-ui`.
- `@wawjs/ngx-core`: shared SSR-safe utilities; must not depend on UI packages.
- `@wawjs/ngx-http`: HTTP and resource helpers; must not depend on UI packages.
