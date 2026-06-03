import { ButtonType } from './button.type';

export const buttonDefaults = {
	type: 'primary' as ButtonType,
	extraClass: '',
	disabled: false,
	disableSubmit: false,
	isMultipleClicksAllowed: false,
};

/**
 * Keep TS classes semantic.
 * Visual decisions live in SCSS and must be token-driven (var(--token)).
 */
export const WBUTTON_BASE_CLASSES = '';

/** BEM modifiers (token-driven in SCSS) */
export const WBUTTON_TYPE_CLASSES: Record<ButtonType, string> = {
	primary: 'wbutton--primary',
	secondary: 'wbutton--secondary',
	success: 'wbutton--success',
	danger: 'wbutton--danger',
	warning: 'wbutton--warning',
	info: 'wbutton--info',
	light: 'wbutton--light',
	dark: 'wbutton--dark',
	link: 'wbutton--link',
};
