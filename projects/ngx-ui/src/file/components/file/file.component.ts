import { NgTemplateOutlet } from '@angular/common';
import {
	Component,
	TemplateRef,
	ViewEncapsulation,
	computed,
	input,
	model,
	output,
	signal,
} from '@angular/core';
import { TranslateDirective } from '@wawjs/ngx-translate';
import { ButtonComponent } from '../../../button/button.component';
import { fileDefaults } from '../../file.const';

export type FileView = 'dropzone' | 'list';

@Component({
	selector: 'ngx-file',
	imports: [NgTemplateOutlet, TranslateDirective, ButtonComponent],
	templateUrl: './file.component.html',
	styleUrl: './file.component.scss',
	encapsulation: ViewEncapsulation.None,
})
export class FileComponent {
	readonly label = input(fileDefaults.label);
	readonly placeholder = input(fileDefaults.placeholder);
	readonly disabled = input(fileDefaults.disabled);
	readonly clearable = input(fileDefaults.clearable);
	readonly accept = input(fileDefaults.accept);
	readonly multiple = input(fileDefaults.multiple);
	readonly view = input<FileView>(fileDefaults.view as FileView);

	readonly tItem = input<TemplateRef<unknown>>();
	readonly tEmpty = input<TemplateRef<unknown>>();

	readonly wFiles = model<File[]>([], { alias: 'wFiles' });
	readonly wChange = output<File[]>();

	readonly isDragging = signal(false);
	readonly isDisabled = computed(() => this.disabled());
	readonly files = computed(() => this.wFiles());

	triggerPick(input: HTMLInputElement): void {
		if (!this.isDisabled()) {
			input.click();
		}
	}

	onPicked(input: HTMLInputElement): void {
		this._setFiles(input.files);
		input.value = '';
	}

	onDragOver(event: DragEvent): void {
		if (this.isDisabled()) {
			return;
		}

		event.preventDefault();
		this.isDragging.set(true);
	}

	onDragLeave(): void {
		this.isDragging.set(false);
	}

	onDrop(event: DragEvent): void {
		if (this.isDisabled()) {
			return;
		}

		event.preventDefault();
		this.isDragging.set(false);
		this._setFiles(event.dataTransfer?.files ?? null);
	}

	removeAt(index: number): void {
		const next = [...this.files()];
		next.splice(index, 1);
		this._emit(next);
	}

	clear(): void {
		this._emit([]);
	}

	fileSize(file: File): string {
		const size = file.size;

		if (size < 1024) {
			return `${size} B`;
		}

		if (size < 1024 * 1024) {
			return `${Math.round(size / 102.4) / 10} KB`;
		}

		return `${Math.round(size / 1024 / 102.4) / 10} MB`;
	}

	private _setFiles(fileList: FileList | null): void {
		if (!fileList?.length) {
			return;
		}

		const selected = Array.from(fileList);
		const next = this.multiple()
			? [...this.files(), ...selected]
			: selected.slice(0, 1);

		this._emit(next);
	}

	private _emit(files: File[]): void {
		this.wFiles.set(files);
		this.wChange.emit(files);
	}
}
