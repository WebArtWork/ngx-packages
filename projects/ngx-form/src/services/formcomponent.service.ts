import { computed, inject, Injectable } from '@angular/core';
import { CrudConfig, CrudService } from '@wawjs/ngx-crud';
import { NGX_FORM_CONFIG } from '../config.interface';
import { Formcomponent } from '../interfaces/component.interface';

function formcomponentCrudConfig(): CrudConfig<Formcomponent> {
	const config = inject(NGX_FORM_CONFIG);

	return {
		name: 'formcomponent',
		appId: config.appId,
	};
}

@Injectable({ providedIn: 'root' })
export class FormcomponentService extends CrudService<Formcomponent> {
	private readonly _ngxFormConfig = inject(NGX_FORM_CONFIG);

	readonly components = computed(() => this.documents());

	constructor() {
		super(formcomponentCrudConfig());

		if (this._ngxFormConfig.appId) {
			this.get({
				query:
					'appId=' + encodeURIComponent(this._ngxFormConfig.appId),
			});
		}
	}
}
