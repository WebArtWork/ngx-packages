import { FormInterface } from '../interfaces/form.interface';

export const formForm: FormInterface = {
	formId: 'form',
	title: 'Form',
	components: [
		{
			name: 'Input',
			key: 'title',
			focused: true,
			props: {
				placeholder: 'Enter form title...',
				label: 'Title',
			},
		},
	],
};
