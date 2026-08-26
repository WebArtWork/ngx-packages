import { Component, ViewEncapsulation, input } from '@angular/core';
import { TranslateDirective } from '@wawjs/ngx-translate';
import { TimelineItem } from './timeline.interface';

@Component({
	selector: 'wtimeline',
	imports: [TranslateDirective],
	templateUrl: './timeline.component.html',
	styleUrl: './timeline.component.scss',
	encapsulation: ViewEncapsulation.None,
})
export class TimelineComponent {
	readonly items = input<TimelineItem[]>([]);
	readonly layout = input<'vertical' | 'horizontal'>('vertical');
}
