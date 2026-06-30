import { Routes } from '@angular/router';

export const routes: Routes = [
	{
		path: '',
		loadComponent: () =>
			import('./pages/landing/landing.component').then(m => m.LandingComponent),
		data: {
			meta: {
				title: 'wawjs.dev',
				description:
					'Developer guide for WAW framework and Angular ngx product docs on wawjs.dev.',
			},
		},
	},
	{
		path: 'features/:slug',
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
