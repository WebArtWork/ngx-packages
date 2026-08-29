export interface ServiceMethodDoc {
	name: string;
	signature: string;
	description: string;
	details?: string[];
	example?: string;
	category?: string;
	docType?: 'Service' | 'Component' | 'Interface' | 'Type' | 'Const';
	sourceFile?: string;
}

export interface ServiceSectionDoc {
	title: string;
	items: string[];
	example?: string;
}

export interface ServiceDoc {
	slug: string;
	name: string;
	description: string;
	summary: string;
	highlights: string[];
	config?: string[];
	availableItems?: string[];
	properties?: ServiceMethodDoc[];
	methods: ServiceMethodDoc[];
	sections?: ServiceSectionDoc[];
	code: string;
}

export const serviceDocs: ServiceDoc[] = [
	{
		slug: 'theme-service',
		name: 'ThemeService',
		description:
			'SSR-safe theme state for mode, density, and radius with provider-based initialization.',
		summary:
			'ThemeService owns document-level appearance state for Angular applications. It persists values in localStorage when available, applies data attributes to the html element in the browser, and exposes Angular signals for mode, density, radius, and the active combination index.',
		highlights: [
			'Initializes once through provideTheme(config?) so components do not need to call init() manually.',
			'Applies data-mode, data-density, and data-radius on the document root in the browser.',
			'Persists selected values to configurable localStorage keys and restores them on the next visit.',
		],
		config: [
			'Use provideTheme(config?) once in application providers.',
			'Default values are dark mode, comfortable density, and rounded radius.',
			'Configure modes, densities, radiuses, defaults, persistence, and storage keys through ThemeConfig.',
			'Use html[data-mode], html[data-density], and html[data-radius] selectors in app styles.',
		],
		availableItems: ['provide-theme.ts', 'theme.interface.ts', 'theme.service.ts', 'theme.type.ts'],
		properties: [
			{
				name: 'mode / density / radius',
				signature: 'signals for current theme state',
				description:
					'Reactive values that expose the active mode, spacing density, and radius style.',
				category: 'State',
				sourceFile: 'theme.service.ts',
			},
			{
				name: 'modes / densities / radiuses',
				signature: 'signals for supported option lists',
				description:
					'Available values used by setMode(), setDensity(), setRadius(), and nextTheme().',
				category: 'State',
				sourceFile: 'theme.service.ts',
			},
			{
				name: 'themeIndex',
				signature: 'Signal<number>',
				description:
					'Linear index for the current mode/density/radius combination used by nextTheme().',
				category: 'State',
				sourceFile: 'theme.service.ts',
			},
			{
				name: 'ThemeMode / ThemeDensity / ThemeRadius',
				signature: 'theme option types',
				description:
					'Type aliases that describe supported mode, density, and radius values.',
				category: 'Types',
				docType: 'Type',
				sourceFile: 'theme.type.ts',
			},
			{
				name: 'ThemeConfig',
				signature: 'interface ThemeConfig',
				description:
					'Provider configuration for default theme values, option lists, persistence, and storage keys.',
				category: 'Configuration',
				docType: 'Interface',
				sourceFile: 'theme.interface.ts',
			},
		],
		methods: [
			{
				name: 'provideTheme',
				signature: 'provideTheme(config?: ThemeConfig): EnvironmentProviders',
				description:
					'Registers ThemeConfig and an environment initializer that injects ThemeService and runs init() during app bootstrap.',
				category: 'Providers',
				sourceFile: 'provide-theme.ts',
				example: `import { provideTheme } from 'ngx-ui';

export const appConfig = {
\tproviders: [
\t\tprovideTheme({
\t\t\tmode: 'dark',
\t\t\tmodes: ['light', 'dark', 'contrast'],
\t\t}),
\t],
};`,
			},
			{
				name: 'provideNgxUi',
				signature: 'provideNgxUi(config?: ThemeConfig): EnvironmentProviders',
				description: 'Alias for provideTheme() that follows the package provider naming convention.',
				category: 'Providers',
				sourceFile: 'provide-theme.ts',
			},
			{
				name: 'setMode',
				signature: "setMode(mode: 'light' | 'dark'): void",
				description:
					'Updates the mode signal, html data-mode attribute, and persisted localStorage value.',
				category: 'State',
				sourceFile: 'theme.service.ts',
			},
			{
				name: 'setDensity',
				signature: "setDensity(density: 'comfortable' | 'compact'): void",
				description:
					'Updates the density signal, html data-density attribute, and persisted localStorage value.',
				category: 'State',
				sourceFile: 'theme.service.ts',
			},
			{
				name: 'setRadius',
				signature: "setRadius(radius: 'rounded' | 'square'): void",
				description:
					'Updates the radius signal, html data-radius attribute, and persisted localStorage value.',
				category: 'State',
				sourceFile: 'theme.service.ts',
			},
			{
				name: 'nextTheme',
				signature: 'nextTheme(): void',
				description:
					'Cycles through every mode, density, and radius combination and persists the resulting themeIndex.',
				category: 'State',
				sourceFile: 'theme.service.ts',
			},
			{
				name: 'init',
				signature: 'init(): void',
				description:
					'Loads persisted values and applies them to the document root when the app runs in the browser.',
				details: [
					'Fallback mode is dark when theme.mode is missing.',
					'Fallback density is comfortable and fallback radius is rounded.',
				],
				category: 'Lifecycle',
				sourceFile: 'theme.service.ts',
			},
			{
				name: 'Theme toggle example',
				signature: 'component usage',
				description:
					'Switch between light and dark modes by reading the current signal and calling setMode().',
				category: 'Usage',
				sourceFile: 'theme.service.ts',
				example: `import { Component, inject } from '@angular/core';
import { ThemeService } from 'ngx-ui';

@Component({
\tselector: 'app-theme-toggle',
\ttemplate: '<button type="button" (click)=\"toggleTheme()\">Toggle theme</button>',
})
export class ThemeToggleComponent {
\treadonly themeService = inject(ThemeService);

\ttoggleTheme() {
\t\tconst nextMode = this.themeService.mode() === 'light' ? 'dark' : 'light';
\t\tthis.themeService.setMode(nextMode);
\t}
}`,
			},
			{
				name: 'Early mode script',
				signature: 'small head script before Angular bootstraps',
				description:
					'Prevents initial theme blink by applying the saved mode before the Angular app renders.',
				category: 'Usage',
				example: `<script>
\t(() => {
\t\ttry {
\t\t\tconst mode = localStorage.getItem('theme.mode') || 'dark';
\t\t\tdocument.documentElement.dataset.mode = mode;
\t\t} catch {
\t\t\tdocument.documentElement.dataset.mode = 'dark';
\t\t}
\t})();
</script>`,
			},
		],
		sections: [
			{
				title: 'Feature role',
				items: [
					'ThemeService owns appearance state instead of duplicating localStorage and document dataset logic in components.',
					'provideTheme() keeps initialization close to bootstrap and consistent with standalone Angular apps.',
					'The feature is SSR-safe because document writes and storage access are guarded behind browser checks.',
				],
			},
			{
				title: 'CSS integration',
				items: [
					'Use html[data-mode="light"] and html[data-mode="dark"] for top-level CSS variables.',
					'Use density and radius data attributes to tune spacing and corner systems globally.',
					'Pair the feature with app-specific CSS variables rather than hard-coding colors in components.',
				],
			},
		],
		code: `import { ThemeService, provideTheme } from 'ngx-ui';

export const appConfig = {
\tproviders: [provideTheme({ mode: 'dark' })],
};

readonly themeService = inject(ThemeService);

toggleTheme() {
\tconst nextMode = this.themeService.mode() === 'light' ? 'dark' : 'light';
\tthis.themeService.setMode(nextMode);
}`,
		},
	{
		slug: 'link-component',
		name: 'LinkComponent',
		description:
			'Display-only contact and action link with semantic, type-specific href generation.',
		summary:
			'LinkComponent is the non-editable counterpart to InputComponent. It renders a semantic anchor for contact details and external actions without introducing a hidden input or label wrapper.',
		highlights: [
			'Generates mailto:, tel:, sms:, WhatsApp, and normalized HTTPS URLs from a value and type.',
			'Accepts an explicit href for custom protocols or destinations.',
			'Adds noopener noreferrer automatically for links opened in a new tab.',
		],
		availableItems: ['link.component.ts', 'link.type.ts'],
		properties: [
			{
				name: 'LinkType',
				signature: "'email' | 'tel' | 'url' | 'sms' | 'whatsapp' | 'custom'",
				description: 'Selects the generated href scheme when href is not supplied explicitly.',
				category: 'Types',
				docType: 'Type',
				sourceFile: 'link.type.ts',
			},
			{
				name: 'value / type / href',
				signature: 'input values',
				description:
					'value is displayed and used to derive the target; href overrides generated targets.',
				category: 'Inputs',
				docType: 'Component',
				sourceFile: 'link.component.ts',
			},
		],
		methods: [
			{
				name: 'wClick',
				signature: 'output<MouseEvent>()',
				description: 'Emits when an enabled link is activated.',
				category: 'Outputs',
				docType: 'Component',
				sourceFile: 'link.component.ts',
			},
		],
		sections: [
			{
				title: 'Accessibility',
				items: [
					'Use this component for navigation or contact actions, not as a substitute for a form control.',
					'It uses a real anchor element, preserving native keyboard and screen-reader behavior.',
				],
			},
		],
		code: `import { LinkComponent } from '@wawjs/ngx-ui';

@Component({
	imports: [LinkComponent],
	template: \`
		<wlink label="Email" type="email" value="hello@example.com" icon="email" />
		<wlink label="Website" type="url" value="example.com" target="_blank" />
	\`,
})
export class ContactComponent {}`,
	},
	{
		slug: 'accordion-component',
		name: 'AccordionComponent',
		description: 'Collapsible panel group for progressive disclosure of content.',
		summary:
			'AccordionComponent hosts one or more AccordionPanelComponent children. By default only one panel is expanded at a time; set multiple to allow several panels open simultaneously.',
		highlights: [
			'AccordionPanelComponent exposes a two-way expanded model so panels can be opened programmatically.',
			'Single-open mode collapses other panels automatically when one opens.',
			'Panels can be individually disabled.',
			'Each header/body pair is linked via aria-controls/aria-labelledby (role="region" on the body) for screen readers.',
		],
		availableItems: ['accordion.component.ts', 'accordion-panel.component.ts'],
		properties: [
			{
				name: 'multiple',
				signature: 'input<boolean>(false)',
				description: 'Allows more than one panel to stay open at once.',
				category: 'Inputs',
				docType: 'Component',
				sourceFile: 'accordion.component.ts',
			},
			{
				name: 'header / disabled',
				signature: 'input<string>(\'\') / input<boolean>(false)',
				description: 'Panel header text and disabled state, set on each AccordionPanelComponent.',
				category: 'Inputs',
				docType: 'Component',
				sourceFile: 'accordion-panel.component.ts',
			},
			{
				name: 'expanded',
				signature: 'model<boolean>(false)',
				description: 'Two-way bindable expanded state for a single panel.',
				category: 'Inputs',
				docType: 'Component',
				sourceFile: 'accordion-panel.component.ts',
			},
		],
		methods: [],
		code: `<waccordion [multiple]="true">
	<waccordion-panel header="Billing">Billing details here.</waccordion-panel>
	<waccordion-panel header="Security" [disabled]="true">Security settings here.</waccordion-panel>
</waccordion>`,
	},
	{
		slug: 'avatar-component',
		name: 'AvatarComponent',
		description: 'User avatar rendered from an image, or initials derived from a label.',
		summary:
			'AvatarComponent shows a profile image when supplied, otherwise falls back to an icon or the initials of the label input, with configurable size and shape.',
		highlights: [
			'Falls back to initials generated from label when no image is set.',
			'size supports small, normal, and large; shape supports circle and square.',
		],
		availableItems: ['avatar.component.ts', 'avatar.const.ts'],
		properties: [
			{
				name: 'image / label / icon',
				signature: 'input<string>()',
				description: 'Image URL, source label for initials, and fallback icon name.',
				category: 'Inputs',
				docType: 'Component',
				sourceFile: 'avatar.component.ts',
			},
			{
				name: 'size',
				signature: "input<'small' | 'normal' | 'large'>",
				description: 'Avatar diameter.',
				category: 'Inputs',
				docType: 'Component',
				sourceFile: 'avatar.component.ts',
			},
			{
				name: 'shape',
				signature: "input<'circle' | 'square'>",
				description: 'Avatar outline shape.',
				category: 'Inputs',
				docType: 'Component',
				sourceFile: 'avatar.component.ts',
			},
		],
		methods: [],
		code: `<wavatar label="Kristina Petrova" />
<wavatar image="/avatars/1.png" size="large" />`,
	},
	{
		slug: 'badge-component',
		name: 'BadgeComponent',
		description: 'Small status or count indicator, typically overlaid on another element.',
		summary:
			'BadgeComponent renders a compact value pill styled by severity type, useful for counts or status dots next to icons and buttons.',
		highlights: ['type controls severity color.', 'value accepts a string or number.'],
		availableItems: ['badge.component.ts', 'badge.const.ts', 'badge.type.ts'],
		properties: [
			{
				name: 'type',
				signature: 'input<BadgeType>',
				description: 'Severity styling for the badge.',
				category: 'Inputs',
				docType: 'Component',
				sourceFile: 'badge.component.ts',
			},
			{
				name: 'value / size',
				signature: "input<string | number>() / input<'small' | 'large'>()",
				description: 'Badge content and size.',
				category: 'Inputs',
				docType: 'Component',
				sourceFile: 'badge.component.ts',
			},
		],
		methods: [],
		code: `<wbadge type="danger" [value]="3" />`,
	},
	{
		slug: 'breadcrumb-component',
		name: 'BreadcrumbComponent',
		description: 'Navigation trail rendered from an ordered list of breadcrumb items.',
		summary:
			'BreadcrumbComponent renders a list of items with optional routerLink or href targets, ending in the current page.',
		highlights: ['items accepts label, routerLink, and href per crumb.', 'homeIcon customizes the leading icon.'],
		availableItems: ['breadcrumb.component.ts', 'breadcrumb.interface.ts'],
		properties: [
			{
				name: 'items',
				signature: 'input<BreadcrumbItem[]>([])',
				description: 'Ordered breadcrumb entries.',
				category: 'Inputs',
				docType: 'Component',
				sourceFile: 'breadcrumb.component.ts',
			},
			{
				name: 'homeIcon',
				signature: "input<string>('home')",
				description: 'Icon rendered before the first crumb.',
				category: 'Inputs',
				docType: 'Component',
				sourceFile: 'breadcrumb.component.ts',
			},
		],
		methods: [],
		code: `<wbreadcrumb [items]="[{ label: 'Settings', routerLink: '/settings' }, { label: 'Profile' }]" />`,
	},
	{
		slug: 'card-component',
		name: 'CardComponent',
		description: 'Content container with an optional title and subtitle header.',
		summary: 'CardComponent wraps projected content in a bordered, padded surface with an optional header.',
		highlights: ['title and subtitle render a header block above the projected content.'],
		availableItems: ['card.component.ts'],
		properties: [
			{
				name: 'title / subtitle',
				signature: 'input<string>()',
				description: 'Header text rendered above the card body.',
				category: 'Inputs',
				docType: 'Component',
				sourceFile: 'card.component.ts',
			},
		],
		methods: [],
		code: `<wcard title="Invoice #1042" subtitle="Due Aug 30">
	Invoice line items go here.
</wcard>`,
	},
	{
		slug: 'chart-component',
		name: 'ChartComponent',
		description: 'Thin Chart.js wrapper for rendering charts from declarative data and options.',
		summary:
			'ChartComponent renders a Chart.js chart inside a canvas, re-rendering when type, data, or options inputs change. chart.js is an optional peer dependency that must be installed by consuming apps.',
		highlights: [
			'type and data are required inputs.',
			'Accepts the same ChartData/ChartOptions shapes as Chart.js.',
			'Renders a visually-hidden data table alongside the canvas as a screen-reader fallback; pass description for its aria-label/caption.',
		],
		availableItems: ['chart.component.ts'],
		properties: [
			{
				name: 'type',
				signature: 'input.required<ChartType>()',
				description: 'Chart.js chart type, e.g. bar, line, pie.',
				category: 'Inputs',
				docType: 'Component',
				sourceFile: 'chart.component.ts',
			},
			{
				name: 'data',
				signature: 'input.required<ChartData>()',
				description: 'Chart.js dataset configuration.',
				category: 'Inputs',
				docType: 'Component',
				sourceFile: 'chart.component.ts',
			},
			{
				name: 'options',
				signature: 'input<ChartOptions>()',
				description: 'Optional Chart.js options object.',
				category: 'Inputs',
				docType: 'Component',
				sourceFile: 'chart.component.ts',
			},
		],
		methods: [],
		sections: [
			{
				title: 'Peer dependency',
				items: ['Install chart.js in the consuming app before using <wchart>.'],
			},
		],
		code: `<wchart
	type="bar"
	[data]="{
		labels: ['Mon', 'Tue', 'Wed'],
		datasets: [{ label: 'Visits', data: [12, 19, 7] }]
	}"
/>`,
	},
	{
		slug: 'chip-component',
		name: 'ChipComponent',
		description: 'Compact, optionally removable token for tags, filters, or selections.',
		summary: 'ChipComponent displays a value with an optional icon or image and an optional remove action.',
		highlights: ['removable shows a close affordance that emits wRemove.'],
		availableItems: ['chip.component.ts'],
		properties: [
			{
				name: 'value / icon / image',
				signature: 'input<string>()',
				description: 'Chip label text and optional icon or image.',
				category: 'Inputs',
				docType: 'Component',
				sourceFile: 'chip.component.ts',
			},
			{
				name: 'removable',
				signature: 'input<boolean>(false)',
				description: 'Shows a remove control on the chip.',
				category: 'Inputs',
				docType: 'Component',
				sourceFile: 'chip.component.ts',
			},
		],
		methods: [
			{
				name: 'wRemove',
				signature: 'output<void>()',
				description: 'Emits when the remove control is activated.',
				category: 'Outputs',
				docType: 'Component',
				sourceFile: 'chip.component.ts',
			},
		],
		code: `<wchip [value]="'Angular'" icon="code" [removable]="true" (wRemove)="remove()" />`,
	},
	{
		slug: 'confirm-service',
		name: 'ConfirmService',
		description: 'Programmatic confirm modal and a directive for inline confirm popups.',
		summary:
			'ConfirmService opens a ConfirmDialogComponent through ModalService for destructive or important actions. ConfirmPopupDirective attaches an inline confirm popup to a trigger element instead of a full modal.',
		highlights: [
			'confirm() merges DEFAULT_CONFIRM_CONFIG with the supplied Confirm options and shows it via ModalService.',
			'[wconfirmPopup] renders an anchored popup with accept/reject outputs, no ModalService involved.',
			'The dialog uses role="alertdialog" with aria-labelledby/aria-describedby; the popup moves focus in on open, closes on Escape, and restores focus to the trigger on close.',
		],
		availableItems: [
			'confirm.service.ts',
			'confirm.interface.ts',
			'confirm-dialog.component.ts',
			'confirm-popup.directive.ts',
			'confirm-popup-styles.component.ts',
		],
		properties: [
			{
				name: 'Confirm',
				signature: 'interface Confirm',
				description:
					'message, header, icon, acceptLabel, rejectLabel, acceptType, rejectType, accept(), reject().',
				category: 'Configuration',
				docType: 'Interface',
				sourceFile: 'confirm.interface.ts',
			},
			{
				name: 'wconfirmPopup / acceptLabel / rejectLabel',
				signature: 'input<string>',
				description: 'Popup message and button labels for ConfirmPopupDirective.',
				category: 'Inputs',
				docType: 'Component',
				sourceFile: 'confirm-popup.directive.ts',
			},
		],
		methods: [
			{
				name: 'confirm',
				signature: 'confirm(opts: Confirm): void',
				description: 'Opens the confirm modal, calling accept() or reject() based on the user choice.',
				category: 'Methods',
				sourceFile: 'confirm.service.ts',
			},
			{
				name: 'wAccept / wReject',
				signature: 'output<void>()',
				description: 'ConfirmPopupDirective outputs emitted when the inline popup is accepted or rejected.',
				category: 'Outputs',
				docType: 'Component',
				sourceFile: 'confirm-popup.directive.ts',
			},
		],
		sections: [
			{
				title: 'Setup',
				items: ['Render <wconfirm-popup-styles /> once in the app shell when using [wconfirmPopup].'],
			},
		],
		code: `const confirm = inject(ConfirmService);

confirm.confirm({
	message: 'Delete this item?',
	accept: () => remove(),
});

// or inline:
// <button wconfirmPopup="Are you sure?" (wAccept)="remove()">Delete</button>`,
	},
	{
		slug: 'divider-component',
		name: 'DividerComponent',
		description: 'Horizontal or vertical separator, optionally with a projected label.',
		summary: 'DividerComponent draws a styled rule, with layout and line type variants, and can wrap label content.',
		highlights: ['layout supports horizontal and vertical.', 'type supports solid, dashed, and dotted lines.'],
		availableItems: ['divider.component.ts'],
		properties: [
			{
				name: 'layout',
				signature: "input<'horizontal' | 'vertical'>('horizontal')",
				description: 'Divider orientation.',
				category: 'Inputs',
				docType: 'Component',
				sourceFile: 'divider.component.ts',
			},
			{
				name: 'type',
				signature: "input<'solid' | 'dashed' | 'dotted'>('solid')",
				description: 'Line style.',
				category: 'Inputs',
				docType: 'Component',
				sourceFile: 'divider.component.ts',
			},
		],
		methods: [],
		code: `<wdivider>OR</wdivider>
<wdivider layout="vertical" />`,
	},
	{
		slug: 'editor-component',
		name: 'EditorComponent',
		description: 'Lightweight contenteditable-based rich text editor for basic formatting.',
		summary:
			'EditorComponent provides a toolbar with a small set of formatting commands (bold, italic, lists by default) over a contenteditable region, bound through wModel. For full-featured editing use @wawjs/ngx-tinymce instead.',
		highlights: [
			'wModel is a two-way model producing HTML content.',
			'commands lets consumers override the default toolbar command set.',
		],
		availableItems: ['editor.component.ts'],
		properties: [
			{
				name: 'wModel',
				signature: "model<string>('')",
				description: 'Two-way bound HTML content of the editor.',
				category: 'Inputs',
				docType: 'Component',
				sourceFile: 'editor.component.ts',
			},
			{
				name: 'placeholder / disabled',
				signature: "input<string>('') / input<boolean>(false)",
				description: 'Placeholder text and disabled state.',
				category: 'Inputs',
				docType: 'Component',
				sourceFile: 'editor.component.ts',
			},
			{
				name: 'commands',
				signature: 'input<EditorCommand[]>(DEFAULT_COMMANDS)',
				description: 'Toolbar command list.',
				category: 'Inputs',
				docType: 'Component',
				sourceFile: 'editor.component.ts',
			},
		],
		methods: [],
		code: `<weditor [(wModel)]="bioHtml" placeholder="Write your bio..." />`,
	},
	{
		slug: 'menu-component',
		name: 'MenuComponent',
		description: 'Popup or inline action menu, plus MenubarComponent for horizontal navigation menus.',
		summary:
			'MenuComponent renders a list of MenuItem entries, optionally as a togglable popup. MenubarComponent renders the same MenuItem shape as a horizontal navigation bar, including nested submenus.',
		highlights: [
			'MenuItem supports label, icon, command, routerLink, href, disabled, separator, and nested items.',
			'popup mode requires calling toggle($event) from a template reference, typically from a trigger button.',
			'role="menu"/"menubar"/"menuitem" with Arrow/Home/End/Escape keyboard navigation and Left/Right into and out of submenus.',
		],
		availableItems: ['menu.component.ts', 'menu-item.component.ts', 'menu.interface.ts', 'menubar.component.ts'],
		properties: [
			{
				name: 'MenuItem',
				signature: 'interface MenuItem',
				description: 'label, icon, command, routerLink, href, disabled, separator, items.',
				category: 'Types',
				docType: 'Interface',
				sourceFile: 'menu.interface.ts',
			},
			{
				name: 'items',
				signature: 'input<MenuItem[]>([])',
				description: 'Menu entries, shared by MenuComponent and MenubarComponent.',
				category: 'Inputs',
				docType: 'Component',
				sourceFile: 'menu.component.ts',
			},
			{
				name: 'popup',
				signature: 'input<boolean>(false)',
				description: 'Renders MenuComponent as a togglable overlay instead of an inline list.',
				category: 'Inputs',
				docType: 'Component',
				sourceFile: 'menu.component.ts',
			},
		],
		methods: [
			{
				name: 'wSelect',
				signature: 'output<MenuItem>()',
				description: 'Emits the selected MenuItem from MenuComponent or MenubarComponent.',
				category: 'Outputs',
				docType: 'Component',
				sourceFile: 'menu.component.ts',
			},
		],
		code: `<wmenu [items]="items" [popup]="true" #menu />
<button wbutton (wClick)="menu.toggle($event)">Actions</button>

<wmenubar [items]="navItems" (wSelect)="onSelect($event)" />`,
	},
	{
		slug: 'metergroup-component',
		name: 'MeterGroupComponent',
		description: 'Segmented meter bar visualizing relative shares of a total.',
		summary: 'MeterGroupComponent renders a stacked bar of MeterItem segments, each with a label, value, and optional color.',
		highlights: ['Segment widths are proportional to each item value relative to the total.'],
		availableItems: ['metergroup.component.ts', 'metergroup.interface.ts'],
		properties: [
			{
				name: 'MeterItem',
				signature: 'interface MeterItem',
				description: 'label, value, and optional color per segment.',
				category: 'Types',
				docType: 'Interface',
				sourceFile: 'metergroup.interface.ts',
			},
			{
				name: 'items',
				signature: 'input<MeterItem[]>',
				description: 'Segments rendered in the meter.',
				category: 'Inputs',
				docType: 'Component',
				sourceFile: 'metergroup.component.ts',
			},
		],
		methods: [],
		code: `<wmetergroup
	[items]="[
		{ label: 'Images', value: 12 },
		{ label: 'Documents', value: 8 },
		{ label: 'Video', value: 4 }
	]"
/>`,
	},
	{
		slug: 'orderlist-component',
		name: 'OrderListComponent',
		description: 'Reorderable list control bound to an array through a two-way model.',
		summary:
			'OrderListComponent renders items with move-up/move-down controls (or drag reordering) and keeps the bound items model in sync with the displayed order.',
		highlights: ['Generic over item type T.', 'bindLabel selects which property renders as the row label.'],
		availableItems: ['orderlist.component.ts'],
		properties: [
			{
				name: 'items',
				signature: 'model<T[]>([])',
				description: 'Two-way bound list of items in display order.',
				category: 'Inputs',
				docType: 'Component',
				sourceFile: 'orderlist.component.ts',
			},
			{
				name: 'bindLabel',
				signature: "input<string>('label')",
				description: 'Property name used to render each row label.',
				category: 'Inputs',
				docType: 'Component',
				sourceFile: 'orderlist.component.ts',
			},
		],
		methods: [],
		code: `<worderlist [(items)]="priorityList" bindLabel="name" />`,
	},
	{
		slug: 'progressbar-component',
		name: 'ProgressBarComponent',
		description: 'Determinate or indeterminate progress indicator bar.',
		summary: 'ProgressBarComponent renders a horizontal progress track, either a fixed percentage or an animated indeterminate mode.',
		highlights: ['mode toggles between determinate and indeterminate.', 'showValue overlays the numeric percentage.'],
		availableItems: ['progressbar.component.ts'],
		properties: [
			{
				name: 'value',
				signature: 'input<number>(0)',
				description: 'Percentage complete, used in determinate mode.',
				category: 'Inputs',
				docType: 'Component',
				sourceFile: 'progressbar.component.ts',
			},
			{
				name: 'mode',
				signature: "input<'determinate' | 'indeterminate'>('determinate')",
				description: 'Progress display mode.',
				category: 'Inputs',
				docType: 'Component',
				sourceFile: 'progressbar.component.ts',
			},
			{
				name: 'showValue',
				signature: 'input<boolean>(true)',
				description: 'Shows the numeric percentage label.',
				category: 'Inputs',
				docType: 'Component',
				sourceFile: 'progressbar.component.ts',
			},
		],
		methods: [],
		code: `<wprogressbar [value]="uploadPercent()" />
<wprogressbar mode="indeterminate" />`,
	},
	{
		slug: 'spinner-component',
		name: 'SpinnerComponent',
		description: 'Circular loading indicator.',
		summary: 'SpinnerComponent renders an animated SVG spinner with configurable size and stroke width.',
		highlights: ['size accepts any CSS length.', 'strokeWidth controls the ring thickness.'],
		availableItems: ['spinner.component.ts'],
		properties: [
			{
				name: 'size',
				signature: "input<string>('2rem')",
				description: 'Spinner diameter as a CSS length.',
				category: 'Inputs',
				docType: 'Component',
				sourceFile: 'spinner.component.ts',
			},
			{
				name: 'strokeWidth',
				signature: 'input<number>(3)',
				description: 'Ring stroke width.',
				category: 'Inputs',
				docType: 'Component',
				sourceFile: 'spinner.component.ts',
			},
		],
		methods: [],
		code: `<wspinner size="2.5rem" [strokeWidth]="4" />`,
	},
	{
		slug: 'tabs-component',
		name: 'TabsComponent',
		description: 'Tabbed content container built from TabsComponent and projected TabPanelComponent items.',
		summary:
			'TabsComponent renders a tab strip from projected TabPanelComponent children, tracking the active tab through a two-way activeIndex model.',
		highlights: [
			'activeIndex is a two-way model.',
			'Individual TabPanelComponent entries can be disabled.',
			'Roving tabindex with Left/Right/Home/End keyboard navigation, per the WAI-ARIA APG Tabs pattern.',
		],
		availableItems: ['tabs.component.ts', 'tab-panel.component.ts'],
		properties: [
			{
				name: 'activeIndex',
				signature: 'model<number>(0)',
				description: 'Two-way bound index of the active tab.',
				category: 'Inputs',
				docType: 'Component',
				sourceFile: 'tabs.component.ts',
			},
			{
				name: 'header / disabled',
				signature: "input<string>('') / input<boolean>(false)",
				description: 'Tab label and disabled state, set on each TabPanelComponent.',
				category: 'Inputs',
				docType: 'Component',
				sourceFile: 'tab-panel.component.ts',
			},
		],
		methods: [],
		code: `<wtabs [(activeIndex)]="tab">
	<wtab header="Overview">Overview content.</wtab>
	<wtab header="Activity">Activity content.</wtab>
</wtabs>`,
	},
	{
		slug: 'tag-component',
		name: 'TagComponent',
		description: 'Inline label for status or category, styled by severity type.',
		summary: 'TagComponent renders a small pill with optional icon, colored according to type, with an optional rounded style.',
		highlights: ['type controls severity color.', 'rounded switches between pill and rectangular corners.'],
		availableItems: ['tag.component.ts', 'tag.const.ts', 'tag.type.ts'],
		properties: [
			{
				name: 'type',
				signature: 'input<TagType>',
				description: 'Severity styling for the tag.',
				category: 'Inputs',
				docType: 'Component',
				sourceFile: 'tag.component.ts',
			},
			{
				name: 'value / icon / rounded',
				signature: "input<string>() / input<string>() / input<boolean>",
				description: 'Tag text, optional icon, and pill-shaped corners.',
				category: 'Inputs',
				docType: 'Component',
				sourceFile: 'tag.component.ts',
			},
		],
		methods: [],
		code: `<wtag type="success" icon="check">Active</wtag>`,
	},
	{
		slug: 'timeline-component',
		name: 'TimelineComponent',
		description: 'Vertical timeline of dated or ordered events.',
		summary: 'TimelineComponent renders a connected list of TimelineItem entries, each with a label, optional date, icon, and color.',
		highlights: ['Items render in the order supplied.'],
		availableItems: ['timeline.component.ts', 'timeline.interface.ts'],
		properties: [
			{
				name: 'TimelineItem',
				signature: 'interface TimelineItem',
				description: 'label, content, icon, color, date.',
				category: 'Types',
				docType: 'Interface',
				sourceFile: 'timeline.interface.ts',
			},
			{
				name: 'items',
				signature: 'input<TimelineItem[]>',
				description: 'Ordered timeline entries.',
				category: 'Inputs',
				docType: 'Component',
				sourceFile: 'timeline.component.ts',
			},
		],
		methods: [],
		code: `<wtimeline
	[items]="[
		{ label: 'Order placed', date: 'Aug 1', icon: 'shopping_cart' },
		{ label: 'Shipped', date: 'Aug 3', icon: 'local_shipping' },
		{ label: 'Delivered', date: 'Aug 5', icon: 'check' }
	]"
/>`,
	},
	{
		slug: 'toggle-component',
		name: 'ToggleComponent',
		description: 'Switch control implementing ControlValueAccessor for reactive and template-driven forms.',
		summary: 'ToggleComponent renders an accessible switch with a two-way checked model, and also works as a form control.',
		highlights: ['checked and disabled are two-way models.', 'Implements ControlValueAccessor for [(ngModel)] or reactive forms.'],
		availableItems: ['toggle.component.ts'],
		properties: [
			{
				name: 'checked / disabled',
				signature: 'model<boolean>(false)',
				description: 'Two-way bound switch state and disabled flag.',
				category: 'Inputs',
				docType: 'Component',
				sourceFile: 'toggle.component.ts',
			},
			{
				name: 'ariaLabel',
				signature: "input<string>('')",
				description: 'Accessible label for the switch.',
				category: 'Inputs',
				docType: 'Component',
				sourceFile: 'toggle.component.ts',
			},
		],
		methods: [],
		code: `<wtoggle [(checked)]="notificationsEnabled" ariaLabel="Notifications" />`,
	},
	{
		slug: 'tooltip-directive',
		name: 'TooltipDirective',
		description: 'Floating tooltip directive applied to any host element.',
		summary: 'TooltipDirective attaches a floating panel that shows the wtooltip text on hover or focus, positioned relative to the host element.',
		highlights: [
			'tooltipPosition supports top, bottom, left, and right placements.',
			'Uses role="tooltip" with aria-describedby on the host, and closes on Escape.',
		],
		availableItems: ['tooltip.directive.ts', 'tooltip-styles.component.ts'],
		properties: [
			{
				name: 'wtooltip',
				signature: "input<string>('')",
				description: 'Tooltip text.',
				category: 'Inputs',
				docType: 'Component',
				sourceFile: 'tooltip.directive.ts',
			},
			{
				name: 'tooltipPosition',
				signature: "input<TooltipPosition>('top')",
				description: 'Placement of the floating panel relative to the host.',
				category: 'Inputs',
				docType: 'Component',
				sourceFile: 'tooltip.directive.ts',
			},
		],
		methods: [],
		sections: [
			{
				title: 'Setup',
				items: ['Render <wtooltip-styles /> once in the app shell so the floating panel is styled.'],
			},
		],
		code: `<span wtooltip="Shown on hover" tooltipPosition="top">Hover me</span>`,
	},
];

export const serviceDocMap = new Map(serviceDocs.map(doc => [doc.slug, doc]));
