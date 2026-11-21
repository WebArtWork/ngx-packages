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
- Runtime token application through `ThemeService`. The package defaults for the current mode, density and radius go into `<style id="wtheme-defaults">` under `:where(:root)` (zero specificity), so the app's own token stylesheet (for example `src/styles/_theme.scss`) and `styles.css` always win, and apps without either still get the defaults. Only tokens passed to `provideNgxUi({...})` are written inline on `<html>`, with the highest priority.
- A packaged `styles.css` static token baseline for SSR and CSS-only setups.
- `provideNgxUi()` as the package-level setup alias for `provideTheme()`.

## ThemeConfig

| Property | Type | Default | Description |
| --- | --- | --- | --- |
| `mode` | `ThemeMode` | `'light'` | Initial mode, used when nothing is persisted yet. A persisted choice (`persist: true`) wins on later visits. |
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

## Startup Screen

A full-screen logo and spinner shown while the app finishes startup work, such as loading the saved language, the theme, or the signed-in user from an API. It hides once the root component has bootstrapped (every app initializer, such as `provideTranslate()`, has finished and the first render is done), every registered task has settled, and the app is stable (no pending HTTP requests or follow-up renders).

It has three parts:

1. **Styles**: add `node_modules/@wawjs/ngx-ui/startup.css` to `angular.json` `styles`. It works without `styles.css` and falls back to system colors when the theme tokens are missing.
2. **Markup and script in `index.html`**: the screen must exist before Angular starts. For example, `provideTranslate()` loads translations in an app initializer, and nothing renders until that finishes.

```html
<html lang="uk" data-startup-language="ua">
	<head>
		<script>
			(function () {
				var root = document.documentElement;
				var show = root.getAttribute('data-startup') === 'always';
				if (!show) {
					try {
						// ngx-translate saves the language through the ngx-core store, which prefixes keys
						// with 'waStore' by default (provideNgxCore({ store: { prefix } })).
						var language = localStorage.getItem('waStoretranslate.language');
						var base = root.getAttribute('data-startup-language');
						show = !!language && !!base && language !== base;
					} catch (e) {}
				}
				if (show) {
					root.classList.add('wstartup-pending');
					// Safety net if the app bundle never starts.
					setTimeout(function () {
						root.classList.remove('wstartup-pending');
					}, 15000);
				}
			})();
		</script>
	</head>
	<body>
		<div id="wstartup" class="wstartup" role="status" aria-live="polite">
			<div class="wstartup__content">
				<div class="wstartup__halo">
					<img class="wstartup__logo" src="logo.png" alt="" width="128" height="128" />
				</div>
				<span class="wstartup__label">Loading</span>
			</div>
		</div>
		<app-root></app-root>
	</body>
</html>
```

   - The logo pulses inside a spinning ring (`wstartup__halo`). The earlier markup (a 64px logo next to an svg `wstartup__spinner` with `wstartup__track` and `wstartup__arc` circles) is still styled, so existing apps keep working.
   - Browser-only apps (SPA) set `data-startup="always"` on `<html>`, so the screen covers the empty page until the app is ready.
   - Prerendered sites set `data-startup-language` to the language code the pages are prerendered in. The screen then shows only when the saved language differs, the case where visitors would otherwise see the text switch. Apply the saved theme in the same early script (as the templates do) so the theme never causes a visible change.

3. **Providers**:

```ts
import { provideStartup, provideStartupTask } from '@wawjs/ngx-ui';

providers: [
	provideStartup(), // { timeout: 10000, minDuration: 250 } by default
	provideStartupTask('user', () => inject(UserService).whenLoaded()),
];
```

- A task runs in an injection context and returns a Promise (or nothing). Convert Observables with `firstValueFrom()`.
- Tasks can also be added from code with `inject(StartupService).register('name', promiseOrFn)`, before the first render finishes.
- A task should handle its own errors. A rejection is logged with the task name and the app still opens. After `timeout` the app opens anyway, and the still-pending task names are logged.
- Once shown, the screen stays at least `minDuration` ms (default 250), counted from the start of the page load, so a fast start does not blink it in and out. It never delays a start that did not show the screen; pass `minDuration: 0` to turn it off.
- `StartupService.ready()`, `pending()` and `whenReady()` expose the state.
- While the screen shows, everything else in `<body>` is `inert`, so nothing underneath can take focus (an autofocused input would otherwise open the on-screen keyboard on mobile behind the spinner). After release, an `[autofocus]` element gets focus.
- On the server the service does nothing.
- The background covers the page at once, and the logo and spinner fade in after 300ms, so a fast start doesn't flash a spinner. With `prefers-reduced-motion` the spinner pulses instead of rotating.

