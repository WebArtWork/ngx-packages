import type { ModalConfig } from '@wawjs/ngx-ui';

export type FabricCropImageInput = string | Blob;

export type FabricCropFormat = 'png' | 'jpeg' | 'webp';

export interface FabricCropResult {
	base64: string;
	format: FabricCropFormat;
	width: number;
	height: number;
	source: {
		x: number;
		y: number;
		width: number;
		height: number;
	};
}

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
	onCrop?: (result: FabricCropResult) => void;
	onCancel?: () => void;
}
