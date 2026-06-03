import { NgTemplateOutlet } from '@angular/common';
import {
	ChangeDetectionStrategy,
	Component,
	TemplateRef,
	computed,
	input,
	model,
	output,
	signal,
} from '@angular/core';
import { TranslatePipe } from '@wawjs/ngx-translate';
import { ButtonComponent } from '../../../button/button.component';
import { fileDefaults } from '../../file.const';

export type FileView = 'dropzone' | 'list';

@Component({
	selector: 'ngx-file',
	changeDetection: ChangeDetectionStrategy.OnPush,
	imports: [NgTemplateOutlet, TranslatePipe, ButtonComponent],
	templateUrl: './file.component.html',
	styles: [
		`
			:host {
				display: block;
			}

			.wfile._disabled {
				opacity: 0.6;
				pointer-events: none;
			}

			.wfile__label {
				margin-bottom: 6px;
			}

			.wfile__body {
				border: 1px dashed var(--c-border);
				border-radius: var(--radius);
				background: var(--c-bg-secondary);
				box-shadow: var(--shadow-sm);
				transition:
					border-color var(--motion-fast) var(--easing),
					box-shadow var(--motion-fast) var(--easing);
			}

			.wfile__body._dragging {
				border-color: var(--c-primary);
				box-shadow: var(--focus-ring);
			}

			.wfile__dropzone {
				display: grid;
				place-items: center;
				gap: var(--sp-2);
				min-block-size: 120px;
				padding: var(--sp-4);
				cursor: pointer;
				text-align: center;
			}

			.wfile__empty {
				color: var(--c-placeholder);
				font-size: 0.9rem;
			}

			.wfile__list {
				display: grid;
				gap: var(--sp-2);
				padding: var(--sp-3);
			}

			.wfile__item {
				display: flex;
				align-items: center;
				justify-content: space-between;
				gap: var(--sp-2);
				border: 1px solid var(--c-border);
				border-radius: var(--radius-card);
				padding: var(--sp-2) var(--sp-3);
				background: var(--c-bg-secondary);
			}

			.wfile__name {
				min-inline-size: 0;
				overflow: hidden;
				text-overflow: ellipsis;
				white-space: nowrap;
			}

			.wfile__meta {
				color: var(--c-text-muted);
				font-size: 0.8rem;
				white-space: nowrap;
			}

			.wfile__actions {
				display: flex;
				align-items: center;
				justify-content: flex-end;
				gap: var(--sp-2);
				padding: var(--sp-2) var(--sp-3);
				border-top: 1px solid var(--c-border);
			}
		`,
	],
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
