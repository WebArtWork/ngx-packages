import { Component, ViewEncapsulation, input } from '@angular/core';
import { WBADGE_TYPE_CLASSES, badgeDefaults } from './badge.const';
import { BadgeType } from './badge.type';

@Component({
	selector: 'wbadge',
	templateUrl: './badge.component.html',
	styleUrl: './badge.component.scss',
	encapsulation: ViewEncapsulation.None,
})
export class BadgeComponent {
	readonly type = input<BadgeType>(badgeDefaults.type);
	readonly value = input<string | number>();
	readonly size = input<'small' | 'large'>();
	readonly extraClass = input<string>(badgeDefaults.extraClass);

	typeClass(): string {
		return WBADGE_TYPE_CLASSES[this.type()] ?? WBADGE_TYPE_CLASSES.primary;
	}
}
