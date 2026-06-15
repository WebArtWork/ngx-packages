import {
	AfterViewInit,
	ChangeDetectorRef,
	Component,
	ElementRef,
	OnDestroy,
	PLATFORM_ID,
	ViewChild,
	inject,
} from '@angular/core';
import { DOCUMENT, isPlatformBrowser } from '@angular/common';
import { ButtonComponent } from '@wawjs/ngx-ui';
import { Canvas, FabricImage, Rect } from 'fabric';
import type {
	FabricCropFormat,
	FabricCropImageInput,
	FabricCropResult,
} from './fabric-crop.interfaces';

type ImageElement = HTMLImageElement | HTMLCanvasElement;

@Component({
	selector: 'ngx-fabric-crop-modal',
	imports: [ButtonComponent],
	template: `
		<section class="fabric-crop">
			<header class="fabric-crop__header">
				<h2>{{ title }}</h2>
				<p>{{ status }}</p>
			</header>

			<div class="fabric-crop__stage">
				<canvas #canvasEl></canvas>
			</div>

			<div class="fabric-crop__controls">
				<label>
					<span>Scale</span>
					<input
						type="range"
						min="0.2"
						max="4"
						step="0.01"
						[value]="zoom"
						(input)="setZoom($any($event.target).value)"
					/>
				</label>

				<label>
					<span>Format</span>
					<select
						[value]="format"
						(change)="setFormat($any($event.target).value)"
					>
						<option value="png">PNG</option>
						<option value="jpeg">JPEG</option>
						<option value="webp">WEBP</option>
					</select>
				</label>

				<label>
					<span>Aspect</span>
					<select
						[value]="aspectValue"
						(change)="setAspect($any($event.target).value)"
					>
						<option value="free">Free</option>
						<option value="1">1:1</option>
						<option value="1.3333333333">4:3</option>
						<option value="1.7777777778">16:9</option>
						<option value="0.75">3:4</option>
					</select>
				</label>

				<wbutton
					type="secondary"
					[disableSubmit]="true"
					(wClick)="fitImage()"
				>
					<span class="material-icons">fit_screen</span>
					Fit
				</wbutton>
			</div>

			<footer class="fabric-crop__footer">
				<wbutton
					type="secondary"
					[disableSubmit]="true"
					(wClick)="cancel()"
				>
					Cancel
				</wbutton>
				<wbutton
					[disableSubmit]="true"
					[disabled]="!isReady"
					(wClick)="crop()"
				>
					Crop image
				</wbutton>
			</footer>
		</section>
	`,
	styles: [
		`
			:host {
				display: block;
				min-inline-size: min(100%, 760px);
			}

			.fabric-crop {
				display: grid;
				gap: 16px;
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
				color: var(--c-text-secondary, #6b7280);
				font-size: 0.875rem;
			}

			.fabric-crop__stage {
				overflow: hidden;
				border: 1px solid var(--c-border, #d1d5db);
				border-radius: var(--radius-card, 8px);
				background:
					linear-gradient(45deg, #eef2f7 25%, transparent 25%),
					linear-gradient(-45deg, #eef2f7 25%, transparent 25%),
					linear-gradient(45deg, transparent 75%, #eef2f7 75%),
					linear-gradient(-45deg, transparent 75%, #eef2f7 75%);
				background-color: #f8fafc;
				background-position:
					0 0,
					0 12px,
					12px -12px,
					-12px 0;
				background-size: 24px 24px;
			}

			.fabric-crop__stage canvas {
				display: block;
				inline-size: 100%;
				block-size: auto;
			}

			.fabric-crop__controls {
				display: grid;
				grid-template-columns: minmax(180px, 1fr) repeat(2, minmax(110px, 150px)) auto;
				gap: 12px;
				align-items: end;
			}

			.fabric-crop__controls label {
				display: grid;
				gap: 6px;
				font-size: 0.8rem;
				color: var(--c-text-secondary, #6b7280);
			}

			.fabric-crop__controls input,
			.fabric-crop__controls select {
				min-block-size: 38px;
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
				.fabric-crop__controls {
					grid-template-columns: 1fr;
				}

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

	@ViewChild('canvasEl', { static: true })
	private readonly _canvasEl?: ElementRef<HTMLCanvasElement>;

	image!: FabricCropImageInput;
	title = 'Crop image';
	width = 720;
	height = 420;
	aspectRatio: number | null = null;
	format: FabricCropFormat = 'png';
	quality = 0.92;
	outputWidth?: number;
	outputHeight?: number;
	close?: () => void;
	onCrop?: (result: FabricCropResult) => void;
	onCancel?: () => void;

	status = 'Loading image';
	zoom = 1;
	isReady = false;
	aspectValue = 'free';

	private _canvas: Canvas | null = null;
	private _fabricImage: FabricImage | null = null;
	private _cropRect: Rect | null = null;
	private _imageElement: ImageElement | null = null;
	private _objectScale = 1;

	ngAfterViewInit(): void {
		if (!isPlatformBrowser(this._platformId) || !this._canvasEl) {
			return;
		}

		this.aspectValue = this.aspectRatio ? String(this.aspectRatio) : 'free';
		this._canvas = new Canvas(this._canvasEl.nativeElement, {
			width: this.width,
			height: this.height,
			backgroundColor: 'rgba(248,250,252,0.92)',
			preserveObjectStacking: true,
			selection: false,
		});

		void this._load();
	}

	ngOnDestroy(): void {
		this._canvas?.dispose();
		this._canvas = null;
	}

	setZoom(value: string | number): void {
		const next = Number(value);
		if (!Number.isFinite(next) || !this._fabricImage) {
			return;
		}

		this.zoom = Math.max(0.2, Math.min(4, next));
		this._fabricImage.set({
			scaleX: this._objectScale * this.zoom,
			scaleY: this._objectScale * this.zoom,
		});
		this._fabricImage.setCoords();
		this._canvas?.requestRenderAll();
	}

	setFormat(value: FabricCropFormat): void {
		this.format = value;
	}

	setAspect(value: string): void {
		this.aspectValue = value;
		this.aspectRatio = value === 'free' ? null : Number(value);
		this._applyAspectRatio();
	}

	fitImage(): void {
		if (!this._fabricImage || !this._imageElement) {
			return;
		}

		const sourceWidth = this._sourceWidth();
		const sourceHeight = this._sourceHeight();
		this._objectScale = Math.min(
			this.width / sourceWidth,
			this.height / sourceHeight,
		);
		this.zoom = 1;

		this._fabricImage.set({
			left: this.width / 2,
			top: this.height / 2,
			scaleX: this._objectScale,
			scaleY: this._objectScale,
		});
		this._fabricImage.setCoords();
		this._resetCropRect();
		this._canvas?.requestRenderAll();
	}

	cancel(): void {
		this.onCancel?.();
		this.close?.();
	}

	crop(): void {
		if (!this._fabricImage || !this._cropRect || !this._imageElement) {
			return;
		}

		const cropBox = this._cropRect.getBoundingRect();
		const imageBox = this._fabricImage.getBoundingRect();
		const scale = this._objectScale * this.zoom;
		const sourceWidth = this._sourceWidth();
		const sourceHeight = this._sourceHeight();
		const sx = this._clamp((cropBox.left - imageBox.left) / scale, 0, sourceWidth);
		const sy = this._clamp((cropBox.top - imageBox.top) / scale, 0, sourceHeight);
		const sw = this._clamp(cropBox.width / scale, 1, sourceWidth - sx);
		const sh = this._clamp(cropBox.height / scale, 1, sourceHeight - sy);
		const outputWidth = this.outputWidth ?? Math.round(sw);
		const outputHeight = this.outputHeight ?? Math.round(sh);
		const canvas = this._document.createElement('canvas');
		const context = canvas.getContext('2d');

		if (!context) {
			return;
		}

		canvas.width = outputWidth;
		canvas.height = outputHeight;
		context.drawImage(
			this._imageElement,
			sx,
			sy,
			sw,
			sh,
			0,
			0,
			outputWidth,
			outputHeight,
		);

		const mime = `image/${this.format}`;
		const base64 = canvas.toDataURL(mime, this.quality);

		this.onCrop?.({
			base64,
			format: this.format,
			width: outputWidth,
			height: outputHeight,
			source: {
				x: Math.round(sx),
				y: Math.round(sy),
				width: Math.round(sw),
				height: Math.round(sh),
			},
		});
		this.close?.();
	}

	private async _load(): Promise<void> {
		if (!this._canvas || !this.image) {
			this.status = 'No image selected';
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
			this.fitImage();
			this._createCropRect();
			this.status = 'Move or resize the crop frame';
			this.isReady = true;
		} catch {
			this.status = 'Image could not be loaded';
			this.isReady = false;
		}

		this._cdr.markForCheck();
	}

	private _createCropRect(): void {
		if (!this._canvas) {
			return;
		}

		this._cropRect = new Rect({
			left: this.width / 2,
			top: this.height / 2,
			originX: 'center',
			originY: 'center',
			width: Math.round(this.width * 0.52),
			height: Math.round(this.height * 0.62),
			fill: 'rgba(255,255,255,0.08)',
			stroke: '#22c55e',
			strokeWidth: 2,
			strokeDashArray: [8, 5],
			cornerColor: '#22c55e',
			cornerStrokeColor: '#ffffff',
			transparentCorners: false,
			lockRotation: true,
		});
		this._canvas.add(this._cropRect);
		this._canvas.setActiveObject(this._cropRect);
		this._applyAspectRatio();
	}

	private _resetCropRect(): void {
		if (!this._cropRect) {
			return;
		}

		this._cropRect.set({
			left: this.width / 2,
			top: this.height / 2,
			width: Math.round(this.width * 0.52),
			height: Math.round(this.height * 0.62),
			scaleX: 1,
			scaleY: 1,
		});
		this._applyAspectRatio();
	}

	private _applyAspectRatio(): void {
		if (!this._cropRect || !this.aspectRatio) {
			this._canvas?.requestRenderAll();
			return;
		}

		const box = this._cropRect.getBoundingRect();
		const width = box.width;
		const height = width / this.aspectRatio;

		this._cropRect.set({
			width,
			height,
			scaleX: 1,
			scaleY: 1,
		});
		this._cropRect.setCoords();
		this._canvas?.requestRenderAll();
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
