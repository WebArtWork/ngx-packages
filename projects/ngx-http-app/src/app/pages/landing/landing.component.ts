import { isPlatformBrowser } from '@angular/common';
import { ChangeDetectionStrategy, Component, inject, PLATFORM_ID, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { serviceDocs } from '../../services/service-docs';

interface LandingFeatureGroup {
	title: string;
	description: string;
	items: string[];
}

@Component({
	imports: [RouterLink],
	templateUrl: './landing.component.html',
	styleUrl: './landing.component.scss',
	changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LandingComponent {
	private readonly _platformId = inject(PLATFORM_ID);

	protected readonly copiedKey = signal('');
	protected readonly installCommand = 'npm i --save ngx-http';

	protected readonly services = serviceDocs;
	protected readonly featureGroups: LandingFeatureGroup[] = [
		{
			title: 'Bootstrap and configuration',
			description:
				'Standalone-first setup centered on provideNgxHttp() for transport defaults.',
			items: [
				'provideNgxHttp()',
				'http / network config',
				'HttpClient provisioning with fetch + DI interceptors',
			],
		},
		{
			title: 'Transport services',
			description: 'Focused runtime features for API access and connectivity state.',
			items: ['HttpService', 'NetworkService', 'Shared config token and typed interfaces'],
		},
	];

	protected readonly usageCopy = `import { provideNgxHttp } from 'ngx-http';

export const appConfig = {
\tproviders: [provideNgxHttp()],
};`;

	protected readonly configCopy = `import { provideNgxHttp } from 'ngx-http';

export const appConfig = {
\tproviders: [
\t\tprovideNgxHttp({
\t\t\thttp: { url: 'https://api.example.com' },
\t\t\tnetwork: {
\t\t\t\tendpoints: ['https://api.example.com/ping'],
\t\t\t\tgoodLatencyMs: 250,
\t\t\t},
\t\t}),
\t],
};`;

	protected copy(key: string, value: string): void {
		if (!isPlatformBrowser(this._platformId) || !navigator?.clipboard) {
			return;
		}

		navigator.clipboard.writeText(value).then(() => {
			this.copiedKey.set(key);
			setTimeout(() => {
				if (this.copiedKey() === key) {
					this.copiedKey.set('');
				}
			}, 1500);
		});
	}
}
