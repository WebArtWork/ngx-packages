import {
	ChangeDetectionStrategy,
	ChangeDetectorRef,
	Component,
	inject,
	input,
	output,
} from '@angular/core';
import {
	buttonDefaults,
	WBUTTON_BASE_CLASSES,
	WBUTTON_TYPE_CLASSES,
} from './button.const';
import { ButtonType } from './button.type';

@Component({
	selector: 'wbutton',
	changeDetection: ChangeDetectionStrategy.OnPush,
	templateUrl: './button.component.html',
	styles: [
		`
			:host {
				display: inline-flex;
				align-items: stretch;
			}

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

			.wbutton:focus-visible {
				outline: none;
				box-shadow: var(--focus-ring);
			}

			.wbutton:disabled,
			.wbutton[aria-disabled='true'] {
				opacity: 0.6;
				cursor: not-allowed;
				pointer-events: none;
			}
		`,
	],
})
export class ButtonComponent {
	private _cdr = inject(ChangeDetectorRef);

	readonly type = input<ButtonType>(buttonDefaults.type);
	readonly extraClass = input<string>(buttonDefaults.extraClass);
	readonly disabled = input<boolean>(buttonDefaults.disabled);
	readonly disableSubmit = input<boolean>(buttonDefaults.disableSubmit);
	readonly isMultipleClicksAllowed = input<boolean>(
		buttonDefaults.isMultipleClicksAllowed,
	);

	readonly wClick = output<MouseEvent>();

	readonly baseClasses = WBUTTON_BASE_CLASSES;

	private _cooling = false;

	get isBlocked(): boolean {
		return (
			this.disabled() ||
			(!this.isMultipleClicksAllowed() && this._cooling)
		);
	}

	/** Tailwind variant class for the current type */
	typeClass(): string {
		return (
			WBUTTON_TYPE_CLASSES[this.type()] ?? WBUTTON_TYPE_CLASSES.primary
		);
	}

	clicked(event: MouseEvent): void {
		if (this.isBlocked) {
			event.preventDefault();
			event.stopImmediatePropagation();
			return;
		}

		this.wClick.emit(event);

		if (!this.isMultipleClicksAllowed()) {
			this._cooling = true;
			this._cdr.markForCheck();

			setTimeout(() => {
				this._cooling = false;
				this._cdr.markForCheck();
			}, 2000);
		}
	}

	resolveType(): 'button' | 'submit' {
		return this.disableSubmit() ? 'button' : 'submit';
	}
}
