import { ApplicationConfig, provideZonelessChangeDetection } from '@angular/core';
import { provideRouter, withInMemoryScrolling } from '@angular/router';
import { provideNgxCore } from 'ngx-core';
import { provideNgxTinymce } from 'ngx-tinymce';
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
		provideNgxTinymce({
			baseURL: 'https://cdn.tiny.cloud/1/no-api-key/tinymce/7/',
			fileName: 'tinymce.min.js',
			config: {
				menubar: false,
				plugins: 'lists link table code',
				toolbar: 'undo redo | bold italic underline | bullist numlist | link table | code',
			},
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
					title: 'ngx-tinymce',
					titleSuffix: ' | Web Art Work',
					description:
						'Angular TinyMCE package from Web Art Work with standalone providers, lazy script loading, form integration, and SSR-safe runtime guards.',
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
