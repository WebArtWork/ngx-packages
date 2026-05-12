import { Routes } from '@angular/router';

export const routes: Routes = [
	{
		path: '',
		loadComponent: () =>
			import('./pages/landing/landing.component').then(m => m.LandingComponent),
		data: {
			meta: {
				title: 'ngx-crud',
				description:
					'Angular CRUD package from Web Art Work for signal-first collections, optimistic local writes, Mongo-compatible IDs, and offline queue replay.',
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
