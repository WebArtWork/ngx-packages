import { Component, ViewEncapsulation, input, model } from '@angular/core';
import { generateA11yId } from '@wawjs/ngx-core';
import { TranslateDirective } from '@wawjs/ngx-translate';

@Component({
	selector: 'waccordion-panel',
	imports: [TranslateDirective],
	templateUrl: './accordion-panel.component.html',
	styleUrl: './accordion-panel.component.scss',
	encapsulation: ViewEncapsulation.None,
})
export class AccordionPanelComponent {
	readonly header = input<string>('');
	readonly disabled = input<boolean>(false);
	readonly expanded = model<boolean>(false);

	private readonly _id = generateA11yId('waccordion-panel');
	readonly headerId = `${this._id}-header`;
	readonly bodyId = `${this._id}-body`;

	toggle(): void {
		if (this.disabled()) {
			return;
		}

		this.expanded.update((value) => !value);
	}
}
