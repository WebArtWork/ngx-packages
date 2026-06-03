import {
	ChangeDetectionStrategy,
	Component,
	computed,
	effect,
	inject,
	input,
	output,
	signal,
	untracked,
	WritableSignal,
} from '@angular/core';
import { CoreService } from '@wawjs/ngx-core';
import { FormComponentInterface } from '../../interfaces/component.interface';
import { FormInterface } from '../../interfaces/form.interface';
import { FormService, JsonSignalForm } from '../../services/form.service';
import { FormcomponentService } from '../../services/formcomponent.service';
import { FormComponentComponent } from '../form-component/form-component.component';

@Component({
	selector: 'wform',
	templateUrl: './form.component.html',
	styles: [
		`
			.wform {
				display: grid;
				gap: var(--sp-3);
			}

			.wform__title {
				font-size: 1.1rem;
				font-weight: 700;
				color: var(--c-text-secondary);
			}

			.wform__subtitle {
				font-size: 0.9rem;
				color: var(--c-text-muted);
			}

			.wform__grid {
				display: grid;
				gap: var(--sp-3);
			}

			.wform__row {
				display: grid;
				gap: var(--sp-3);
				grid-template-columns: repeat(12, minmax(0, 1fr));
			}

			.wform__cell {
				grid-column: span 12;
			}

			.wform__cell._span-1 {
				grid-column: span 1;
			}

			.wform__cell._span-2 {
				grid-column: span 2;
			}

			.wform__cell._span-3 {
				grid-column: span 3;
			}

			.wform__cell._span-4 {
				grid-column: span 4;
			}

			.wform__cell._span-5 {
				grid-column: span 5;
			}

			.wform__cell._span-6 {
				grid-column: span 6;
			}

			.wform__cell._span-7 {
				grid-column: span 7;
			}

			.wform__cell._span-8 {
				grid-column: span 8;
			}

			.wform__cell._span-9 {
				grid-column: span 9;
			}

			.wform__cell._span-10 {
				grid-column: span 10;
			}

			.wform__cell._span-11 {
				grid-column: span 11;
			}

			.wform__cell._span-12 {
				grid-column: span 12;
			}

			.wform__actions {
				display: flex;
				justify-content: flex-end;
				gap: var(--sp-2);
				margin-top: var(--sp-2);
			}

			.wform__card {
				border: 1px solid var(--c-border);
				border-radius: var(--radius);
				background: var(--c-bg-secondary);
				box-shadow: var(--shadow-sm);
				padding: var(--sp-4);
			}
		`,
	],
	imports: [FormComponentComponent],
	changeDetection: ChangeDetectionStrategy.OnPush,
})
export class FormComponent {
	private readonly _coreService = inject(CoreService);
	private readonly _formService = inject(FormService);
	private readonly _formcomponentService = inject(FormcomponentService);

	readonly config = input.required<FormInterface>();
	readonly submition = input<Record<string, unknown> | null>({});

	readonly wChange = output<Record<string, unknown>>();
	readonly wSubmit = output<Record<string, unknown>>();

	private readonly _components = computed<FormComponentInterface[]>(() => {
		return this.config()?.components ?? [];
	});

	readonly visibleComponents = computed<FormComponentInterface[]>(() =>
		this._components()
			.filter((component) => !component?.hidden)
			.concat(
				this._formcomponentService
					.components()
					.filter((component) => component.formId === this.formId)
					.map((component) => {
						const { components: _components, ...schemaComponent } =
							component;

						return schemaComponent as FormComponentInterface;
					}),
			),
	);

	readonly instance = signal<JsonSignalForm | null>(null);

	constructor() {
		effect(() => {
			const cfg = this.config();
			const initial = this.submition();

			if (!cfg) {
				return;
			}

			const inst = untracked(() =>
				this._formService.form(cfg, initial ?? undefined),
			);

			this.instance.set(inst);
		});

		effect(() => {
			const inst = this.instance();

			if (!inst) {
				return;
			}

			this.wChange.emit(inst.model());
		});
	}

	get formId(): string {
		return this.instance()?.id ?? '';
	}

	get fieldTree(): unknown {
		return this.instance()?.form ?? null;
	}

	get model(): WritableSignal<Record<string, unknown>> | null {
		return this.instance()?.model ?? null;
	}

	get title(): string | undefined {
		return this.config()?.title;
	}

	get cssClass(): string {
		return this.config()?.class ?? '';
	}

	onSubmit(): void {
		const inst = this.instance();
		const values = inst ? inst.model() : {};

		this.wSubmit.emit(values);
	}

	onLegacyChange(): void {
		const inst = this.instance();
		const values = inst ? inst.model() : {};

		this._coreService.afterWhile(
			this,
			() => this.wChange.emit(values),
			150,
		);
	}

	onClick(): void {}
}
