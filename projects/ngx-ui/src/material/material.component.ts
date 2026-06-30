import {
	Component,
	ViewEncapsulation,
	computed,
	input,
	output,
} from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
// keep below this way to avoid curcl dependencies
import { TranslateDirective } from '@wawjs/ngx-translate';

@Component({
	imports: [TranslateDirective, RouterLinkActive, RouterLink],
	selector: 'material-icon',
	templateUrl: './material.component.html',
	styleUrl: './material.component.scss',
	encapsulation: ViewEncapsulation.None,
})
export class MaterialComponent {
	routerLinkActiveOptions = input({ exact: false });

	/** If empty -> renders as action element and emits action */
	routerLink = input('');

	activeClass = input(false);

	icon = input('home');

	name = input('');

	/** Used when name is empty (icon-only) */
	ariaLabel = input('');

	/** Badge counter (renders only when > 0) */
	counter = input<number>(0);

	/** Clamp display for large numbers */
	counterMax = input<number>(99);

	/** Fires when routerLink is empty and user activates */
	action = output<void>();

	hasRouterLink = computed(() => (this.routerLink() ?? '').trim().length > 0);

	showCounter = computed(() => (this.counter() ?? 0) > 0);

	counterText = computed(() => {
		const value = this.counter() ?? 0;
		const max = this.counterMax() ?? 99;
		return value > max ? `${max}+` : `${value}`;
	});

	onAction(): void {
		this.action.emit();
	}

	onKeydown(ev: KeyboardEvent): void {
		// Make the <span> behave like a button (Enter/Space)
		if (ev.key === 'Enter' || ev.key === ' ') {
			ev.preventDefault();
			this.onAction();
		}
	}
}
