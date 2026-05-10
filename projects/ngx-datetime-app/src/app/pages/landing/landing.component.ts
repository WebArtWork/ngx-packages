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
	protected readonly installCommand = 'npm i --save ngx-datetime';

	protected readonly services = serviceDocs;
	protected readonly featureGroups: LandingFeatureGroup[] = [
		{
			title: 'Bootstrap',
			description:
				'Focused setup centered on provideNgxDatetime() with configurable date naming and formatting defaults.',
			items: [
				'provideNgxDatetime(config)',
				'DatePipe dependency registration',
				'default format, timezone, locale, and week policy',
			],
		},
		{
			title: 'Datetime service',
			description:
				'One focused injectable for common date naming, formatting, arithmetic, and range helpers.',
			items: [
				'TimeService',
				'Formatting, timezone conversion, and locale-aware week boundaries',
				'Day / week / month / year helpers plus date math',
			],
		},
	];

	protected readonly usageCopy = `import { provideNgxDatetime } from 'ngx-datetime';

export const appConfig = {
\tproviders: [provideNgxDatetime()],
};`;

	protected readonly configCopy = `import { provideNgxDatetime } from 'ngx-datetime';

export const appConfig = {
\tproviders: [
\t\tprovideNgxDatetime({
\t\t\tdefaultFormat: 'medium',
\t\t\tdefaultTimezone: 'UTC',
\t\t\tdefaultLocale: 'en-GB',
\t\t\tfirstDayOfWeek: 1,
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
