import { Component, ViewEncapsulation, input, output, signal } from '@angular/core';
import { ClickOutsideDirective } from '@wawjs/ngx-core';
import { MenuItemComponent } from './menu-item.component';
import { MenuItem } from './menu.interface';

@Component({
	selector: 'wmenu',
	imports: [MenuItemComponent, ClickOutsideDirective],
	templateUrl: './menu.component.html',
	styleUrl: './menu.scss',
	encapsulation: ViewEncapsulation.None,
})
export class MenuComponent {
	readonly items = input<MenuItem[]>([]);
	readonly popup = input<boolean>(false);
	readonly ariaLabel = input<string>('Menu');

	readonly wSelect = output<MenuItem>();

	readonly visible = signal(false);

	toggle(event?: Event): void {
		event?.stopPropagation();
		this.visible.update((value) => !value);
	}

	show(): void {
		this.visible.set(true);
	}

	hide(): void {
		this.visible.set(false);
	}

	onSelect(item: MenuItem): void {
		this.wSelect.emit(item);

		if (this.popup()) {
			this.hide();
		}
	}
}
