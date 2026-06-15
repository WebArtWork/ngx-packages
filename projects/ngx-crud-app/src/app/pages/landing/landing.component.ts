import { isPlatformBrowser } from '@angular/common';
import { Component, inject, PLATFORM_ID, signal } from '@angular/core';
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
})
export class LandingComponent {
	private readonly _platformId = inject(PLATFORM_ID);

	protected readonly copiedKey = signal('');
	protected readonly installCommand = 'npm i --save ngx-crud';

	protected readonly services = serviceDocs;
	protected readonly featureGroups: LandingFeatureGroup[] = [
		{
			title: 'Bootstrap and configuration',
			description:
				'Standalone-first setup that composes ngx-core storage utilities with ngx-http request and network services.',
			items: [
				'provideNgxCore()',
				'provideNgxCrud()',
				'http / network config from ngx-http',
				'SSR-safe collection defaults',
			],
		},
		{
			title: 'CRUD runtime',
			description:
				'One base service per document interface, with a single documents signal as the source of truth.',
			items: [
				'CrudService<Document>',
				'required Mongo-compatible _id',
				'computed() projections from documents',
			],
		},
		{
			title: 'Offline-aware behavior',
			description:
				'Apply writes locally first, persist a mutation queue, and resync when NetworkService.isOnline turns true.',
			items: [
				'create(), update(), unique(), delete() work without subscribe',
				'flushQueue() replays mutations in order',
				'checkUser(userId) scopes cache to login state',
			],
		},
		{
			title: 'Reusable CRUD UI base',
			description:
				'Extend CrudComponent to wire forms, pagination, bulk editing, sorting, and document actions into one base list view.',
			items: [
				'setDocuments(), bulkManagement(), getConfig()',
				'create(), update(), delete(), mutateUrl()',
				'server and local data modes',
			],
		},
	];

	protected readonly usageCopy = `import { provideNgxCore } from 'ngx-core';
import { provideNgxCrud } from 'ngx-crud';

export const appConfig = {
\tproviders: [provideNgxCore(), provideNgxCrud()],
};`;

	protected readonly configCopy = `import { provideNgxCore } from 'ngx-core';
import { provideNgxCrud } from 'ngx-crud';

export const appConfig = {
\tproviders: [
\t\tprovideNgxCore({
\t\t\tstore: { prefix: 'waStore' },
\t\t}),
\t\tprovideNgxCrud({
\t\t\thttp: {
\t\t\t\turl: 'https://api.example.com',
\t\t\t},
\t\t\tnetwork: {
\t\t\t\tendpoints: ['https://api.example.com/ping'],
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
