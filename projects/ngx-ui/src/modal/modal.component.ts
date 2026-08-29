import {
	AfterViewInit,
	Component,
	ElementRef,
	OnDestroy,
	OnInit,
	ViewEncapsulation,
	viewChild,
} from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { PLATFORM_ID, inject } from '@angular/core';
import { FocusTrap, FocusTrapFactory } from '@angular/cdk/a11y';
import { pushEscapeHandler } from '@wawjs/ngx-core';
import { ButtonDirective } from '../button/button.directive';
import { PlusIconComponent } from '../icons/plus/plus-icon.component';

@Component({
	selector: 'lib-modal',
	templateUrl: './modal.component.html',
	styleUrl: './modal.component.scss',
	encapsulation: ViewEncapsulation.None,
	imports: [ButtonDirective, PlusIconComponent],
})
export class ModalComponent implements OnInit, AfterViewInit, OnDestroy {
	private readonly _isBrowser = isPlatformBrowser(inject(PLATFORM_ID));
	private readonly _focusTrapFactory = inject(FocusTrapFactory);

	closable = true;
	close: () => void = () => {};
	onOpen?: () => void;
	onClickOutside?: () => void;

	// used in template for size modifiers
	size: 'small' | 'mid' | 'big' | 'full' = 'mid';

	// optional custom class applied to the content panel
	panelClass = '';

	// accessibility
	role: 'dialog' | 'alertdialog' = 'dialog';
	ariaLabel = '';
	ariaLabelledBy?: string;
	ariaDescribedBy?: string;

	private readonly _content = viewChild<ElementRef<HTMLElement>>('content');

	get contentClasses(): string {
		return [
			'wawjs-modal__content',
			`wawjs-modal__content--${this.size || 'mid'}`,
			this.panelClass,
		]
			.filter(Boolean)
			.join(' ');
	}

	private _focusTrap?: FocusTrap;
	private _unregisterEscape?: () => void;
	private readonly _popStateHandler = (e: PopStateEvent) => this.popStateListener(e);

	ngOnInit(): void {
		if (typeof this.onClickOutside !== 'function') {
			this.onClickOutside = this.close;
		}

		if (typeof this.onOpen === 'function') {
			this.onOpen();
		}

		if (this._isBrowser) {
			window.addEventListener('popstate', this._popStateHandler);
			this._unregisterEscape = pushEscapeHandler(document, () => {
				if (this.closable) {
					this.close();
				}
			});
		}
	}

	ngAfterViewInit(): void {
		if (!this._isBrowser) {
			return;
		}

		const element = this._content()?.nativeElement;

		if (!element) {
			return;
		}

		this._focusTrap = this._focusTrapFactory.create(element);

		void this._focusTrap.focusInitialElementWhenReady().then(focused => {
			if (!focused) {
				element.focus();
			}
		});
	}

	ngOnDestroy(): void {
		if (this._isBrowser) {
			window.removeEventListener('popstate', this._popStateHandler);
		}

		this._unregisterEscape?.();
		this._focusTrap?.destroy();
	}

	onBackdropClick(): void {
		this.onClickOutside?.();
	}

	private popStateListener(_: Event): void {
		this.close?.();
	}
}
