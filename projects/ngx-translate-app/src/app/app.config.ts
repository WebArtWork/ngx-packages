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
				{
					code: 'ua',
					name: 'Ukrainian',
					nativeName: '\u0423\u043a\u0440\u0430\u0457\u043d\u0441\u044c\u043a\u0430',
				},
			],
			folder: '/i18n/',
		}),
		provideNgxCore({
			meta: {
				applyFromRoutes: true,
				defaults: {
					title: 'ngx-translate',
					titleSuffix: ' | Web Art Work',
					description:
						'Angular language and runtime translation library from Web Art Work with signal-based APIs, theme-ready docs, and SSR-safe behavior.',
					image: 'https://wawjs.wiki/logo.png',
					links: {
						canonical: 'https://wawjs.wiki/ngx-translate',
					},
				},
				useTitleSuffix: true,
			},
		}),
	],
};
