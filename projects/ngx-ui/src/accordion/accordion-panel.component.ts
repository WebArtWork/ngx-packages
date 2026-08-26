import { Component, ViewEncapsulation, input, model } from '@angular/core';
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

	toggle(): void {
		if (this.disabled()) {
			return;
		}

		this.expanded.update((value) => !value);
	}
}
