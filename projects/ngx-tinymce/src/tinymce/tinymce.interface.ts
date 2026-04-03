import { InjectionToken } from '@angular/core';

export type TinymceMode = 'readonly' | 'design';

export interface TinymceEditorModeApi {
	set(mode: TinymceMode): void;
}

export interface TinymceEditor {
	on(events: string, callback: () => void): void;
	off(): void;
	remove(): void;
	getContent(): string;
	setContent(value: string): void;
	mode?: TinymceEditorModeApi;
	setMode?(mode: TinymceMode): void;
}

export interface TinymceInitOptions {
	selector?: string;
	inline?: boolean;
	auto_focus?: string | boolean;
	placeholder?: string;
	setup?: (editor: TinymceEditor) => void;
	init_instance_callback?: (editor: TinymceEditor) => void;
	[key: string]: unknown;
}

export interface TinymceGlobal {
	baseURL?: string;
	init(options: TinymceInitOptions): unknown;
}

export interface TinymceConfig {
	baseURL?: string;
	fileName?: string;
	config?: TinymceInitOptions;
	delay?: number;
}

export const TINYMCE_CONFIG = new InjectionToken<TinymceConfig>('TINYMCE_CONFIG');
