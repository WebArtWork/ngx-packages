import {
	Component,
	ViewEncapsulation,
	computed,
	input,
	output,
} from '@angular/core';
import { TranslateDirective } from '@wawjs/ngx-translate';

export type BurgerState = 'three-lines' | 'two-lines' | 'one-line' | 'cross';

@Component({
	selector: 'icon-burger',
	templateUrl: './burger.component.html',
	styleUrl: './burger.component.scss',
	encapsulation: ViewEncapsulation.None,
	imports: [TranslateDirective],
})
export class BurgerComponent {
	readonly state = input<BurgerState>('three-lines');

	/** Id of the element this toggle controls (e.g. a nav/drawer), for `aria-controls`. */
	readonly controls = input<string>('');

	/** Overrides the default accessible name. */
	readonly ariaLabel = input<string>('');

	/**
	 * Legacy input (kept for compatibility).
	 * If you still pass [isOpen], it will be respected only when state is not used externally.
	 */
	readonly isOpen = input(false);

	/**
	 * Emits on click (kept name for compatibility).
	 * Value is not meaningful for multi-state; treat as "clicked".
	 */
	readonly updated = output<boolean>();

	/** Emits hover state */
	readonly hovered = output<boolean>();

	readonly _isCross = computed(() => this.state() === 'cross');

	readonly _lines = computed<1 | 2 | 3>(() => {
		switch (this.state()) {
			case 'one-line':
				return 1;
			case 'two-lines':
				return 2;
			case 'cross':
				return 3;
			case 'three-lines':
			default:
				return 3;
		}
	});

	// legacy: if someone still binds [isOpen] but not state mapping, allow cross
	readonly _legacyCross = computed(() => this.isOpen());

	readonly expanded = computed(() => this._isCross() || this._legacyCross());

	readonly resolvedAriaLabel = computed(
		() => this.ariaLabel() || (this.expanded() ? 'Close menu' : 'Open menu'),
	);

	readonly _classes = computed(() => {
		// Cross wins (cross) OR legacy open signal
		const cross = this._isCross() || this._legacyCross();

		return {
			'burger--cross': cross,
			'burger--one': !cross && this._lines() === 1,
			'burger--two': !cross && this._lines() === 2,
			'burger--three': !cross && this._lines() === 3,
		};
	});

	toggle(): void {
		// Controlled: just emit "clicked"
		this.updated.emit(true);
	}

	onHover(v: boolean): void {
		this.hovered.emit(v);
	}
}
