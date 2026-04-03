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
	protected readonly installCommand = 'npm i --save ngx-tinymce';

	protected readonly services = serviceDocs;
	protected readonly featureGroups: LandingFeatureGroup[] = [
		{
			title: 'Bootstrap and defaults',
			description:
				'Standalone-first setup centered on provideNgxTinymce() so script paths and default editor options are registered once.',
			items: ['provideNgxTinymce()', 'baseURL and fileName', 'default TinyMCE config'],
		},
		{
			title: 'Component API',
			description:
				'Angular component wrapper for classic or inline TinyMCE usage with signal inputs and a ready event.',
			items: [
				'TinymceComponent',
				'[config], [inline], [disabled], [delay]',
				'ready output and instance getter',
			],
		},
		{
			title: 'Forms integration',
			description:
				'ControlValueAccessor support keeps template-driven and reactive forms aligned with editor content and readonly state.',
			items: ['[(ngModel)]', 'formControlName', 'setDisabledState()', 'blur touch handling'],
		},
		{
			title: 'Runtime safety',
			description:
				'Script loading and editor startup only happen in the browser, which keeps SSR intact while still allowing lazy loading.',
			items: ['lazy script injection', 'SSR guard', 'config merge and re-init'],
		},
	];

	protected readonly usageCopy = `import { provideNgxTinymce } from 'ngx-tinymce';

export const appConfig = {
\tproviders: [provideNgxTinymce()],
};`;

	protected readonly configCopy = `import { provideNgxTinymce } from 'ngx-tinymce';

export const appConfig = {
\tproviders: [
\t\tprovideNgxTinymce({
\t\t\tbaseURL: '/assets/tinymce/',
\t\t\tfileName: 'tinymce.min.js',
\t\t\tconfig: {
\t\t\t\tmenubar: false,
\t\t\t\tplugins: 'lists link table code',
\t\t\t\ttoolbar: 'undo redo | bold italic | bullist numlist | code',
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
