import { DatePipe } from '@angular/common';
import { EnvironmentProviders, makeEnvironmentProviders } from '@angular/core';

export function provideNgxDatetime(): EnvironmentProviders {
	return makeEnvironmentProviders([DatePipe]);
}
