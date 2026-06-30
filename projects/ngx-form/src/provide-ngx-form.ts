import { EnvironmentProviders, makeEnvironmentProviders } from '@angular/core';
import { ModalFormComponent } from './modals/modal-form/modal-form.component';
import { ModalUniqueComponent } from './modals/modal-unique/modal-unique.component';
import { NgxFormConfig, NGX_FORM_CONFIG } from './config.interface';

export function provideNgxForm(config: NgxFormConfig = {}): EnvironmentProviders {
	return makeEnvironmentProviders([
		{
			provide: NGX_FORM_CONFIG,
			useValue: {
				modalFormComponent: ModalFormComponent,
				modalUniqueComponent: ModalUniqueComponent,
				...config,
			},
		},
	]);
}
