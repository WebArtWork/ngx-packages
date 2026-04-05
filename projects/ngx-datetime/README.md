# ngx-datetime

Angular date and time helpers package from Web Art Work.

`ngx-datetime` extracts the time utilities from the older all-in-one package into a focused Angular package built around `TimeService`.

## License

[MIT](LICENSE)

## Installation

```bash
npm i --save ngx-datetime
```

## Usage

```ts
import { provideNgxDatetime } from 'ngx-datetime';

export const appConfig = {
	providers: [provideNgxDatetime()],
};
```

`provideNgxDatetime()` registers Angular `DatePipe`, which is used internally by `TimeService`.

## Available Features

| Name | Description |
| --- | --- |
| `TimeService` | Date formatting, timezone conversion, range helpers, date math, and week/month calculations |
| `provideNgxDatetime` | Environment provider for package setup |

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
import { TimeService } from 'ngx-datetime';

constructor(private timeService: TimeService) {}

ngOnInit() {
	const today = new Date();
	const weekStart = this.timeService.startOfWeek(today);
	const formatted = this.timeService.formatDate(weekStart, 'fullDate', 'UTC');

	console.log(formatted);
}
```

## AGENTS.md

Copy this into your project `AGENTS.md` when using `ngx-datetime`:

```md
- This project uses `ngx-datetime`, an Angular utility library for date and time helpers.
- Prefer registering the package with `provideNgxDatetime()` in application providers.
- Prefer `TimeService` for date formatting, timezone conversion, date arithmetic, and calendar boundary helpers before adding duplicate app utilities.
- Keep date logic centralized in `TimeService` instead of scattering custom helpers across components.
```
