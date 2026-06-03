import { JsonPipe } from '@angular/common';
import {
	AfterViewInit,
	ChangeDetectionStrategy,
	Component,
	TemplateRef,
	inject,
	signal,
	viewChild,
} from '@angular/core';
import { FormComponent, FormInterface, FormService } from 'ngx-form';
import { FileComponent, InputComponent, SelectComponent } from 'ngx-ui';

interface TemplateContext {
	props: Record<string, unknown>;
	field: unknown;
	key: string;
	model: { update: (updater: (value: Record<string, unknown>) => Record<string, unknown>) => void };
}

@Component({
	imports: [FileComponent, FormComponent, InputComponent, JsonPipe, SelectComponent],
	templateUrl: './landing.component.html',
	styleUrl: './landing.component.scss',
	changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LandingComponent implements AfterViewInit {
	private readonly _formService = inject(FormService);

	private readonly _inputTpl = viewChild.required<TemplateRef<unknown>>('inputTpl');
	private readonly _selectTpl = viewChild.required<TemplateRef<unknown>>('selectTpl');
	private readonly _fileTpl = viewChild.required<TemplateRef<unknown>>('fileTpl');

	protected readonly latest = signal<Record<string, unknown>>({});

	protected readonly schema: FormInterface = {
		formId: 'ngx-form-demo',
		title: 'Customer request',
		components: [
			{
				name: 'Input',
				key: 'name',
				required: true,
				props: {
					label: 'Name',
					placeholder: 'Enter customer name',
				},
			},
			{
				name: 'Select',
				key: 'priority',
				props: {
					label: 'Priority',
					placeholder: 'Select priority',
					items: [
						{ _id: 'low', name: 'Low' },
						{ _id: 'normal', name: 'Normal' },
						{ _id: 'urgent', name: 'Urgent' },
					],
				},
			},
			{
				name: 'File',
				key: 'attachments',
				props: {
					label: 'Attachments',
					multiple: true,
				},
			},
		],
	};

	protected readonly initial = {
		name: 'Web Art Work',
		priority: 'normal',
	};

	ngAfterViewInit(): void {
		this._formService.addTemplateComponent('Input', this._inputTpl());
		this._formService.addTemplateComponent('Select', this._selectTpl());
		this._formService.addTemplateComponent('File', this._fileTpl());
	}

	protected setModelValue(ctx: TemplateContext, value: unknown): void {
		ctx.model.update(model => ({
			...model,
			[ctx.key]: value,
		}));
	}
}
