import { InputType } from './input.type';

export const inputDefaults = {
	type: 'text' as InputType,
	name: 'name',
	label: '',
	placeholder: '',
	items: [] as string[],
	disabled: false,
	focused: false,
	clearable: false,
	wClass: '',
	autocomplete: undefined as string | null | undefined,
	error: null as string | null,
	icons: [] as any[],
};
