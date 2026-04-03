import { ApplicationConfig, provideZonelessChangeDetection } from '@angular/core';
import { provideRouter, withInMemoryScrolling } from '@angular/router';
import { provideNgxAce } from 'ngx-ace';
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
		provideNgxAce({
			mode: 'javascript',
			theme: 'github',
			useWorker: false,
			showPrintMargin: false,
			fontSize: 14,
			minLines: 12,
		}),
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
					title: 'ngx-ace',
					titleSuffix: ' | Web Art Work',
					description:
						'Angular Ace editor package from Web Art Work with standalone providers, lazy-loaded modes and themes, and SSR-safe runtime guards.',
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
