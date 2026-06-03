import {
	Directive,
	ElementRef,
	input,
	output,
} from '@angular/core';
import {
	buttonDefaults,
	WBUTTON_BASE_CLASSES,
	WBUTTON_TYPE_CLASSES,
} from './button.const';
import { ButtonType } from './button.type';

@Directive({
	selector: 'button[wbutton], a[wbutton]',
	host: {
		'[attr.type]': 'hostType',
		'[attr.disabled]': 'nativeDisabled',
		'[attr.aria-disabled]': 'ariaDisabled',
		'[class]': 'hostClass',
		'(click)': 'onClick($event)',
	},
})
export class ButtonDirective {
	constructor(private el: ElementRef<HTMLElement>) {}

	readonly type = input<ButtonType>(buttonDefaults.type);
	readonly disabled = input<boolean>(buttonDefaults.disabled);
	readonly disableSubmit = input<boolean>(buttonDefaults.disableSubmit);
	readonly isMultipleClicksAllowed = input<boolean>(
		buttonDefaults.isMultipleClicksAllowed,
	);

	readonly extraClass = input<string>(buttonDefaults.extraClass);

	readonly wClick = output<void>();

	private cooling = false;

	private get tag(): string {
		return this.el.nativeElement.tagName;
	}
	private get isButton(): boolean {
		return this.tag === 'BUTTON';
	}
	private get isBlocked(): boolean {
		return (
			this.disabled() || (!this.isMultipleClicksAllowed() && this.cooling)
		);
	}

	get hostType(): 'button' | 'submit' | null {
		return this.isButton
			? this.disableSubmit()
				? 'button'
				: 'submit'
			: null;
	}

	get nativeDisabled(): '' | null {
		return this.isButton && this.isBlocked ? '' : null;
	}

	get ariaDisabled(): 'true' | null {
		return !this.isButton && this.isBlocked ? 'true' : null;
	}

	get hostClass(): string {
		const typeClass =
			WBUTTON_TYPE_CLASSES[this.type()] ?? WBUTTON_TYPE_CLASSES.primary;

		return [
			'wbutton',
			WBUTTON_BASE_CLASSES,
			typeClass,
			this.extraClass() || '',
		]
			.filter(Boolean)
			.join(' ');
	}

	onClick(ev: Event) {
		if (this.isBlocked) {
			ev.preventDefault();
			(ev as any).stopImmediatePropagation?.();
			return;
		}

		this.wClick.emit();

		if (!this.isMultipleClicksAllowed()) {
			this.cooling = true;
			setTimeout(() => (this.cooling = false), 2000);
		}
	}
}
