import {
	EnvironmentProviders,
	inject,
	makeEnvironmentProviders,
	provideEnvironmentInitializer,
} from '@angular/core';
import { DEFAULT_THEME_CONFIG, ThemeConfig, THEME_CONFIG } from './theme.interface';
import { ThemeService } from './theme.service';

export function provideTheme(config: ThemeConfig = DEFAULT_THEME_CONFIG): EnvironmentProviders {
	return makeEnvironmentProviders([
		{
			provide: THEME_CONFIG,
			useValue: config,
		},
		provideEnvironmentInitializer(() => {
			void inject(ThemeService).init();
		}),
	]);
}

export function provideNgxUi(config: ThemeConfig = DEFAULT_THEME_CONFIG): EnvironmentProviders {
	return provideTheme(config);
}
