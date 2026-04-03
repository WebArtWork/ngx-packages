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
	protected readonly installCommand = 'npm i --save ngx-translate';

	protected readonly services = serviceDocs;
	protected readonly featureGroups: LandingFeatureGroup[] = [
		{
			title: 'Bootstrap and setup',
			description:
				'Standalone-first language and translation setup for Angular applications.',
			items: [
				'provideLanguage() for language-only bootstrap',
				'provideTranslate() for runtime i18n bootstrap',
				'inline translations or /i18n/{lang}.json file loading',
			],
		},
		{
			title: 'Runtime services',
			description:
				'Focused APIs for language state, translation lookup, and live UI updates.',
			items: [
				'LanguageService for current/default language state',
				'TranslateService for signal-based runtime translations',
				'language persistence with SSR-safe local storage guards',
			],
		},
		{
			title: 'Template integration',
			description:
				'Use the same translation runtime in templates, directives, and app shell controls.',
			items: [
				'TranslatePipe and TranslateDirective',
				'language switchers and translated headers',
				'lazy signals that fall back to source text',
			],
		},
	];

	protected readonly usageCopy = `import { provideTranslate } from 'ngx-translate';

export const appConfig = {
\tproviders: [provideTranslate({ defaultLanguage: 'en' })],
};`;

	protected readonly configCopy = `import { provideTranslate } from 'ngx-translate';

export const appConfig = {
\tproviders: [
\t\tprovideTranslate({
\t\t\tdefaultLanguage: 'en',
\t\t\tlanguages: ['en', 'de', 'fr'],
\t\t\tfolder: '/i18n/',
\t\t\tpersistLanguage: true,
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
