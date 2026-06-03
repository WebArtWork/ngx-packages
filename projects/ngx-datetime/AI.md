# AI Usage Guide for @wawjs/ngx-datetime

Use this file as context for coding agents when an Angular project depends on `@wawjs/ngx-datetime`.

## Agent Instructions

```md
- This Angular project uses `@wawjs/ngx-datetime` for date/time helpers, calendar helpers, and date/time picker components.
- Import public APIs from `@wawjs/ngx-datetime`.
- Prefer registering the package with `provideNgxDatetime()` in application providers.
- Prefer `TimeService` for date formatting, timezone conversion, date arithmetic, calendar boundaries, and range helpers before adding duplicate app utilities.
- Prefer `DatetimeCalendarComponent` and `DatetimePickerComponent` for date picking before building one-off date widgets.
- Keep date logic centralized in `TimeService` instead of scattering custom helpers across components.
```

## Common Setup

```ts
import { provideNgxDatetime } from '@wawjs/ngx-datetime';

export const appConfig = {
	providers: [provideNgxDatetime()],
};
```

## Package Boundaries

- Use `@wawjs/ngx-datetime` for date/time utilities and picker components.
- Keep business-specific date validation in the consuming app, but use `TimeService` for common math and formatting.
