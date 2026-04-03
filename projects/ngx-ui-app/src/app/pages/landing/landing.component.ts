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
	protected readonly installCommand = 'npm i --save ngx-ui';

	protected readonly services = serviceDocs;
	protected readonly featureGroups: LandingFeatureGroup[] = [
		{
			title: 'Bootstrap',
			description:
				'Standalone-first setup centered on provideTheme() so theme state initializes once during app startup.',
			items: ['provideTheme()', 'environment initializer', 'SSR-safe startup defaults'],
		},
		{
			title: 'Mode switching',
			description:
				'Use one service to keep light and dark state in sync with the document and persisted storage.',
			items: ['ThemeService.mode()', 'setMode()', 'localStorage persistence'],
		},
		{
			title: 'Density and radius',
			description:
				'Theme controls go beyond mode so design systems can expose compact spacing and alternate corner styles.',
			items: ['setDensity()', 'setRadius()', 'html[data-density] and html[data-radius]'],
		},
		{
			title: 'Theme cycling',
			description:
				'Preview every supported mode, density, and radius combination from one utility method.',
			items: ['themeIndex signal', 'nextTheme()', 'design-system previews'],
		},
	];

	protected readonly usageCopy = `import { provideTheme } from 'ngx-ui';

export const appConfig = {
\tproviders: [provideTheme()],
};`;

	protected readonly configCopy = `import { inject } from '@angular/core';
import { ThemeService, provideTheme } from 'ngx-ui';

export const appConfig = {
\tproviders: [provideTheme()],
};

const themeService = inject(ThemeService);

themeService.setMode('dark');
themeService.setDensity('comfortable');
themeService.setRadius('rounded');`;

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
