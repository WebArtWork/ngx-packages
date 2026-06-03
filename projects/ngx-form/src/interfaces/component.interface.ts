import { CrudDocument } from '@wawjs/ngx-crud';

export interface FormComponentInterface {
	components?: FormComponentInterface[];
	name?: string;
	key?: string;
	class?: string;
	hidden?: boolean;
	focus?: () => void;
	focused?: boolean;
	required?: boolean;
	disabled?: boolean;
	disabledWhen?: (values: Record<string, unknown>) => boolean;
	props?: Record<string, unknown>;
}

/** @deprecated Replaced by props: Record<string, unknown>. */
export interface TemplateFieldInterface {
	name: string;
	value: unknown;
}

export interface TemplateComponentInterface {
	name: string;
	component: unknown;
}

export interface Formcomponent extends CrudDocument<Formcomponent> {
	formId: string;
	name: string;
	key: string;
	props: Record<string, unknown>;
	components: string[];
}
