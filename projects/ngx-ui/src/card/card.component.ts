import { Component, ViewEncapsulation, input } from '@angular/core';
import { TranslateDirective } from '@wawjs/ngx-translate';

@Component({
	selector: 'wcard',
	imports: [TranslateDirective],
	templateUrl: './card.component.html',
	styleUrl: './card.component.scss',
	encapsulation: ViewEncapsulation.None,
})
export class CardComponent {
	readonly title = input<string>();
	readonly subtitle = input<string>();
	readonly extraClass = input<string>('');
}
