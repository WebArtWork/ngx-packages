import { Routes } from '@angular/router';

export const routes: Routes = [
	{
		path: '',
		loadComponent: () =>
			import('./pages/landing/landing.component').then(m => m.LandingComponent),
		data: {
			meta: {
				title: 'ngx-tinymce',
				description:
					'Angular TinyMCE package from Web Art Work with standalone providers, lazy script loading, form integration, and SSR-safe runtime guards.',
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
