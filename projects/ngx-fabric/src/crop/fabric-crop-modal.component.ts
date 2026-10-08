import {
	AfterViewInit,
	ChangeDetectorRef,
	Component,
	ElementRef,
	OnDestroy,
	PLATFORM_ID,
	inject,
	viewChild,
} from '@angular/core';
import { DOCUMENT, isPlatformBrowser } from '@angular/common';
import { ButtonComponent } from '@wawjs/ngx-ui';
import { Canvas, FabricImage, Point, Rect } from 'fabric';
import {
	DEFAULT_FABRIC_CROP_LABELS,
	type FabricCropFormat,
	type FabricCropImageInput,
	type FabricCropLabels,
	type FabricCropResult,
	type FabricCropTools,
} from './fabric-crop.interfaces';

type ImageElement = HTMLImageElement | HTMLCanvasElement;

interface Box {
	left: number;
	top: number;
	width: number;
	height: number;
}

interface FrameState {
	left: number;
	top: number;
	scaleX: number;
	scaleY: number;
}

interface CropState {
	zoom: number;
	objectScale: number;
	image: Pick<
		FabricImage,
		'left' | 'top' | 'scaleX' | 'scaleY' | 'angle' | 'flipX' | 'flipY' | 'skewX' | 'skewY'
	>;
	frame: FrameState & { width: number; height: number };
}

const MAX_ZOOM = 4;
const MAX_HISTORY = 50;
const MIN_FRAME = 24;
const EPSILON = 0.5;

/**
 * Crop editor.
 *
 * The canvas view is never transformed: pan, zoom, rotate, flip and skew are
 * applied to the photo itself, so the crop frame stays where it is on screen
 * and the photo moves under it. The crop is exported by rendering the canvas.
 */
