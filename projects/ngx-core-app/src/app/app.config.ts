import { ApplicationConfig, provideZonelessChangeDetection } from '@angular/core';
import { provideRouter, withInMemoryScrolling } from '@angular/router';
import { provideNgxCore, provideTheme, provideTranslate } from 'ngx-core';
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
			folder: '/assets/i18n/',
		}),
		provideNgxCore({
			meta: {
				applyFromRoutes: true,
				defaults: {
					title: 'ngx-core',
					titleSuffix: ' | Web Art Work',
					description:
						'Angular utility library from Web Art Work for feature-oriented services, translation helpers, UI primitives, and app-level configuration.',
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
