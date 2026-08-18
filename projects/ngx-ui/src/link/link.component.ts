import {
	Component,
	ViewEncapsulation,
	computed,
	input,
	output,
} from '@angular/core';
import { TranslateDirective } from '@wawjs/ngx-translate';
import { LinkType } from './link.type';

@Component({
	selector: 'wlink',
	imports: [TranslateDirective],
	templateUrl: './link.component.html',
	styleUrl: './link.component.scss',
	encapsulation: ViewEncapsulation.None,
})
export class LinkComponent {
	readonly value = input('');
	readonly type = input<LinkType>('url');
	readonly href = input<string | null>(null);
	readonly label = input('');
	readonly icon = input('');
	readonly target = input('_self');
	readonly rel = input<string | null>(null);
	readonly wClass = input('');
	readonly disabled = input(false);

	readonly wClick = output<MouseEvent>();

	readonly linkHref = computed(() => {
		const explicitHref = this.href()?.trim();
		if (explicitHref) {
			return explicitHref;
		}

		const value = this.value().trim();
		if (!value) {
			return null;
		}

		switch (this.type()) {
			case 'email':
				return `mailto:${value}`;
			case 'tel':
				return `tel:${value.replace(/[^+\d]/g, '')}`;
			case 'sms':
				return `sms:${value.replace(/[^+\d]/g, '')}`;
			case 'whatsapp':
				return `https://wa.me/${value.replace(/\D/g, '')}`;
			case 'url':
				return /^[a-z][a-z\d+.-]*:/i.test(value) ? value : `https://${value}`;
			case 'custom':
				return null;
			default:
				return null;
		}
	});

	readonly linkRel = computed(() => {
		const rel = this.rel()?.trim();
		if (rel) {
			return rel;
		}

		return this.target() === '_blank' ? 'noopener noreferrer' : null;
	});

	readonly isClickable = computed(() => !!this.linkHref() && !this.disabled());

	onClick(event: MouseEvent): void {
		if (!this.isClickable()) {
			event.preventDefault();
			return;
		}

		this.wClick.emit(event);
	}
}
