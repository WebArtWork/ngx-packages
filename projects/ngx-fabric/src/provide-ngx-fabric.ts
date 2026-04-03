import { EnvironmentProviders, makeEnvironmentProviders } from '@angular/core';
import { FABRIC_CONFIG, type FabricConfigInterface } from './fabric/fabric.interfaces';

export function provideNgxFabric(config: FabricConfigInterface = {}): EnvironmentProviders {
	return makeEnvironmentProviders([
		{
			provide: FABRIC_CONFIG,
			useValue: config,
		},
	]);
}

export function provideFabric(config: FabricConfigInterface = {}): EnvironmentProviders {
	return provideNgxFabric(config);
}
