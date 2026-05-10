import { EnvironmentProviders, makeEnvironmentProviders } from '@angular/core';
import { provideNgxHttp } from '@wawjs/ngx-http';
import { CONFIG_TOKEN, Config, DEFAULT_CONFIG } from './config.interface';

export function provideNgxCrud(config: Config = DEFAULT_CONFIG): EnvironmentProviders {
	return makeEnvironmentProviders([
		{ provide: CONFIG_TOKEN, useValue: config },
		provideNgxHttp(config),
	]);
}
