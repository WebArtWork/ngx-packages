import { Component } from '@angular/core';

@Component({
	selector: 'lib-wrapper',
	templateUrl: './wrapper.component.html',
	styles: [
		`
			.alert-lib-wrapper__alert--top-left {
				top: 0;
				left: 0;
				align-items: flex-start;
			}

			.alert-lib-wrapper__alert--top {
				top: 0;
				left: 0;
				right: 0;
				align-items: center;
			}

			.alert-lib-wrapper__alert--top-right {
				top: 0;
				right: 0;
				align-items: flex-end;
			}

			.alert-lib-wrapper__alert--bottom-right {
				bottom: 0;
				right: 0;
				align-items: flex-end;
			}
		`,
	],
})
/**
 * Container component that provides placeholder elements for alert instances
 * rendered in different screen positions.
 */
export class WrapperComponent {
	readonly baseClasses = [
		'fixed',
		'w-full',
		'pointer-events-none',
		'flex',
		'flex-col',
		'z-[99999]',
	] as const;

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
