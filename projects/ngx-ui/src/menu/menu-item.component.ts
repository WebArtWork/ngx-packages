import {
	Component,
	ElementRef,
	ViewEncapsulation,
	forwardRef,
	input,
	output,
	viewChild,
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
	readonly wEscape = output<void>();

	private readonly _link = viewChild<ElementRef<HTMLElement>>('itemLink');

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

	onChildEscape(): void {
		this.wEscape.emit();
	}

	onKeydown(event: KeyboardEvent): void {
		const link = this._link()?.nativeElement;
		if (!link) return;

		switch (event.key) {
			case 'ArrowDown':
				event.preventDefault();
				this._focusSibling(link, 1);
				break;
			case 'ArrowUp':
				event.preventDefault();
				this._focusSibling(link, -1);
				break;
			case 'Home':
				event.preventDefault();
				this._focusEdge(link, 'first');
				break;
			case 'End':
				event.preventDefault();
				this._focusEdge(link, 'last');
				break;
			case 'ArrowRight':
				if (this.item().items?.length) {
					event.preventDefault();
					this._focusFirstChild(link);
				}
				break;
			case 'ArrowLeft':
				if (this._focusParent(link)) {
					event.preventDefault();
				}
				break;
			case 'Escape': {
				// Only consume/stop the keystroke when it actually closed a
				// submenu level here — otherwise let it bubble (e.g. so an
				// ancestor modal can still close on the same Escape).
				const closedSubmenu = this._focusParent(link);

				if (closedSubmenu) {
					event.preventDefault();
					event.stopPropagation();
				} else {
					this.wEscape.emit();
				}
				break;
			}
		}
	}

	private _siblingItems(link: HTMLElement): HTMLElement[] {
		const list = link.closest('ul');
		if (!list) return [];
		return Array.from(list.querySelectorAll<HTMLElement>(':scope > li > .wmenu__link'));
	}

	private _focusSibling(link: HTMLElement, delta: 1 | -1): void {
		const items = this._siblingItems(link);
		if (!items.length) return;
		const idx = items.indexOf(link);
		const next = items[(idx + delta + items.length) % items.length];
		next?.focus();
	}

	private _focusEdge(link: HTMLElement, edge: 'first' | 'last'): void {
		const items = this._siblingItems(link);
		if (!items.length) return;
		(edge === 'first' ? items[0] : items[items.length - 1])?.focus();
	}

	private _focusFirstChild(link: HTMLElement): void {
		const submenu = link.parentElement?.querySelector('ul.wmenu__submenu');
		const firstLink = submenu?.querySelector<HTMLElement>(':scope > li > .wmenu__link');
		firstLink?.focus();
	}

	/** Returns true when a parent trigger was focused (i.e. this item is inside a submenu). */
	private _focusParent(link: HTMLElement): boolean {
		const submenu = link.closest('ul.wmenu__submenu');
		if (!submenu) return false;

		const parentLink = submenu.parentElement?.querySelector<HTMLElement>(
			':scope > .wmenu__link',
		);
		parentLink?.focus();
		return true;
	}
}
