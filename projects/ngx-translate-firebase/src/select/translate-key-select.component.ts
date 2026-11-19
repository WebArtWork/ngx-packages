import { Component, OnInit, computed, inject, input, model, output } from '@angular/core';
import { SelectComponent } from '@wawjs/ngx-ui';
import { TranslateFirebaseService } from '../service/translate-firebase.service';

export interface TranslateKeyPick {
	sourceText: string;

	/** What the translation files say for the picked key, per language code. */
	translations: Record<string, string>;
}

/**
 * Searchable select of the keys (source texts) that exist in the translation files.
 * Picking one emits `picked` with the texts of the files, so a form can prefill every language.
 */
@Component({
	selector: 'wtranslate-key-select',
	imports: [SelectComponent],
	template: `
		<wselect
			[label]="label()"
			[placeholder]="placeholder()"
			[items]="items()"
			[searchable]="true"
			[raw]="true"
			[wModel]="value()"
			(wChange)="onChange($event)"
		/>
	`,
})
export class TranslateKeySelectComponent implements OnInit {
	private readonly _service = inject(TranslateFirebaseService);

	/** The selected key. */
	readonly value = model<string | null>(null);
	readonly label = input('Source text');
	readonly placeholder = input('Source text');

	/** Emits when the user picks a key (not for the initial value). */
	readonly picked = output<TranslateKeyPick>();

	/** The keys of the files, plus the current value when it is not in them. */
	readonly items = computed(() => {
		const keys = this._service.fileKeys();
		const value = this.value();

		return value && !keys.includes(value) ? [value, ...keys] : keys;
	});

	ngOnInit(): void {
		void this._service.loadFileTexts();
	}

	onChange(selected: unknown): void {
		const key = typeof selected === 'string' && selected ? selected : null;

		// The initial value (and any echo of the model) arrives here too: only a real change is a pick.
		if (key === this.value()) return;

		this.value.set(key);

		if (key) this.picked.emit({ sourceText: key, translations: this._service.filesFor(key) });
	}
}
