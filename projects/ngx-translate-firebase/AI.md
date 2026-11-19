# AI Usage Guide for @wawjs/ngx-translate-firebase

## Agent Instructions

```md
- This Angular project uses `@wawjs/ngx-translate-firebase` for custom translations stored in Firestore on top of `@wawjs/ngx-translate`.
- Import public APIs from `@wawjs/ngx-translate-firebase`.
- Set it up with `provideTranslateFirebase({ firestore, ready?, collection?, folders?, autoLoad? })`, after `provideTranslate(...)`.
- The package never imports the Firebase SDK. The app returns the Firestore helpers (`db`, `collection`, `doc`, `getDocs`, `addDoc`, `setDoc`, `deleteDoc`) from `firestore`.
- List every i18n folder that a page loads with `TranslateService.loadExtraTranslations` in `folders`, so the key selector offers those keys too.
- Use `TranslateFirebaseService` for CRUD (`add`, `save`, `upsert`, `remove`); the entries signal and the applied custom texts update by themselves.
- Mount the admin page with `translateFirebaseRoutes`, and guard the route in the app.
- Use `wtranslate-key-select` when a form needs a key of the translation files; it emits the file texts of the picked key for prefilling.
- Custom texts are applied with `TranslateService.setOne()`. Do not replace this with `setMany()`: it resets every key that is not in the list.
```

## Package Boundaries

- Depends on `@wawjs/ngx-translate` (service, language), `@wawjs/ngx-ui` (select, table, modal, alert, input, button) and `@wawjs/ngx-core`.
- Firestore access stays behind `TranslateFirebaseConfig.firestore`; do not add a hard Firebase SDK dependency.
- Modal content components (`TranslateFirebaseFormComponent`) receive `row`, `onSave` and `close` as plain properties from `ModalService`; they are not signal inputs.
- SSR: nothing reads Firestore on the server; `getFileTranslations` returns nothing there.
- The app owns routes, guards, Firebase setup and Firestore security rules.
