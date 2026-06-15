import {
	Component,
	ViewEncapsulation,
} from '@angular/core';

@Component({
	selector: 'wbutton-styles',
	template: '',
	styles: [
		`
			.wbutton {
				cursor: pointer;
				display: inline-flex;
				align-items: center;
				justify-content: center;
				gap: var(--sp-2);
				user-select: none;
				white-space: nowrap;
				border-radius: var(--radius-btn);
				font-family: var(--ff-base);
				letter-spacing: var(--letter-spacing);
				font-weight: 500;
				font-size: 0.875rem;
				line-height: 1;
				padding: var(--sp-3) var(--sp-6);
				border: 1px solid transparent;
			}
		`,
	],
	encapsulation: ViewEncapsulation.None,
})
export class ButtonStylesComponent {}
