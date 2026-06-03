import { NgTemplateOutlet } from '@angular/common';
import {
	ChangeDetectionStrategy,
	Component,
	effect,
	inject,
	input,
	output,
	signal,
	TemplateRef,
	WritableSignal,
} from '@angular/core';
import { FormComponentInterface } from '../../interfaces/component.interface';
import { FormInterface } from '../../interfaces/form.interface';
import { FormService } from '../../services/form.service';

@Component({
	selector: 'form-component',
	templateUrl: './form-component.component.html',
	styles: [
		`
			:host {
				display: block;
				position: relative;
			}

			.wformc {
				position: relative;
				padding: 0;
			}

			.wformc__item {
				display: block;
				margin: 0 0 10px;
			}
		`,
	],
	imports: [NgTemplateOutlet],
	changeDetection: ChangeDetectionStrategy.OnPush,
})
export class FormComponentComponent {
	private readonly _form = inject(FormService);

	readonly index = input<string>('');
	readonly formId = input<string>('');
	readonly config = input.required<FormInterface>();
	readonly component = input.required<FormComponentInterface>();
	readonly submition = input<Record<string, unknown> | null>({});
	readonly model = input<WritableSignal<Record<string, unknown>> | null>(
		null,
	);
	readonly fieldTree = input<unknown | null>(null);

	readonly wSubmit = output<Record<string, unknown>>();
	readonly wChange = output<void>();
	readonly wClick = output<void>();

	readonly template = signal<TemplateRef<unknown> | null>(null);

	constructor() {
		effect(() => {
			this._form.templatesVersion();

			const name = this.component().name;

			this.template.set(
				name ? this._form.getTemplateComponent(name) : null,
			);
		});
	}

	hasChildren(): boolean {
		return (
			Array.isArray(this.component().components) &&
			!!this.component().components?.length
		);
	}

	effectiveKey(): string | null {
		const key = this.component().key;

		if (!key) {
			return null;
		}

		if (!key.includes('[]')) {
			return key;
		}

		const idxStr = (this.index() || '').split('_').pop() || '0';
		const idx = Number.isFinite(+idxStr) ? +idxStr : 0;

		return key.replace(/\[\]/g, `[${idx}]`);
	}

	get field(): unknown {
		const tree = this.fieldTree();
		const key = this.effectiveKey();

		if (!tree || !key) {
			return null;
		}

		return (tree as Record<string, unknown>)[key];
	}

	submit(): void {
		this.wSubmit.emit(this.submition() || {});
	}

	change(): void {
		this.wChange.emit();
	}

	click(): void {
		this.wClick.emit();
	}
}
