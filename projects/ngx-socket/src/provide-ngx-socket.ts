import { EnvironmentProviders, makeEnvironmentProviders } from '@angular/core';
import { CONFIG_TOKEN, Config, DEFAULT_CONFIG } from './core/config.interface';

export function provideNgxSocket(config: Config = DEFAULT_CONFIG): EnvironmentProviders {
	return makeEnvironmentProviders([{ provide: CONFIG_TOKEN, useValue: config }]);
}
