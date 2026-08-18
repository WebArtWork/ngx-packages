import { Component, input } from '@angular/core';

@Component({
	selector: 'plus-icon',
	template: `
		<svg
			class="plus-icon"
			[attr.width]="size()"
			[attr.height]="size()"
			[attr.aria-hidden]="ariaHidden()"
			viewBox="0 0 24 24"
			[style.transform]="'rotate(' + rotate() + 'deg)'"
		>
			<path
				d="M12 5v14M5 12h14"
				fill="none"
				stroke="currentColor"
				stroke-linecap="round"
				[attr.stroke-width]="strokeWidth()"
			/>
		</svg>
	`,
	styles: [
		`
			:host {
				display: inline-flex;
				align-items: center;
				justify-content: center;
				line-height: 0;
			}

			.plus-icon {
				display: block;
				flex: 0 0 auto;
				transition: transform 160ms ease;
			}
		`,
	],
})
export class PlusIconComponent {
	readonly size = input(20);
	readonly rotate = input(0);
	readonly strokeWidth = input(2.25);
	readonly ariaHidden = input('true');
}
