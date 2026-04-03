import { Routes } from '@angular/router';

export const routes: Routes = [
	{
		path: '',
		loadComponent: () =>
			import('./pages/landing/landing.component').then(m => m.LandingComponent),
		data: {
			meta: {
				title: 'ngx-rtc',
				description:
					'Angular WebRTC package from Web Art Work for SSR-safe local media setup and peer connection workflows.',
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
