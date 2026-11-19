import { Routes } from '@angular/router';

/** Lazy route for the admin page, for example `{ path: 'translates', loadChildren: () => import(...).then(m => m.translateFirebaseRoutes) }`. */
export const translateFirebaseRoutes: Routes = [
	{
		path: '',
		loadComponent: () =>
			import('./translate-firebase.component').then((m) => m.TranslateFirebaseComponent),
	},
];
