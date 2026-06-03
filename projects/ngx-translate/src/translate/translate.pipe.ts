import { Pipe, inject } from '@angular/core';
import { TranslateVars } from './translate.interface';
import { TranslateService } from './translate.service';

@Pipe({
	name: 'translate',
})
export class TranslatePipe {
	private readonly _translateService = inject(TranslateService);

	transform(text: string, vars?: TranslateVars | null): string {
		return this._translateService.interpolate(this._translateService.translate(text)(), vars);
	}
}
