import {
	Directive,
	DoCheck,
	ElementRef,
	EventEmitter,
	Inject,
	Input,
	KeyValueDiffer,
	KeyValueDiffers,
	NgZone,
	OnChanges,
	OnDestroy,
	OnInit,
	Optional,
	Output,
	SimpleChanges,
} from '@angular/core';
import { Canvas, type CanvasOptions, StaticCanvas, type StaticCanvasOptions } from 'fabric';
import ResizeObserver from 'resize-observer-polyfill';
import {
	FABRIC_CONFIG,
	FabricConfig,
	type FabricConfigInterface,
	type FabricEvent,
	FabricEvents,
} from './fabric.interfaces';

@Directive({
	selector: '[fabric]',
	exportAs: 'ngxFabric',
})
export class FabricDirective implements OnInit, OnDestroy, DoCheck, OnChanges {
	private _instance: Canvas | StaticCanvas | null = null;
	private _resizeObserver: ResizeObserver | null = null;
	private _objectsJSON: string | object | null = null;
	private _initialZoom: number | null = null;
	private _initialWidth: number | null = null;
	private _initialHeight: number | null = null;
	private _configDiff: KeyValueDiffer<string, unknown> | null = null;

	@Input()
	set zoom(zoom: number | null | undefined) {
		if (zoom !== null && zoom !== undefined) {
			this.setZoom(zoom);
		}
	}

	@Input()
	set width(width: number | null | undefined) {
		if (width !== null && width !== undefined) {
			this.setWidth(width);
		}
	}

	@Input()
	set height(height: number | null | undefined) {
		if (height !== null && height !== undefined) {
			this.setHeight(height);
		}
	}

	@Input() disabled = false;
	@Input('fabric') config?: FabricConfigInterface;

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

	constructor(
		private readonly _zone: NgZone,
		private readonly _elementRef: ElementRef<HTMLCanvasElement>,
		private readonly _differs: KeyValueDiffers,
		@Optional() @Inject(FABRIC_CONFIG) private readonly _defaults: FabricConfigInterface | null,
	) {}

	private _configObject(): Record<string, unknown> {
		return (this.config ?? {}) as Record<string, unknown>;
	}

	ngOnInit(): void {
		const params = new FabricConfig(this._defaults ?? {});
		params.assign(this.config);

		Object.keys(params).forEach(key => {
			if (params[key] === undefined) {
				delete params[key];
			}
		});

		this._zone.runOutsideAngular(() => {
			this._instance = this.disabled
				? new StaticCanvas(
						this._elementRef.nativeElement,
						params as unknown as StaticCanvasOptions,
					)
				: new Canvas(this._elementRef.nativeElement, params as unknown as CanvasOptions);

			if (this._initialZoom !== null) {
				this.setZoom(this._initialZoom);
			}

			if (this._initialWidth !== null) {
				this.setWidth(this._initialWidth);
			}

			if (this._initialHeight !== null) {
				this.setHeight(this._initialHeight);
			}

			if (this._objectsJSON !== null) {
				this.loadFromJSON(this._objectsJSON);
			}
		});

		FabricEvents.forEach((eventName: FabricEvent) => {
			const fabricEvent = eventName.replace(/([A-Z])/g, letter => `:${letter.toLowerCase()}`);

			this._instance?.on(fabricEvent as never, (event: unknown) => {
				this._zone.run(() => {
					const emitter = this[eventName] as EventEmitter<unknown>;
					if (emitter.observers.length) {
						emitter.emit(event);
					}
				});
			});
		});

		if (!this._configDiff) {
			this._configDiff = this._differs.find(this._configObject()).create();
			this._configDiff.diff(this._configObject());
		}

		this._zone.runOutsideAngular(() => {
			this._resizeObserver = new ResizeObserver(() => {
				const host = this._elementRef.nativeElement.parentElement?.parentElement;
				if (!host) {
					return;
				}

				if (this._initialWidth === null) {
					this.setWidth(host.offsetWidth);
				}

				if (this._initialHeight === null) {
					this.setHeight(host.offsetHeight);
				}
			});

			const observed = this._elementRef.nativeElement.parentElement?.parentElement;
			if (observed) {
				this._resizeObserver.observe(observed);
			}
		});
	}

	ngOnDestroy(): void {
		this._resizeObserver?.disconnect();
		this._resizeObserver = null;

		if (this._instance) {
			this._objectsJSON = this._instance.toObject();
			this._instance.dispose();
			this._instance = null;
		}
	}

	ngDoCheck(): void {
		const changes = this._configDiff?.diff(this._configObject());
		if (changes) {
			this.ngOnDestroy();
			this.ngOnInit();
		}
	}

	ngOnChanges(changes: SimpleChanges): void {
		if (
			this._instance &&
			changes['disabled'] &&
			changes['disabled'].currentValue !== changes['disabled'].previousValue
		) {
			this.ngOnDestroy();
			this.ngOnInit();
		}
	}

	fabric(): Canvas | StaticCanvas | null {
		return this._instance;
	}

	clear(): void {
		this._instance?.clear();
	}

	render(): void {
		this._instance?.renderAll();
	}

	setZoom(zoom: number): void {
		this._initialZoom = zoom;
		this._instance?.setZoom(zoom);
	}

	setWidth(width: number): void {
		this._initialWidth = width;
		this._instance?.setDimensions({ width });
	}

	setHeight(height: number): void {
		this._initialHeight = height;
		this._instance?.setDimensions({ height });
	}

	loadFromJSON(
		json: string | object,
		callback?: () => boolean | void,
		reviverOpt?: unknown,
	): void {
		if (!this._instance) {
			return;
		}

		this._instance.loadFromJSON(json, reviverOpt).then(() => {
			const shouldRender = callback ? callback() !== false : true;
			if (shouldRender) {
				this._instance?.renderAll();
			}
		});
	}
}
