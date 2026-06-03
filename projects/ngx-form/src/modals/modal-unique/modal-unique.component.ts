import {
	ChangeDetectionStrategy,
	Component,
	inject,
	input,
} from '@angular/core';
import { HttpService } from '@wawjs/ngx-http';
import { FormComponent } from '../../components/form/form.component';
import { FormInterface } from '../../interfaces/form.interface';

@Component({
	templateUrl: './modal-unique.component.html',
	styles: [
		`
			:host {
				display: block;
			}
		`,
	],
	imports: [FormComponent],
	changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ModalUniqueComponent {
	private readonly _http = inject(HttpService);

	readonly form = input.required<FormInterface>();
	readonly module = input.required<string>();
	readonly field = input.required<string>();
	readonly doc = input.required<Record<string, unknown>>();

	get getDoc(): Record<string, unknown> {
		return this.doc();
	}

	change(_values?: Record<string, unknown>): void {
		this._http
			.post(
				`/api/${this.module()}/unique${this.field() || ''}`,
				this.doc(),
			)
			.subscribe((resp: string) => {
				if (this.doc()[this.field()] !== resp) {
					this.doc()[this.field()] = resp;
				}
			});
	}
}
