import { Component, ViewEncapsulation, input, output } from '@angular/core';
import { TranslateDirective } from '@wawjs/ngx-translate';

@Component({
	selector: 'wchip',
	imports: [TranslateDirective],
	templateUrl: './chip.component.html',
	styleUrl: './chip.component.scss',
	encapsulation: ViewEncapsulation.None,
})
export class ChipComponent {
	readonly value = input<string>();
	readonly icon = input<string>();
	readonly image = input<string>();
	readonly removable = input<boolean>(false);
	readonly extraClass = input<string>('');

	readonly wRemove = output<void>();
}
