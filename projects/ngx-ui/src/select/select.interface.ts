import { SelectId } from './select.type';

export interface SelectItem {
	name: string;
	id: SelectId;
	__search?: string;
}

export interface SelectButton {
	click: () => void;
	icon?: string;
	text?: string;
	class?: string;
	disabled?: boolean;
}
