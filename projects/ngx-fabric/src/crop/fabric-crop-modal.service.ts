import { Service, inject } from '@angular/core';
import { Modal, ModalService } from '@wawjs/ngx-ui';
import { FabricCropModalComponent } from './fabric-crop-modal.component';
import type { FabricCropModalOptions } from './fabric-crop.interfaces';

@Service()
export class FabricCropModalService {
	private readonly _modalService = inject(ModalService);

	open(options: FabricCropModalOptions): Modal {
		return this._modalService.show({
			...options,
			component: FabricCropModalComponent,
			size: options.size ?? 'big',
			panelClass: [
				'ngx-fabric-crop-modal',
				options.panelClass || options.class || '',
			]
				.filter(Boolean)
				.join(' '),
		});
	}
}
