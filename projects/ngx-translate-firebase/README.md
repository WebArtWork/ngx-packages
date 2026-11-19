# @wawjs/ngx-translate-firebase

Custom translations kept in **Firebase Firestore**, laid over the texts of `@wawjs/ngx-translate`.

- `provideTranslateFirebase(config)`: setup, reads the custom texts when the app starts.
- `TranslateFirebaseService`: CRUD (`add`, `save`, `upsert`, `remove`, `load`, `reload`) and the glue that applies the custom texts with `TranslateService.setOne()`.
- `TranslateKeySelectComponent` (`wtranslate-key-select`): searchable select of the keys that exist in the translation files; emits the file texts of the picked key so a form can prefill every language.
- `TranslateFirebaseFormComponent` and `TranslateFirebaseComponent`: modal form and a full admin page (table with add, edit, delete), mounted with `translateFirebaseRoutes`.

Firestore holds one document per key: `{ sourceText: string, translations: { [languageCode]: string } }`.

## Install

```bash
npm i @wawjs/ngx-translate-firebase
```

Peer dependencies: `@wawjs/ngx-core`, `@wawjs/ngx-translate`, `@wawjs/ngx-ui`, `@angular/core`, `@angular/common`, `@angular/router`, `rxjs`. The package does **not** import the Firebase SDK: your app owns the Firebase setup and hands over the Firestore helpers.

## Setup

```ts
import { provideTranslate } from '@wawjs/ngx-translate';
import { provideTranslateFirebase } from '@wawjs/ngx-translate-firebase';

export const appConfig: ApplicationConfig = {
	providers: [
		provideTranslate({ defaultLanguage: 'en', languages: [...], folder: '/i18n/' }),
		provideTranslateFirebase({
			collection: 'translations',
			// i18n folders that pages load on their own (see below)
			folders: ['/i18n/articles/'],
			// awaited before the first read, for example until the Firebase user is known
			ready: () => auth.watch(),
			firestore: async () => {
				const fs = await import('firebase/firestore');

				return {
					db: fs.getFirestore(app),
					collection: fs.collection,
					doc: fs.doc,
					getDocs: fs.getDocs,
					addDoc: fs.addDoc,
					setDoc: fs.setDoc,
					deleteDoc: fs.deleteDoc,
				};
			},
		}),
	],
};
```

Provide it after `provideTranslate(...)`. The read is not awaited, so the app does not wait for Firestore to start.

| Option | Meaning |
| --- | --- |
| `firestore` | Returns the Firestore helpers (`TranslateFirebaseFirestore`), sync or async. |
| `ready` | Awaited before the first read. |
| `collection` | Firestore collection. Defaults to `translations`. |
| `folders` | i18n folders or `.json` files that hold keys, loaded with `TranslateService.loadExtraTranslations`. The folders of `provideTranslate` are always included. |
| `autoLoad` | Read the custom texts on start. Defaults to `true`. |

### Why `folders`

`ngx-translate` knows its `folder` / `folders` from `provideTranslate`, but a page can also call `loadExtraTranslations(...)` for its own folder when it opens. Those folders are not registered anywhere, so the key selector could not offer their keys before the page was visited. List them in `folders` and they are loaded for the selector.

## Admin page

```ts
{
	path: 'translates',
	loadChildren: () =>
		import('@wawjs/ngx-translate-firebase').then((m) => m.translateFirebaseRoutes),
}
```

The page needs `provideTheme()` / `@wawjs/ngx-ui` styles like any `ngx-ui` table, and the app should guard the route (only admins should write translations; also set Firestore security rules).

## Key selector

```html
<wtranslate-key-select [(value)]="sourceText" (picked)="texts.set($event.translations)" />
```

`picked` emits `{ sourceText, translations }` for a user pick, not for the initial value. Labels are shown as they are, not translated.

## How custom texts are applied

- On start and on every language change the service waits for `TranslateService.loadTranslations(language)`, then calls `setOne()` for each custom text of that language.
- `setOne()` only touches its own key, so texts that a page loads later are not lost.
- Removing or clearing a custom text restores the text of the translation files (`TranslateService.getFileTranslations`), or the key itself when no file has it.
- On the server (SSR) nothing is read from Firestore.
