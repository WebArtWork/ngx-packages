import { NgTemplateOutlet } from '@angular/common';
import {
	Component,
	ElementRef,
	Signal,
	TemplateRef,
	ViewEncapsulation,
	computed,
	contentChild,
	effect,
	forwardRef,
	inject,
	input,
	model,
	output,
	signal,
	viewChild,
} from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';
import type { Field } from '@angular/forms/signals';
import { ClickOutsideDirective, CoreService } from '@wawjs/ngx-core';
import { TranslateDirective } from '@wawjs/ngx-translate';
import { InputComponent } from '../input/input.component';
import { selectDefaults } from './select.const';
import {
	WselectItemDirective,
	WselectSearchDirective,
	WselectViewDirective,
} from './select.directives';
import { SelectButton, SelectItem } from './select.interface';
import { SelectId, SelectValue } from './select.type';

@Component({
	selector: 'wselect',
	imports: [
		NgTemplateOutlet,
		TranslateDirective,
		InputComponent,
		ClickOutsideDirective,
	],
	templateUrl: './select.component.html',
	styleUrl: './select.component.scss',
	encapsulation: ViewEncapsulation.None,
	providers: [
		{
			provide: NG_VALUE_ACCESSOR,
			useExisting: forwardRef(() => SelectComponent),
			multi: true,
		},
	],
})
export class SelectComponent implements ControlValueAccessor {
	/* ===== Inputs ===== */
	readonly disabled = input(selectDefaults.disabled);
	readonly clearable = input(selectDefaults.clearable);
	readonly placeholder = input(selectDefaults.placeholder);
	readonly multiple = input(selectDefaults.multiple);
	readonly bindLabel = input(selectDefaults.bindLabel);
	readonly bindValue = input(selectDefaults.bindValue);
	readonly label = input(selectDefaults.label);
	readonly searchable = input(selectDefaults.searchable);
	readonly searchableBy = input(selectDefaults.searchableBy);
	readonly items = input<unknown[]>(selectDefaults.items);
	readonly buttons = input<SelectButton[]>(selectDefaults.buttons);

	/* ===== Signal Forms (canonical: formField) ===== */
	readonly formField = input<Field<SelectValue> | null>(null, {
		alias: 'formField',
	});

	/** Back-compat alias for older templates/docs */
	readonly field = input<Field<SelectValue> | null>(null, {
		alias: 'field',
	});

	private readonly _resolvedField = computed(
		() => this.formField() ?? this.field(),
	);

	/* ==== Projected templates (contentChild) ==== */
	readonly viewTpl = contentChild(WselectViewDirective, {
		read: TemplateRef<unknown>,
	});
	readonly itemTpl = contentChild(WselectItemDirective, {
		read: TemplateRef<unknown>,
	});
	readonly searchTpl = contentChild(WselectSearchDirective, {
		read: TemplateRef<unknown>,
	});

	/** Two-way model (single source of truth) */
	readonly wModel = model<SelectValue>(null, { alias: 'wModel' });

	/** Back-compat event */
	readonly wChange = output<SelectValue>();

	/* ===== Internal state ===== */
	private readonly _core = inject(CoreService);

	/** quick id->label map for header rendering */
	readonly allItem: Record<SelectId, string> = {};

	/** signals array for fast template iteration */
	readonly allItems = signal<Signal<SelectItem>[]>(
		this._core.toSignalsArray<SelectItem>([]),
	);

	/** popup + search */
	readonly showOptions = signal(false);
	readonly search = signal('');

	/** keyboard navigation */
	readonly activeIndex = signal<number>(-1);

	private readonly _popupListEl =
		viewChild<ElementRef<HTMLElement>>('popupListEl');

	/** derived helpers */
	readonly isMulti = computed(() => this.multiple());
	private _disabledCva = false;
	readonly isDisabled = computed(() => this.disabled() || this._disabledCva);

	/** normalize selection for render */
	readonly selectedIds = computed<SelectId[]>(() => {
		const v = this.wModel();
		return this.isMulti()
			? Array.isArray(v)
				? (v as SelectId[])
				: []
			: v == null
				? []
				: [v as SelectId];
	});
	readonly selectedId = computed<SelectId | null>(
		() => this.selectedIds()[0] ?? null,
	);

