import { ButtonType } from '../../button/button.type';

export interface Confirm {
	message: string;
	header?: string;
	icon?: string;
	acceptLabel?: string;
	rejectLabel?: string;
	acceptType?: ButtonType;
	rejectType?: ButtonType;
	accept?: () => void;
	reject?: () => void;
}

export const DEFAULT_CONFIRM_CONFIG: Partial<Confirm> = {
	header: 'Are you sure?',
	icon: 'help_outline',
	acceptLabel: 'Yes',
	rejectLabel: 'No',
	acceptType: 'primary',
	rejectType: 'light',
};
