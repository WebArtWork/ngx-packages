import { CrudDocument } from '@wawjs/ngx-crud';
import { FormComponentInterface } from './component.interface';

export interface FormInterface {
	formId?: string;
	title?: string;
	class?: string;
	components: FormComponentInterface[];
}

export interface Form extends CrudDocument<Form> {
	title: string;
	formId: string;
}