@Component({
	selector: 'ngx-fabric-crop-modal',
	imports: [ButtonComponent],
	host: { '(keydown)': 'onKeydown($event)' },
	template: `
		<section class="fabric-crop">
			<header class="fabric-crop__header">
				<h2>{{ title }}</h2>
				<p id="fabric-crop-status">{{ status }}</p>
			</header>

			<div class="fabric-crop__stage">
				<canvas
					#canvasEl
					tabindex="0"
					role="application"
					[attr.aria-label]="l.cropFrame"
					aria-describedby="fabric-crop-status"
				></canvas>
			</div>

			<div class="fabric-crop__toolbar" role="toolbar" [attr.aria-label]="title">
				@if (t.history) {
					<div class="fabric-crop__group">
						<button
							type="button"
							class="fabric-crop__tool"
							[disabled]="!canUndo"
							[attr.aria-label]="l.undo"
							[title]="l.undo"
							(click)="undo()"
						>
							<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M9 14 4 9l5-5" /><path d="M4 9h10.5a5.5 5.5 0 0 1 0 11H11" /></svg>
						</button>
						<button
							type="button"
							class="fabric-crop__tool"
							[disabled]="!canRedo"
							[attr.aria-label]="l.redo"
							[title]="l.redo"
							(click)="redo()"
						>
							<svg viewBox="0 0 24 24" aria-hidden="true"><path d="m15 14 5-5-5-5" /><path d="M20 9H9.5a5.5 5.5 0 0 0 0 11H13" /></svg>
						</button>
					</div>
				}

				@if (t.rotate) {
					<div class="fabric-crop__group">
						<button
							type="button"
							class="fabric-crop__tool"
							[disabled]="!isReady"
							[attr.aria-label]="l.rotateLeft"
							[title]="l.rotateLeft"
							(click)="rotate(-90)"
						>
							<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" /><path d="M3 3v5h5" /></svg>
						</button>
						<button
							type="button"
							class="fabric-crop__tool"
							[disabled]="!isReady"
							[attr.aria-label]="l.rotateRight"
							[title]="l.rotateRight"
							(click)="rotate(90)"
						>
							<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M21 12a9 9 0 1 1-9-9c2.52 0 4.93 1 6.74 2.74L21 8" /><path d="M21 3v5h-5" /></svg>
						</button>
					</div>
				}

				@if (t.flip) {
					<div class="fabric-crop__group">
						<button
							type="button"
							class="fabric-crop__tool"
							[disabled]="!isReady"
							[attr.aria-label]="l.flipHorizontal"
							[title]="l.flipHorizontal"
							(click)="flip('x')"
						>
							<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M8 3H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h3" /><path d="M16 3h3a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-3" /><path d="M12 20v2M12 14v2M12 8v2M12 2v2" /></svg>
						</button>
						<button
							type="button"
							class="fabric-crop__tool"
							[disabled]="!isReady"
							[attr.aria-label]="l.flipVertical"
							[title]="l.flipVertical"
							(click)="flip('y')"
						>
							<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M21 8V5a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v3" /><path d="M21 16v3a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-3" /><path d="M4 12H2M10 12H8M16 12h-2M22 12h-2" /></svg>
						</button>
					</div>
				}

				@if (t.skew) {
					<div class="fabric-crop__group">
						<button
							type="button"
							class="fabric-crop__tool"
							[class.fabric-crop__tool--active]="skewOpen"
							[disabled]="!isReady"
							[attr.aria-label]="l.skew"
							[attr.aria-expanded]="skewOpen"
							[title]="l.skew"
							(click)="toggleSkew()"
						>
							<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M7 5h14l-4 14H3z" /></svg>
						</button>
					</div>
				}

				<label class="fabric-crop__zoom">
					<span>{{ l.scale }}</span>
					<input
						type="range"
						[min]="minZoom"
						[max]="maxZoom"
						step="0.01"
						[value]="zoom"
						[disabled]="!isReady"
						(input)="setZoom($any($event.target).value)"
						(change)="commitNow()"
					/>
				</label>

				<button
					type="button"
					class="fabric-crop__tool"
					[disabled]="!isReady"
					[attr.aria-label]="l.fit"
					[title]="l.fit"
					(click)="fitImage()"
				>
					<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M8 3H5a2 2 0 0 0-2 2v3M21 8V5a2 2 0 0 0-2-2h-3M3 16v3a2 2 0 0 0 2 2h3M16 21h3a2 2 0 0 0 2-2v-3" /></svg>
				</button>
			</div>

			@if (t.skew && skewOpen) {
				<div class="fabric-crop__skew">
					<label>
						<span>{{ l.skewX }}</span>
						<input
							type="range"
							min="-45"
							max="45"
							step="1"
							[value]="skewX"
							(input)="setSkew('x', $any($event.target).value)"
							(change)="setSkew('x', $any($event.target).value, true)"
						/>
					</label>
					<label>
						<span>{{ l.skewY }}</span>
						<input
							type="range"
							min="-45"
							max="45"
							step="1"
							[value]="skewY"
							(input)="setSkew('y', $any($event.target).value)"
							(change)="setSkew('y', $any($event.target).value, true)"
						/>
					</label>
					<button type="button" class="fabric-crop__text-button" (click)="resetSkew()">
						{{ l.resetSkew }}
					</button>
				</div>
			}

			<div class="fabric-crop__options">
				<label>
					<span>{{ l.aspect }}</span>
					<select [value]="aspectValue" (change)="setAspect($any($event.target).value)">
						<option value="free">{{ l.free }}</option>
						<option value="1">1:1</option>
						<option value="1.3333333333">4:3</option>
						<option value="1.7777777778">16:9</option>
						<option value="0.75">3:4</option>
					</select>
				</label>

				<label>
					<span>{{ l.format }}</span>
					<select [value]="format" (change)="setFormat($any($event.target).value)">
						<option value="png">PNG</option>
						<option value="jpeg">JPEG</option>
						<option value="webp">WEBP</option>
					</select>
				</label>
			</div>

			<footer class="fabric-crop__footer">
				<wbutton type="secondary" [disableSubmit]="true" (wClick)="cancel()">
					{{ l.cancel }}
				</wbutton>
				<wbutton [disableSubmit]="true" [disabled]="!isReady" (wClick)="crop()">
					{{ l.crop }}
				</wbutton>
			</footer>
		</section>
	`,
	styles: [
		`
			:host {
				display: block;
				inline-size: min(100%, 980px);
				margin-inline: auto;
			}

			.fabric-crop {
				display: grid;
				gap: 12px;
				color: var(--c-text-primary, #111827);
			}

			.fabric-crop__header {
				display: grid;
				gap: 4px;
			}

			.fabric-crop__header h2 {
				margin: 0;
				font-size: 1.125rem;
				line-height: 1.3;
			}

			.fabric-crop__header p {
				margin: 0;
				color: var(--c-text-muted, #6b7280);
				font-size: 0.875rem;
			}

			.fabric-crop__stage {
				display: inline-flex;
				justify-self: center;
				max-inline-size: 100%;
				overflow: hidden;
				border: 1px solid var(--c-border, #d1d5db);
				border-radius: var(--radius-card, 8px);
				background: var(--c-bg-secondary, #f8fafc);
			}

			.fabric-crop__stage canvas {
				display: block;
				max-inline-size: 100%;
				block-size: auto;
			}

			.fabric-crop__toolbar {
				display: flex;
				flex-wrap: wrap;
				align-items: center;
				gap: 8px 12px;
			}

			.fabric-crop__group {
				display: inline-flex;
				gap: 4px;
				padding-inline-end: 12px;
				border-inline-end: 1px solid var(--c-border, #d1d5db);
			}

			.fabric-crop__tool {
				display: inline-flex;
				align-items: center;
				justify-content: center;
				inline-size: 36px;
				block-size: 36px;
				padding: 0;
				border: 1px solid var(--c-border, #d1d5db);
				border-radius: var(--radius, 6px);
				background: var(--c-bg-secondary, #fff);
				color: var(--c-text-primary, #111827);
				cursor: pointer;
			}

			.fabric-crop__tool:hover:not(:disabled),
			.fabric-crop__tool--active {
				background: var(--c-bg-tertiary, #f1f5f9);
			}

			.fabric-crop__tool:focus-visible {
				outline: 2px solid var(--c-primary, #2563eb);
				outline-offset: 2px;
			}

			.fabric-crop__tool:disabled {
				opacity: 0.4;
				cursor: not-allowed;
			}

			.fabric-crop__tool svg {
				inline-size: 18px;
				block-size: 18px;
				fill: none;
				stroke: currentColor;
				stroke-width: 2;
				stroke-linecap: round;
				stroke-linejoin: round;
			}

			.fabric-crop__zoom {
				display: flex;
				flex: 1 1 180px;
				align-items: center;
				gap: 8px;
				font-size: 0.8rem;
				color: var(--c-text-muted, #6b7280);
			}

			.fabric-crop__zoom input {
				flex: 1;
				min-inline-size: 0;
			}

			.fabric-crop__skew {
				display: flex;
				flex-wrap: wrap;
				align-items: center;
				gap: 8px 16px;
				font-size: 0.8rem;
				color: var(--c-text-muted, #6b7280);
			}

			.fabric-crop__skew label {
				display: flex;
				align-items: center;
				gap: 8px;
			}

			.fabric-crop__text-button {
				padding: 4px 8px;
				border: 0;
				background: transparent;
				color: var(--c-primary, #2563eb);
				cursor: pointer;
				text-decoration: underline;
			}

			.fabric-crop__options {
				display: flex;
				flex-wrap: wrap;
				gap: 12px;
			}

			.fabric-crop__options label {
				display: grid;
				gap: 6px;
				font-size: 0.8rem;
				color: var(--c-text-muted, #6b7280);
			}

			.fabric-crop__options select {
				min-block-size: 38px;
				min-inline-size: 130px;
				border: 1px solid var(--c-border, #d1d5db);
				border-radius: var(--radius, 6px);
				background: var(--c-bg-secondary, #fff);
				color: var(--c-text-primary, #111827);
			}

			.fabric-crop__footer {
				display: flex;
				justify-content: flex-end;
				gap: 10px;
			}

			@media (max-width: 720px) {
				.fabric-crop__footer {
					justify-content: stretch;
				}

				.fabric-crop__footer wbutton {
					flex: 1 1 0;
				}
			}
		`,
	],
})
export class FabricCropModalComponent implements AfterViewInit, OnDestroy {
	private readonly _cdr = inject(ChangeDetectorRef);
	private readonly _platformId = inject(PLATFORM_ID);
	private readonly _document = inject(DOCUMENT);

