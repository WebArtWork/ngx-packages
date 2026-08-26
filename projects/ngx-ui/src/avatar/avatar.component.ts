import { Component, ViewEncapsulation, computed, input } from '@angular/core';
import { avatarDefaults } from './avatar.const';

@Component({
	selector: 'wavatar',
	templateUrl: './avatar.component.html',
	styleUrl: './avatar.component.scss',
	encapsulation: ViewEncapsulation.None,
})
export class AvatarComponent {
	readonly image = input<string>();
	readonly label = input<string>();
	readonly icon = input<string>(avatarDefaults.icon);
	readonly size = input<'small' | 'normal' | 'large'>(avatarDefaults.size);
	readonly shape = input<'circle' | 'square'>(avatarDefaults.shape);
	readonly extraClass = input<string>(avatarDefaults.extraClass);

	readonly initials = computed(() => {
		const label = this.label()?.trim();

		if (!label) {
			return '';
		}

		const parts = label.split(/\s+/).filter(Boolean);

		if (parts.length === 1) {
			return parts[0].slice(0, 2).toUpperCase();
		}

		return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
	});
}
