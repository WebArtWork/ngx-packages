import { Component, ViewEncapsulation, input, signal } from '@angular/core';

@Component({
	selector: 'wtab',
	template: `
		<div
			class="wtab"
			role="tabpanel"
			[id]="panelId()"
			[attr.aria-labelledby]="tabId()"
			tabindex="0"
			[hidden]="!active()"
		>
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

	/** Set by the parent `TabsComponent` to wire the `tabpanel`/`tab` ARIA relationship. */
	readonly panelId = signal('');
	readonly tabId = signal('');
}