	private readonly _canvasEl = viewChild<ElementRef<HTMLCanvasElement>>('canvasEl');

	image!: FabricCropImageInput;
	title = 'Crop image';
	width = 720;
	height = 420;
	aspectRatio: number | null = null;
	format: FabricCropFormat = 'png';
	quality = 0.92;
	outputWidth?: number;
	outputHeight?: number;
	maxEdge?: number;
	tools?: FabricCropTools;
	labels?: Partial<FabricCropLabels>;
	close?: () => void;
	onCrop?: (result: FabricCropResult) => void;
	onCancel?: () => void;

	status = '';
	zoom = 1;
	minZoom = 0.2;
	readonly maxZoom = MAX_ZOOM;
	skewX = 0;
	skewY = 0;
	skewOpen = false;
	isReady = false;
	aspectValue = 'free';

	get l(): FabricCropLabels {
		return { ...DEFAULT_FABRIC_CROP_LABELS, ...this.labels };
	}

	get t(): Required<FabricCropTools> {
		return { rotate: true, flip: true, skew: true, history: true, ...this.tools };
	}

	get canUndo(): boolean {
		return this._undo.length > 0 || this._commitTimer !== null;
	}

	get canRedo(): boolean {
		return this._redo.length > 0;
	}

	private _canvas: Canvas | null = null;
	private _fabricImage: FabricImage | null = null;
	private _cropRect: Rect | null = null;
	private _imageElement: ImageElement | null = null;
	private _objectScale = 1;

	private _panFrom: Point | null = null;
	private readonly _pointers = new Map<number, Point>();
	private _pinch: { distance: number; midpoint: Point } | null = null;
	private _lastFrame: FrameState | null = null;

	private _undo: CropState[] = [];
	private _redo: CropState[] = [];
	private _current: CropState | null = null;
	private _commitTimer: ReturnType<typeof setTimeout> | null = null;

	private readonly _onPointerDown = (e: PointerEvent) => this._pointerDown(e);
	private readonly _onPointerMove = (e: PointerEvent) => this._pointerMove(e);
	private readonly _onPointerUp = (e: PointerEvent) => this._pointerUp(e);

