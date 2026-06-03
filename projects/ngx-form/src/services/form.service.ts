import {
	inject,
	Injectable,
	Injector,
	runInInjectionContext,
	signal,
	TemplateRef,
	WritableSignal,
} from '@angular/core';
import { form as buildSignalForm, required } from '@angular/forms/signals';
import { StoreService } from '@wawjs/ngx-core';
import { CrudConfig, CrudService } from '@wawjs/ngx-crud';
import { NGX_FORM_CONFIG, NgxFormModal } from '../config.interface';
import { FormComponentInterface } from '../interfaces/component.interface';
import { Form, FormInterface } from '../interfaces/form.interface';
import { ModalFormComponent } from '../modals/modal-form/modal-form.component';
import { ModalUniqueComponent } from '../modals/modal-unique/modal-unique.component';

export interface FormModalButton {
	click: (submition: unknown, close: () => void) => void;
	label: string;
	class?: string;
}

export interface JsonSignalForm {
	id: string;
	model: WritableSignal<Record<string, unknown>>;
	form: unknown;
	schema: FormInterface;
}

function formCrudConfig(): CrudConfig<Form> {
	const config = inject(NGX_FORM_CONFIG);

	return {
		name: 'form',
		appId: config.appId,
	};
}

@Injectable({ providedIn: 'root' })
export class FormService extends CrudService<Form> {
	private readonly _ngxFormConfig = inject(NGX_FORM_CONFIG);
	private readonly _formStoreService = inject(StoreService);
	private readonly _formInjector = inject(Injector);

	readonly appId = this._ngxFormConfig.appId ?? '';
	readonly templatesVersion = signal(0);
	readonly formIds = signal<string[]>([]);

	private readonly _templateComponent = new Map<string, TemplateRef<unknown>>();
	private readonly _signalForms = new Map<string, JsonSignalForm>();

	templateFields: Record<string, string[]> = {};
	customTemplateFields: Record<string, Record<string, string>> = {};
	forms: FormInterface[] = [];

	constructor() {
		super(formCrudConfig());

		void this._restoreFormIds();

		if (this.appId) {
			this.get({
				query: 'appId=' + encodeURIComponent(this.appId),
			});
		}
	}

	addTemplateComponent<T>(name: string, template: TemplateRef<T>): void {
		if (this._templateComponent.has(name)) {
			return;
		}

		this._templateComponent.set(
			name,
			template as unknown as TemplateRef<unknown>,
		);
		this.templatesVersion.update((version) => version + 1);
	}

	removeTemplateComponent(name: string): void {
		if (this._templateComponent.delete(name)) {
			this.templatesVersion.update((version) => version + 1);
		}
	}

	getTemplateComponent(name: string): TemplateRef<unknown> | null {
		return this._templateComponent.get(name) ?? null;
	}

	getTemplateComponentsNames(): string[] {
		return Array.from(this._templateComponent.keys());
	}

	getTemplateFields(name: string): string[] {
		return this.templateFields[name] || ['Placeholder', 'Label'];
	}

	setTemplateFields(
		name: string,
		fields: string[],
		customFields: Record<string, string> = {},
	): void {
		this.templateFields[name] = fields;
		this.customTemplateFields[name] = {
			...(this.customTemplateFields[name] || {}),
			...customFields,
		};
	}

	getCustomTemplateFields(name: string): Record<string, string> {
		return this.customTemplateFields[name] || {};
	}

	getDefaultForm(
		formId: string,
		keys = ['name', 'description'],
	): FormInterface {
		this._rememberFormId(formId);

		const components: FormComponentInterface[] = keys.map((fullKey, i) => {
			const base = fullKey.includes('.') ? fullKey.split('.')[1] : 'Text';
			const label = (fullKey.split('.')[0] || fullKey).replace(
				/\[\]|\[\d+\]/g,
				'',
			);

			return {
				name: base,
				key: fullKey,
				focused: i === 0,
				props: {
					placeholder: `Enter your ${label}`,
					label: label.charAt(0).toUpperCase() + label.slice(1),
				},
			};
		});

		return { formId, components };
	}

	form(
		form: FormInterface,
		initial?: Record<string, unknown>,
	): JsonSignalForm {
		if (form.formId) {
			this._rememberFormId(form.formId);
		}

		const id = form.formId || this._createFormId();

		form.formId = id;

		const existing = this._signalForms.get(id);

		if (existing) {
			if (initial && Object.keys(initial).length) {
				existing.model.set(
					this._buildInitialModel(form, {
						...(existing.model() ?? {}),
						...initial,
					}),
				);
			}

			return existing;
		}

		const model = signal<Record<string, unknown>>(
			this._buildInitialModel(form, initial ?? {}),
		);

		const formTree = runInInjectionContext(this._formInjector, () =>
			buildSignalForm(model, (schema) => {
				this._applyValidators(schema, form);
			}),
		);

		const instance: JsonSignalForm = {
			id,
			model,
			form: formTree,
			schema: form,
		};

		this._signalForms.set(id, instance);

		return instance;
	}

