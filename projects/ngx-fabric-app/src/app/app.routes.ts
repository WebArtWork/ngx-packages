import { Routes } from '@angular/router';

export const routes: Routes = [
	{
		path: '',
		loadComponent: () =>
			import('./pages/landing/landing.component').then(m => m.LandingComponent),
		data: {
			meta: {
				title: 'ngx-fabric',
				description:
					'Angular Fabric.js package from Web Art Work with focused canvas bindings, standalone providers, theme modes, and translations.',
			},
		},
	},
	{
		path: 'services/:slug',
		loadComponent: () =>
			import('./pages/service-detail/service-detail.component').then(
				m => m.ServiceDetailComponent,
			),
	},
	{
		path: '**',
		redirectTo: '',
	},
];
