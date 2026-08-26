import { Service, inject } from '@angular/core';
import { ConfirmDialogComponent } from '../components/confirm-dialog/confirm-dialog.component';
import { Confirm, DEFAULT_CONFIRM_CONFIG } from '../interfaces/confirm.interface';
import { Modal } from '../../modal/modal.interface';
import { ModalService } from '../../modal/modal.service';

@Service()
export class ConfirmService {
	private readonly _modalService = inject(ModalService);

	confirm(opts: Confirm): void {
		const merged: Confirm = { ...DEFAULT_CONFIRM_CONFIG, ...opts };

		this._modalService.show({
			component: ConfirmDialogComponent,
			size: 'small',
			panelClass: 'wconfirm-modal',
			...merged,
		} satisfies Modal);
	}
}
