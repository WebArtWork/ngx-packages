import { InjectionToken } from '@angular/core';

export type WeekStartDay = 0 | 1 | 2 | 3 | 4 | 5 | 6;

export interface DatetimeConfig {
	weekDays?: string[];
	monthNames?: string[];
	defaultFormat?: string;
	defaultTimezone?: string;
	defaultLocale?: string;
	firstDayOfWeek?: WeekStartDay;
	sundayFirstRegions?: string[];
}

export const DEFAULT_DATETIME_CONFIG: DatetimeConfig = {
	weekDays: [
		'Sunday',
		'Monday',
		'Tuesday',
		'Wednesday',
		'Thursday',
		'Friday',
		'Saturday',
	],
	monthNames: [
		'January',
		'February',
		'March',
		'April',
		'May',
		'June',
		'July',
		'August',
		'September',
		'October',
		'November',
		'December',
	],
	defaultFormat: 'mediumDate',
	defaultTimezone: 'UTC',
	defaultLocale: '',
	sundayFirstRegions: ['US', 'CA', 'AU', 'NZ', 'PH', 'BR'],
};

export const DATETIME_CONFIG = new InjectionToken<DatetimeConfig>('DATETIME_CONFIG');
