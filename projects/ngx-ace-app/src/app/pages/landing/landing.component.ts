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
	protected readonly installCommand = 'npm i --save ngx-ace';

	protected readonly services = serviceDocs;
	protected readonly featureGroups: LandingFeatureGroup[] = [
		{
			title: 'Bootstrap and defaults',
			description:
				'Standalone-first setup centered on provideNgxAce() with editor defaults registered once.',
			items: ['provideNgxAce()', 'default mode and theme', 'SSR-safe browser guards'],
		},
		{
			title: 'Component API',
			description:
				'Template-friendly editor wrapper with signal inputs, outputs, and two-way value binding.',
			items: [
				'AceComponent',
				'[(value)], [mode], [theme], [config]',
				'focus, blur, change, selection outputs',
			],
		},
		{
			title: 'Directive control',
			description:
				'Low-level directive access for teams that want direct editor instance methods and events.',
			items: [
				'AceDirective',
				'ace(), getValue(), setValue(), clear()',
				'readOnly and disabled state sync',
			],
		},
		{
			title: 'Lazy loading',
			description:
				'Modes and themes are loaded only when requested, with extension hooks for extra registrations.',
			items: [
				'ensureAce()',
				'registerAceMode() and registerAceTheme()',
				'text/javascript and github/clouds defaults',
			],
		},
	];

	protected readonly usageCopy = `import { provideNgxAce } from 'ngx-ace';

export const appConfig = {
\tproviders: [provideNgxAce()],
};`;

	protected readonly configCopy = `import { provideNgxAce } from 'ngx-ace';

export const appConfig = {
\tproviders: [
\t\tprovideNgxAce({
\t\t\tmode: 'javascript',
\t\t\ttheme: 'github',
\t\t\tuseWorker: false,
\t\t\tshowPrintMargin: false,
\t\t\tfontSize: 14,
\t\t\tminLines: 12,
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
