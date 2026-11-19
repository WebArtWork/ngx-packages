import { Component, computed, inject, signal } from '@angular/core';
import { LanguageService, TranslateService } from '@wawjs/ngx-translate';
import { AlertService, Modal, ModalService, TableComponent } from '@wawjs/ngx-ui';
import { TranslateFirebaseFormComponent } from '../form/translate-firebase-form.component';
import { TranslateFirebaseEntry } from '../service/translate-firebase.interface';
import { TranslateFirebaseService } from '../service/translate-firebase.service';

/** A table row: the entry id, its source text and one column per language. */
type Row = { id: string; sourceText: string } & Record<string, string>;

/**
 * Admin page for the custom translations: a table with add, edit and delete.
 * Mount it with `translateFirebaseRoutes`, for example under `/admin/translates`.
 */
@Component({
	selector: 'wtranslate-firebase',
	imports: [TableComponent],
	templateUrl: './translate-firebase.component.html',
})
export class TranslateFirebaseComponent {
	private readonly _service = inject(TranslateFirebaseService);
	private readonly _modalService = inject(ModalService);
	private readonly _alertService = inject(AlertService);
	private readonly _translate = inject(TranslateService);
	private readonly _languages = inject(LanguageService).languages();

	readonly columns = ['sourceText', ...this._languages.map((language) => language.code)];

	readonly rows = computed<Row[]>(() =>
		this._service.entries().map((entry) => ({
			id: entry.id,
			sourceText: entry.sourceText,
			...entry.translations,
		})),
	);

	readonly failed = signal(false);

	readonly config = {
		allDocs: true,
		perPage: 50,
		page: 1,
		searchBy: 'sourceText',
		create: () => this._open(),
		update: (row: Row) => this._open(row),
		delete: (row: Row) => this._confirmDelete(row),
		buttons: [],
		headerButtons: [],
	};

	constructor() {
		void this._service.load();
		void this._service.loadFileTexts();
	}

	private _open(row?: Row): void {
		const entry = row
			? this._service.entries().find((item) => item.id === row.id) ?? null
			: null;

		this._modalService.show({
			component: TranslateFirebaseFormComponent,
			size: 'big',
			row: entry,
			onSave: (updated: TranslateFirebaseEntry) =>
				updated.id
					? this._service.save(updated)
					: this._service.upsert(updated.sourceText, updated.translations),
		} as unknown as Modal);
	}

	private _confirmDelete(row: Row): void {
		this._alertService.question({
			text: this._translate.translate('Delete this translation?')(),
			timeout: 0,
			progress: false,
			buttons: [
				{
					text: this._translate.translate('Delete')(),
					callback: () => void this._run(() => this._service.remove(row.id)),
				},
				{ text: this._translate.translate('Cancel')() },
			],
		});
	}

	private async _run(job: () => Promise<void>): Promise<void> {
		this.failed.set(false);

		try {
			await job();
		} catch {
			this.failed.set(true);
			this._alertService.error({ text: this._translate.translate('Something went wrong')() });
		}
	}
}
