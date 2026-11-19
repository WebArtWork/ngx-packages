import { EnvironmentProviders, inject, makeEnvironmentProviders, provideAppInitializer } from '@angular/core';
import { TRANSLATE_FIREBASE_CONFIG, TranslateFirebaseConfig } from './translate-firebase.interface';
import { TranslateFirebaseService } from './translate-firebase.service';

/**
 * Sets up the custom translations kept in Firestore. They are laid over the texts of
 * `@wawjs/ngx-translate`, so provide this after `provideTranslate(...)`.
 */
export function provideTranslateFirebase(config: TranslateFirebaseConfig): EnvironmentProviders {
	return makeEnvironmentProviders([
		{ provide: TRANSLATE_FIREBASE_CONFIG, useValue: config },
		provideAppInitializer(() => {
			const service = inject(TranslateFirebaseService);

			// Not awaited: the app must not wait for Firestore to start.
			if (config.autoLoad !== false) void service.load();
		}),
	]);
}
