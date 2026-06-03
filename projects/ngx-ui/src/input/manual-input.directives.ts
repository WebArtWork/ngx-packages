import { Directive, effect, ElementRef, inject, input } from '@angular/core';

@Directive({
	selector: 'input[manualDisabled], textarea[manualDisabled]',
})
export class ManualDisabledDirective {
	readonly manualDisabled = input<boolean | null>(null, {
		alias: 'manualDisabled',
	});

	private readonly _el =
		inject<ElementRef<HTMLInputElement | HTMLTextAreaElement>>(ElementRef);

	constructor() {
		effect(() => {
			this._el.nativeElement.disabled = !!this.manualDisabled();
		});
	}
}

@Directive({
	selector: 'input[manualType], textarea[manualType]',
})
export class ManualTypeDirective {
	readonly manualType = input<string | null>(null, { alias: 'manualType' });

	private readonly _el =
		inject<ElementRef<HTMLInputElement | HTMLTextAreaElement>>(ElementRef);

	constructor() {
		effect(() => {
			const type = this.manualType();

			if (type && this._el.nativeElement.type !== type) {
				this._el.nativeElement.setAttribute('type', type);
			}
		});
	}
}
