export interface ServiceMethodDoc {
	name: string;
	signature: string;
	description: string;
	details?: string[];
	example?: string;
	category?: string;
	docType?: 'Service' | 'Component' | 'Interface' | 'Type' | 'Const';
	sourceFile?: string;
}

export interface ServiceSectionDoc {
	title: string;
	items: string[];
	example?: string;
}

export interface ServiceDoc {
	slug: string;
	name: string;
	description: string;
	summary: string;
	highlights: string[];
	config?: string[];
	availableItems?: string[];
	properties?: ServiceMethodDoc[];
	methods: ServiceMethodDoc[];
	sections?: ServiceSectionDoc[];
	code: string;
}

const _serviceDocs: ServiceDoc[] = [
	{
		slug: 'datetime',
		name: 'Datetime',
		description:
			'Date and time feature built around picker components plus TimeService utilities for formatting, ranges, arithmetic, and comparisons.',
		summary:
			'Datetime exposes compact picker components and TimeService as reusable date handling primitives for Angular apps. It centralizes calendar UI, picker modes, naming, formatting, timezone conversion, period boundaries, date arithmetic, differences, and calendar helpers instead of scattering ad hoc date logic across components.',
		highlights: [
			'Provides two standalone components for inline calendars and date/time/range picker inputs.',
			'Provides day/month naming plus DatePipe-based formatting through one injectable service.',
			'Includes start/end helpers for day, week, month, and year ranges.',
			'Covers add/subtract operations, differences, same-day checks, ISO week numbers, and month week counts.',
		],
		config: [
			'Register the package with provideNgxDatetime(config?) to provide Angular DatePipe for TimeService.',
			'TimeService is provided in root and uses Angular DatePipe internally for formatting.',
			'Configure day/month names, default format, timezone, locale, and first-day-of-week policy through DatetimeConfig.',
		],
		availableItems: [
			'datetime-calendar.component.ts',
			'datetime-picker.component.ts',
			'datetime-picker.interface.ts',
			'datetime.interface.ts',
			'provide-ngx-datetime.ts',
			'time.service.ts',
		],
		properties: [
			{
				name: 'DatetimePickerMode',
				signature:
					"type DatetimePickerMode = 'date' | 'time' | 'datetime' | 'date-range' | 'datetime-range'",
				description:
					'Mode union used by DatetimePickerComponent to switch between single, time-only, datetime, and range workflows.',
				category: 'Picker',
				docType: 'Type',
				sourceFile: 'datetime-picker.interface.ts',
			},
			{
				name: 'DatetimeRangeValue / DatetimePickerValue',
				signature: 'range and picker value types',
				description:
					'Typed values emitted by calendar and picker components for single-date and range selection.',
				category: 'Picker',
				docType: 'Type',
				sourceFile: 'datetime-picker.interface.ts',
			},
			{
				name: 'DatetimeConfig',
				signature: 'interface DatetimeConfig',
				description:
					'Provider configuration for weekday/month labels, default formatting, timezone, locale, and week-start policy.',
				category: 'Configuration',
				docType: 'Interface',
				sourceFile: 'datetime.interface.ts',
			},
			{
				name: 'DATETIME_CONFIG / DEFAULT_DATETIME_CONFIG',
				signature: 'InjectionToken<DatetimeConfig> and default config const',
				description: 'Configuration token and defaults consumed by TimeService.',
				category: 'Configuration',
				docType: 'Const',
				sourceFile: 'datetime.interface.ts',
			},
		],
		methods: [
			{
				name: 'DatetimeCalendarComponent',
				signature:
					'<ngx-datetime-calendar [(value)]="date" [(rangeValue)]="range" selectionMode="single | range" />',
				description:
					'Inline calendar component with month navigation, single selection, range selection, disabled dates, min/max bounds, and locale-aware weekday ordering.',
				category: 'Components',
				docType: 'Component',
				sourceFile: 'datetime-calendar.component.ts',
				example: `import { DatetimeCalendarComponent } from 'ngx-datetime';

@Component({
	imports: [DatetimeCalendarComponent],
	template: \`<ngx-datetime-calendar [(value)]="date" />\`,
})
export class CalendarExample {
	date = signal(new Date());
}`,
			},
			{
				name: 'DatetimePickerComponent',
				signature:
					'<ngx-datetime-picker mode="date | time | datetime | date-range | datetime-range" [(value)]="value" />',
				description:
					'Input and popover picker component that reuses DatetimeCalendarComponent and supports ControlValueAccessor forms integration.',
				category: 'Components',
				docType: 'Component',
				sourceFile: 'datetime-picker.component.ts',
				example: `import { DatetimePickerComponent } from 'ngx-datetime';

@Component({
	imports: [DatetimePickerComponent],
	template: \`
		<ngx-datetime-picker
			mode="datetime-range"
			label="Schedule"
			[(value)]="range"
		/>
	\`,
})
export class PickerExample {
	range = signal({ start: null, end: null });
}`,
			},
			{
				name: 'provideNgxDatetime',
				signature: 'provideNgxDatetime(config?: DatetimeConfig): EnvironmentProviders',
				description:
					'Registers the Angular DatePipe dependency and datetime defaults used by TimeService.',
				category: 'Bootstrap',
				docType: 'Const',
				sourceFile: 'provide-ngx-datetime.ts',
				example: `import { provideNgxDatetime } from 'ngx-datetime';

export const appConfig = {
	providers: [
		provideNgxDatetime({
			defaultFormat: 'medium',
			defaultTimezone: 'UTC',
		}),
	],
};`,
			},
			{
				name: 'getDayName',
				signature: "getDayName(date: Date, format: 'short' | 'long' = 'long'): string",
				description: 'Returns the weekday name for a date in short or long form.',
				category: 'Naming',
				sourceFile: 'time.service.ts',
				example: `import { TimeService } from 'ngx-datetime';

private readonly _timeService = inject(TimeService);

labelFor(date: Date) {
	return this._timeService.getDayName(date, 'short');
}`,
			},
			{
				name: 'getMonthName',
				signature:
					"getMonthName(monthIndex: number, format: 'short' | 'long' = 'long'): string",
				description:
					'Returns the month name for a zero-based month index and throws for invalid indexes.',
				category: 'Naming',
				sourceFile: 'time.service.ts',
			},
			{
				name: 'formatDate',
				signature:
					"formatDate(date: Date, format = 'mediumDate', timezone = 'UTC'): string",
				description:
					'Formats a date through Angular DatePipe with optional format and timezone overrides.',
				category: 'Formatting',
				sourceFile: 'time.service.ts',
			},
			{
				name: 'convertToTimezone',
				signature: 'convertToTimezone(date: Date, timezone: string): Date',
				description: 'Creates a Date adjusted to the target IANA timezone.',
				category: 'Formatting',
				sourceFile: 'time.service.ts',
			},
			{
				name: 'startOfDay / endOfDay',
				signature: 'day boundary helpers',
				description: 'Returns the local start or end timestamp for the supplied day.',
				category: 'Ranges',
				sourceFile: 'time.service.ts',
			},
			{
				name: 'startOfWeek / endOfWeek',
				signature: 'week boundary helpers with optional locale',
				description: 'Builds locale-aware week boundaries using runtime locale resolution.',
				details: [
					'Sunday-first regions include US, CA, AU, NZ, PH, and BR.',
					'Other locales default to Monday-first week boundaries.',
				],
				category: 'Ranges',
				sourceFile: 'time.service.ts',
			},
			{
				name: 'startOfMonth / endOfMonth',
				signature: 'month boundary helpers',
				description: 'Returns the first or last moment of the month for a given date.',
				category: 'Ranges',
				sourceFile: 'time.service.ts',
			},
			{
				name: 'startOfYear / endOfYear',
				signature: 'year boundary helpers',
				description: 'Returns the first or last moment of the year for a given date.',
				category: 'Ranges',
				sourceFile: 'time.service.ts',
			},
			{
				name: 'getDaysInMonth / isLeapYear',
				signature: 'calendar helpers',
				description:
					'Returns month lengths and leap-year status for calendar calculations.',
				category: 'Calendar',
				sourceFile: 'time.service.ts',
			},
			{
				name: 'addDays / addMonths / addYears / addHours / addMinutes / addSeconds',
				signature: 'date arithmetic helpers',
				description: 'Returns new dates shifted forward by the requested amount.',
				category: 'Arithmetic',
				sourceFile: 'time.service.ts',
				example: `import { TimeService } from 'ngx-datetime';

private readonly _timeService = inject(TimeService);

buildReminder(date: Date) {
	return this._timeService.addDays(date, 7);
}`,
			},
			{
				name: 'subtractDays / subtractMonths / subtractYears / subtractHours / subtractMinutes / subtractSeconds',
				signature: 'date arithmetic helpers',
				description: 'Returns new dates shifted backward by the requested amount.',
				category: 'Arithmetic',
				sourceFile: 'time.service.ts',
			},
			{
				name: 'differenceInDays / differenceInHours / differenceInMinutes',
				signature: 'difference helpers',
				description: 'Calculates elapsed time between two dates in the requested unit.',
				category: 'Comparison',
				sourceFile: 'time.service.ts',
			},
			{
				name: 'isSameDay',
				signature: 'isSameDay(date1: Date, date2: Date): boolean',
				description: 'Checks whether two dates share the same calendar day.',
				category: 'Comparison',
				sourceFile: 'time.service.ts',
			},
			{
				name: 'getWeekNumber / getWeeksInMonth',
				signature: 'ISO week helpers',
				description:
					'Returns ISO week numbers and the number of ISO weeks touched by a month.',
				category: 'Calendar',
				sourceFile: 'time.service.ts',
			},
		],
		sections: [
			{
				title: 'Feature role',
				items: [
					'Use DatetimePickerComponent for input/popover workflows and DatetimeCalendarComponent when the calendar should stay inline.',
					'Use TimeService when features need shared date formatting, ranges, or calendar math without introducing another date library.',
					'The service returns new Date instances for transformations so callers can keep inputs immutable.',
					'Formatting uses Angular DatePipe and provider defaults while other helpers rely on built-in Date and Intl APIs.',
				],
			},
		],
		code: `import { DatetimePickerComponent, TimeService } from 'ngx-datetime';

private readonly _timeService = inject(TimeService);

formatDueDate(date: Date) {
	return this._timeService.formatDate(
		this._timeService.endOfWeek(date, 'en-GB'),
		'medium',
		'UTC',
	);
}`,
	},
];

export const serviceDocs: ServiceDoc[] = _serviceDocs;

export const serviceDocMap = new Map(serviceDocs.map(doc => [doc.slug, doc]));
