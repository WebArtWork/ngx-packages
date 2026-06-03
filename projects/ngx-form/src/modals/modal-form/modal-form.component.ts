import {
	ChangeDetectionStrategy,
	Component,
	inject,
	signal,
} from '@angular/core';
import { CoreService } from '@wawjs/ngx-core';
import { ButtonComponent } from '@wawjs/ngx-ui';
import { FormComponent } from '../../components/form/form.component';
import { FormInterface } from '../../interfaces/form.interface';
import { FormModalButton, FormService } from '../../services/form.service';

@Component({
	templateUrl: './modal-form.component.html',
	styles: [
		`
			:host {
				display: block;
				max-block-size: 100%;
			}

			.modal-form {
				display: flex;
				flex-direction: column;
				min-block-size: 100%;
			}

			.modal-form__body {
				flex: 1 1 auto;
				min-block-size: 0;
				margin-top: var(--sp-3);
			}

			.modal-form__actions {
				position: sticky;
				inset-block-end: calc(-1 * var(--sp-4));
				padding-block-start: var(--sp-3);
				padding-block-end: var(--sp-3);
				background: var(--c-bg-secondary);
			}

			.modal-form__button {
				width: 100%;
				display: block;
			}
		`,
	],
	imports: [FormComponent, ButtonComponent],
	changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ModalFormComponent {
	private readonly _coreService = inject(CoreService);
	private readonly _formService = inject(FormService);

	form!: FormInterface;
	submition!: Record<string, unknown>;
	modalButtons!: FormModalButton[];
	close!: () => void;
	submit: (form: unknown) => void = (_form: unknown): void => {};
	change: (form: unknown) => void = (_form: unknown): void => {};

	readonly submitting = signal(false);

	resetOnSubmit = false;

	handleSubmit(values?: Record<string, unknown>): void {
		this.submitting.set(true);

		try {
			this._sync(values);
			this.submit(this.submition);
			this.close();
		} finally {
			this.submitting.set(false);

			if (this.resetOnSubmit && this.form.formId) {
				this._formService.reset(this.form.formId);
			}
		}
	}

	handleChange(values: Record<string, unknown>): void {
		this._sync(values);
		this.change(this.submition);
	}

	onButtonClick(button: FormModalButton): void {
		if (this.submitting()) {
			return;
		}

		button.click(this.submition, this.close);

		if (this.resetOnSubmit && this.form.formId) {
			this._formService.reset(this.form.formId);
		}
	}

	private _sync(update: Record<string, unknown> | undefined | null): void {
		if (!update) {
			return;
		}

		this._coreService.copy(update, this.submition);

		const updateData = update['data'];

		if (updateData && typeof updateData === 'object') {
			this.submition['data'] = this.submition['data'] || {};
			this._coreService.copy(updateData, this.submition['data']);
		}
	}
}
