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
			'Date and time utility feature built around TimeService for formatting, ranges, arithmetic, and comparisons.',
		summary:
			'Datetime exposes TimeService as a lightweight helper for common date handling in Angular apps. It centralizes naming, formatting, timezone conversion, period boundaries, date arithmetic, differences, and calendar helpers instead of scattering ad hoc date logic across components.',
		highlights: [
			'Provides day/month naming plus DatePipe-based formatting through one injectable service.',
			'Includes start/end helpers for day, week, month, and year ranges.',
			'Covers add/subtract operations, differences, same-day checks, ISO week numbers, and month week counts.',
		],
		config: [
			'Register the package with provideNgxDatetime() to provide Angular DatePipe for TimeService.',
			'TimeService is provided in root and uses Angular DatePipe internally for formatting.',
			'Week boundaries depend on locale when using startOfWeek() and endOfWeek().',
		],
		availableItems: ['provide-ngx-datetime.ts', 'time.service.ts'],
		methods: [
			{
				name: 'provideNgxDatetime',
				signature: 'provideNgxDatetime(): EnvironmentProviders',
				description: 'Registers the Angular DatePipe dependency used by TimeService.',
				category: 'Bootstrap',
				docType: 'Const',
				sourceFile: 'provide-ngx-datetime.ts',
				example: `import { provideNgxDatetime } from 'ngx-datetime';

export const appConfig = {
	providers: [provideNgxDatetime()],
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
					'Use TimeService when features need shared date formatting, ranges, or calendar math without introducing another date library.',
					'The service returns new Date instances for transformations so callers can keep inputs immutable.',
					'Formatting uses Angular DatePipe while other helpers rely on built-in Date and Intl APIs.',
				],
			},
		],
		code: `import { TimeService } from 'ngx-datetime';

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
