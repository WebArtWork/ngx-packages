import { Component, ViewEncapsulation, input } from '@angular/core';

@Component({
	selector: 'wspinner',
	templateUrl: './spinner.component.html',
	styleUrl: './spinner.component.scss',
	encapsulation: ViewEncapsulation.None,
})
export class SpinnerComponent {
	readonly size = input<string>('2rem');
	readonly strokeWidth = input<number>(3);
	readonly extraClass = input<string>('');
}
