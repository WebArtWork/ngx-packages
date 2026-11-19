import { Component, inject } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { LanguageService, TranslateDirective } from '@wawjs/ngx-translate';

@Component({
	selector: 'app-root',
	imports: [RouterOutlet, TranslateDirective],
	template: `
		<header class="bar">
			<strong translate>Dashboard</strong>
			@for (language of languageService.languages(); track language.code) {
			<button type="button" (click)="languageService.setLanguage(language.code)">
				{{ language.nativeName }}
			</button>
			}
		</header>
		<main class="main"><router-outlet /></main>
	`,
	styles: `
		.bar {
			display: flex;
			align-items: center;
			gap: 12px;
			padding: 12px 16px;
		}

		.main {
			padding: 16px;
		}
	`,
})
export class AppComponent {
	protected readonly languageService = inject(LanguageService);
}
