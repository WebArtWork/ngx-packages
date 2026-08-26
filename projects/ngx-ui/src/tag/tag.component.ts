import { Component, ViewEncapsulation, input } from '@angular/core';
import { TranslateDirective } from '@wawjs/ngx-translate';
import { WTAG_TYPE_CLASSES, tagDefaults } from './tag.const';
import { TagType } from './tag.type';

@Component({
	selector: 'wtag',
	imports: [TranslateDirective],
	templateUrl: './tag.component.html',
	styleUrl: './tag.component.scss',
	encapsulation: ViewEncapsulation.None,
})
export class TagComponent {
	readonly type = input<TagType>(tagDefaults.type);
	readonly value = input<string>();
	readonly icon = input<string>();
	readonly rounded = input<boolean>(tagDefaults.rounded);
	readonly extraClass = input<string>(tagDefaults.extraClass);

	typeClass(): string {
		return WTAG_TYPE_CLASSES[this.type()] ?? WTAG_TYPE_CLASSES.primary;
	}
}
