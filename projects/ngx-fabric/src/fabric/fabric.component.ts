import {
	AfterViewInit,
	Component,
	ViewEncapsulation,
	effect,
	input,
	output,
	viewChild,
} from '@angular/core';
import { FabricDirective } from './fabric.directive';
import type { FabricConfigInterface } from './fabric.interfaces';

@Component({
	selector: 'fabric',
	exportAs: 'ngxFabric',
	host: {
		'[class.fabric]': 'useFabricClass()',
	},
	templateUrl: './fabric.component.html',
	styles: [
		`
			fabric.flex {
				display: flex;
				flex: 1 1 auto;
				min-width: 0;
				min-height: 0;
			}

			fabric {
				display: block;
			}

			fabric.fabric {
				position: relative;
				width: 100%;
				height: 100%;
			}

			fabric.fabric canvas {
				display: block;
				width: 100%;
				height: 100%;
			}
		`,
	],
	encapsulation: ViewEncapsulation.None,
	imports: [FabricDirective],
})
export class FabricComponent implements AfterViewInit {
	private _json: string | object | null = null;

	readonly data = input<string | object | null>(null);
	readonly zoom = input<number | null>(null);
	readonly width = input<number | null>(null);
	readonly height = input<number | null>(null);
	readonly disabled = input(false);
	readonly config = input<FabricConfigInterface | undefined>(undefined);
	readonly useFabricClass = input(true);

	readonly dataLoaded = output<unknown>();
	readonly drop = output<unknown>();
	readonly dragover = output<unknown>();
	readonly dragenter = output<unknown>();
	readonly dragleave = output<unknown>();
	readonly mouseup = output<unknown>();
	readonly mousedown = output<unknown>();
	readonly mouseover = output<unknown>();
	readonly mouseout = output<unknown>();
	readonly mousemove = output<unknown>();
	readonly mousewheel = output<unknown>();
	readonly mousedblclick = output<unknown>();
	readonly mouseupBefore = output<unknown>();
	readonly mousedownBefore = output<unknown>();
	readonly mousemoveBefore = output<unknown>();
	readonly mouseUp = output<unknown>();
	readonly mouseDown = output<unknown>();
	readonly mouseOver = output<unknown>();
	readonly mouseOut = output<unknown>();
	readonly mouseMove = output<unknown>();
	readonly mouseWheel = output<unknown>();
	readonly mouseDblclick = output<unknown>();
	readonly mouseUpBefore = output<unknown>();
	readonly mouseDownBefore = output<unknown>();
	readonly mouseMoveBefore = output<unknown>();
	readonly pathCreated = output<unknown>();
	readonly alterRender = output<unknown>();
	readonly objectAdded = output<unknown>();
	readonly objectMoved = output<unknown>();
	readonly objectScaled = output<unknown>();
	readonly objectSkewed = output<unknown>();
	readonly objectRotated = output<unknown>();
	readonly objectRemoved = output<unknown>();
	readonly objectModified = output<unknown>();
	readonly objectSelected = output<unknown>();
	readonly objectMoving = output<unknown>();
	readonly objectScaling = output<unknown>();
	readonly objectSkewing = output<unknown>();
	readonly objectRotating = output<unknown>();
	readonly selectionCleared = output<unknown>();
	readonly selectionCreated = output<unknown>();
	readonly selectionUpdated = output<unknown>();
	readonly beforeTransform = output<unknown>();
	readonly beforeSelectionCleared = output<unknown>();

	readonly directiveRef = viewChild(FabricDirective);

	constructor() {
		effect(() => {
			const data = this.data();
			if (data !== null) {
				this._setJSON(data);
			}
		});
	}

	ngAfterViewInit(): void {
		if (this._json) {
			this._setJSON(this._json, true);
		}
	}

	private _setJSON(data: string | object, force = false): void {
		if (!force && data === this._json) {
			return;
		}

		const directive = this.directiveRef();
		directive?.loadFromJSON(data, () => {
			const instance = directive.fabric();
			if (instance) {
				this.dataLoaded.emit(instance);
			}
		});

		this._json = data;
	}
}
