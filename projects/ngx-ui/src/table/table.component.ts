import { NgTemplateOutlet } from '@angular/common';
import {
	AfterContentInit,
	Component,
	OnInit,
	Signal,
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
import { StoreService } from '@wawjs/ngx-core';
import { ButtonComponent } from '../button/button.component';
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
	styles: [
		`
			:host {
				display: block;
			}
		`,
	],
	imports: [ButtonComponent, NgTemplateOutlet, RouterLink],
})
export class TableComponent implements OnInit, AfterContentInit {
	private readonly _router = inject(Router);
	private readonly _storeService = inject(StoreService);

	// inputs (function-based API)
	readonly bindValue = input<string>('_id');
	readonly rows = input<unknown[]>([]);
	readonly config = input<any>({});
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

		const cfg = this.config();
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

		const cfg = this.config();
		const rows = this.filteredRows();

		if (!Array.isArray(rows)) return [];

		let copy = rows.map((it, i) => ({ ...it, num: i + 1 }));

		const sort = this.sort_type;
		if (sort?.direction) {
			copy = copy.slice().sort((a: any, b: any) => {
				if (a[sort.title] < b[sort.title]) {
					return sort.direction === 'desc' ? 1 : -1;
				}
				if (a[sort.title] > b[sort.title]) {
					return sort.direction === 'desc' ? -1 : 1;
				}
				return 0;
			});
		}

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

	constructor() {
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
		this.default_config();

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

	default_config() {
		const cfg = this.config();

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

	searching() {
		setTimeout(() => {
			if (!this.config().globalSearch) {
				this.filterFilter.set(this.searchingText());
				this.refresh();
			}
		}, 100);

		clearTimeout(this._search_timeout);
		this._search_timeout = setTimeout(this.searching.bind(this), 2000);
	}

	search() {
		clearTimeout(this._search_timeout);

		setTimeout(() => {
			if (!this.config().globalSearch) {
				this.filterFilter.set(this.searchingText());
				this.refresh();
			}
		}, 100);

		this.onSearch.emit(this.searchingText());
	}

	next() {
		const cfg = this.config();
		const rows = this.normalizedRows();

		if (cfg.perPage === -1) return;

		// client mode – we have all docs in memory
		if (cfg.allDocs || typeof cfg.paginate !== 'function') {
			if (rows && cfg.page * cfg.perPage < rows.length) {
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
		const cfg = this.config();

		if (cfg.page <= 1) return;

		cfg.page -= 1;

		// only call backend when we are in server mode
		if (!cfg.allDocs && typeof cfg.paginate === 'function') {
			cfg.paginate(cfg.page);
		}

		this.refresh();
	}

	changePerPage(row: number) {
		const cfg = this.config();

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

		const rows = this.normalizedRows();
		if (
			rows &&
			cfg.perPage > 0 &&
			(cfg.page - 1) * cfg.perPage > rows.length
		) {
			this.lastPage();
		}

		this.select_page_size = false;
		this.refresh();
	}

	firstPage() {
		const cfg = this.config();
		const rows = this.normalizedRows();

		if (!rows || !rows.length || cfg.perPage <= 0) return;

		cfg.page = 1;
		this.refresh();
	}

	lastPage() {
		const cfg = this.config();
		const rows = this.normalizedRows();

		if (!rows || !rows.length || cfg.perPage <= 0) return;

		cfg.page = Math.ceil(rows.length / cfg.perPage);
		this.refresh();
	}

	isLast(): boolean {
		const cfg = this.config();
		const rows = this.normalizedRows();

		if (!rows || !rows.length || cfg.perPage <= 0 || !cfg.allDocs) {
			return false;
		}

		return cfg.page >= Math.ceil(rows.length / cfg.perPage);
	}

	sort(column: any) {
		if (this.sort_type.title !== column.field) this.sort_type = {};

		if (this.sortable[column.field]) {
			this.sort_type = {
				title: column.field,
				direction:
					(typeof this.sort_type.direction !== 'string' && 'asc') ||
					(this.sort_type.direction === 'asc' && 'desc') ||
					undefined,
			};
			this.refresh();
		}
	}
}
