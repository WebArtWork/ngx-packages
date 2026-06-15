import { injectAsync } from '@angular/core';
import type { FabricCropModalService } from './fabric-crop-modal.service';

export function injectFabricCropModalService(): () => Promise<FabricCropModalService> {
	return injectAsync<FabricCropModalService>(() =>
		import('./fabric-crop-modal.service').then(m => m.FabricCropModalService),
	);
}
