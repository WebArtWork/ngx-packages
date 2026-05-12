import { isPlatformBrowser } from '@angular/common';
import {
	afterNextRender,
	Directive,
	effect,
	ElementRef,
	inject,
	input,
	PLATFORM_ID,
	signal,
	WritableSignal,
} from '@angular/core';
import { TranslateDirectiveConfig, TranslateDirectiveValue } from './translate.interface';
import { TranslateService } from './translate.service';

@Directive({
	selector: '[translate]',
})
export class TranslateDirective {
	private readonly _platformId = inject(PLATFORM_ID);
	private readonly _isBrowser = isPlatformBrowser(this._platformId);

	/**
	 * Optional translation key or target map.
	 *
	 * - If a string is provided, that key is used for the element text.
	 * - If an object is provided, `content` updates textContent and other keys
	 *   update host attributes.
	 * - If empty, the directive uses the element's initial rendered textContent
	 *   (captured after render) as the key.
	 *
	 * Note:
	 * Content translation writes to `textContent`, which replaces all child
	 * text/markup inside the host element.
	 */
	readonly translate = input<TranslateDirectiveValue>('');

	private readonly _el = inject(ElementRef<HTMLElement>);
	private readonly _translateService = inject(TranslateService);

	/**
	 * Captures the element's original rendered text (trimmed) after the first render.
	 *
	 * Used as the implicit key when no explicit `translate` input is provided.
	 * This is captured only in the browser (SSR-safe guard).
	 */
	private readonly _original = signal<string>(''); // set after render

	private _lastKey = '';
	private _lastSignal: WritableSignal<string> = signal('');
	private _translatedAttributes = new Set<string>();

	constructor() {
		if (!this._isBrowser) return;

		// capture origin text once the element content is actually rendered
		afterNextRender(() => {
			const text = (this._el.nativeElement.textContent ?? '').trim();
			this._original.set(text);
		});

		effect(() => {
			if (!this._isBrowser) return;

			const value = this.translate();

			if (this._isConfig(value)) {
				this._applyConfig(value);
				return;
			}

			this._clearTranslatedAttributes();

			const origin = this._original().trim();
			const explicit = (value || '').trim();

			// If no explicit key and origin is still empty, don't overwrite DOM.
			// This prevents blanking the content.
			const key = (explicit || origin).trim();
			if (!key) return;

			// Only swap signal when key changes
			if (key !== this._lastKey) {
				this._lastKey = key;
				this._lastSignal = this._translateService.translate(key);
			}

			// If no translation exists, service returns key (origin), so this keeps origin text.
			this._el.nativeElement.textContent = this._lastSignal();
		});
	}

	private _applyConfig(config: TranslateDirectiveConfig): void {
		const nextAttributes = new Set<string>();

		for (const key in config) {
			const sourceText = (config[key] || '').trim();

			if (!sourceText) {
				continue;
			}

			const translated = this._translateService.translate(sourceText)();

			if (key === 'content') {
				this._el.nativeElement.textContent = translated;
				continue;
			}

			const attributeName = this._normalizeAttributeName(key);
			nextAttributes.add(attributeName);
			this._el.nativeElement.setAttribute(attributeName, translated);
		}

		for (const attributeName of this._translatedAttributes) {
			if (!nextAttributes.has(attributeName)) {
				this._el.nativeElement.removeAttribute(attributeName);
			}
		}

		this._translatedAttributes = nextAttributes;
	}

	private _clearTranslatedAttributes(): void {
		for (const attributeName of this._translatedAttributes) {
			this._el.nativeElement.removeAttribute(attributeName);
		}

		this._translatedAttributes.clear();
	}

	private _isConfig(value: TranslateDirectiveValue): value is TranslateDirectiveConfig {
		return !!value && typeof value === 'object' && !Array.isArray(value);
	}

	private _normalizeAttributeName(name: string): string {
		return name.replace(/[A-Z]/g, letter => `-${letter.toLowerCase()}`);
	}
}