	modal<T>(
		form: FormInterface | FormInterface[],
		buttons: FormModalButton | FormModalButton[] = [],
		submition: unknown = { data: {} },
		change: (update: T) => void | Promise<void> = (_update: T): void => {},
		modalOptions: Partial<NgxFormModal> = {},
	): Promise<T> {
		const forms = Array.isArray(form) ? form : [form];

		forms.forEach((schema) =>
			this.form(schema, submition as Record<string, unknown>),
		);

		return new Promise((resolve) => {
			this._showModal({
				...modalOptions,
				component: ModalFormComponent,
				class: 'forms_modalService',
				size: 'big',
				form,
				modalButtons: Array.isArray(buttons) ? buttons : [buttons],
				submition,
				onClose: () => resolve(submition as T),
				submit: (update: T) => resolve(update),
				change: (update: T) => {
					void change(update);
				},
			});
		});
	}

	modalDocs<T>(
		docs: T[],
		title = 'Modify content of documents',
	): Promise<T[]> {
		return new Promise((resolve) => {
			const submition = {
				docs: JSON.stringify(docs.length ? docs : [], null, 4),
			};

			this._showModal({
				component: ModalFormComponent,
				class: 'forms_modalService',
				size: 'big',
				submition,
				form: {
					title,
					components: [
						{
							name: 'Ace',
							key: 'docs',
							props: {
								placeholder: 'Fill content of documents...',
							},
						},
					],
				},
				modalButtons: [
					{
						label: 'Update',
						click: (
							_submition: Record<string, unknown>,
							close: () => void,
						) => {
							close();

							const out: T[] = submition.docs
								? JSON.parse(submition.docs)
								: [];

							resolve(out);
						},
					},
				],
			});
		});
	}

	modalUnique<T extends Record<string, unknown>>(
		module: string,
		field: string,
		doc: T,
		component = '',
		onClose: () => void | Promise<void> = (): void => {},
	): void {
		const form = this.getDefaultForm('unique', [
			field + (component ? '.' + component : ''),
		]);

		this.form(form, doc);

		this._showModal({
			component: ModalUniqueComponent,
			form,
			module,
			field,
			doc,
			class: 'forms_modalService',
			onClose: () => {
				void onClose();
			},
		});
	}

	getComponent(form: FormInterface, key: string): FormComponentInterface {
		return this._getComponent(form.components, key) || {};
	}

	getProp<T = unknown>(
		form: FormInterface,
		key: string,
		prop: string,
	): T | null {
		const comp = this.getComponent(form, key);

		return (comp?.props?.[prop] as T) ?? null;
	}

	setProp(
		form: FormInterface,
		key: string,
		prop: string,
		value: unknown,
	): void {
		const comp = this.getComponent(form, key);

		comp.props = comp.props || {};
		comp.props[prop] = value;
	}

	reset(formId: string, next: Record<string, unknown> = {}): void {
		const inst = this._signalForms.get(formId);

		if (!inst) {
			return;
		}

		inst.model.set(this._buildInitialModel(inst.schema, next));
	}

	private _buildInitialModel(
		form: FormInterface,
		initial: Record<string, unknown> = {},
	): Record<string, unknown> {
		const model: Record<string, unknown> = { ...initial };

		this._traverseComponents(form.components, (component) => {
			if (component.key && !(component.key in model)) {
				model[component.key] = null;
			}
		});

		return model;
	}

	private _applyValidators(schema: unknown, form: FormInterface): void {
		this._traverseComponents(form.components, (component) => {
			if (!component.key) {
				return;
			}

			const field = (schema as Record<string, unknown>)[component.key];

			if (!field) {
				return;
			}

			const label =
				(component.props?.['label'] as string | undefined) ??
				component.key;

			if (component.required) {
				required(field as Parameters<typeof required>[0], {
					message: `${label} is required`,
				});
			}
		});
	}

	private _traverseComponents(
		components: FormComponentInterface[] | undefined,
		visitor: (component: FormComponentInterface) => void,
	): void {
		if (!components?.length) {
			return;
		}

		for (const component of components) {
			visitor(component);

			if (component.components?.length) {
				this._traverseComponents(component.components, visitor);
			}
		}
	}

	private _getComponent(
		components: FormComponentInterface[] = [],
		key: string,
	): FormComponentInterface | null {
		for (const component of components) {
			if (component.key === key) {
				return component;
			}

			if (component.components?.length) {
				const found = this._getComponent(component.components, key);

				if (found) {
					return found;
				}
			}
		}

		return null;
	}

	private _rememberFormId(formId: string): void {
		if (!formId || this.formIds().includes(formId)) {
			return;
		}

		this.formIds.update((formIds) => [...formIds, formId]);
		void this._formStoreService.setJson('formIds', this.formIds());
	}

	private async _restoreFormIds(): Promise<void> {
		const formIds = await this._formStoreService.getJson<string[]>(
			'formIds',
			{
				defaultValue: [],
			},
		);

		if (Array.isArray(formIds)) {
			this.formIds.set(formIds);
		}
	}

	private _showModal(modal: NgxFormModal): void {
		if (!this._ngxFormConfig.modalService) {
			throw new Error(
				'NgxForm modal helpers require provideNgxForm({ modalService }).',
			);
		}

		this._ngxFormConfig.modalService.show(modal);
	}

	private _createFormId(): string {
		const randomUUID = globalThis.crypto?.randomUUID;

		if (typeof randomUUID === 'function') {
			return randomUUID.call(globalThis.crypto);
		}

		return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
			const r = (Math.random() * 16) | 0;
			const v = c === 'x' ? r : (r & 0x3) | 0x8;

			return v.toString(16);
		});
	}
}
