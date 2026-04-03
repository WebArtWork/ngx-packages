import { ApplicationConfig, provideZonelessChangeDetection } from '@angular/core';
import { provideRouter, withInMemoryScrolling } from '@angular/router';
import { provideNgxCore } from 'ngx-core';
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
				{ code: 'ua', name: 'Ukrainian', nativeName: 'Українська' },
			],
			folder: '/i18n/',
		}),
		provideNgxCore({
			meta: {
				applyFromRoutes: true,
				defaults: {
					title: 'ngx-ui',
					titleSuffix: ' | Web Art Work',
					description:
						'Angular theming package from Web Art Work for SSR-safe mode, density, and radius state.',
					image: 'https://wawjs.wiki/logo.png',
					links: {
						canonical: 'https://wawjs.wiki/',
					},
				},
				useTitleSuffix: true,
			},
		}),
	],
};
