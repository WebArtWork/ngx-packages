import { BadgeType } from './badge.type';

export const badgeDefaults = {
	type: 'secondary' as BadgeType,
	extraClass: '',
};

export const WBADGE_TYPE_CLASSES: Record<BadgeType, string> = {
	primary: 'wbadge--primary',
	secondary: 'wbadge--secondary',
	success: 'wbadge--success',
	danger: 'wbadge--danger',
	warning: 'wbadge--warning',
	info: 'wbadge--info',
	light: 'wbadge--light',
	dark: 'wbadge--dark',
};