	ngAfterViewInit(): void {
		const canvasEl = this._canvasEl();

		if (!isPlatformBrowser(this._platformId) || !canvasEl) {
			return;
		}

		this.status = this.l.loading;
		this.aspectValue = this.aspectRatio ? String(this.aspectRatio) : 'free';
		this._canvas = new Canvas(canvasEl.nativeElement, {
			width: this.width,
			height: this.height,
			backgroundColor: 'rgb(248, 250, 252)',
			preserveObjectStacking: true,
			selection: false,
			uniformScaling: !!this.aspectRatio,
			defaultCursor: 'grab',
			hoverCursor: 'move',
		});

		this._bindEvents(this._canvas);
		void this._load();
	}

	ngOnDestroy(): void {
		if (this._commitTimer) {
			clearTimeout(this._commitTimer);
			this._commitTimer = null;
		}

		const upper = this._canvas?.upperCanvasEl;
		upper?.removeEventListener('pointerdown', this._onPointerDown, true);
		upper?.removeEventListener('pointermove', this._onPointerMove, true);
		upper?.removeEventListener('pointerup', this._onPointerUp, true);
		upper?.removeEventListener('pointercancel', this._onPointerUp, true);

		this._canvas?.dispose();
		this._canvas = null;
	}

	// ---------------------------------------------------------------------------
	// Public actions
	// ---------------------------------------------------------------------------

	/** Slider handler: previews the zoom around the frame centre. */
	setZoom(value: string | number): void {
		const next = Number(value);
		if (!Number.isFinite(next) || !this._fabricImage || !this._cropRect) {
			return;
		}

		this._zoomAt(this._cropRect.getCenterPoint(), next);
		this._commitSoon();
	}

	setFormat(value: FabricCropFormat): void {
		this.format = value;
	}

	setAspect(value: string): void {
		this.aspectValue = value;
		this.aspectRatio = value === 'free' ? null : Number(value);

		if (this._canvas) {
			this._canvas.uniformScaling = !!this.aspectRatio;
		}

		this._applyAspectRatio();
		this._applyFrameControls();
		this._keepFrameOnImage();
		this._render();
		this._commit();
	}

	fitImage(): void {
		if (!this._fabricImage) {
			return;
		}

		this._fitImage();
		this._resetCropRect();
		this._afterImageChange();
		this._commit();
	}

	rotate(step: 90 | -90): void {
		if (!this._fabricImage) {
			return;
		}

		this._fabricImage.rotate((((this._fabricImage.angle + step) % 360) + 360) % 360);
		this._afterImageChange();
		this._commit();
	}

	flip(axis: 'x' | 'y'): void {
		const image = this._fabricImage;
		if (!image) {
			return;
		}

		image.set(axis === 'x' ? { flipX: !image.flipX } : { flipY: !image.flipY });
		this._afterImageChange();
		this._commit();
	}

	/** Slider -45…45. `(input)` previews, `(change)` commits. */
	setSkew(axis: 'x' | 'y', value: string | number, commit = false): void {
		const image = this._fabricImage;
		const next = this._clamp(Number(value) || 0, -45, 45);
		if (!image) {
			return;
		}

		if (axis === 'x') {
			this.skewX = next;
			image.set({ skewX: next });
		} else {
			this.skewY = next;
			image.set({ skewY: next });
		}

		this._afterImageChange();
		if (commit) {
			this._commit();
		}
	}

	resetSkew(): void {
		if (!this._fabricImage) {
			return;
		}

		this.skewX = 0;
		this.skewY = 0;
		this._fabricImage.set({ skewX: 0, skewY: 0 });
		this._afterImageChange();
		this._commit();
	}

	toggleSkew(): void {
		this.skewOpen = !this.skewOpen;
	}

	undo(): void {
		this._flushCommit();
		this._step(this._undo, this._redo);
	}

	redo(): void {
		this._flushCommit();
		this._step(this._redo, this._undo);
	}

	/** Commits a change that was previewed through `(input)` events. */
	commitNow(): void {
		this._commit();
	}

	cancel(): void {
		this.onCancel?.();
		this.close?.();
	}

	onKeydown(event: KeyboardEvent): void {
		const key = event.key.toLowerCase();
		const modifier = event.ctrlKey || event.metaKey;

		if (modifier && key === 'z') {
			event.preventDefault();
			event.shiftKey ? this.redo() : this.undo();
			return;
		}

		if (modifier && key === 'y') {
			event.preventDefault();
			this.redo();
			return;
		}

		const target = event.target as HTMLElement | null;
		if (target?.closest('input, select, textarea') || !this._cropRect || !this.isReady) {
			return;
		}

		const step = event.shiftKey ? 10 : 1;
		const arrows: Record<string, [number, number]> = {
			arrowleft: [-step, 0],
			arrowright: [step, 0],
			arrowup: [0, -step],
			arrowdown: [0, step],
		};

		if (arrows[key]) {
			event.preventDefault();
			this._cropRect.set({
				left: this._cropRect.left + arrows[key][0],
				top: this._cropRect.top + arrows[key][1],
			});
			this._keepFrameOnImage();
			this._render();
			this._commitSoon();
		} else if (key === '+' || key === '=' || key === '-') {
			event.preventDefault();
			this._zoomAt(
				this._cropRect.getCenterPoint(),
				this.zoom * (key === '-' ? 1 / 1.1 : 1.1),
			);
			this._commitSoon();
		}
	}

