import { TestBed } from '@angular/core/testing';
import { afterEach, describe, expect, it } from 'vitest';
import { provideNgxUi } from './provide-theme';
import { ThemeService } from './theme.service';
import { DEFAULT_DARK_TOKENS, DEFAULT_LIGHT_TOKENS } from './theme.tokens';

function defaultsStyle(): HTMLStyleElement | null {
	return document.getElementById('wtheme-defaults') as HTMLStyleElement | null;
}

describe('ThemeService', () => {
	afterEach(() => {
		defaultsStyle()?.remove();
		document.documentElement.removeAttribute('style');
		localStorage.clear();
	});

	it('writes package defaults to a zero-specificity style tag, not inline', () => {
		TestBed.configureTestingModule({ providers: [provideNgxUi({ mode: 'light', persist: false })] });
		TestBed.inject(ThemeService);

		const style = defaultsStyle();

		expect(style).not.toBeNull();
		expect(document.head.firstElementChild).toBe(style);
		expect(style!.textContent).toMatch(/^:where\(:root\)\{/);
		expect(style!.textContent).toContain(`--c-bg-primary:${DEFAULT_LIGHT_TOKENS.bgPrimary}`);
		expect(document.documentElement.style.getPropertyValue('--c-bg-primary')).toBe('');
	});

	it('keeps one style tag and follows the mode', () => {
		TestBed.configureTestingModule({ providers: [provideNgxUi({ mode: 'light', persist: false })] });
		const theme = TestBed.inject(ThemeService);

		theme.setMode('dark');

		expect(document.querySelectorAll('#wtheme-defaults').length).toBe(1);
		expect(defaultsStyle()!.textContent).toContain(`--c-bg-primary:${DEFAULT_DARK_TOKENS.bgPrimary}`);
	});

	it('writes configured tokens inline and removes ones that no longer apply', () => {
		TestBed.configureTestingModule({
			providers: [
				provideNgxUi({
					mode: 'light',
					persist: false,
					tokens: { primary: '#123456' },
					lightTokens: { bgPrimary: '#ffffff' },
				}),
			],
		});
		const theme = TestBed.inject(ThemeService);
		const root = document.documentElement;

		expect(root.style.getPropertyValue('--c-primary')).toBe('#123456');
		expect(root.style.getPropertyValue('--c-bg-primary')).toBe('#ffffff');

		theme.setMode('dark');

		expect(root.style.getPropertyValue('--c-primary')).toBe('#123456');
		expect(root.style.getPropertyValue('--c-bg-primary')).toBe('');
	});
});
