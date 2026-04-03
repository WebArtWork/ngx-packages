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
	protected readonly installCommand = 'npm i --save ngx-fabric fabric resize-observer-polyfill';

	protected readonly services = serviceDocs;
	protected readonly featureGroups: LandingFeatureGroup[] = [
		{
			title: 'Bootstrap and defaults',
			description:
				'Standalone-first setup centered on provideNgxFabric() with shared canvas defaults registered once.',
			items: [
				'provideNgxFabric()',
				'FABRIC_CONFIG',
				'shared selection and rendering defaults',
			],
		},
		{
			title: 'Component wrapper',
			description:
				'Template-friendly canvas wrapper for teams that want Fabric in markup with minimal wiring.',
			items: [
				'FabricComponent',
				'[config], [data], [zoom], [disabled]',
				'dataLoaded and Fabric event outputs',
			],
		},
		{
			title: 'Directive control',
			description:
				'Low-level directive access for teams that want the raw Fabric instance and imperative helpers.',
			items: [
				'FabricDirective',
				'fabric(), clear(), render(), loadFromJSON()',
				'setZoom(), setWidth(), setHeight()',
			],
		},
		{
			title: 'Canvas behavior',
			description:
				'The wrapper keeps canvas sizing and config reapplication practical for app use.',
			items: [
				'ResizeObserver-based sizing',
				'interactive Canvas vs StaticCanvas',
				'camelCase Angular bindings for Fabric events',
			],
		},
	];

	protected readonly usageCopy = `import { provideNgxFabric } from 'ngx-fabric';

export const appConfig = {
\tproviders: [provideNgxFabric()],
};`;

	protected readonly configCopy = `import { provideNgxFabric } from 'ngx-fabric';

export const appConfig = {
\tproviders: [
\t\tprovideNgxFabric({
\t\t\tselectionColor: 'rgba(37, 99, 235, 0.16)',
\t\t\trenderOnAddRemove: true,
\t\t\tpreserveObjectStacking: true,
\t\t\tisDrawingMode: false,
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