	crop(): void {
		const image = this._fabricImage;
		const frameRect = this._cropRect;
		const canvas = this._canvas;

		if (!image || !frameRect || !canvas || !this._imageElement) {
			return;
		}

		this._flushCommit();
		frameRect.setCoords();

		const frame = frameRect.getBoundingRect();
		const inset = frameRect.strokeWidth; // the frame's own stroke is part of its box
		const scale = this._objectScale * this.zoom;
		const background = canvas.backgroundColor;

		canvas.backgroundColor = this.format === 'jpeg' ? '#ffffff' : ''; // JPEG has no transparency

		let rendered: HTMLCanvasElement;
		try {
			rendered = canvas.toCanvasElement(1 / scale, {
				left: frame.left + inset / 2,
				top: frame.top + inset / 2,
				width: frame.width - inset,
				height: frame.height - inset,
				filter: object => object === image, // the photo only, no frame
			});
		} finally {
			canvas.backgroundColor = background;
		}

		const [outputWidth, outputHeight] = this._outputSize(rendered.width, rendered.height);
		let output = rendered;

		if (outputWidth !== rendered.width || outputHeight !== rendered.height) {
			output = this._document.createElement('canvas');
			output.width = outputWidth;
			output.height = outputHeight;

			const context = output.getContext('2d');
			if (!context) {
				return;
			}

			context.imageSmoothingQuality = 'high';
			context.drawImage(rendered, 0, 0, outputWidth, outputHeight);
		}

		this.onCrop?.({
			base64: output.toDataURL(`image/${this.format}`, this.quality),
			format: this.format,
			width: outputWidth,
			height: outputHeight,
			source: this._sourceRect(frame, inset, scale),
		});
		this.close?.();
	}

	// ---------------------------------------------------------------------------
	// Loading
	// ---------------------------------------------------------------------------

	private async _load(): Promise<void> {
		if (!this._canvas || !this.image) {
			this.status = this.l.noImage;
			this._cdr.markForCheck();
			return;
		}

		try {
			const source = await this._readImage(this.image);
			const image = await FabricImage.fromURL(source);
			this._imageElement = image.getElement() as ImageElement;
			this._fabricImage = image;
			image.set({
				originX: 'center',
				originY: 'center',
				selectable: false,
				evented: false,
			});
			this._canvas.add(image);
			this._fitImage();
			this._createCropRect();
			this._afterImageChange();
			this._current = this._snapshot();
			this.status = this.l.ready;
			this.isReady = true;
		} catch {
			this.status = this.l.loadError;
			this.isReady = false;
		}

		this._cdr.markForCheck();
	}

	private _bindEvents(canvas: Canvas): void {
		canvas.on('mouse:down', ({ target, viewportPoint }) => {
			if (!this._cropRect || target === this._cropRect || this._pinch) {
				return; // the frame keeps its own move/resize
			}

			this._panFrom = viewportPoint;
			canvas.setCursor('grabbing');
		});

		canvas.on('mouse:move', ({ viewportPoint }) => {
			if (!this._panFrom || !this._fabricImage || this._pinch) {
				return;
			}

			const delta = viewportPoint.subtract(this._panFrom);
			this._panFrom = viewportPoint;
			this._panBy(delta.x, delta.y);
		});

		canvas.on('mouse:up', () => {
			if (!this._panFrom) {
				return;
			}

			this._panFrom = null;
			canvas.setCursor('grab');
			if (this._cropRect) {
				canvas.setActiveObject(this._cropRect); // clicking off the frame deselects it
			}
			this._commit();
		});

		canvas.on('mouse:wheel', ({ e }) => {
			if (!this._fabricImage) {
				return;
			}

			e.preventDefault();
			this._zoomAt(canvas.getViewportPoint(e), this.zoom * 0.999 ** e.deltaY);
			this._commitSoon();
		});

		canvas.on('object:moving', () => {
			this._keepFrameOnImage();
			this._rememberFrame();
		});

		canvas.on('object:scaling', () => this._limitFrameScaling());
		canvas.on('object:modified', () => {
			this._afterImageChange();
			this._commit();
		});

		// Fabric has no gestures: track two pointers for pinch zoom + pan.
		const upper = canvas.upperCanvasEl;
		upper.addEventListener('pointerdown', this._onPointerDown, true);
		upper.addEventListener('pointermove', this._onPointerMove, true);
		upper.addEventListener('pointerup', this._onPointerUp, true);
		upper.addEventListener('pointercancel', this._onPointerUp, true);
	}

