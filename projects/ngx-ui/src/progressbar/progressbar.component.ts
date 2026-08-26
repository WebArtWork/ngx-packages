import { Component, ViewEncapsulation, input } from '@angular/core';

@Component({
	selector: 'wprogressbar',
	templateUrl: './progressbar.component.html',
	styleUrl: './progressbar.component.scss',
	encapsulation: ViewEncapsulation.None,
})
export class ProgressBarComponent {
	readonly value = input<number>(0);
	readonly mode = input<'determinate' | 'indeterminate'>('determinate');
	readonly showValue = input<boolean>(true);
	readonly extraClass = input<string>('');
}
