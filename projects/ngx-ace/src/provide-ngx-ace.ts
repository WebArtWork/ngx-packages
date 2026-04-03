import { EnvironmentProviders, makeEnvironmentProviders } from '@angular/core';
import { ACE_CONFIG, AceConfigInterface } from './ace/ace.interfaces';

export function provideNgxAce(config: AceConfigInterface = {}): EnvironmentProviders {
	return makeEnvironmentProviders([
		{
			provide: ACE_CONFIG,
			useValue: config,
		},
	]);
}

export function provideAce(config: AceConfigInterface = {}): EnvironmentProviders {
	return provideNgxAce(config);
}
