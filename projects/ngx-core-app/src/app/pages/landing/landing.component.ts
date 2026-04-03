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
	protected readonly installCommand = 'npm i --save ngx-core';

	protected readonly services = serviceDocs;
	protected readonly featureGroups: LandingFeatureGroup[] = [
		{
			title: 'Bootstrap and configuration',
			description:
				'Standalone-first setup centered on provideNgxCore() and focused app-wide defaults.',
			items: ['provideNgxCore()', 'store / meta config', 'SSR-safe app-wide defaults'],
		},
		{
			title: 'Application services',
			description:
				'Reusable services for common app behavior instead of duplicating infrastructure code.',
			items: [
				'CoreService, StoreService, MetaService',
				'EmitterService, MetaService, DomService',
				'UtilService',
			],
		},
		{
			title: 'DOM feature',
			description:
				'Programmatic component mounting helpers for overlays, portals, and dynamic UI composition.',
			items: [
				'DomService',
				'appendById(), appendComponent(), getComponentRef(), removeComponent()',
				'DomComponent interface',
			],
		},
		{
			title: 'UI helpers',
			description:
				'Small reusable primitives that can be imported directly where they are needed.',
			items: [
				'clickOutside directive',
				'arr, search, safe, pagination, split, splice pipes',
				'number pipe',
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
