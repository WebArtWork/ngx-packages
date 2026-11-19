import { ApplicationConfig, provideZonelessChangeDetection } from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideTranslate } from '@wawjs/ngx-translate';
import { provideTranslateFirebase } from '@wawjs/ngx-translate-firebase';
import { provideTheme } from '@wawjs/ngx-ui';
import { routes } from './app.routes';
import { createMemoryFirestore } from './memory-firestore';

const firestore = createMemoryFirestore({
	translations: [{ sourceText: 'Dashboard', translations: { en: 'Dashboard (custom)' } }],
});

export const appConfig: ApplicationConfig = {
	providers: [
		provideZonelessChangeDetection(),
		provideRouter(routes),
		provideTheme(),
		provideTranslate({
			defaultLanguage: 'en',
			languages: [
				{ code: 'en', name: 'English', nativeName: 'English' },
				{ code: 'ua', name: 'Ukrainian', nativeName: 'Українська' },
			],
			folder: '/i18n/',
		}),
		provideTranslateFirebase({
			firestore: () => firestore,
			// Folders that a page loads on its own are listed here so the key selector offers them too.
			folders: ['/i18n/extra/'],
		}),
	],
};
