import { Component, ViewEncapsulation } from '@angular/core';

@Component({
	selector: 'lib-wrapper',
	templateUrl: './wrapper.component.html',
	styleUrl: './wrapper.component.scss',
	encapsulation: ViewEncapsulation.None,
})
/**
 * Container component that provides placeholder elements for alert instances
 * rendered in different screen positions.
 */
export class WrapperComponent {
	readonly positions = [
		{ id: 'topLeft', class: 'alert-lib-wrapper__alert--top-left' },
		{ id: 'top', class: 'alert-lib-wrapper__alert--top' },
		{ id: 'topRight', class: 'alert-lib-wrapper__alert--top-right' },
		{ id: 'left', class: 'alert-lib-wrapper__alert--left' },
		{ id: 'center', class: 'alert-lib-wrapper__alert--center' },
		{ id: 'right', class: 'alert-lib-wrapper__alert--right' },
		{ id: 'bottomLeft', class: 'alert-lib-wrapper__alert--bottom-left' },
		{ id: 'bottom', class: 'alert-lib-wrapper__alert--bottom' },
		{ id: 'bottomRight', class: 'alert-lib-wrapper__alert--bottom-right' },
	] as const;
}