	// ---------------------------------------------------------------------------
	// Pinch (touch)
	// ---------------------------------------------------------------------------

	private _pointerDown(e: PointerEvent): void {
		if (e.pointerType !== 'touch' || !this._canvas) {
			return;
		}

		this._pointers.set(e.pointerId, this._canvas.getViewportPoint(e));

		if (this._pointers.size === 2) {
			this._panFrom = null;
			this._pinch = this._pinchMetrics();
			e.stopImmediatePropagation(); // hide the second finger from Fabric
		}
	}

	private _pointerMove(e: PointerEvent): void {
		if (!this._canvas || !this._pointers.has(e.pointerId)) {
			return;
		}

		this._pointers.set(e.pointerId, this._canvas.getViewportPoint(e));

		if (!this._pinch || this._pointers.size < 2) {
			return;
		}

		e.stopImmediatePropagation();

		const next = this._pinchMetrics();
		this._zoomAt(next.midpoint, this.zoom * (next.distance / (this._pinch.distance || 1)));
		const delta = next.midpoint.subtract(this._pinch.midpoint);
		this._panBy(delta.x, delta.y);
		this._pinch = next;
		this._commitSoon();
	}

	private _pointerUp(e: PointerEvent): void {
		if (!this._pointers.delete(e.pointerId)) {
			return;
		}

		if (this._pinch && this._pointers.size < 2) {
			this._pinch = null;
			this._panFrom = null;
			e.stopImmediatePropagation();
		}
	}

	private _pinchMetrics(): { distance: number; midpoint: Point } {
		const [a, b] = [...this._pointers.values()];
		return { distance: a.distanceFrom(b), midpoint: a.midPointFrom(b) };
	}

	// ---------------------------------------------------------------------------
	// Photo transforms
	// ---------------------------------------------------------------------------

	private _panBy(dx: number, dy: number): void {
		const image = this._fabricImage;
		if (!image) {
			return;
		}

		image.set({ left: image.left + dx, top: image.top + dy });
		this._afterImageChange();
	}

	private _zoomAt(point: Point, value: number): void {
		const image = this._fabricImage;
		if (!image || !Number.isFinite(value)) {
			return;
		}

		const next = this._clamp(value, this._minZoom(), MAX_ZOOM);
		const ratio = next / this.zoom;
		this.zoom = next;
		image.set({
			left: point.x + (image.left - point.x) * ratio, // keep the point under the cursor still
			top: point.y + (image.top - point.y) * ratio,
			scaleX: this._objectScale * next,
			scaleY: this._objectScale * next,
		});
		this._afterImageChange();
	}

	/** The photo may never be smaller than the frame. */
	private _minZoom(): number {
		const image = this._imageBox();
		const frame = this._frameBox();
		return this.zoom * Math.max(frame.width / image.width, frame.height / image.height);
	}

	/** Fit the photo (with its current rotation and skew) into the canvas. */
	private _fitImage(): void {
		const image = this._fabricImage!;

		image.set({ scaleX: 1, scaleY: 1 });
		const box = this._imageBox();
		this._objectScale = Math.min(this.width / box.width, this.height / box.height);
		this.zoom = 1;

		image.set({
			left: this.width / 2,
			top: this.height / 2,
			scaleX: this._objectScale,
			scaleY: this._objectScale,
		});
		image.setCoords();
	}

	/**
	 * Runs after every change of the photo: shrinks the frame if the photo got
	 * smaller than it, then moves the photo so it still covers the frame.
	 */
	private _afterImageChange(): void {
		if (!this._fabricImage || !this._cropRect) {
			return;
		}

		this._fabricImage.setCoords();
		this._shrinkFrameToImage();
		this._coverFrame();
		this._rememberFrame();
		this._updateZoomLimits();
		this._render();
	}

	private _updateZoomLimits(): void {
		this.minZoom = Math.min(this.zoom, this._minZoom());
		this._cdr.markForCheck();
	}

	private _coverFrame(): void {
		const image = this._fabricImage!;
		const box = this._imageBox();
		const frame = this._frameBox();
		let dx = 0;
		let dy = 0;

		if (box.left > frame.left) {
			dx = frame.left - box.left;
		} else if (box.left + box.width < frame.left + frame.width) {
			dx = frame.left + frame.width - (box.left + box.width);
		}

		if (box.top > frame.top) {
			dy = frame.top - box.top;
		} else if (box.top + box.height < frame.top + frame.height) {
			dy = frame.top + frame.height - (box.top + box.height);
		}

		if (dx || dy) {
			image.set({ left: image.left + dx, top: image.top + dy });
			image.setCoords();
		}
	}

	// ---------------------------------------------------------------------------
	// Crop frame
	// ---------------------------------------------------------------------------

