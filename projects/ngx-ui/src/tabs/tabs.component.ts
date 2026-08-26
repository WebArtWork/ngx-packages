import {
	Component,
	ViewEncapsulation,
	contentChildren,
	effect,
	model,
} from '@angular/core';
import { TranslateDirective } from '@wawjs/ngx-translate';
import { TabPanelComponent } from './tab-panel.component';

@Component({
	selector: 'wtabs',
	imports: [TranslateDirective],
	templateUrl: './tabs.component.html',
	styleUrl: './tabs.component.scss',
	encapsulation: ViewEncapsulation.None,
})
export class TabsComponent {
	readonly activeIndex = model<number>(0);

	readonly panels = contentChildren(TabPanelComponent);

	constructor() {
		effect(() => {
			const panels = this.panels();
			const active = this.activeIndex();

			panels.forEach((panel, index) => panel.active.set(index === active));
		});
	}

	select(index: number): void {
		if (this.panels()[index]?.disabled()) {
			return;
		}

		this.activeIndex.set(index);
	}
}
