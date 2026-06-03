import { ApplicationConfig, provideZonelessChangeDetection } from '@angular/core';
import { provideRouter, withInMemoryScrolling } from '@angular/router';
import { provideNgxCore } from 'ngx-core';
import { provideNgxCrud } from 'ngx-crud';
import { provideNgxForm } from 'ngx-form';
import { provideTranslate } from 'ngx-translate';
import { provideTheme } from 'ngx-ui';
import { routes } from './app.routes';

export const appConfig: ApplicationConfig = {
	providers: [
		provideZonelessChangeDetection(),
		provideRouter(
			routes,
			withInMemoryScrolling({
				scrollPositionRestoration: 'top',
			}),
		),
		provideNgxCore(),
		provideNgxCrud(),
		provideNgxForm(),
		provideTheme(),
		provideTranslate({
			defaultLanguage: 'en',
			languages: [{ code: 'en', name: 'English', nativeName: 'English' }],
			folder: '/i18n/',
		}),
	],
};
