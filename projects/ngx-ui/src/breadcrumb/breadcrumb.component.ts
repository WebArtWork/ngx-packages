import { Component, ViewEncapsulation, input } from '@angular/core';
import { RouterLink } from '@angular/router';
import { TranslateDirective } from '@wawjs/ngx-translate';
import { BreadcrumbItem } from './breadcrumb.interface';

@Component({
	selector: 'wbreadcrumb',
	imports: [RouterLink, TranslateDirective],
	templateUrl: './breadcrumb.component.html',
	styleUrl: './breadcrumb.component.scss',
	encapsulation: ViewEncapsulation.None,
})
export class BreadcrumbComponent {
	readonly items = input<BreadcrumbItem[]>([]);
	readonly homeIcon = input<string>('home');
	readonly extraClass = input<string>('');
}
