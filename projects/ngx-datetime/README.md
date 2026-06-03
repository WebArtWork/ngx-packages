# @wawjs/ngx-datetime

Angular date and time helpers package from Web Art Work.

`ngx-datetime` extracts the time utilities from the older all-in-one package into a focused Angular package built around `TimeService`, `DatetimeCalendarComponent`, and `DatetimePickerComponent`.

## License

[MIT](LICENSE)

## Installation

```bash
npm i --save @wawjs/ngx-datetime
```

## Usage

```ts
import { provideNgxDatetime } from '@wawjs/ngx-datetime';

export const appConfig = {
	providers: [
		provideNgxDatetime({
			defaultFormat: 'mediumDate',
			defaultTimezone: 'UTC',
			defaultLocale: 'en-GB',
		}),
	],
};
```

`provideNgxDatetime()` registers Angular `DatePipe` and datetime defaults used internally by `TimeService`.

## Available Features

| Name                                                              | Description                                                                                 |
| ----------------------------------------------------------------- | ------------------------------------------------------------------------------------------- |
| `DatetimeCalendarComponent`                                       | Inline calendar with single and range selection                                             |
| `DatetimePickerComponent`                                         | Input/popover picker for date, time, datetime, date range, and datetime range values        |
| `DatetimePickerMode`, `DatetimeRangeValue`, `DatetimePickerValue` | Picker mode and value types                                                                 |
| `TimeService`                                                     | Date formatting, timezone conversion, range helpers, date math, and week/month calculations |
| `provideNgxDatetime`                                              | Environment provider for package setup                                                      |
| `DatetimeConfig`, `DATETIME_CONFIG`, `DEFAULT_DATETIME_CONFIG`    | Provider configuration helpers                                                              |

## Picker Components

Use `DatetimePickerComponent` for input-style workflows and `DatetimeCalendarComponent` when the calendar should render inline.

```ts
import { Component, signal } from '@angular/core';
import { DatetimePickerComponent } from '@wawjs/ngx-datetime';

@Component({
	imports: [DatetimePickerComponent],
	template: `
		<ngx-datetime-picker
			mode="datetime-range"
			label="Schedule"
			placeholder="Select range"
			[(value)]="range"
		/>
	`,
})
export class ExampleComponent {
	range = signal({ start: null, end: null });
}
```

Supported picker modes:

- `date`
- `time`
- `datetime`
- `date-range`
- `datetime-range`

## Time Service

`TimeService` provides date formatting, timezone conversion, range helpers, and common date arithmetic.

### Naming and formatting

- `getDayName(date, format?)`
- `getMonthName(monthIndex, format?)`
- `formatDate(date, format?, timezone?)`
- `convertToTimezone(date, timezone)`

### Boundaries and ranges

- `startOfDay(date)`
- `endOfDay(date)`
- `startOfWeek(date, locale?)`
- `endOfWeek(date, locale?)`
- `startOfMonth(date)`
- `endOfMonth(date)`
- `startOfYear(date)`
- `endOfYear(date)`

### Calendar helpers

- `getDaysInMonth(month, year)`
- `isLeapYear(year)`
- `getWeekNumber(date)`
- `getWeeksInMonth(month, year)`
- `isSameDay(date1, date2)`

### Date math

- `addDays(date, days)`
- `addMonths(date, months)`
- `addYears(date, years)`
- `addHours(date, hours)`
- `addMinutes(date, minutes)`
- `addSeconds(date, seconds)`
- `subtractDays(date, days)`
- `subtractMonths(date, months)`
- `subtractYears(date, years)`
- `subtractHours(date, hours)`
- `subtractMinutes(date, minutes)`
- `subtractSeconds(date, seconds)`
- `differenceInDays(date1, date2)`
- `differenceInHours(date1, date2)`
- `differenceInMinutes(date1, date2)`

Example:

```ts
import { TimeService } from '@wawjs/ngx-datetime';

constructor(private timeService: TimeService) {}

ngOnInit() {
	const today = new Date();
	const weekStart = this.timeService.startOfWeek(today);
	const formatted = this.timeService.formatDate(weekStart, 'fullDate', 'UTC');

	console.log(formatted);
}
```

## AI Coding Agents

This package includes [AI.md](AI.md) with copyable instructions for Codex, Claude Code, Cursor, and other coding agents.

Copy this into the consuming project's `AGENTS.md`, `CLAUDE.md`, or equivalent file:

```md
- This Angular project uses `@wawjs/ngx-datetime` for date/time helpers, calendar helpers, and date/time picker components.
- Import public APIs from `@wawjs/ngx-datetime`.
- Prefer registering the package with `provideNgxDatetime()` in application providers.
- Prefer `TimeService` for date formatting, timezone conversion, date arithmetic, and calendar boundary helpers before adding duplicate app utilities.
- Prefer `DatetimeCalendarComponent` and `DatetimePickerComponent` for date picking before building one-off date widgets.
- Keep date logic centralized in `TimeService` instead of scattering custom helpers across components.
```
