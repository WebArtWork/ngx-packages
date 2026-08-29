import { DOCUMENT, isPlatformBrowser } from '@angular/common';
import {
	Directive,
	ElementRef,
	OnDestroy,
	PLATFORM_ID,
	Renderer2,
	inject,
	input,
	output,
} from '@angular/core';
import { generateA11yId, pushEscapeHandler } from '@wawjs/ngx-core';
import { DEFAULT_CONFIRM_CONFIG } from './interfaces/confirm.interface';

@Directive({
	selector: '[wconfirmPopup]',
	host: {
		'(click)': 'toggle($event)',
	},
})
export class ConfirmPopupDirective implements OnDestroy {
	readonly wconfirmPopup = input<string>('');
	readonly acceptLabel = input<string>(
		DEFAULT_CONFIRM_CONFIG.acceptLabel as string,
	);
	readonly rejectLabel = input<string>(
		DEFAULT_CONFIRM_CONFIG.rejectLabel as string,
	);

	readonly wAccept = output<void>();
	readonly wReject = output<void>();

	private readonly _elementRef = inject<ElementRef<HTMLElement>>(ElementRef);
	private readonly _renderer = inject(Renderer2);
	private readonly _document = inject(DOCUMENT);
	private readonly _isBrowser = isPlatformBrowser(inject(PLATFORM_ID));

	private readonly _messageId = generateA11yId('wconfirm-popup-message');
	private _panelEl?: HTMLElement;
	private _removeDocClick?: () => void;
	private _unregisterEscape?: () => void;

	toggle(event: Event): void {
		event.stopPropagation();

		if (this._panelEl) {
			this.hide();
		} else {
			this.show();
		}
	}

	show(): void {
		if (!this._isBrowser || !this.wconfirmPopup() || this._panelEl) {
			return;
		}

		const panel = this._renderer.createElement('div');
		this._renderer.addClass(panel, 'wconfirm-popup');
		this._renderer.setAttribute(panel, 'role', 'dialog');
		this._renderer.setAttribute(panel, 'aria-modal', 'false');
		this._renderer.setAttribute(panel, 'aria-describedby', this._messageId);

		const message = this._renderer.createElement('div');
		this._renderer.setAttribute(message, 'id', this._messageId);
		this._renderer.addClass(message, 'wconfirm-popup__message');
		this._renderer.setProperty(message, 'textContent', this.wconfirmPopup());
		this._renderer.appendChild(panel, message);

		const actions = this._renderer.createElement('div');
		this._renderer.addClass(actions, 'wconfirm-popup__actions');

		const rejectBtn = this._renderer.createElement('button');
		this._renderer.setAttribute(rejectBtn, 'type', 'button');
		this._renderer.addClass(rejectBtn, 'wconfirm-popup__btn');
		this._renderer.addClass(rejectBtn, 'wconfirm-popup__btn--reject');
		this._renderer.setProperty(rejectBtn, 'textContent', this.rejectLabel());
		this._renderer.listen(rejectBtn, 'click', () => {
			this.wReject.emit();
			this.hide({ restoreFocus: true });
		});
		this._renderer.appendChild(actions, rejectBtn);

		const acceptBtn = this._renderer.createElement('button');
		this._renderer.setAttribute(acceptBtn, 'type', 'button');
		this._renderer.addClass(acceptBtn, 'wconfirm-popup__btn');
		this._renderer.addClass(acceptBtn, 'wconfirm-popup__btn--accept');
		this._renderer.setProperty(acceptBtn, 'textContent', this.acceptLabel());
		this._renderer.listen(acceptBtn, 'click', () => {
			this.wAccept.emit();
			this.hide({ restoreFocus: true });
		});
		this._renderer.appendChild(actions, acceptBtn);

		this._renderer.appendChild(panel, actions);
		this._renderer.appendChild(this._document.body, panel);

		this._panelEl = panel;
		this._position();

		rejectBtn.focus();

		this._removeDocClick = this._renderer.listen(
			this._document,
			'click',
			() => this.hide(),
		);

		this._unregisterEscape = pushEscapeHandler(this._document, () =>
			this.hide({ restoreFocus: true }),
		);
	}

	hide(options?: { restoreFocus?: boolean }): void {
		const hadPanel = !!this._panelEl;

		if (this._panelEl) {
			this._renderer.removeChild(this._document.body, this._panelEl);
			this._panelEl = undefined;
		}

		this._removeDocClick?.();
		this._removeDocClick = undefined;

		this._unregisterEscape?.();
		this._unregisterEscape = undefined;

		if (
			hadPanel &&
			options?.restoreFocus &&
			typeof this._elementRef.nativeElement.focus === 'function'
		) {
			this._elementRef.nativeElement.focus();
		}
	}

	ngOnDestroy(): void {
		this.hide();
	}

	private _position(): void {
		if (!this._panelEl) {
			return;
		}

		const hostRect = this._elementRef.nativeElement.getBoundingClientRect();
		const scrollX = this._document.defaultView?.scrollX ?? 0;
		const scrollY = this._document.defaultView?.scrollY ?? 0;

		this._renderer.setStyle(
			this._panelEl,
			'top',
			`${hostRect.bottom + scrollY + 8}px`,
		);
		this._renderer.setStyle(
			this._panelEl,
			'left',
			`${hostRect.left + scrollX}px`,
		);
	}
}
