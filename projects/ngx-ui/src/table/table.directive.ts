import { Directive, TemplateRef, inject, input } from '@angular/core';

@Directive({ selector: 'ng-template[cell]' })
export class CellDirective {
	template = inject<TemplateRef<any>>(TemplateRef);

	cell = input();
}

@Directive({ selector: 'ng-template[sort]' })
export class SortDirective {
	template = inject<TemplateRef<any>>(TemplateRef);

	sort = input();
}

@Directive({ selector: 'ng-template[actions]' })
export class ActionsDirective {
	template = inject<TemplateRef<any>>(TemplateRef);
}

@Directive({ selector: 'ng-template[customEdit]' })
export class CustomEditDirective {
	template = inject<TemplateRef<any>>(TemplateRef);
}

/** Optional header slot for <wtable> */
@Directive({ selector: 'ng-template[tableHeader]' })
export class TableHeaderDirective {
	template = inject<TemplateRef<any>>(TemplateRef);
}
