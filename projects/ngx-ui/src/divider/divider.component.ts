import { Component, ViewEncapsulation, input } from '@angular/core';

@Component({
	selector: 'wdivider',
	templateUrl: './divider.component.html',
	styleUrl: './divider.component.scss',
	encapsulation: ViewEncapsulation.None,
})
export class DividerComponent {
	readonly layout = input<'horizontal' | 'vertical'>('horizontal');
	readonly type = input<'solid' | 'dashed' | 'dotted'>('solid');
	readonly extraClass = input<string>('');
}
