import { DatePipe } from '@angular/common';
import { EnvironmentProviders, makeEnvironmentProviders } from '@angular/core';
import { DATETIME_CONFIG, DatetimeConfig, DEFAULT_DATETIME_CONFIG } from './datetime/datetime.interface';

export function provideNgxDatetime(
	config: DatetimeConfig = DEFAULT_DATETIME_CONFIG,
): EnvironmentProviders {
	return makeEnvironmentProviders([
		DatePipe,
		{
			provide: DATETIME_CONFIG,
			useValue: config,
		},
	]);
}
