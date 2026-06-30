import { ApplicationConfig, provideZonelessChangeDetection } from '@angular/core';
import { provideRouter, withInMemoryScrolling } from '@angular/router';
import { provideNgxCore } from '@wawjs/ngx-core';
import { provideNgxHttp } from '@wawjs/ngx-http';
import { provideTranslate } from '@wawjs/ngx-translate';
import { provideTheme } from '@wawjs/ngx-ui';
import { provideNgxMap } from 'ngx-map';
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
				{ code: 'ua', name: 'Ukrainian', nativeName: 'Ukrainian' },
			],
			folder: '/i18n/',
		}),
		provideNgxCore({
			meta: {
				applyFromRoutes: true,
				defaults: {
					title: 'ngx-map',
					titleSuffix: ' | Web Art Work',
					description:
						'Angular map package from Web Art Work for Google Maps display, markers, address search, and Photon geocoding.',
					image: 'https://wawjs.dev/logo.png',
					links: {
						canonical: 'https://wawjs.dev/ngx-map',
					},
				},
				useTitleSuffix: true,
			},
		}),
		provideNgxHttp(),
		provideNgxMap({
			photonUrl: '/api/proton',
			predictionLimit: 7,
			resolveUserLocation: false,
		}),
	],
};
