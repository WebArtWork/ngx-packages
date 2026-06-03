import { Directive } from '@angular/core';

@Directive({
	selector: '[wselectView]',
})
export class WselectViewDirective {}

@Directive({
	selector: '[wselectItem]',
})
export class WselectItemDirective {}

@Directive({
	selector: '[wselectSearch]',
})
export class WselectSearchDirective {}
