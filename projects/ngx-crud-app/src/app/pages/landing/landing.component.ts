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
	protected readonly installCommand = 'npm i --save ngx-crud';

	protected readonly services = serviceDocs;
	protected readonly featureGroups: LandingFeatureGroup[] = [
		{
			title: 'Bootstrap and configuration',
			description:
				'Standalone-first setup centered on provideNgxCrud() for collection syncing and offline-aware CRUD flows.',
			items: [
				'provideNgxCrud()',
				'store / http / network config',
				'SSR-safe collection defaults',
			],
		},
		{
			title: 'CRUD runtime',
			description:
				'One extracted feature package that keeps data loading, mutation, retry, and cached document access together.',
			items: [
				'CrudService',
				'CrudComponent',
				'CrudDocument, CrudOptions, CrudConfig, TableConfig',
			],
		},
		{
			title: 'Offline-aware behavior',
			description:
				'Queue writes while offline, restore cached documents, and resync once connectivity returns.',
			items: [
				'create(), update(), unique(), delete() retry on reconnect',
				'getSignal(), getSignals(), getFieldSignals()',
				'loaded and getted completion streams',
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

	protected readonly usageCopy = `import { provideNgxCrud } from 'ngx-crud';

export const appConfig = {
\tproviders: [provideNgxCrud()],
};`;

	protected readonly configCopy = `import { provideNgxCrud } from 'ngx-crud';

export const appConfig = {
\tproviders: [
\t\tprovideNgxCrud({
\t\t\tstore: { prefix: 'waStore' },
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
