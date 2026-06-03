import { Routes } from '@angular/router';

export const routes: Routes = [
	{
		path: '',
		loadComponent: () =>
			import('./pages/landing/landing.component').then(m => m.LandingComponent),
		data: {
			meta: {
				title: 'ngx-map',
				description:
					'Angular map package from Web Art Work for Google Maps display, markers, address search, and Photon geocoding.',
			},
		},
	},
	{
		path: '**',
		redirectTo: '',
	},
];
