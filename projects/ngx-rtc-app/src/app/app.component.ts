import { NgOptimizedImage } from '@angular/common';
import { Component, inject } from '@angular/core';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { Language, LanguageService, TranslateService } from 'ngx-translate';
import { ThemeService } from 'ngx-ui';
import { serviceDocs } from './services/service-docs';

@Component({
	selector: 'app-root',
	imports: [NgOptimizedImage, RouterLink, RouterLinkActive, RouterOutlet],
	templateUrl: './app.component.html',
	styleUrl: './app.component.scss',
})
export class AppComponent {
	private readonly _languageFlagByCode: Record<string, string> = {
		en: '/flags/united-kingdom.svg',
		ua: '/flags/ukraine.svg',
	};

	protected readonly themeService = inject(ThemeService);
	protected readonly languageService = inject(LanguageService);
	protected readonly translateService = inject(TranslateService);
	protected readonly services = serviceDocs;

	protected translate(text: string): string {
		return this.translateService.translate(text)();
	}

	protected themeSwitchLabel(): string {
		const mode = this.themeService.mode() === 'light' ? 'dark' : 'light';
		return `${this.translate('Switch to')} ${this.translate(mode)} ${this.translate('mode')}`;
	}

	protected topbarLabel(name: string): string {
		if (name === 'RtcService') {
			return 'RTC';
		}

		return name.replace(/Service$/, '');
	}

	protected languages(): Language[] {
		return this.languageService.languages();
	}

	protected languageFlag(language: Language): string {
		return this._languageFlagByCode[language.code] || '';
	}

	protected languageCode(language: Language): string {
		return language.code.toUpperCase();
	}

	protected switchLanguageLabel(language: Language): string {
		return this.translateService.translate(`Switch language to ${language.name}`)();
	}

	protected setLanguage(language: string): void {
		void this.translateService.setLanguage(language);
	}

	protected isLanguage(language: string): boolean {
		const current =
			this.languageService.language() || this.languageService.defaultLanguage() || 'en';
		return current === language;
	}

	protected toggleTheme(): void {
		const nextMode = this.themeService.mode() === 'light' ? 'dark' : 'light';
		this.themeService.setMode(nextMode);
	}
}
