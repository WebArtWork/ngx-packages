export interface MenuItem {
	label: string;
	icon?: string;
	command?: () => void;
	routerLink?: string | unknown[];
	href?: string;
	disabled?: boolean;
	separator?: boolean;
	items?: MenuItem[];
}
