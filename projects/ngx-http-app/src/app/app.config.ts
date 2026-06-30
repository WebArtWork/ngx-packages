import { ApplicationConfig, provideZonelessChangeDetection } from '@angular/core';
import { provideRouter, withInMemoryScrolling } from '@angular/router';
import { provideNgxCore } from 'ngx-core';
import { provideNgxHttp } from 'ngx-http';
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
		provideTheme(),
		provideTranslate({
			defaultLanguage: 'en',
			languages: [
				{ code: 'en', name: 'English', nativeName: 'English' },
				{ code: 'ua', name: 'Ukrainian', nativeName: 'Ð£ÐºÑ€Ð°Ñ—Ð½ÑÑŒÐºÐ°' },
			],
			folder: '/i18n/',
		}),
		provideNgxCore({
			meta: {
				applyFromRoutes: true,
				defaults: {
					title: 'ngx-http',
					titleSuffix: ' | Web Art Work',
					description:
						'Angular transport package from Web Art Work for shared HttpService and NetworkService configuration.',
					image: 'https://wawjs.dev/logo.png',
					links: {
						canonical: 'https://wawjs.dev/ngx-http',
					},
				},
				useTitleSuffix: true,
			},
		}),
		provideNgxHttp(),
	],
};
