import {
	Component,
	OnDestroy,
	OnInit,
} from '@angular/core';

@Component({
	selector: 'lib-modal',
	templateUrl: './modal.component.html',
	styles: [
		`
			:host {
				display: block;
			}
		`,
	],
})
export class ModalComponent implements OnInit, OnDestroy {
	closable = true;
	close: () => void = () => {};
	onOpen?: () => void;
	onClickOutside?: () => void;

	// used in template for size modifiers
	size: 'small' | 'mid' | 'big' | 'full' = 'mid';

	// optional custom class applied to the content panel
	panelClass = '';

	private readonly _popStateHandler = (e: PopStateEvent) =>
		this.popStateListener(e);

	ngOnInit(): void {
		if (typeof this.onClickOutside !== 'function') {
			this.onClickOutside = this.close;
		}

		if (typeof this.onOpen === 'function') {
			this.onOpen();
		}

		window.addEventListener('popstate', this._popStateHandler);
	}

	ngOnDestroy(): void {
		window.removeEventListener('popstate', this._popStateHandler);
	}

	onBackdropClick(): void {
		this.onClickOutside?.();
	}

	private popStateListener(_: Event): void {
		this.close?.();
	}
}
