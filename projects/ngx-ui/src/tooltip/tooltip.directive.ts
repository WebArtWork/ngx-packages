import { DOCUMENT, isPlatformBrowser } from '@angular/common';
import {
	Directive,
	ElementRef,
	OnDestroy,
	PLATFORM_ID,
	Renderer2,
	inject,
	input,
} from '@angular/core';
import { generateA11yId } from '@wawjs/ngx-core';

export type TooltipPosition = 'top' | 'bottom' | 'left' | 'right';

@Directive({
	selector: '[wtooltip]',
	host: {
		'(mouseenter)': 'show()',
		'(mouseleave)': 'hide()',
		'(focus)': 'show()',
		'(blur)': 'hide()',
		'(keydown.escape)': 'hide()',
	},
})
export class TooltipDirective implements OnDestroy {
	readonly wtooltip = input<string>('');
	readonly tooltipPosition = input<TooltipPosition>('top');

	private readonly _elementRef =
		inject<ElementRef<HTMLElement>>(ElementRef);
	private readonly _renderer = inject(Renderer2);
	private readonly _document = inject(DOCUMENT);
	private readonly _isBrowser = isPlatformBrowser(inject(PLATFORM_ID));

	private readonly _id = generateA11yId('wtooltip');
	private _tooltipEl?: HTMLElement;

	show(): void {
		if (!this._isBrowser || !this.wtooltip() || this._tooltipEl) {
			return;
		}

		this._tooltipEl = this._renderer.createElement('div');
		this._renderer.setAttribute(this._tooltipEl, 'id', this._id);
		this._renderer.setAttribute(this._tooltipEl, 'role', 'tooltip');
		this._renderer.addClass(this._tooltipEl, 'wtooltip');
		this._renderer.addClass(
			this._tooltipEl,
			`wtooltip--${this.tooltipPosition()}`,
		);
		this._renderer.setProperty(
			this._tooltipEl,
			'textContent',
			this.wtooltip(),
		);
		this._renderer.appendChild(this._document.body, this._tooltipEl);
		this._renderer.setAttribute(
			this._elementRef.nativeElement,
			'aria-describedby',
			this._id,
		);

		this._position();
	}

	hide(): void {
		if (this._tooltipEl) {
			this._renderer.removeChild(this._document.body, this._tooltipEl);
			this._tooltipEl = undefined;
			this._renderer.removeAttribute(
				this._elementRef.nativeElement,
				'aria-describedby',
			);
		}
	}

	ngOnDestroy(): void {
		this.hide();
	}

	private _position(): void {
		if (!this._tooltipEl) {
			return;
		}

		const hostRect = this._elementRef.nativeElement.getBoundingClientRect();
		const tipRect = this._tooltipEl.getBoundingClientRect();
		const scrollX = this._document.defaultView?.scrollX ?? 0;
		const scrollY = this._document.defaultView?.scrollY ?? 0;

		let top = 0;
		let left = 0;

		switch (this.tooltipPosition()) {
			case 'bottom':
				top = hostRect.bottom + 8;
				left = hostRect.left + hostRect.width / 2 - tipRect.width / 2;
				break;
			case 'left':
				top = hostRect.top + hostRect.height / 2 - tipRect.height / 2;
				left = hostRect.left - tipRect.width - 8;
				break;
			case 'right':
				top = hostRect.top + hostRect.height / 2 - tipRect.height / 2;
				left = hostRect.right + 8;
				break;
			default:
				top = hostRect.top - tipRect.height - 8;
				left = hostRect.left + hostRect.width / 2 - tipRect.width / 2;
		}

		this._renderer.setStyle(this._tooltipEl, 'top', `${top + scrollY}px`);
		this._renderer.setStyle(this._tooltipEl, 'left', `${left + scrollX}px`);
	}
}
