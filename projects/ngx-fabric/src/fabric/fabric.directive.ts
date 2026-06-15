import {
	Directive,
	DoCheck,
	ElementRef,
	KeyValueDiffer,
	KeyValueDiffers,
	NgZone,
	OnDestroy,
	OnInit,
	OutputEmitterRef,
	effect,
	inject,
	input,
	output,
} from '@angular/core';
import {
	Canvas,
	type CanvasOptions,
	StaticCanvas,
	type StaticCanvasOptions,
} from 'fabric';
import ResizeObserver from 'resize-observer-polyfill';
import {
	FABRIC_CONFIG,
	FabricConfig,
	type FabricConfigInterface,
	type FabricEvent,
	FabricEvents,
} from './fabric.interfaces';

type FabricLoadFromJSONReviver = Parameters<Canvas['loadFromJSON']>[1];

@Directive({
	selector: '[fabric]',
	exportAs: 'ngxFabric',
})
export class FabricDirective implements OnInit, OnDestroy, DoCheck {
	private _instance: Canvas | StaticCanvas | null = null;
	private _resizeObserver: ResizeObserver | null = null;
	private _objectsJSON: string | object | null = null;
	private _initialZoom: number | null = null;
	private _initialWidth: number | null = null;
	private _initialHeight: number | null = null;
	private _configDiff: KeyValueDiffer<string, unknown> | null = null;
	private _lastDisabled = false;

	readonly zoom = input<number | null | undefined>(undefined);
	readonly width = input<number | null | undefined>(undefined);
	readonly height = input<number | null | undefined>(undefined);
	readonly disabled = input(false);
	readonly config = input<FabricConfigInterface | undefined>(undefined, {
		alias: 'fabric',
	});

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

	private readonly _zone = inject(NgZone);
	private readonly _elementRef = inject<ElementRef<HTMLCanvasElement>>(ElementRef);
	private readonly _differs = inject(KeyValueDiffers);
	private readonly _defaults = inject(FABRIC_CONFIG, { optional: true });

	constructor() {
		effect(() => {
			const zoom = this.zoom();
			if (zoom !== null && zoom !== undefined) {
				this.setZoom(zoom);
			}
		});

		effect(() => {
			const width = this.width();
			if (width !== null && width !== undefined) {
				this.setWidth(width);
			}
		});

		effect(() => {
			const height = this.height();
			if (height !== null && height !== undefined) {
				this.setHeight(height);
			}
		});

		effect(() => {
			const disabled = this.disabled();
			if (this._instance && disabled !== this._lastDisabled) {
				this.ngOnDestroy();
				this.ngOnInit();
				return;
			}

			this._lastDisabled = disabled;
		});
	}

	private _configObject(): Record<string, unknown> {
		return (this.config() ?? {}) as Record<string, unknown>;
	}

	ngOnInit(): void {
		const params = new FabricConfig(this._defaults ?? {});
		params.assign(this.config());

		Object.keys(params).forEach(key => {
			if (params[key] === undefined) {
				delete params[key];
			}
		});

		this._zone.runOutsideAngular(() => {
			this._lastDisabled = this.disabled();
			this._instance = this._lastDisabled
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
					const emitter = this[eventName] as OutputEmitterRef<unknown>;
					emitter.emit(event);
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
		reviverOpt?: FabricLoadFromJSONReviver,
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
