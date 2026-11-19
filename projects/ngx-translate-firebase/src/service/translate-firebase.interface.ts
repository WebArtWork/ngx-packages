import { InjectionToken } from '@angular/core';

/** One custom phrase: the source text (an ngx-translate key) and its text per language code. */
export interface TranslateFirebaseEntry {
	id: string;
	sourceText: string;
	translations: Record<string, string>;
}

/**
 * The Firestore helpers the package needs. They match the modular Firebase SDK, so an app can return
 * `{ db: getFirestore(app), doc, setDoc, collection, getDocs, addDoc, deleteDoc }` from `firebase/firestore`.
 * The app owns the Firebase setup, the package never imports the Firebase SDK itself.
 */
export interface TranslateFirebaseFirestore {
	db: unknown;
	collection: (db: any, path: string) => any;
	doc: (db: any, path: string, id: string) => any;
	getDocs: (query: any) => Promise<{ docs: { id: string; data: () => unknown }[] }>;
	addDoc: (collection: any, data: any) => Promise<{ id: string }>;
	setDoc: (ref: any, data: any) => Promise<unknown>;
	deleteDoc: (ref: any) => Promise<unknown>;
}

export interface TranslateFirebaseConfig {
	/** Returns the Firestore helpers (lazy, so the Firebase SDK can be loaded on first use). */
	firestore: () => TranslateFirebaseFirestore | Promise<TranslateFirebaseFirestore>;

	/** Awaited before the first read, for example until the Firebase user is known. */
	ready?: () => unknown | Promise<unknown>;

	/** Firestore collection with the custom translations. Defaults to `translations`. */
	collection?: string;

	/**
	 * i18n folders (or `.json` files) that hold the translation keys, for example `['/i18n/', '/i18n/articles/']`.
	 * They are loaded with `TranslateService.loadExtraTranslations`, so folders that a page only loads when it
	 * opens are still offered by the key selector. The folders given to `provideTranslate` are always included.
	 */
	folders?: string[];

	/** Reads the custom translations when the app starts. Defaults to `true`. */
	autoLoad?: boolean;
}

export const TRANSLATE_FIREBASE_CONFIG = new InjectionToken<TranslateFirebaseConfig>(
	'TRANSLATE_FIREBASE_CONFIG',
);
