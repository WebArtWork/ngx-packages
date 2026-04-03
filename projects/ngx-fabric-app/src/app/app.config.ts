import { ApplicationConfig, provideZonelessChangeDetection } from '@angular/core';
import { provideRouter, withInMemoryScrolling } from '@angular/router';
import { provideNgxCore } from 'ngx-core';
import { provideNgxFabric } from 'ngx-fabric';
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
		provideNgxFabric({
			selectionColor: 'rgba(37, 99, 235, 0.16)',
			renderOnAddRemove: true,
			preserveObjectStacking: true,
		}),
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
					title: 'ngx-fabric',
					titleSuffix: ' | Web Art Work',
					description:
						'Angular Fabric.js package from Web Art Work with focused canvas bindings, standalone providers, theme modes, and translations.',
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
