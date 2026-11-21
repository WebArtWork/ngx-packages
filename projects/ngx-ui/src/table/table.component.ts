import { NgTemplateOutlet } from '@angular/common';
import {
	AfterContentInit,
	Component,
	DestroyRef,
	OnInit,
	Signal,
	ViewEncapsulation,
	computed,
	contentChild,
	contentChildren,
	effect,
	inject,
	input,
	isSignal,
	model,
	output,
	signal,
} from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { ClickOutsideDirective, StoreService } from '@wawjs/ngx-core';
import { ButtonDirective } from '../button/button.directive';
import {
	ActionsDirective,
	CellDirective,
	CustomEditDirective,
	SortDirective,
	TableHeaderDirective,
} from './table.directive';

@Component({
	selector: 'wtable',
	templateUrl: './table.component.html',
	styleUrl: './table.component.scss',
	encapsulation: ViewEncapsulation.None,
	imports: [ButtonDirective, NgTemplateOutlet, RouterLink, ClickOutsideDirective],
})
export class TableComponent implements OnInit, AfterContentInit {
	private readonly _router = inject(Router);
	private readonly _storeService = inject(StoreService);

	// inputs (function-based API)
	readonly bindValue = input<string>('_id');
	readonly rows = input<unknown[]>([]);
	readonly config = input<any>({});

	/** config() with defaults applied, re-applied whenever a new config object arrives */
	readonly cfg = computed<any>(() => {
		const cfg = this.config() || {};
		this.default_config(cfg);
		return cfg;
	});
	readonly columns = model<any[]>([]);
	readonly value = input<string>('_id');
	readonly title = input<string>('');

	// outputs
	readonly onSearch = output<string>();

	// projected templates
	private readonly _cellDirs = contentChildren(CellDirective, {
		descendants: true,
	});
	private readonly _sortDirs = contentChildren(SortDirective, {
		descendants: true,
	});
	private readonly _actionDir = contentChild(ActionsDirective);
	private readonly _editFormDir = contentChild(CustomEditDirective);
	headerTpl = contentChild(TableHeaderDirective);

	action?: ActionsDirective;
	editForm?: CustomEditDirective;

	searchShow = false;
	readonly searchingText = signal('');
	readonly filterFilter = signal('');
	select_page_size = false;

	custom_cell: Record<string, any> = {};
	sort_type: any = {};
	sortable: Record<string, boolean> = {};

	/** Always plain objects, even if input rows are Signal<T>[] */
	readonly normalizedRows = signal<any[]>([]);

	/** Manual invalidation for config mutations (page / perPage etc.) */
	private readonly _refreshToken = signal(0);

	/** rows after local search (client mode only) */
	readonly filteredRows = computed<any[]>(() => {
		this._refreshToken(); // track manual refreshes

		const cfg = this.cfg();
		const rows = this.normalizedRows();

		// server mode or global search handled outside
		if (!cfg.allDocs || cfg.globalSearch) return rows;

		const term = (this.filterFilter() || this.searchingText() || '')
			.trim()
			.toLowerCase();

		if (!term) return rows;

		const searchBy = cfg.searchBy || 'title';

		return rows.filter((row: any) => {
			const raw = row?.[searchBy];
			if (raw == null) return false;
			return raw.toString().toLowerCase().includes(term);
		});
	});

	/** rows after search + pagination (client mode) */
	readonly paginatedRows = computed<any[]>(() => {
		this._refreshToken();

		const cfg = this.cfg();
		const rows = this.filteredRows();

		if (!Array.isArray(rows)) return [];

		let copy = rows.slice();

		const sort = this.sort_type;
		if (sort?.direction) {
			copy = copy.sort((a: any, b: any) => {
				if (a[sort.title] < b[sort.title]) {
					return sort.direction === 'desc' ? 1 : -1;
				}
				if (a[sort.title] > b[sort.title]) {
					return sort.direction === 'desc' ? -1 : 1;
				}
				return 0;
			});
		}

		// number rows after sorting so "No." follows the visible order
		copy = copy.map((it, i) => ({ ...it, num: i + 1 }));

		// no pagination in client mode
		if (cfg.perPage === -1 || !cfg.perPage || !cfg.allDocs) {
			return copy;
		}

		const start = (cfg.page - 1) * cfg.perPage;
		const end = cfg.page * cfg.perPage;

		return copy.slice(start, end);
	});

	/** total rows count after local search (client mode) */
	readonly totalCount = computed<number>(
		() => this.filteredRows().length || 0,
	);

	tableId =
		'table_' +
		this._router.url
			.split('/')
			.filter((p) => p && p.length !== 24)
			.join('/');

	private _search_timeout: any;
	private _apply_timeout: any;

	constructor() {
		inject(DestroyRef).onDestroy(() => {
			clearTimeout(this._search_timeout);
			clearTimeout(this._apply_timeout);
		});

		// react to rows() changes and unwrap signals
		effect(() => {
			const raw = this.rows() || [];
			const normalized = Array.isArray(raw)
				? raw.map((row: any) =>
						isSignal(row) ? (row as Signal<any>)() : row,
					)
				: [];
			this.normalizedRows.set(normalized);
		});
	}