	private _createCropRect(): void {
		if (!this._canvas) {
			return;
		}

		this._cropRect = new Rect({
			left: this.width / 2,
			top: this.height / 2,
			originX: 'center',
			originY: 'center',
			width: 100,
			height: 100,
			fill: 'rgba(255,255,255,0.08)',
			stroke: '#22c55e',
			strokeWidth: 2,
			strokeUniform: true,
			strokeDashArray: [8, 5],
			cornerColor: '#22c55e',
			cornerStrokeColor: '#ffffff',
			transparentCorners: false,
			lockRotation: true,
			lockScalingFlip: true,
		});
		this._canvas.add(this._cropRect);
		this._canvas.setActiveObject(this._cropRect);
		this._applyFrameControls();
		this._resetCropRect();
	}

	/** Largest frame of the right shape that fits on the photo. */
	private _resetCropRect(): void {
		const frame = this._cropRect;
		if (!frame) {
			return;
		}

		const box = this._imageBox();
		const stroke = frame.strokeWidth;
		const availableWidth = Math.max(MIN_FRAME, box.width - stroke);
		const availableHeight = Math.max(MIN_FRAME, box.height - stroke);
		let width: number;
		let height: number;

		if (this.aspectRatio) {
			width = Math.min(availableWidth, availableHeight * this.aspectRatio);
			height = width / this.aspectRatio;
		} else {
			width = availableWidth * 0.8;
			height = availableHeight * 0.8;
		}

		frame.set({
			left: box.left + box.width / 2,
			top: box.top + box.height / 2,
			width,
			height,
			scaleX: 1,
			scaleY: 1,
		});
		frame.setCoords();
		this._rememberFrame();
	}

	private _applyAspectRatio(): void {
		const frame = this._cropRect;
		if (!frame || !this.aspectRatio) {
			return;
		}

		const width = frame.width * frame.scaleX;
		frame.set({
			width,
			height: width / this.aspectRatio,
			scaleX: 1,
			scaleY: 1,
		});
		frame.setCoords();
	}

	/** With a locked shape only the corner handles remain. */
	private _applyFrameControls(): void {
		const sides = !this.aspectRatio;
		this._cropRect?.setControlsVisibility({
			mtr: false,
			mt: sides,
			mb: sides,
			ml: sides,
			mr: sides,
		});
	}

	/** Shrinks the frame (keeping its shape) when it is larger than the photo. */
	private _shrinkFrameToImage(): void {
		const frame = this._cropRect!;
		const box = this._imageBox();
		const stroke = frame.strokeWidth;
		const k = Math.min(
			1,
			(box.width - stroke) / (frame.width * frame.scaleX),
			(box.height - stroke) / (frame.height * frame.scaleY),
		);

		if (k < 1) {
			frame.set({ scaleX: frame.scaleX * k * 0.9999, scaleY: frame.scaleY * k * 0.9999 });
			frame.setCoords();
		}
	}

	/** Called on object:moving and after frame changes: keeps the frame on the photo. */
	private _keepFrameOnImage(): void {
		const frame = this._cropRect;
		if (!frame || !this._fabricImage) {
			return;
		}

		this._shrinkFrameToImage();

		const image = this._imageBox();
		const box = this._frameBox();

		frame.set({
			left:
				frame.left +
				this._clamp(box.left, image.left, image.left + image.width - box.width) -
				box.left,
			top:
				frame.top +
				this._clamp(box.top, image.top, image.top + image.height - box.height) -
				box.top,
		});
		frame.setCoords();
	}

	/** While resizing, refuse sizes that leave the photo or get too small. */
	private _limitFrameScaling(): void {
		const frame = this._cropRect;
		if (!frame || !this._lastFrame) {
			return;
		}

		frame.setCoords();
		const image = this._imageBox();
		const box = this._frameBox();
		const inside =
			box.left >= image.left - EPSILON &&
			box.top >= image.top - EPSILON &&
			box.left + box.width <= image.left + image.width + EPSILON &&
			box.top + box.height <= image.top + image.height + EPSILON;

		if (inside && box.width >= MIN_FRAME && box.height >= MIN_FRAME) {
			this._rememberFrame();
		} else {
			frame.set(this._lastFrame);
			frame.setCoords();
		}
	}

	private _rememberFrame(): void {
		const frame = this._cropRect;
		if (frame) {
			this._lastFrame = {
				left: frame.left,
				top: frame.top,
				scaleX: frame.scaleX,
				scaleY: frame.scaleY,
			};
		}
	}

	// ---------------------------------------------------------------------------
	// Undo / redo (numbers only, never toJSON)
	// ---------------------------------------------------------------------------

	private _snapshot(): CropState {
		const { left, top, scaleX, scaleY, angle, flipX, flipY, skewX, skewY } = this._fabricImage!;
		const frame = this._cropRect!;

		return {
			zoom: this.zoom,
			objectScale: this._objectScale,
			image: { left, top, scaleX, scaleY, angle, flipX, flipY, skewX, skewY },
			frame: {
				left: frame.left,
				top: frame.top,
				width: frame.width,
				height: frame.height,
				scaleX: frame.scaleX,
				scaleY: frame.scaleY,
			},
		};
	}

