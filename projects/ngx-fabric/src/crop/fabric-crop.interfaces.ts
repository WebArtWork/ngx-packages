import type { ModalConfig } from '@wawjs/ngx-ui';

export type FabricCropImageInput = string | Blob;

export type FabricCropFormat = 'png' | 'jpeg' | 'webp';

export interface FabricCropResult {
	base64: string;
	format: FabricCropFormat;
	width: number;
	height: number;
	/**
	 * Crop rectangle in source-image pixels.
	 *
	 * @deprecated Only present when the photo is not rotated or skewed. The
	 * result is rendered from the canvas, so use `base64` instead.
	 */
	source?: {
		x: number;
		y: number;
		width: number;
		height: number;
	};
}

/** Toolbar groups. Every group is shown unless it is set to `false`. */
export interface FabricCropTools {
	rotate?: boolean;
	flip?: boolean;
	skew?: boolean;
	history?: boolean;
}

/** Every visible string, so the editor can be translated. */
export interface FabricCropLabels {
	loading: string;
	noImage: string;
	loadError: string;
	ready: string;
	undo: string;
	redo: string;
	rotateLeft: string;
	rotateRight: string;
	flipHorizontal: string;
	flipVertical: string;
	skew: string;
	skewX: string;
	skewY: string;
	resetSkew: string;
	scale: string;
	fit: string;
	format: string;
	aspect: string;
	free: string;
	cancel: string;
	crop: string;
	cropFrame: string;
}

export const DEFAULT_FABRIC_CROP_LABELS: FabricCropLabels = {
	loading: 'Loading image',
	noImage: 'No image selected',
	loadError: 'Image could not be loaded',
	ready: 'Drag the photo to move it, drag the frame to crop',
	undo: 'Undo',
	redo: 'Redo',
	rotateLeft: 'Rotate left',
	rotateRight: 'Rotate right',
	flipHorizontal: 'Flip horizontally',
	flipVertical: 'Flip vertically',
	skew: 'Skew',
	skewX: 'Skew X',
	skewY: 'Skew Y',
	resetSkew: 'Reset skew',
	scale: 'Scale',
	fit: 'Fit',
	format: 'Format',
	aspect: 'Aspect',
	free: 'Free',
	cancel: 'Cancel',
	crop: 'Crop image',
	cropFrame: 'Crop frame',
};

export interface FabricCropModalOptions extends ModalConfig {
	image: FabricCropImageInput;
	title?: string;
	width?: number;
	height?: number;
	aspectRatio?: number | null;
	format?: FabricCropFormat;
	quality?: number;
	outputWidth?: number;
	outputHeight?: number;
	/** Longest edge of the output in pixels; larger results are scaled down. */
	maxEdge?: number;
	tools?: FabricCropTools;
	labels?: Partial<FabricCropLabels>;
	onCrop?: (result: FabricCropResult) => void;
	onCancel?: () => void;
}
