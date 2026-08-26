import {
	ChangeDetectorRef,
	Component,
	ViewEncapsulation,
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

/**
 * @deprecated Wraps `<button>` in an extra `wbutton` host element for no
 * behavioral benefit. Use `ButtonDirective` (`[wbutton]` on a native
 * `<button>` or `<a>`) instead, e.g. `<button wbutton type="primary">`.
 * Will be removed in the next Angular major version bump.
 */
@Component({
	selector: 'wbutton',
	templateUrl: './button.component.html',
	styleUrl: './button.component.scss',
	encapsulation: ViewEncapsulation.None,
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