	private _commit(): void {
		this._clearCommitTimer();

		if (!this._current || !this._fabricImage || !this._cropRect) {
			return;
		}

		const next = this._snapshot();
		if (JSON.stringify(next) === JSON.stringify(this._current)) {
			return;
		}

		this._undo.push(this._current);
		if (this._undo.length > MAX_HISTORY) {
			this._undo.shift();
		}

		this._redo = [];
		this._current = next;
		this._cdr.markForCheck();
	}

	/** Debounced commit for continuous input such as wheel and pinch zoom. */
	private _commitSoon(): void {
		this._clearCommitTimer();
		this._commitTimer = setTimeout(() => {
			this._commitTimer = null;
			this._commit();
		}, 300);
		this._cdr.markForCheck();
	}

	private _flushCommit(): void {
		if (this._commitTimer) {
			this._commit();
		}
	}

	private _clearCommitTimer(): void {
		if (this._commitTimer) {
			clearTimeout(this._commitTimer);
			this._commitTimer = null;
		}
	}

	private _step(from: CropState[], to: CropState[]): void {
		const state = from.pop();
		if (!state || !this._current || !this._fabricImage || !this._cropRect) {
			return;
		}

		to.push(this._current);
		this._current = state;
		this.zoom = state.zoom;
		this._objectScale = state.objectScale;
		this.skewX = state.image.skewX;
		this.skewY = state.image.skewY;
		this._fabricImage.set(state.image).setCoords();
		this._cropRect.set(state.frame).setCoords();
		this._canvas?.setActiveObject(this._cropRect);
		this._rememberFrame();
		this._updateZoomLimits();
		this._render();
	}

	// ---------------------------------------------------------------------------
	// Export helpers
	// ---------------------------------------------------------------------------

	private _outputSize(width: number, height: number): [number, number] {
		let w = width;
		let h = height;

		if (this.outputWidth && this.outputHeight) {
			w = this.outputWidth;
			h = this.outputHeight;
		} else if (this.outputWidth) {
			w = this.outputWidth;
			h = (height * w) / width;
		} else if (this.outputHeight) {
			h = this.outputHeight;
			w = (width * h) / height;
		}

		if (this.maxEdge && Math.max(w, h) > this.maxEdge) {
			const k = this.maxEdge / Math.max(w, h);
			w *= k;
			h *= k;
		}

		return [Math.max(1, Math.round(w)), Math.max(1, Math.round(h))];
	}

	/** Crop rectangle in source pixels, only meaningful without rotation or skew. */
	private _sourceRect(frame: Box, inset: number, scale: number): FabricCropResult['source'] {
		const image = this._fabricImage!;

		if (image.angle % 360 !== 0 || image.skewX || image.skewY) {
			return undefined;
		}

		const box = this._imageBox();
		const sourceWidth = this._sourceWidth();
		const sourceHeight = this._sourceHeight();
		const sw = this._clamp((frame.width - inset) / scale, 1, sourceWidth);
		const sh = this._clamp((frame.height - inset) / scale, 1, sourceHeight);
		let sx = (frame.left + inset / 2 - box.left) / scale;
		let sy = (frame.top + inset / 2 - box.top) / scale;

		if (image.flipX) {
			sx = sourceWidth - sx - sw;
		}
		if (image.flipY) {
			sy = sourceHeight - sy - sh;
		}

		sx = this._clamp(sx, 0, sourceWidth - sw);
		sy = this._clamp(sy, 0, sourceHeight - sh);

		return {
			x: Math.round(sx),
			y: Math.round(sy),
			width: Math.round(sw),
			height: Math.round(sh),
		};
	}

	// ---------------------------------------------------------------------------
	// Utilities
	// ---------------------------------------------------------------------------

	private _imageBox(): Box {
		this._fabricImage!.setCoords();
		return this._fabricImage!.getBoundingRect();
	}

	private _frameBox(): Box {
		this._cropRect!.setCoords();
		return this._cropRect!.getBoundingRect();
	}

	private _render(): void {
		this._canvas?.requestRenderAll();
		this._cdr.markForCheck();
	}

	private _readImage(image: FabricCropImageInput): Promise<string> {
		if (typeof image === 'string') {
			return Promise.resolve(image);
		}

		return new Promise((resolve, reject) => {
			const reader = new FileReader();
			reader.onload = () => resolve(String(reader.result || ''));
			reader.onerror = () => reject(reader.error);
			reader.readAsDataURL(image);
		});
	}

	private _sourceWidth(): number {
		const element = this._imageElement;
		return element instanceof HTMLImageElement
			? element.naturalWidth || element.width
			: element?.width || 1;
	}

	private _sourceHeight(): number {
		const element = this._imageElement;
		return element instanceof HTMLImageElement
			? element.naturalHeight || element.height
			: element?.height || 1;
	}

	private _clamp(value: number, min: number, max: number): number {
		return Math.max(min, Math.min(max, value));
	}
}
