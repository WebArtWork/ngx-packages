import { TagType } from './tag.type';

export const tagDefaults = {
	type: 'primary' as TagType,
	rounded: false,
	extraClass: '',
};

export const WTAG_TYPE_CLASSES: Record<TagType, string> = {
	primary: 'wtag--primary',
	secondary: 'wtag--secondary',
	success: 'wtag--success',
	danger: 'wtag--danger',
	warning: 'wtag--warning',
	info: 'wtag--info',
	light: 'wtag--light',
	dark: 'wtag--dark',
};