	async ngOnInit() {
		this.cfg();

		// normalize string columns => { title, field }
		const cols = this.columns();
		for (let i = 0; i < cols.length; i++) {
			if (typeof cols[i] === 'string') {
				cols[i] = { title: cols[i], field: cols[i] };
			}
		}
		this.columns.set(cols);

		const perPage = await this._storeService.get(this.tableId + 'perPage');

		if (perPage) this.changePerPage(Number(perPage));
	}

	default_config(cfg: any = this.config()) {
		if (!cfg.pageSizeOptions) cfg.pageSizeOptions = [1, 10, 20, 50];
		if (cfg.perPage === undefined) cfg.perPage = -1;
		if (!cfg.page) cfg.page = 1;
		if (!cfg.searchable) cfg.searchable = false;
		if (typeof cfg.allDocs !== 'boolean') cfg.allDocs = true;
	}

	ngAfterContentInit() {
		const sortDirs = this._sortDirs();
		for (const dir of sortDirs) {
			this.sortable[dir.sort() as string] = true;
		}

		const cellDirs = this._cellDirs();
		for (const c of cellDirs) {
			this.custom_cell[c.cell() as string] = c.template;
		}

		this.action = this._actionDir() ?? undefined;
		this.editForm = this._editFormDir() ?? undefined;
	}

	private refresh() {
		this._refreshToken.update((v) => v + 1);
	}

	protected inputValue(event: Event): string {
		return (event.target as HTMLInputElement | null)?.value || '';
	}

	/** Applies the typed text as the local filter and goes back to page 1 when it changed. */
	private _applyFilter() {
		const cfg = this.cfg();
		if (cfg.globalSearch) return;

		const term = this.searchingText();
		if (term !== this.filterFilter()) {
			this.filterFilter.set(term);
			if (cfg.allDocs) cfg.page = 1;
		}
		this.refresh();
	}

	/** Debounced local filter while typing. */
	searching() {
		const cfg = this.cfg();
		// filteredRows already reads searchingText, so the visible rows change now: reset the page now too
		if (cfg.allDocs && !cfg.globalSearch) cfg.page = 1;

		clearTimeout(this._search_timeout);
		this._search_timeout = setTimeout(() => this._applyFilter(), 300);
	}

	search() {
		clearTimeout(this._search_timeout);
		clearTimeout(this._apply_timeout);

		this._apply_timeout = setTimeout(() => this._applyFilter(), 100);

		this.onSearch.emit(this.searchingText());
	}

	next() {
		const cfg = this.cfg();

		if (cfg.perPage === -1) return;

		// client mode: we have all docs in memory
		if (cfg.allDocs || typeof cfg.paginate !== 'function') {
			if (cfg.page * cfg.perPage < this.totalCount()) {
				cfg.page += 1;
				this.refresh();
			}
			return;
		}

		// server mode – delegate to backend
		cfg.page += 1;
		cfg.paginate(cfg.page);
		this.refresh();
	}

	previous() {
		const cfg = this.cfg();

		if (cfg.page <= 1) return;

		cfg.page -= 1;

		// only call backend when we are in server mode
		if (!cfg.allDocs && typeof cfg.paginate === 'function') {
			cfg.paginate(cfg.page);
		}

		this.refresh();
	}

	changePerPage(row: number) {
		const cfg = this.cfg();

		cfg.perPage = row;
		cfg.page = 1;

		// server mode: sync per-page + reload page 1
		if (!cfg.allDocs) {
			if (typeof cfg.setPerPage === 'function') {
				cfg.setPerPage(cfg.perPage);
			}
			if (typeof cfg.paginate === 'function') {
				cfg.paginate(cfg.page);
			}
		}

		this._storeService.set(this.tableId + 'perPage', row.toString());

		if (
			cfg.perPage > 0 &&
			(cfg.page - 1) * cfg.perPage > this.totalCount()
		) {
			this.lastPage();
		}

		this.select_page_size = false;
		this.refresh();
	}

	firstPage() {
		const cfg = this.cfg();
		const rows = this.normalizedRows();

		if (!rows || !rows.length || cfg.perPage <= 0) return;

		cfg.page = 1;
		this.refresh();
	}

	lastPage() {
		const cfg = this.cfg();
		const count = this.totalCount();

		if (!count || cfg.perPage <= 0) return;

		cfg.page = Math.ceil(count / cfg.perPage);
		this.refresh();
	}

	isLast(): boolean {
		const cfg = this.cfg();
		const count = this.totalCount();

		if (!count || cfg.perPage <= 0 || !cfg.allDocs) {
			return false;
		}

		return cfg.page >= Math.ceil(count / cfg.perPage);
	}

	sort(column: any) {
		const prev = this.sort_type;

		if (this.sort_type.title !== column.field) this.sort_type = {};

		if (this.sortable[column.field]) {
			this.sort_type = {
				title: column.field,
				direction:
					(typeof this.sort_type.direction !== 'string' && 'asc') ||
					(this.sort_type.direction === 'asc' && 'desc') ||
					undefined,
			};
		}

		if (this.sort_type !== prev) this.refresh();
	}
}