## Components And Services

| Export | Selector / usage | BEM root |
| --- | --- | --- |
| `ButtonComponent` | `<wbutton>` (deprecated, use `ButtonDirective`) | `.wbutton` |
| `ButtonDirective` | `<button wbutton>` / `<a wbutton>` | `.wbutton` |
| `ButtonStylesComponent` | `<wbutton-styles>` | injects `.wbutton` styles |
| `InputComponent` | `<winput>` | `.winput` |
| `LinkComponent` | `<wlink>` | `.wlink` |
| `SelectComponent` | `<wselect>` | `.wselect` |
| `FileComponent` | `<ngx-file>` | `.wfile` |
| `TableComponent` | `<wtable>` | `.wtable` |
| `MaterialComponent` | `<material-icon>` | `.mi` |
| `BurgerComponent` | `<icon-burger>` | `.burger` |
| `ThemeComponent` | `<icon-theme>` | `.icon-theme` |
| `ModalService` | programmatic modals | `.wawjs-modal` |
| `AlertService` | programmatic alerts | `.walert` |
| `TagComponent` | `<wtag>` | `.wtag` |
| `BadgeComponent` | `<wbadge>` | `.wbadge` |
| `AvatarComponent` | `<wavatar>` | `.wavatar` |
| `SpinnerComponent` | `<wspinner>` | `.wspinner` |
| `ChipComponent` | `<wchip>` | `.wchip` |
| `BreadcrumbComponent` | `<wbreadcrumb>` | `.wbreadcrumb` |
| `AccordionComponent` / `AccordionPanelComponent` | `<waccordion>` / `<waccordion-panel>` | `.waccordion` |
| `TabsComponent` / `TabPanelComponent` | `<wtabs>` / `<wtab>` | `.wtabs` |
| `CardComponent` | `<wcard>` | `.wcard` |
| `MenuComponent` / `MenubarComponent` | `<wmenu>` / `<wmenubar>` | `.wmenu` / `.wmenubar` |
| `TooltipDirective` | `[wtooltip]` | `.wtooltip` |
| `TooltipStylesComponent` | `<wtooltip-styles>` | injects `.wtooltip` styles |
| `ConfirmService` | programmatic confirm modal | `.wconfirm` |
| `ConfirmPopupDirective` | `[wconfirmPopup]` | `.wconfirm-popup` |
| `ConfirmPopupStylesComponent` | `<wconfirm-popup-styles>` | injects `.wconfirm-popup` styles |
| `DividerComponent` | `<wdivider>` | `.wdivider` |
| `ProgressBarComponent` | `<wprogressbar>` | `.wprogressbar` |
| `ToggleComponent` | `<wtoggle>` | `.wtoggle` |
| `MeterGroupComponent` | `<wmetergroup>` | `.wmetergroup` |
| `TimelineComponent` | `<wtimeline>` | `.wtimeline` |
| `OrderListComponent` | `<worderlist>` | `.worderlist` |
| `EditorComponent` | `<weditor>` | `.weditor` |

### Buttons

```html
<wbutton type="primary" (wClick)="save()">Save</wbutton>
<button wbutton type="secondary" (wClick)="cancel()">Cancel</button>
<a wbutton type="link" href="/docs">Docs</a>
```

When using only `ButtonDirective`, render `<wbutton-styles />` once in the app shell so the directive styles are present.

`ButtonDirective` also supports `icon`, `iconPos`, `loading`, `loadingIcon`, `size` (`small`/`large`), `outlined`, `text`, `raised`, `rounded`, `plain`, `badge`, `badgeSeverity`, `ariaLabel`, and `autofocus`:

```html
<button wbutton icon="save" [loading]="saving()" (wClick)="save()">Save</button>
<button wbutton size="small" outlined type="danger">Delete</button>
```

### Inputs

```html
<winput label="Email" type="email" [(wModel)]="email" required />
<winput label="Message" type="textarea" [(wModel)]="message" />
<winput label="I agree" type="checkbox" [(wModel)]="agreed" />
```

