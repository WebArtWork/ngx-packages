import { Component, ViewEncapsulation } from '@angular/core';
import { ButtonDirective } from '../../../button/button.directive';
import { ButtonType } from '../../../button/button.type';
import { DEFAULT_CONFIRM_CONFIG } from '../../interfaces/confirm.interface';

@Component({
	selector: 'wconfirm-dialog',
	imports: [ButtonDirective],
	templateUrl: './confirm-dialog.component.html',
	styleUrl: './confirm-dialog.component.scss',
	encapsulation: ViewEncapsulation.None,
})
export class ConfirmDialogComponent {
	message = '';
	header = DEFAULT_CONFIRM_CONFIG.header as string;
	icon = DEFAULT_CONFIRM_CONFIG.icon as string;
	acceptLabel = DEFAULT_CONFIRM_CONFIG.acceptLabel as string;
	rejectLabel = DEFAULT_CONFIRM_CONFIG.rejectLabel as string;
	acceptType = DEFAULT_CONFIRM_CONFIG.acceptType as ButtonType;
	rejectType = DEFAULT_CONFIRM_CONFIG.rejectType as ButtonType;

	accept?: () => void;
	reject?: () => void;

	/** Set by ModalService when this component is opened as a modal. */
	close: () => void = () => {};

	onAccept(): void {
		this.accept?.();
		this.close();
	}

	onReject(): void {
		this.reject?.();
		this.close();
	}
}
