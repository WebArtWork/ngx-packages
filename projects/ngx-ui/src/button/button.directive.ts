import {
	Directive,
	ElementRef,
	Renderer2,
	effect,
	inject,
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
		'[attr.aria-label]': 'ariaLabel() || null',
		'[attr.autofocus]': 'autofocus() ? "" : null',
		'[class]': 'hostClass',
		'(click)': 'onClick($event)',
	},
})
export class ButtonDirective {
	private readonly _elementRef = inject<ElementRef<HTMLElement>>(ElementRef);
	private readonly _renderer = inject(Renderer2);
	private readonly _staticClass =
		this._elementRef.nativeElement.getAttribute('class') ?? '';

	readonly type = input<ButtonType>(buttonDefaults.type);
	readonly disabled = input<boolean>(buttonDefaults.disabled);
	readonly disableSubmit = input<boolean>(buttonDefaults.disableSubmit);
	readonly isMultipleClicksAllowed = input<boolean>(
		buttonDefaults.isMultipleClicksAllowed,
	);

	readonly extraClass = input<string>(buttonDefaults.extraClass);

	/** Material icon name shown next to the button content. */
	readonly icon = input<string>();
	readonly iconPos = input<'left' | 'right'>('left');
	/** Shows a spinning icon and blocks clicks while true. */
	readonly loading = input<boolean>(false);
	readonly loadingIcon = input<string>('progress_activity');
	readonly size = input<'small' | 'large'>();
	readonly outlined = input<boolean>(false);
	readonly text = input<boolean>(false);
	readonly raised = input<boolean>(false);
	readonly rounded = input<boolean>(false);
	readonly plain = input<boolean>(false);
	/** Small count/status badge appended after the button content. */
	readonly badge = input<string>();
	readonly badgeSeverity = input<ButtonType>('secondary');
	readonly ariaLabel = input<string>();
	readonly autofocus = input<boolean>(false);

	readonly wClick = output<void>();

	private cooling = false;
	private readonly _iconEl: HTMLElement;
	private readonly _badgeEl: HTMLElement;

	private get tag(): string {
		return this._elementRef.nativeElement.tagName;
	}
	private get isButton(): boolean {
		return this.tag === 'BUTTON';
	}
	private get isBlocked(): boolean {
		return (
			this.disabled() ||
			this.loading() ||
			(!this.isMultipleClicksAllowed() && this.cooling)
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
		const size = this.size();

		return [
			this._staticClass,
			'wbutton',
			WBUTTON_BASE_CLASSES,
			typeClass,
			size ? `wbutton--${size}` : '',
			this.outlined() ? 'wbutton--outlined' : '',
			this.text() ? 'wbutton--text' : '',
			this.raised() ? 'wbutton--raised' : '',
			this.rounded() ? 'wbutton--rounded' : '',
			this.plain() ? 'wbutton--plain' : '',
			this.loading() ? 'wbutton--loading' : '',
			this.extraClass() || '',
		]
			.filter(Boolean)
			.join(' ');
	}

	constructor() {
		this._iconEl = this._renderer.createElement('span');
		this._renderer.addClass(this._iconEl, 'wbutton__icon');
		this._renderer.addClass(this._iconEl, 'material-icons');
		this._renderer.setAttribute(this._iconEl, 'aria-hidden', 'true');

		this._badgeEl = this._renderer.createElement('span');
		this._renderer.addClass(this._badgeEl, 'wbutton__badge');

		effect(() => this._syncIcon());
		effect(() => this._syncBadge());
	}

	onClick(ev: Event) {
		if (this.isBlocked) {
			ev.preventDefault();
			ev.stopImmediatePropagation();
			return;
		}

		this.wClick.emit();

		if (!this.isMultipleClicksAllowed()) {
			this.cooling = true;
			setTimeout(() => (this.cooling = false), 2000);
		}
	}

	private _syncIcon(): void {
		const iconName = this.loading() ? this.loadingIcon() : this.icon();
		const host = this._elementRef.nativeElement;

		if (!iconName) {
			if (this._iconEl.parentElement) {
				this._renderer.removeChild(host, this._iconEl);
			}
			return;
		}

		this._renderer.setProperty(this._iconEl, 'textContent', iconName);
		this._iconEl.classList.toggle('wbutton__icon--spin', this.loading());
		this._iconEl.classList.toggle(
			'wbutton__icon--right',
			this.iconPos() === 'right',
		);

		if (!this._iconEl.parentElement) {
			if (this.iconPos() === 'right') {
				this._renderer.appendChild(host, this._iconEl);
			} else {
				this._renderer.insertBefore(host, this._iconEl, host.firstChild);
			}
		}
	}

	private _syncBadge(): void {
		const badgeText = this.badge();
		const host = this._elementRef.nativeElement;

		if (!badgeText) {
			if (this._badgeEl.parentElement) {
				this._renderer.removeChild(host, this._badgeEl);
			}
			return;
		}

		this._renderer.setProperty(this._badgeEl, 'textContent', badgeText);
		this._badgeEl.className =
			`wbutton__badge wbutton__badge--${this.badgeSeverity()}`.trim();

		if (!this._badgeEl.parentElement) {
			this._renderer.appendChild(host, this._badgeEl);
		}
	}
}
