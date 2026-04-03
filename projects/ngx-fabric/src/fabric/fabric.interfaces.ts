import { InjectionToken } from '@angular/core';

export const FABRIC_CONFIG = new InjectionToken<FabricConfigInterface>('FABRIC_CONFIG');

export type FabricEvent =
	| 'drop'
	| 'dragover'
	| 'dragenter'
	| 'dragleave'
	| 'mouseup'
	| 'mousedown'
	| 'mouseover'
	| 'mouseout'
	| 'mousemove'
	| 'mousewheel'
	| 'mousedblclick'
	| 'mouseupBefore'
	| 'mousedownBefore'
	| 'mousemoveBefore'
	| 'mouseUp'
	| 'mouseDown'
	| 'mouseOver'
	| 'mouseOut'
	| 'mouseMove'
	| 'mouseWheel'
	| 'mouseDblclick'
	| 'mouseUpBefore'
	| 'mouseDownBefore'
	| 'mouseMoveBefore'
	| 'pathCreated'
	| 'alterRender'
	| 'objectAdded'
	| 'objectMoved'
	| 'objectScaled'
	| 'objectSkewed'
	| 'objectRotated'
	| 'objectRemoved'
	| 'objectModified'
	| 'objectSelected'
	| 'objectMoving'
	| 'objectScaling'
	| 'objectSkewing'
	| 'objectRotating'
	| 'selectionCleared'
	| 'selectionCreated'
	| 'selectionUpdated'
	| 'beforeTransform'
	| 'beforeSelectionCleared';

export const FabricEvents: FabricEvent[] = [
	'drop',
	'dragover',
	'dragenter',
	'dragleave',
	'mouseup',
	'mousedown',
	'mouseover',
	'mouseout',
	'mousemove',
	'mousewheel',
	'mousedblclick',
	'mouseupBefore',
	'mousedownBefore',
	'mousemoveBefore',
	'mouseUp',
	'mouseDown',
	'mouseOver',
	'mouseOut',
	'mouseMove',
	'mouseWheel',
	'mouseDblclick',
	'mouseUpBefore',
	'mouseDownBefore',
	'mouseMoveBefore',
	'pathCreated',
	'alterRender',
	'objectAdded',
	'objectMoved',
	'objectScaled',
	'objectSkewed',
	'objectRotated',
	'objectRemoved',
	'objectModified',
	'objectSelected',
	'objectMoving',
	'objectScaling',
	'objectSkewing',
	'objectRotating',
	'selectionCleared',
	'selectionCreated',
	'selectionUpdated',
	'beforeTransform',
	'beforeSelectionCleared',
];

export interface FabricConfigInterface {
	allowTouchScrolling?: boolean;
	altActionKey?: string;
	altSelectionKey?: string;
	backgroundColor?: string | unknown;
	backgroundImage?: unknown;
	backgroundVpt?: boolean;
	centeredKey?: string;
	centeredRotation?: boolean;
	centeredScaling?: boolean;
	clipTo?: FabricClipToFunction;
	containerClass?: string;
	controlsAboveOverlay?: boolean;
	defaultCursor?: string;
	enableRetinaScaling?: boolean;
	fireMiddleClick?: boolean;
	fireRightClick?: boolean;
	freeDrawingCursor?: string;
	FX_DURATION?: number;
	hoverCursor?: string;
	imageSmoothingEnabled?: boolean;
	includeDefaultValues?: boolean;
	interactive?: boolean;
	isDrawingMode?: boolean;
	moveCursor?: string;
	notAllowedCursor?: string;
	overlayColor?: string | unknown;
	overlayImage?: unknown;
	overlayVpt?: boolean;
	perPixelTargetFind?: boolean;
	preserveObjectStacking?: boolean;
	renderOnAddRemove?: boolean;
	rotationCursor?: string;
	selection?: boolean;
	selectionBorderColor?: string;
	selectionColor?: string;
	selectionDashArray?: unknown[];
	selectionKey?: string;
	selectionLineWidth?: number;
	skipOffscreen?: boolean;
	skipTargetFind?: boolean;
	snapAngle?: number;
	snapThreshold?: number;
	stateful?: boolean;
	stopContextMenu?: boolean;
	svgViewportTransformation?: boolean;
	targetFindToTolerance?: number;
	uniScaleKey?: string;
	uniScaleTransform?: boolean;
	viewportTransform?: unknown[];
	vptCoords?: unknown;
}

export class FabricConfig implements FabricConfigInterface {
	[key: string]: unknown;

	allowTouchScrolling?: boolean;
	altActionKey?: string;
	altSelectionKey?: string;
	backgroundColor?: string | unknown;
	backgroundImage?: unknown;
	backgroundVpt?: boolean;
	centeredKey?: string;
	centeredRotation?: boolean;
	centeredScaling?: boolean;
	clipTo?: FabricClipToFunction;
	containerClass?: string;
	controlsAboveOverlay?: boolean;
	defaultCursor?: string;
	enableRetinaScaling?: boolean;
	fireMiddleClick?: boolean;
	fireRightClick?: boolean;
	freeDrawingCursor?: string;
	FX_DURATION?: number;
	hoverCursor?: string;
	imageSmoothingEnabled?: boolean;
	includeDefaultValues?: boolean;
	interactive?: boolean;
	isDrawingMode?: boolean;
	moveCursor?: string;
	notAllowedCursor?: string;
	overlayColor?: string | unknown;
	overlayImage?: unknown;
	overlayVpt?: boolean;
	perPixelTargetFind?: boolean;
	preserveObjectStacking?: boolean;
	renderOnAddRemove?: boolean;
	rotationCursor?: string;
	selection?: boolean;
	selectionBorderColor?: string;
	selectionColor?: string;
	selectionDashArray?: unknown[];
	selectionKey?: string;
	selectionLineWidth?: number;
	skipOffscreen?: boolean;
	skipTargetFind?: boolean;
	snapAngle?: number;
	snapThreshold?: number;
	stateful?: boolean;
	stopContextMenu?: boolean;
	svgViewportTransformation?: boolean;
	targetFindToTolerance?: number;
	uniScaleKey?: string;
	uniScaleTransform?: boolean;
	viewportTransform?: unknown[];
	vptCoords?: unknown;

	constructor(config: FabricConfigInterface = {}) {
		this.assign(config);
	}

	assign(config: FabricConfigInterface = {}): void {
		for (const key in config) {
			this[key] = config[key as keyof FabricConfigInterface];
		}
	}
}

export type FabricClipToFunction = (ctx: unknown) => void;
