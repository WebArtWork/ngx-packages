import {
	Component,
	computed,
	input,
	output,
} from '@angular/core';

export type BurgerState = 'three-lines' | 'two-lines' | 'one-line' | 'cross';

@Component({
	selector: 'icon-burger',
	templateUrl: './burger.component.html',
	styles: [
		`
			.burger {
				--burger-size: 44px;
				--bar-w: 24px;
				--bar-h: 2px;
				--bar-gap: 8px;
				display: inline-flex;
			}

			.burger__btn {
				inline-size: var(--burger-size);
				block-size: var(--burger-size);
				display: inline-flex;
				align-items: center;
				justify-content: center;
				cursor: pointer;
				background: transparent;
				border: 0;
				border-radius: var(--radius-btn);
				padding: 0;
			}

			.burger__bar,
			.burger__bar::before,
			.burger__bar::after {
				inline-size: var(--bar-w);
				block-size: var(--bar-h);
				background-color: var(--c-text-primary);
				transition:
					transform var(--motion) var(--easing),
					opacity var(--motion-fast) var(--easing);
			}

			.burger__bar {
				position: relative;
			}

			.burger__bar::before,
			.burger__bar::after {
				content: '';
				position: absolute;
				left: 0;
			}

			.burger__bar::before {
				transform: translateY(calc(var(--bar-gap) * -1));
			}

			.burger__bar::after {
				transform: translateY(var(--bar-gap));
			}

			.burger--one .burger__bar::before,
			.burger--one .burger__bar::after {
				opacity: 0;
			}

			.burger--two .burger__bar,
			.burger--cross .burger__bar {
				background-color: transparent;
			}

			.burger--two .burger__bar::before {
				transform: translateY(calc(var(--bar-gap) / -2));
			}

			.burger--two .burger__bar::after {
				transform: translateY(calc(var(--bar-gap) / 2));
			}

			.burger--cross .burger__bar::before {
				transform: translateY(0) rotate(45deg);
			}

			.burger--cross .burger__bar::after {
				transform: translateY(0) rotate(-45deg);
			}
		`,
	],
})
export class BurgerComponent {
	readonly state = input<BurgerState>('three-lines');

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
