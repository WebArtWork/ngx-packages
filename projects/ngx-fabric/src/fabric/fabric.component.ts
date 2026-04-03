import {
	AfterViewInit,
	Component,
	EventEmitter,
	HostBinding,
	Input,
	Output,
	ViewChild,
	ViewEncapsulation,
} from '@angular/core';
import { FabricDirective } from './fabric.directive';
import type { FabricConfigInterface } from './fabric.interfaces';

@Component({
	selector: 'fabric',
	exportAs: 'ngxFabric',
	templateUrl: './fabric.component.html',
	styleUrl: './fabric.component.scss',
	encapsulation: ViewEncapsulation.None,
	imports: [FabricDirective],
})
export class FabricComponent implements AfterViewInit {
	private _json: string | object | null = null;

	@Input()
	set data(data: string | object | null) {
		if (data !== null) {
			this._setJSON(data);
		}
	}

	@Input() zoom: number | null = null;
	@Input() width: number | null = null;
	@Input() height: number | null = null;
	@Input() disabled = false;
	@Input() config?: FabricConfigInterface;

	@HostBinding('class.fabric')
	@Input()
	useFabricClass = true;

	@Output() dataLoaded = new EventEmitter<unknown>();
	@Output() drop = new EventEmitter<unknown>();
	@Output() dragover = new EventEmitter<unknown>();
	@Output() dragenter = new EventEmitter<unknown>();
	@Output() dragleave = new EventEmitter<unknown>();
	@Output() mouseup = new EventEmitter<unknown>();
	@Output() mousedown = new EventEmitter<unknown>();
	@Output() mouseover = new EventEmitter<unknown>();
	@Output() mouseout = new EventEmitter<unknown>();
	@Output() mousemove = new EventEmitter<unknown>();
	@Output() mousewheel = new EventEmitter<unknown>();
	@Output() mousedblclick = new EventEmitter<unknown>();
	@Output() mouseupBefore = new EventEmitter<unknown>();
	@Output() mousedownBefore = new EventEmitter<unknown>();
	@Output() mousemoveBefore = new EventEmitter<unknown>();
	@Output() mouseUp = new EventEmitter<unknown>();
	@Output() mouseDown = new EventEmitter<unknown>();
	@Output() mouseOver = new EventEmitter<unknown>();
	@Output() mouseOut = new EventEmitter<unknown>();
	@Output() mouseMove = new EventEmitter<unknown>();
	@Output() mouseWheel = new EventEmitter<unknown>();
	@Output() mouseDblclick = new EventEmitter<unknown>();
	@Output() mouseUpBefore = new EventEmitter<unknown>();
	@Output() mouseDownBefore = new EventEmitter<unknown>();
	@Output() mouseMoveBefore = new EventEmitter<unknown>();
	@Output() pathCreated = new EventEmitter<unknown>();
	@Output() alterRender = new EventEmitter<unknown>();
	@Output() objectAdded = new EventEmitter<unknown>();
	@Output() objectMoved = new EventEmitter<unknown>();
	@Output() objectScaled = new EventEmitter<unknown>();
	@Output() objectSkewed = new EventEmitter<unknown>();
	@Output() objectRotated = new EventEmitter<unknown>();
	@Output() objectRemoved = new EventEmitter<unknown>();
	@Output() objectModified = new EventEmitter<unknown>();
	@Output() objectSelected = new EventEmitter<unknown>();
	@Output() objectMoving = new EventEmitter<unknown>();
	@Output() objectScaling = new EventEmitter<unknown>();
	@Output() objectSkewing = new EventEmitter<unknown>();
	@Output() objectRotating = new EventEmitter<unknown>();
	@Output() selectionCleared = new EventEmitter<unknown>();
	@Output() selectionCreated = new EventEmitter<unknown>();
	@Output() selectionUpdated = new EventEmitter<unknown>();
	@Output() beforeTransform = new EventEmitter<unknown>();
	@Output() beforeSelectionCleared = new EventEmitter<unknown>();

	@ViewChild(FabricDirective, { static: true }) directiveRef?: FabricDirective;

	ngAfterViewInit(): void {
		if (this._json) {
			this._setJSON(this._json, true);
		}
	}

	private _setJSON(json: string | object, force = false): void {
		if (!force && json === this._json) {
			return;
		}

		this.directiveRef?.loadFromJSON(json, () => {
			const instance = this.directiveRef?.fabric();
			if (instance) {
				this.dataLoaded.emit(instance);
			}
		});

		this._json = json;
	}
}
