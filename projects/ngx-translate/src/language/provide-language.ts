import {
	APP_INITIALIZER,
	EnvironmentProviders,
	inject,
	makeEnvironmentProviders,
} from '@angular/core';
import { ProvideLanguageConfig } from './language.interface';
import { LanguageService } from './language.service';

export function provideLanguage(config: ProvideLanguageConfig = {}): EnvironmentProviders {
	return makeEnvironmentProviders([
		{
			provide: APP_INITIALIZER,
			useFactory: () => {
				const service = inject(LanguageService);
				return () => service.init(config);
			},
			multi: true,
		},
	]);
}

export function provideLanguages(config: ProvideLanguageConfig = {}): EnvironmentProviders {
	return provideLanguage(config);
}
