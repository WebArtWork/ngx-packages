import { Component, ViewEncapsulation, computed, input } from '@angular/core';
import { TranslateDirective } from '@wawjs/ngx-translate';
import { MeterItem } from './metergroup.interface';

@Component({
	selector: 'wmetergroup',
	imports: [TranslateDirective],
	templateUrl: './metergroup.component.html',
	styleUrl: './metergroup.component.scss',
	encapsulation: ViewEncapsulation.None,
})
export class MeterGroupComponent {
	readonly items = input<MeterItem[]>([]);
	readonly max = input<number>();

	readonly total = computed(
		() =>
			this.max() ??
			this.items().reduce((sum, item) => sum + item.value, 0) ??
			0,
	);

	percent(value: number): number {
		const total = this.total();

		return total > 0 ? Math.min(100, (value / total) * 100) : 0;
	}
}
