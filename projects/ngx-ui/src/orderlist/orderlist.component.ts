import { Component, ViewEncapsulation, input, model } from '@angular/core';
import { ButtonDirective } from '../button/button.directive';

@Component({
	selector: 'worderlist',
	imports: [ButtonDirective],
	templateUrl: './orderlist.component.html',
	styleUrl: './orderlist.component.scss',
	encapsulation: ViewEncapsulation.None,
})
export class OrderListComponent<T = unknown> {
	readonly items = model<T[]>([]);
	readonly bindLabel = input<string>('label');

	label(item: T): string {
		const key = this.bindLabel();

		return String((item as Record<string, unknown>)[key] ?? item);
	}

	moveUp(index: number): void {
		if (index <= 0) {
			return;
		}

		this._swap(index, index - 1);
	}

	moveDown(index: number): void {
		const items = this.items();

		if (index >= items.length - 1) {
			return;
		}

		this._swap(index, index + 1);
	}

	moveTop(index: number): void {
		if (index <= 0) {
			return;
		}

		const items = [...this.items()];
		const [item] = items.splice(index, 1);
		items.unshift(item);
		this.items.set(items);
	}

	moveBottom(index: number): void {
		const items = [...this.items()];

		if (index >= items.length - 1) {
			return;
		}

		const [item] = items.splice(index, 1);
		items.push(item);
		this.items.set(items);
	}

	private _swap(a: number, b: number): void {
		const items = [...this.items()];
		[items[a], items[b]] = [items[b], items[a]];
		this.items.set(items);
	}
}
