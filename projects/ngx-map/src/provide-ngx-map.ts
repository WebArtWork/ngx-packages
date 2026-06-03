import { EnvironmentProviders, makeEnvironmentProviders } from '@angular/core';
import { CONFIG_TOKEN, DEFAULT_CONFIG, NgxMapConfig } from './config.interface';

export function provideNgxMap(config: NgxMapConfig = {}): EnvironmentProviders {
	return makeEnvironmentProviders([
		{
			provide: CONFIG_TOKEN,
			useValue: {
				...DEFAULT_CONFIG,
				...config,
			},
		},
	]);
}
