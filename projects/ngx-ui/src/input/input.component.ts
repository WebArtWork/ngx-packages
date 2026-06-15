import {
	AfterViewInit,
	Component,
	ElementRef,
	computed,
	input,
	model,
	output,
	signal,
	viewChild,
} from '@angular/core';
import { FormField, type Field } from '@angular/forms/signals';
import { TranslateDirective } from '@wawjs/ngx-translate';
import { MaterialComponent } from '../material/material.component';
import {
	ManualDisabledDirective,
	ManualTypeDirective,
} from './manual-input.directives';
import { inputDefaults } from './input.const';
import { InputIconAction } from './input.interface';
import { InputType, InputValue } from './input.type';

@Component({
	selector: 'winput',
	imports: [
		FormField,
		TranslateDirective,
		ManualTypeDirective,
		ManualDisabledDirective,
		MaterialComponent,
	],
	templateUrl: './input.component.html',
	styles: [
		`
			.winput {
				display: grid;
				gap: 6px;
			}

			.winput__label {
				font-size: 0.85rem;
				font-weight: 600;
				color: var(--c-text-primary);
			}

			.winput__control {
				display: inline-flex;
				align-items: center;
				gap: var(--sp-2);
				border: 1px solid var(--c-border);
				border-radius: var(--radius);
				background: var(--c-bg-secondary);
				padding: 10px 12px;
				box-shadow: var(--shadow-sm);
			}

			.winput__control:focus-within {
				box-shadow: var(--focus-ring);
			}

			.winput__field {
				flex: 1 1 auto;
				min-width: 0;
				border: 0;
				outline: 0;
				background: transparent;
				color: var(--c-text-primary);
				font: inherit;
			}

			.winput__error {
				font-size: 0.8rem;
				color: var(--c-secondary);
			}
		`,
	],
})
export class InputComponent implements AfterViewInit {
	/* ---------------- Signal forms ---------------- */
	readonly formField = input<Field<any> | null>(null);

	/* ---------------- Template-model mode ---------------- */
	readonly wModel = model<InputValue | null>(null, { alias: 'wModel' });

	/* ---------------- Inputs (all via shared defaults) ---------------- */
	readonly type = input<InputType>(inputDefaults.type);
	readonly name = input(inputDefaults.name);
	readonly label = input(inputDefaults.label);
	readonly placeholder = input(inputDefaults.placeholder);
	readonly items = input<string[]>(inputDefaults.items); // radio/checkbox

	readonly icons = input<InputIconAction[]>(inputDefaults.icons);

	readonly disabled = input(inputDefaults.disabled);
	readonly focused = input(inputDefaults.focused);
	readonly clearable = input(inputDefaults.clearable);
	readonly wClass = input(inputDefaults.wClass);
	readonly autocomplete = input<string | null | undefined>(
		inputDefaults.autocomplete,
	);

	// Optional external error override
	readonly error = input<string | null>(inputDefaults.error);

	/* ---------------- Outputs ---------------- */
	readonly wChange = output<InputValue | null>();
	readonly wSubmit = output<void>();
	readonly wBlur = output<FocusEvent>();
	readonly wFocus = output<FocusEvent>();
	readonly wKeydown = output<KeyboardEvent>();

	/* ---------------- Internal state ---------------- */
	showPassword = signal(false);

	private readonly _inputEl =
		viewChild<ElementRef<HTMLInputElement>>('inputEl');

	/* ---------------- Derived state ---------------- */
	readonly fieldState = computed(() => {
		const f = this.formField();
		return f ? f() : null;
	});

	readonly fieldError = computed<string | null>(() => {
		const explicit = this.error();
		if (explicit) return explicit;

		const state = this.fieldState();
		if (!state) return null;

		const touched =
			typeof state.touched === 'function' ? state.touched() : false;
		const dirty = typeof state.dirty === 'function' ? state.dirty() : false;
		const invalid =
			typeof state.invalid === 'function' ? state.invalid() : false;

		if (!(invalid && (touched || dirty))) {
			return null;
		}

		const rawErrors =
			typeof state.errors === 'function' ? state.errors() : null;

		if (!rawErrors) return null;

		const errorsArray = Array.isArray(rawErrors)
			? rawErrors
			: Object.values(rawErrors);

		if (!errorsArray.length) return null;

		const first = errorsArray[0] as { message?: unknown } | string | null;
		if (!first) return null;

		if (typeof first === 'string') return first;
		if (first.message && typeof first.message === 'string') {
			return first.message;
		}

		return null;
	});

	/* ---------------- Lifecycle ---------------- */
	ngAfterViewInit() {
		if (this.focused() && this._inputEl()) {
			this._inputEl()!.nativeElement.focus();
		}
	}

	/* ---------------- Handlers ---------------- */
	onInput(event: Event, option?: string) {
		const target = event.target as HTMLInputElement | HTMLTextAreaElement;
		const nativeType = (target as HTMLInputElement).type;

		let value: InputValue | null = null;

		if (nativeType === 'checkbox' && target instanceof HTMLInputElement) {
			if (option != null && this.items().length && !this.formField()) {
				const current = this.wModel() as InputValue;
				const list = Array.isArray(current)
					? [...current]
					: [];
				const idx = list.indexOf(option);

				if (target.checked && idx === -1) {
					list.push(option);
				} else if (!target.checked && idx !== -1) {
					list.splice(idx, 1);
				}

				value = list as InputValue;
			} else {
				value = target.checked;
			}
		} else if (nativeType === 'radio') {
			value = option != null ? option : target.value;
		} else {
			value = target.value;
		}

		if (!this.formField()) {
			this.wModel.set(value);
		}

		this.wChange.emit(value);
	}

	onSubmit() {
		this.wSubmit.emit();
	}

	onClear() {
		if (!this.formField()) {
			this.wModel.set(null);
		}
		this.wChange.emit(null);
		this.onSubmit();
		if (this._inputEl()) {
			this._inputEl()!.nativeElement.focus();
		}
	}

	/* ---------------- Utility ---------------- */
	getAutocompleteAttr(type: InputType): string | null {
		const auto = this.autocomplete();
		if (auto !== undefined && auto !== null) return auto;
		return type === 'password' ? 'current-password' : null;
	}

	isItemChecked(item: string): boolean {
		const model = this.wModel();
		return Array.isArray(model) ? (model as readonly unknown[]).includes(item) : !!model;
	}
}
