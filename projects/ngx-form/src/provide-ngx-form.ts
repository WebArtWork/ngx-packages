import { EnvironmentProviders, makeEnvironmentProviders } from '@angular/core';
import { NgxFormConfig, NGX_FORM_CONFIG } from './config.interface';

export function provideNgxForm(config: NgxFormConfig = {}): EnvironmentProviders {
	return makeEnvironmentProviders([
		{
			provide: NGX_FORM_CONFIG,
			useValue: config,
		},
	]);
}
