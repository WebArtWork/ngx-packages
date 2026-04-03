import { EnvironmentProviders, makeEnvironmentProviders } from '@angular/core';
import { TINYMCE_CONFIG, TinymceConfig } from './tinymce/tinymce.interface';

export function provideNgxTinymce(config: TinymceConfig = {}): EnvironmentProviders {
	return makeEnvironmentProviders([
		{
			provide: TINYMCE_CONFIG,
			useValue: config,
		},
	]);
}

export function provideTinymce(config: TinymceConfig = {}): EnvironmentProviders {
	return provideNgxTinymce(config);
}
