import {
	AfterViewInit,
	ChangeDetectionStrategy,
	Component,
	HostBinding,
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
	templateUrl: './ace.component.html',
	styleUrl: './ace.component.scss',
	encapsulation: ViewEncapsulation.None,
	changeDetection: ChangeDetectionStrategy.OnPush,
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
	readonly blur = output();
	readonly focus = output();

	readonly copy = output();
	readonly paste = output();

	readonly change = output();

	readonly changeCursor = output();
	readonly changeSession = output();
	readonly changeSelection = output();

	// -------- view child --------
	readonly directiveRef = viewChild(AceDirective);

	@HostBinding('class.ace')
	get hostAceClass(): boolean {
		return this.useAceClass();
	}

	ngAfterViewInit(): void {
		const directive = this.directiveRef();
		if (!directive) return;

		const current = this.value() ?? '';
		if (current !== '') {
			directive.setValue(current, 1);
		}
	}

	onContentChange(event: any): void {
		const directive = this.directiveRef();
		if (!directive) return;

		this.change.emit(event);

		const newValue = directive.getValue() ?? '';
		this.value.set(newValue);
	}
}
