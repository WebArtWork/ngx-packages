import {
	Component,
	ViewEncapsulation,
	forwardRef,
	input,
	model,
} from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';

@Component({
	selector: 'wtoggle',
	templateUrl: './toggle.component.html',
	styleUrl: './toggle.component.scss',
	encapsulation: ViewEncapsulation.None,
	providers: [
		{
			provide: NG_VALUE_ACCESSOR,
			useExisting: forwardRef(() => ToggleComponent),
			multi: true,
		},
	],
})
export class ToggleComponent implements ControlValueAccessor {
	readonly disabled = model<boolean>(false);
	readonly checked = model<boolean>(false);
	readonly ariaLabel = input<string>('');

	private _onChange: (value: boolean) => void = () => {};
	private _onTouched: () => void = () => {};

	onToggle(value: boolean): void {
		if (this.disabled()) {
			return;
		}

		this.checked.set(value);
		this._onChange(value);
		this._onTouched();
	}

	writeValue(value: boolean): void {
		this.checked.set(!!value);
	}

	registerOnChange(fn: (value: boolean) => void): void {
		this._onChange = fn;
	}

	registerOnTouched(fn: () => void): void {
		this._onTouched = fn;
	}

	setDisabledState(isDisabled: boolean): void {
		this.disabled.set(isDisabled);
	}
}
