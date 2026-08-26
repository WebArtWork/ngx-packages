import { Component, ViewEncapsulation, input, signal } from '@angular/core';

@Component({
	selector: 'wtab',
	template: `
		<div class="wtab" [hidden]="!active()">
			<ng-content></ng-content>
		</div>
	`,
	styleUrl: './tab-panel.component.scss',
	encapsulation: ViewEncapsulation.None,
})
export class TabPanelComponent {
	readonly header = input<string>('');
	readonly disabled = input<boolean>(false);

	readonly active = signal(false);
}
