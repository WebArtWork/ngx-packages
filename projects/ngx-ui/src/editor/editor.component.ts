import { DOCUMENT, isPlatformBrowser } from '@angular/common';
import {
	Component,
	ElementRef,
	PLATFORM_ID,
	ViewEncapsulation,
	effect,
	inject,
	input,
	model,
	viewChild,
} from '@angular/core';

export interface EditorCommand {
	command: string;
	icon: string;
	value?: string;
}

const DEFAULT_COMMANDS: EditorCommand[] = [
	{ command: 'bold', icon: 'format_bold' },
	{ command: 'italic', icon: 'format_italic' },
	{ command: 'underline', icon: 'format_underlined' },
	{ command: 'insertUnorderedList', icon: 'format_list_bulleted' },
	{ command: 'insertOrderedList', icon: 'format_list_numbered' },
];

/**
 * Lightweight `contenteditable`-based rich text editor for simple bold/
 * italic/list formatting. For a full-featured editor (tables, media
 * embeds, custom plugins), use `@wawjs/ngx-tinymce` instead.
 */
@Component({
	selector: 'weditor',
	templateUrl: './editor.component.html',
	styleUrl: './editor.component.scss',
	encapsulation: ViewEncapsulation.None,
})
export class EditorComponent {
	readonly wModel = model<string>('');
	readonly placeholder = input<string>('');
	readonly disabled = input<boolean>(false);
	readonly commands = input<EditorCommand[]>(DEFAULT_COMMANDS);

	private readonly _editorEl = viewChild<ElementRef<HTMLElement>>('editorEl');

	private readonly _document = inject(DOCUMENT);
	private readonly _isBrowser = isPlatformBrowser(inject(PLATFORM_ID));

	constructor() {
		effect(() => {
			const el = this._editorEl()?.nativeElement;
			const value = this.wModel();

			if (el && el.innerHTML !== value) {
				el.innerHTML = value;
			}
		});
	}

	exec(command: string, value?: string): void {
		if (!this._isBrowser || this.disabled()) {
			return;
		}

		this._document.execCommand(command, false, value);
	}

	onInput(event: Event): void {
		this.wModel.set((event.target as HTMLElement).innerHTML);
	}
}
