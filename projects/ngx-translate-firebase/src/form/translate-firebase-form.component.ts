import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { LanguageService, TranslateDirective } from '@wawjs/ngx-translate';
import { ButtonDirective, InputComponent } from '@wawjs/ngx-ui';
import { TranslateFirebaseEntry } from '../service/translate-firebase.interface';
import { TranslateKeyPick, TranslateKeySelectComponent } from '../select/translate-key-select.component';

/**
 * Modal content: pick a key of the translation files, then edit its text per language.
 *
 * The modal service assigns `row`, `onSave` and `close` as plain properties before the first render
 * (they are not signal inputs).
 */
@Component({
	selector: 'wtranslate-firebase-form',
	imports: [TranslateKeySelectComponent, InputComponent, ButtonDirective, TranslateDirective],
	templateUrl: './translate-firebase-form.component.html',
	styleUrl: './translate-firebase-form.component.scss',
})
export class TranslateFirebaseFormComponent implements OnInit {
	/** The entry to edit; `null` creates a new one. */
	row: TranslateFirebaseEntry | null = null;

	/** Called with the edited entry; the modal closes when it resolves. */
	onSave: ((entry: TranslateFirebaseEntry) => Promise<void>) | null = null;

	/** Set by the modal service. */
	close: () => void = () => undefined;

	readonly languages = inject(LanguageService).languages();

	readonly sourceText = signal<string | null>(null);
	readonly texts = signal<Record<string, string>>({});
	readonly saving = signal(false);
	readonly failed = signal(false);

	readonly canSave = computed(() => !!this.sourceText() && !this.saving());

	ngOnInit(): void {
		if (!this.row) return;

		this.sourceText.set(this.row.sourceText);
		this.texts.set({ ...this.row.translations });
	}

	/** A key was picked: fill every language with what the translation files say. */
	prefill(pick: TranslateKeyPick): void {
		this.texts.set({ ...pick.translations });
	}

	setText(code: string, value: unknown): void {
		this.texts.update((texts) => ({ ...texts, [code]: String(value ?? '') }));
	}

	async submit(): Promise<void> {
		const sourceText = this.sourceText();

		if (!sourceText || !this.onSave) return;

		this.saving.set(true);
		this.failed.set(false);

		try {
			await this.onSave({ id: this.row?.id ?? '', sourceText, translations: this.texts() });

			this.close();
		} catch {
			this.failed.set(true);
		} finally {
			this.saving.set(false);
		}
	}
}
