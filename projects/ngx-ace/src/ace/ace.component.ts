import {
	AfterViewInit,
	Component,
	ViewEncapsulation,
	input,
	model,
	output,
	viewChild,
} from '@angular/core';

import { AceDirective } from './ace.directive';
import { AceConfigInterface } from './ace.interfaces';

@Component({
	selector: 'ace',
	exportAs: 'ngxAce',
	host: {
		'[class.ace]': 'useAceClass()',
	},
	templateUrl: './ace.component.html',
	styles: [
		`
			:host {
				display: block;
				width: 100%;
				height: 100%;
				min-width: 0;
				min-height: 0;
			}

			:host(.flex) {
				display: flex;
				flex-direction: inherit;
				align-items: inherit;
				min-width: 0;
				min-height: 0;
				-webkit-box-direction: inherit;
				-webkit-box-orient: inherit;
			}

			.ace-host {
				display: block;
				width: 100%;
				height: 100%;
				min-width: 0;
				min-height: 0;
			}

			.ace-host.ace_editor {
				width: 100% !important;
				height: 100% !important;
			}

			:host(.flex) > .ace-host {
				flex: 1 1 auto;
				min-width: 0;
				min-height: 0;
				-webkit-box-flex: 1;
			}

			.ace-host.ace--disabled {
				opacity: 0.6;
				pointer-events: none;
			}

			.ace-host.ace--disabled .ace_cursor {
				display: none !important;
			}

			.ace-host.ace--disabled .ace_active-line {
				background: transparent !important;
			}

			.ace-host.ace--disabled .ace_scroller {
				cursor: not-allowed;
			}
		`,
	],
	encapsulation: ViewEncapsulation.None,
	imports: [AceDirective],
})
export class AceComponent implements AfterViewInit {
	// -------- inputs --------
	readonly disabled = input(false);
	readonly readOnly = input(false);

	readonly mode = input<'' | 'text' | 'javascript'>('');
	readonly theme = input<'' | 'github' | 'clouds'>('');

	// Escape hatch (advanced options)
	readonly config = input<AceConfigInterface | undefined>(undefined);

	// host class toggle
	readonly useAceClass = input(true);

	// two-way value binding: [(value)]
	readonly value = model<string>('');

	// -------- outputs --------
	readonly blur = output<unknown>();
	readonly focus = output<unknown>();

	readonly copy = output<unknown>();
	readonly paste = output<unknown>();

	readonly change = output<unknown>();

	readonly changeCursor = output<unknown>();
	readonly changeSession = output<unknown>();
	readonly changeSelection = output<unknown>();

	// -------- view child --------
	readonly directiveRef = viewChild(AceDirective);

	ngAfterViewInit(): void {
		const directive = this.directiveRef();
		if (!directive) return;

		const current = this.value() ?? '';
		if (current !== '') {
			directive.setValue(current, 1);
		}
	}

	onContentChange(event: unknown): void {
		const directive = this.directiveRef();
		if (!directive) return;

		this.change.emit(event);

		const newValue = directive.getValue() ?? '';
		this.value.set(newValue);
	}
}
