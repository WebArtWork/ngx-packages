import { InjectionToken, Type } from '@angular/core';

export interface NgxFormModal {
	component: Type<unknown>;
	class?: string;
	panelClass?: string;
	size?: 'small' | 'mid' | 'big' | 'full' | string;
	onClose?: () => void;
	[x: string]: unknown;
}

export interface NgxFormModalService {
	show: (modal: NgxFormModal) => void;
}

export interface NgxFormConfig {
	appId?: string;
	modalService?: NgxFormModalService;
	modalFormComponent?: Type<unknown>;
	modalUniqueComponent?: Type<unknown>;
}

export const DEFAULT_NGX_FORM_CONFIG: NgxFormConfig = {};

export const NGX_FORM_CONFIG = new InjectionToken<NgxFormConfig>(
	'NGX_FORM_CONFIG',
	{
		providedIn: 'root',
		factory: () => DEFAULT_NGX_FORM_CONFIG,
	},
);