Validation errors (from the `error` input, or from a bound Signal Forms `formField`) render with `role="alert"` and are wired to the control via `aria-describedby`/`aria-invalid`; pass `required` (or rely on the signal-forms field's own required state) for `aria-required`.

### Links

`LinkComponent` is the display-only counterpart to `InputComponent`. It renders a semantic anchor with a safe, type-specific href; it does not create or wrap a hidden form input.

```html
<wlink label="Email" type="email" value="hello@example.com" icon="email" />
<wlink label="Phone" type="tel" value="+38 (067) 123-45-67" icon="call" />
<wlink label="Website" type="url" value="example.com" target="_blank" icon="open_in_new" />
```

| `type` | Generated href |
| --- | --- |
| `email` | `mailto:` |
| `tel` | `tel:` |
| `url` | Adds `https://` when no scheme is supplied. |
| `sms` | `sms:` |
| `whatsapp` | `https://wa.me/` |
| `custom` | Requires an explicit `href`. |

Set `href` to override generated targets. External links receive `rel="noopener noreferrer"` by default when `target="_blank"`.

### Select

```html
<wselect label="Country" [items]="countries" [(wModel)]="countryId" />
<wselect label="Tags" [items]="tags" [multiple]="true" [searchable]="true" [(wModel)]="tagIds" />
```

`[raw]="true"` shows the option labels as they are instead of passing them through the translator (use it when the labels are translation keys). With `formField` (Signal Forms) the select keeps the field and `wModel` in sync in both directions.

`<wselect>` implements the WAI-ARIA APG combobox/listbox pattern: `role="combobox"` with `aria-haspopup="listbox"`, `aria-expanded`, `aria-controls`, and `aria-activedescendant` tracking the arrow-key-highlighted option, plus `label` programmatically associated via `aria-labelledby`.

### Table

```html
<wtable [rows]="rows" [columns]="columns" [config]="config" />
```

Sortable column headers are keyboard-operable (Enter/Space) and expose `aria-sort`; row-action icons render as real `<button>`s with an accessible name instead of bare `<i>` glyphs; the per-page selector is a `role="listbox"` popup with <kbd>Escape</kbd> support instead of a plain click-toggle `<div>`.

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

`ModalComponent` renders `role="dialog"` (or `role="alertdialog"` via `role: 'alertdialog'`), traps focus while open (`@angular/cdk/a11y` `FocusTrapFactory`), restores focus to whatever triggered it on close, and closes on <kbd>Escape</kbd> when `closeOnEscape` is true. Pass `ariaLabel`, or preferably `ariaLabelledBy`/`ariaDescribedBy` pointing at an id inside your content component, to give the dialog an accessible name:

```ts
modal.show({
	component: DetailsComponent,
	ariaLabelledBy: 'details-modal-title',
});
```

Close behaviour is controlled separately: `showClose` (the x button), `closeOnEscape` and `closeOnBackdrop`. Each defaults to `closable` (itself `true`), so `closable: false` still disables all three at once, and e.g. `{ closable: true, closeOnBackdrop: false }` keeps the button and Escape but ignores backdrop clicks. `onOpen` and `onClose` are part of `ModalConfig`, so they can be passed straight to `show()`.

`size` accepts `'small' | 'mid' | 'big' | 'full' | 'fullscreen'`. `'fullscreen'` fills the whole window (`100vw` x `100dvh`) with no outer gap, rounded corners or max-width; `'full'` is the large padded panel. `modal.fullscreen(opts)` is a shortcut.

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

Alerts render `role="alert"` (errors/questions, announced immediately) or `role="status"` (info/success/warning, announced politely). The auto-dismiss timer pauses on keyboard focus as well as mouse hover, so a focused alert never disappears mid-interaction.

### Tag, Badge, Chip, Avatar

```html
<wtag type="success" icon="check">Active</wtag>
<wbadge type="danger" [value]="3" />
<wchip [value]="'Angular'" icon="code" [removable]="true" (wRemove)="remove()" />
<wavatar label="Kristina Petrova" />
<wavatar image="/avatars/1.png" size="large" />
```

### Breadcrumb

```html
<wbreadcrumb [items]="[{ label: 'Settings', routerLink: '/settings' }, { label: 'Profile' }]" />
```

### Accordion

```html
<waccordion>
	<waccordion-panel header="Billing">Billing details here.</waccordion-panel>
	<waccordion-panel header="Security">Security settings here.</waccordion-panel>
</waccordion>
```

Pass `[multiple]="true"` on `<waccordion>` to allow more than one panel open at once.

Each panel's header button gets a stable `id`/`aria-controls` pair with its body (`role="region"`, `aria-labelledby`), so the expand/collapse relationship is exposed to assistive technology.

### Tabs

```html
<wtabs [(activeIndex)]="tab">
	<wtab header="Overview">Overview content.</wtab>
	<wtab header="Activity">Activity content.</wtab>
</wtabs>
```

Follows the WAI-ARIA APG Tabs pattern: only the active tab is in the Tab order (roving `tabindex`), Left/Right/Home/End move focus and selection together, and each tab/panel pair is linked via `aria-controls`/`aria-labelledby`.

### Card

```html
<wcard title="Invoice #1042" subtitle="Due Aug 30">
	Invoice line items go here.
</wcard>
```

### Menu And Menubar

```html
<wmenu [items]="items" [popup]="true" #menu />
<button wbutton (wClick)="menu.toggle($event)">Actions</button>

<wmenubar [items]="navItems" (wSelect)="onSelect($event)" />
```

`MenuItem` supports `label`, `icon`, `command`, `routerLink`, `href`, `disabled`, `separator`, and nested `items` for submenus.

`<wmenu>`/`<wmenubar>` render `role="menu"`/`role="menubar"` with `role="menuitem"` items, support Arrow/Home/End keyboard navigation between items (and Left/Right into and out of submenus), and close on <kbd>Escape</kbd>.

### Tooltip

```html
<span wtooltip="Shown on hover" tooltipPosition="top">Hover me</span>
```

Render `<wtooltip-styles />` once in the app shell so the directive's floating panel is styled. The tooltip gets `role="tooltip"` and the host element gets a matching `aria-describedby` while it's shown (in addition to the existing show-on-focus behavior), and <kbd>Escape</kbd> dismisses it.

### Confirm

```ts
import { inject } from '@angular/core';
import { ConfirmService } from '@wawjs/ngx-ui';

const confirm = inject(ConfirmService);

confirm.confirm({
	message: 'Delete this item?',
	accept: () => remove(),
});
```

```html
<button wconfirmPopup="Are you sure?" (wAccept)="remove()">Delete</button>
```

Render `<wconfirm-popup-styles />` once in the app shell when using `[wconfirmPopup]`. The popup moves focus to its reject button when it opens, closes on <kbd>Escape</kbd>, and restores focus to the triggering element on close.

### Divider, ProgressBar, Toggle, MeterGroup

```html
<wdivider>OR</wdivider>
<wdivider layout="vertical" />

<wprogressbar [value]="uploadPercent()" />
<wprogressbar mode="indeterminate" />

<wtoggle [(checked)]="notificationsEnabled" ariaLabel="Notifications" />

<wmetergroup
	[items]="[
		{ label: 'Images', value: 12 },
		{ label: 'Documents', value: 8 },
		{ label: 'Video', value: 4 }
	]"
/>
```

### Timeline

```html
<wtimeline
	[items]="[
		{ label: 'Order placed', date: 'Aug 1', icon: 'shopping_cart' },
		{ label: 'Shipped', date: 'Aug 3', icon: 'local_shipping' },
		{ label: 'Delivered', date: 'Aug 5', icon: 'check' }
	]"
/>
```

### OrderList

```html
<worderlist [(items)]="priorityList" bindLabel="name" />
```

### Editor

Lightweight `contenteditable`-based rich text editor for basic bold/italic/list formatting. For a full-featured editor (tables, media embeds, plugins), use `@wawjs/ngx-tinymce` instead. HTML set through `wModel` is sanitized with Angular's `DomSanitizer` before rendering (scripts, event handlers, and unsafe URLs are removed).

```html
<weditor [(wModel)]="bioHtml" placeholder="Write your bio..." />
```

### Theme Icon And Burger

```html
<icon-theme [showText]="true" />
<icon-burger
	state="three-lines"
	[controls]="'main-nav'"
	(updated)="toggleMenu()"
/>
```

`icon-burger` reflects its open/closed state via `aria-expanded` and points `aria-controls` at whatever element id you pass to `controls` (e.g. the nav/drawer it toggles). Pass `ariaLabel` to override the default "Open menu" / "Close menu" text.

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

## Accessibility

See [ACCESSIBILITY.md](ACCESSIBILITY.md) for the current WCAG 2.2 AA / EN 301 549 / WAI-ARIA APG coverage per component, the Vitest + axe-core testing setup, and known gaps.

## AI Coding Agents

This package includes [AI.md](AI.md) with copyable guidance for Codex, Claude Code, Cursor, Copilot, and other coding agents.