	/** filtered list for popup (replaces SearchPipe) */
	readonly filteredItems = computed(() => {
		const q = (this.search() ?? '').toString().trim().toLowerCase();
		const list = this.allItems();

		if (!q) return list;

		return list.filter((sig) => {
			const it = sig();
			const hay = (it.__search ?? it.name ?? '').toString().toLowerCase();
			return hay.includes(q);
		});
	});

	/* ===== CVA glue ===== */
	private _onChange: (v: any) => void = () => {};
	private _onTouched: () => void = () => {};

	constructor() {
		/* ===== Signal Forms bridge (field <-> wModel) ===== */
		effect(() => {
			const f = this._resolvedField();
			if (!f) return;

			try {
				// Expect field to be a signal returning { value: Signal<T> }
				const state = f();
				const v = state?.value?.();
				if (!this._equal(this.wModel(), v)) {
					this.wModel.set(v as any);
				}
			} catch {
				// ignore invalid field shape
			}
		});

		effect(() => {
			const f = this._resolvedField();
			if (!f) return;

			try {
				const state = f();
				if (state?.value?.set) {
					state.value.set(this.wModel() as any);
				}
			} catch {
				// ignore invalid field shape
			}
		});

		/* rebuild items mirror on input changes (supports plain items & signals) */
		effect(() => {
			const list = this.items();
			const bindLabel = this.bindLabel();
			const bindValue = this.bindValue();
			const searchBy = this.searchableBy();

			for (const key of Object.keys(this.allItem)) {
				// eslint-disable-next-line @typescript-eslint/no-dynamic-delete
				delete (this.allItem as any)[key];
			}

			const normalized: SelectItem[] = list.map((raw) => {
				let value: any = raw;
				if (typeof raw === 'function') {
					try {
						value = (raw as any)();
					} catch {
						value = raw;
					}
				}

				let id: SelectId;
				let name: string;

				if (
					typeof value === 'string' ||
					typeof value === 'number' ||
					typeof value === 'boolean'
				) {
					id = value as SelectId;
					name = String(value);
				} else if (value && typeof value === 'object') {
					const v: any = value;
					id = (v[bindValue] ?? v._id) as SelectId;
					name = (v[bindLabel] ??
						v.name ??
						v.title ??
						String(id)) as string;
				} else {
					id = String(value) as SelectId;
					name = String(value);
				}

				let searchValue = name;
				if (value && typeof value === 'object' && searchBy) {
					const fields = searchBy.split(/\s+/).filter(Boolean);
					const tokens: string[] = [];
					for (const f of fields) {
						const token = (value as any)[f];
						if (token != null) tokens.push(String(token));
					}
					if (tokens.length) searchValue = tokens.join(' ');
				}

				const item: SelectItem = {
					id,
					name,
					__search: searchValue,
				};

				this.allItem[id] = name;
				return item;
			});

			this.allItems.set(
				this._core.toSignalsArray<SelectItem>(normalized),
			);

			const ids = new Set(this.allItems().map((s) => s().id));
			const val = this.wModel();

			if (this.isMulti()) {
				const next = (Array.isArray(val) ? val : []).filter((id) =>
					ids.has(id as SelectId),
				) as SelectId[];
				if (JSON.stringify(next) !== JSON.stringify(val)) {
					this.wModel.set(next);
				}
			} else {
				if (
					!val ||
					(this.allItems().length && !ids.has(val as SelectId))
				) {
					this.wModel.set(null);
				}
			}
		});

		/* propagate to CVA + legacy output */
		effect(() => {
			const v = this.wModel();
			this._onChange(v);
			this.wChange.emit(v);
		});

		/* when list changes while open, keep activeIndex valid */
		effect(() => {
			if (!this.showOptions()) return;
			const len = this.filteredItems().length;
			if (!len) {
				this.activeIndex.set(-1);
				return;
			}
			const idx = this.activeIndex();
			if (idx < 0 || idx >= len) {
				this.activeIndex.set(0);
				queueMicrotask(() => this._scrollActiveIntoView());
			}
		});
	}

	/* ===== UI actions ===== */
	toggleOptions(show = !this.showOptions()) {
		if (this.isDisabled()) return;

		this.showOptions.set(show);

		if (show) {
			this._primeActiveIndex();
			queueMicrotask(() => this._scrollActiveIntoView());
		} else {
			this.activeIndex.set(-1);
		}
	}

