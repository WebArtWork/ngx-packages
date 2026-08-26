import { Component, ViewEncapsulation, input, output } from '@angular/core';
import { MenuItemComponent } from './menu-item.component';
import { MenuItem } from './menu.interface';

@Component({
	selector: 'wmenubar',
	imports: [MenuItemComponent],
	template: `
		<ul class="wmenubar">
			@for (item of items(); track item) {
			<wmenu-item [item]="item" (wSelect)="wSelect.emit($event)" />
			}
		</ul>
	`,
	styleUrl: './menu.scss',
	encapsulation: ViewEncapsulation.None,
})
export class MenubarComponent {
	readonly items = input<MenuItem[]>([]);

	readonly wSelect = output<MenuItem>();
}
