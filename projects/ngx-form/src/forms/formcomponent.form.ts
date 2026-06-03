import { FormInterface } from '../interfaces/form.interface';

export function createFormcomponentForm(items: unknown[] = []): FormInterface {
	return {
		formId: 'form',
		title: 'Form',
		components: [
			{
				name: 'Select',
				key: 'name',
				focused: true,
				props: {
					placeholder: 'Enter form name...',
					label: 'Name',
					items,
				},
			},
			{
				name: 'Input',
				key: 'key',
				props: {
					placeholder: 'Enter form key...',
					label: 'Key',
				},
			},
		],
	};
}

export const formcomponentForm = createFormcomponentForm();