	selectOption(item: SelectItem): void {
		if (this.isMulti()) {
			const set = new Set(this.selectedIds());
			set.has(item.id) ? set.delete(item.id) : set.add(item.id);
			this.wModel.set([...set]);
		} else {
			this.wModel.set(item.id);
			this.showOptions.set(false);
			this.activeIndex.set(-1);
		}
		this._onTouched();
	}

	selectOptionAt(index: number): void {
		const list = this.filteredItems();
		if (index < 0 || index >= list.length) return;
		this.selectOption(list[index]());
	}

	removeItem(index: number) {
		if (!this.isMulti()) return;
		const arr = [...this.selectedIds()];
		arr.splice(index, 1);
		this.wModel.set(arr);
	}

	clear(): void {
		this.wModel.set(this.isMulti() ? [] : null);
	}

	/* ===== Keyboard ===== */
	onKeydown(ev: KeyboardEvent): void {
		if (this.isDisabled()) return;

		const key = ev.key;

		// open from closed state
		if (!this.showOptions()) {
			if (
				key === 'ArrowDown' ||
				key === 'ArrowUp' ||
				key === 'Enter' ||
				key === ' '
			) {
				ev.preventDefault();
				this.toggleOptions(true);
			}
			return;
		}

		const len = this.filteredItems().length;

		switch (key) {
			case 'Escape': {
				ev.preventDefault();
				this.toggleOptions(false);
				return;
			}
			case 'Tab': {
				// let focus move, but close popup
				this.toggleOptions(false);
				return;
			}
			case 'ArrowDown': {
				ev.preventDefault();
				if (!len) return;
				const next = Math.min(
					this.activeIndex() < 0 ? 0 : this.activeIndex() + 1,
					len - 1,
				);
				this.activeIndex.set(next);
				this._scrollActiveIntoView();
				return;
			}
			case 'ArrowUp': {
				ev.preventDefault();
				if (!len) return;
				const next = Math.max(
					this.activeIndex() < 0 ? len - 1 : this.activeIndex() - 1,
					0,
				);
				this.activeIndex.set(next);
				this._scrollActiveIntoView();
				return;
			}
			case 'Home': {
				ev.preventDefault();
				if (!len) return;
				this.activeIndex.set(0);
				this._scrollActiveIntoView();
				return;
			}
			case 'End': {
				ev.preventDefault();
				if (!len) return;
				this.activeIndex.set(len - 1);
				this._scrollActiveIntoView();
				return;
			}
			case 'Enter':
			case ' ': {
				ev.preventDefault();
				const idx = this.activeIndex();
				if (idx >= 0) this.selectOptionAt(idx);
				return;
			}
		}
	}

	private _primeActiveIndex(): void {
		const list = this.filteredItems();

		if (!list.length) {
			this.activeIndex.set(-1);
			return;
		}

		// Prefer currently selected item as the active one
		const selected = this.selectedId();
		if (!this.isMulti() && selected != null) {
			const idx = list.findIndex((s) => s().id === selected);
			this.activeIndex.set(idx >= 0 ? idx : 0);
			return;
		}

		// Multi: prefer first selected in the filtered list
		if (this.isMulti() && this.selectedIds().length) {
			const set = new Set(this.selectedIds());
			const idx = list.findIndex((s) => set.has(s().id));
			this.activeIndex.set(idx >= 0 ? idx : 0);
			return;
		}

		this.activeIndex.set(0);
	}

	private _scrollActiveIntoView(): void {
		const idx = this.activeIndex();
		if (idx < 0) return;

		const root = this._popupListEl()?.nativeElement;
		if (!root) return;

		const el = root.querySelector<HTMLElement>(`[data-index="${idx}"]`);
		el?.scrollIntoView({ block: 'nearest' });
	}

	/* ===== CVA ===== */
	writeValue(obj: SelectValue): void {
		if (!this._equal(this.wModel(), obj)) this.wModel.set(obj);
	}
	registerOnChange(fn: any): void {
		this._onChange = fn;
	}
	registerOnTouched(fn: any): void {
		this._onTouched = fn;
	}
	setDisabledState(isDisabled: boolean): void {
		this._disabledCva = isDisabled;
	}

	/* ===== Utils ===== */
	private _equal(a: any, b: any) {
		return Array.isArray(a) || Array.isArray(b)
			? JSON.stringify(a) === JSON.stringify(b)
			: a === b;
	}
}
