# Accessibility

`@wawjs/ngx-ui` targets WCAG 2.2 Level AA, EN 301 549, and the WAI-ARIA Authoring Practices Guide (APG) interaction patterns for its components. This document summarizes what's implemented and what's still open.

**Using this package does not, by itself, make a consuming application legally accessibility-compliant.** Compliance also depends on the application's own content, structure, configuration, and usage of these components (real labels, correct heading order, meaningful alt text, etc.).

## What's covered

| Component | Pattern / notes |
| --- | --- |
| `Modal` / `ConfirmDialog` | `role="dialog"`/`"alertdialog"`, `aria-modal`, focus trap (`@angular/cdk/a11y` `FocusTrapFactory`), focus restored to the triggering element on close, closes on <kbd>Escape</kbd> |
| `Select` | WAI-ARIA APG combobox/listbox: `aria-haspopup`, `aria-expanded`, `aria-controls`, `aria-activedescendant`, full keyboard support (Arrow/Home/End/Enter/Space/Escape/Tab) |
| `Tabs` | Roving `tabindex`, Left/Right/Home/End keyboard nav, `aria-controls`/`aria-labelledby` pairing between tabs and panels |
| `Accordion` | `aria-controls`/`id` pairing between header and panel, `role="region"` |
| `Menu` / `Menubar` | `role="menu"`/`"menubar"`/`"menuitem"`, Arrow/Home/End/Escape keyboard navigation, submenu entry/exit via Left/Right |
| `Table` | Keyboard-operable sort headers (`aria-sort`), row-action buttons with accessible names, `role="listbox"` page-size popup with Escape support |
| `Input` | `aria-invalid`/`aria-describedby`/`aria-required` wired to a `role="alert"` error message; radio/checkbox groups wrapped in `role="radiogroup"`/`role="group"` |
| `Tooltip` | `role="tooltip"` + `aria-describedby`, shows on focus (not just hover), dismissible with <kbd>Escape</kbd> |
| `ConfirmPopup` | Focus moves into the popup on open, <kbd>Escape</kbd> closes it, focus returns to the trigger |
| `Alert` | `role="alert"`/`"status"` depending on severity, auto-dismiss pauses on keyboard focus as well as mouse hover |
| `Burger` / `ThemeComponent` (theme toggle) | Real `<button>` elements, `aria-expanded`/`aria-controls` where applicable |
| `Chart` | Visually-hidden data `<table>` fallback (with `<caption>`) alongside the canvas, plus `role="img"` + `aria-label` from the `description` input |
| `ngx-datetime`'s `DatetimeCalendarComponent` / `DatetimePickerComponent` | WAI-ARIA APG grid pattern (roving-tabindex day grid), picker panel with focus management/Escape/label association |
| Reduced motion | `Spinner` and `ProgressBar`'s continuous/looping animations respect `prefers-reduced-motion` (switch to a simple opacity pulse) |

## Testing

`ngx-ui` has a Vitest-based unit-test setup:

```bash
npm run test:ui
# or
npx ng test ngx-ui
```

`projects/ngx-ui/src/testing/axe.ts` exports `expectNoA11yViolations(element)`, an [axe-core](https://github.com/dequelabs/axe-core) wrapper for asserting a rendered fixture has no accessibility violations (`color-contrast` is disabled in this helper since jsdom, the test environment, has no real layout engine). `projects/ngx-ui/src/testing/setup.ts` patches a couple of jsdom gaps (`matchMedia`, `scrollIntoView`) so components that use them can be unit tested at all.

See `burger.component.spec.ts`, `modal.component.spec.ts`, `tabs.component.spec.ts`, and `select.component.spec.ts` for the established shape: accessible name/state assertions, a keyboard-interaction assertion, and (where practical) an `expectNoA11yViolations` call.

Automated tests do not replace manual verification. Before shipping a component change, spot-check it with a keyboard only (no mouse) and with a screen reader (NVDA on Windows, VoiceOver on macOS, TalkBack on Android where relevant).

## Contrast

`scripts/check-contrast.mjs` (workspace root) computes WCAG contrast ratios for the default light/dark theme token pairs and prints a pass/fail table (it's a reporting script, not a build gate):

```bash
node scripts/check-contrast.mjs
```

**Known gap:** as of the current default tokens, white button-label text on the brand `primary`/`danger` colors falls slightly short of the 4.5:1 normal-text threshold in some cases (light theme's `onDanger`-on-`danger` is ~3.76:1; dark theme's `onPrimary`-on-`primary` is ~3.68:1 — both still clear the 3:1 large-text/UI-component threshold). Fixing this means either darkening those brand colors slightly or using a different text color, which is a visual-identity decision for whoever owns the design tokens, not something changed silently as part of this pass — re-run the script after adjusting `theme.tokens.ts`'s `DEFAULT_LIGHT_TOKENS`/`DEFAULT_DARK_TOKENS` to confirm a fix.

## What's not (yet) covered

- `@angular/aria`'s headless interaction-pattern directives (`accordion`/`combobox`/`grid`/`listbox`/`menu`/`tabs`/`toolbar`/`tree`) are a peer dependency but not yet adopted internally — the components above use hand-written keyboard/ARIA logic that follows the same APG patterns. Migrating to `@angular/aria` directives is a possible future simplification, not a correctness gap.
- A full icon-only-button `ariaLabel` sweep has covered the confirmed gaps found during the initial audit (`OrderList`, `Table`, `MaterialComponent`); a from-scratch re-audit of every `icon`-only usage across consuming apps has not been repeated since.
- Target-size (WCAG 2.5.8, 24×24 CSS px minimum) has not been audited component-by-component.
- Drag-only interactions: none exist in `ngx-ui` (`OrderList` intentionally uses buttons, not drag-and-drop, to avoid this class of issue).
