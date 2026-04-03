import { InjectionToken } from '@angular/core';

export const ACE_CONFIG = new InjectionToken<AceConfigInterface>('ACE_CONFIG');

export interface AceConfigInterface {
	readOnly?: boolean;

	cursorStyle?: 'ace' | 'slim' | 'smooth' | 'wide';
	selectionStyle?: 'line' | 'text';

	mergeUndoDeltas?: boolean | 'always';
	behavioursEnabled?: boolean;
	wrapBehavioursEnabled?: boolean;

	highlightActiveLine?: boolean;
	highlightSelectedWord?: boolean;

	copyWithEmptySelection?: boolean;
	navigateWithinSoftTabs?: boolean;
	autoScrollEditorIntoView?: boolean;

	mode?: string;
	wrap?: boolean;
	tabSize?: number;
	overwrite?: boolean;
	useWorker?: boolean;
	foldStyle?: string;
	newLineMode?: string;
	useSoftTabs?: boolean;
	firstLineNumber?: number;

	theme?: string;

	minLines?: number;
	maxLines?: number;

	fontSize?: number | string;
	fontFamily?: string;

	showGutter?: boolean;
	showLineNumbers?: boolean;

	showPrintMargin?: boolean;
	printMargin?: number;
	printMarginColumn?: boolean;

	scrollPastEnd?: boolean;
	animatedScroll?: boolean;

	showInvisibles?: boolean;
	fadeFoldWidgets?: boolean;
	showFoldWidgets?: boolean;

	fixedWidthGutter?: boolean;
	displayIndentGuides?: boolean;
	highlightGutterLine?: boolean;

	hScrollBarAlwaysVisible?: boolean;
	vScrollBarAlwaysVisible?: boolean;

	dragDelay?: number;
	dragEnabled?: boolean;
	scrollSpeed?: number;
	focusTimeout?: number;
	tooltipFollowsMouse?: boolean;

	enableBasicAutocompletion?:
		| boolean
		| {
				getCompletions: (
					editor: any,
					session: any,
					pos: any,
					prefix: any,
					callback: any,
				) => void;
		  }[];
	enableLiveAutocompletion?: boolean;
	enableSnippets?: boolean;
	enableEmmet?: boolean;

	useElasticTabstops?: boolean;
}

export class AceConfig implements AceConfigInterface {
	// declare the fields we actually touch in code (keeps TS/Angular happy)
	readOnly?: boolean;
	mode?: string;
	theme?: string;

	useWorker?: boolean;
	highlightActiveLine?: boolean;

	showGutter?: boolean;
	showLineNumbers?: boolean;

	constructor(config: AceConfigInterface = {}) {
		this.assign(config);
	}

	assign(config: AceConfigInterface | Record<string, unknown> = {}, target: any = this): void {
		for (const key in config as any) {
			const v = (config as any)[key];

			if (v && !Array.isArray(v) && typeof v === 'object') {
				(target as any)[key] = (target as any)[key] ?? {};
				this.assign(v, (target as any)[key]);
			} else {
				(target as any)[key] = v;
			}
		}
	}
}
