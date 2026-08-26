import {
	Component,
	ViewEncapsulation,
	contentChildren,
	effect,
	input,
} from '@angular/core';
import { AccordionPanelComponent } from './accordion-panel.component';

@Component({
	selector: 'waccordion',
	template: `<div class="waccordion"><ng-content></ng-content></div>`,
	styleUrl: './accordion.component.scss',
	encapsulation: ViewEncapsulation.None,
})
export class AccordionComponent {
	readonly multiple = input<boolean>(false);

	private readonly _panels = contentChildren(AccordionPanelComponent);
	private _prevExpanded: boolean[] = [];

	constructor() {
		effect(() => {
			const panels = this._panels();
			const current = panels.map((panel) => panel.expanded());

			if (!this.multiple()) {
				const openedIndex = current.findIndex(
					(value, index) => value && !this._prevExpanded[index],
				);

				if (openedIndex !== -1) {
					panels.forEach((panel, index) => {
						if (index !== openedIndex) {
							panel.expanded.set(false);
						}
					});
				}
			}

			this._prevExpanded = panels.map((panel) => panel.expanded());
		});
	}
}
