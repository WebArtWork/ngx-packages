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
	protected readonly installCommand = 'npm run start:app';

	protected readonly services = serviceDocs;
	protected readonly featureGroups: LandingFeatureGroup[] = [
		{
			title: 'Project baseline',
			description:
				'Cloned from ngx-core-app and kept standalone-first with provideNgxCore().',
			items: ['SSR-ready shell', 'provideNgxCore()', 'provideTheme()', 'provideTranslate()'],
		},
		{
			title: 'Scaffolded features',
			description:
				'Requested feature areas exist as placeholders so implementation can be filled in later.',
			items: [
				'core, ui, translate, http, socket, crud',
				'rtc, datetime, ace, fabric, tinymce',
				'empty feature files for future work',
			],
		},
	];

	protected readonly usageCopy = `import { provideNgxCore } from 'ngx-core';

export const appConfig = {
\tproviders: [provideNgxCore()],
};`;

	protected readonly configCopy = `import { provideNgxCore } from 'ngx-core';

export const appConfig = {
\tproviders: [
\t\tprovideNgxCore({
\t\t\tstore: { prefix: 'waStore' },
\t\t\thttp: { url: '/api' },
\t\t\tmeta: {
\t\t\t\tuseTitleSuffix: false,
\t\t\t\tapplyFromRoutes: true,
\t\t\t\tdefaults: { links: {} },
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
