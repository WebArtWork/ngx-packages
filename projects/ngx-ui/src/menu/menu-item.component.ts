import {
	Component,
	ViewEncapsulation,
	forwardRef,
	input,
	output,
} from '@angular/core';
import { RouterLink } from '@angular/router';
import { TranslateDirective } from '@wawjs/ngx-translate';
import { MenuItem } from './menu.interface';

@Component({
	selector: 'wmenu-item',
	imports: [RouterLink, TranslateDirective, forwardRef(() => MenuItemComponent)],
	templateUrl: './menu-item.component.html',
	styleUrl: './menu.scss',
	encapsulation: ViewEncapsulation.None,
})
export class MenuItemComponent {
	readonly item = input.required<MenuItem>();

	readonly wSelect = output<MenuItem>();

	onClick(event: Event): void {
		const item = this.item();

		if (item.disabled) {
			event.preventDefault();
			return;
		}

		if (!item.items?.length) {
			item.command?.();
			this.wSelect.emit(item);
			return;
		}

		if (!item.routerLink && !item.href) {
			event.preventDefault();
		}
	}

	onChildSelect(item: MenuItem): void {
		this.wSelect.emit(item);
	}
}
