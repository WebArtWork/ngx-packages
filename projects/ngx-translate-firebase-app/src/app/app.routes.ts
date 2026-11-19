import { Routes } from '@angular/router';

export const routes: Routes = [
	{
		path: '',
		loadChildren: () =>
			import('@wawjs/ngx-translate-firebase').then((m) => m.translateFirebaseRoutes),
	},
];
