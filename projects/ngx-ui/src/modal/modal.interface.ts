import { Signal, Type } from '@angular/core';

export const MODAL_SIZES = ['small', 'mid', 'big', 'full', 'fullscreen'] as const;
export type ModalSizes = (typeof MODAL_SIZES)[number];

export interface ModalButton {
	text: string;
	callback?: () => void;
}

export interface ModalConfig {
	size?: ModalSizes;
	buttons?: ModalButton[];

	/**
	 * Legacy API: extra class for the panel.
	 * Prefer `panelClass`, kept for backwards compatibility.
	 */
	class?: string;

	/**
	 * New API: class applied to the modal content panel.
	 */
	panelClass?: string;

	unique?: string;
	progress?: boolean;
	timeout?: number;
	close?: () => void;

	/**
	 * Master switch for the close behaviours. When `showClose`, `closeOnEscape`
	 * or `closeOnBackdrop` is not set, it falls back to this value.
	 */
	closable?: boolean;

	/** Show the close (x) button. Defaults to `closable`. */
	showClose?: boolean;

	/** Close on Escape. Defaults to `closable`. */
	closeOnEscape?: boolean;

	/** Close when the backdrop is clicked. Defaults to `closable`. */
	closeOnBackdrop?: boolean;

	/** Called after the modal has been closed. */
	onClose?: () => void;

	/** Called when the modal shell has been opened. */
	onOpen?: () => void;

	/**
	 * ARIA role for the modal panel. Defaults to `dialog`; use `alertdialog`
	 * for modals that demand an immediate response (errors, confirmations).
	 */
	role?: 'dialog' | 'alertdialog';

	/**
	 * Accessible name for the modal when no visible heading id is available.
	 * Prefer `ariaLabelledBy` when the content component renders its own
	 * heading element.
	 */
	ariaLabel?: string;

	/** Id of an element (usually a heading) inside the modal that labels it. */
	ariaLabelledBy?: string;

	/** Id of an element inside the modal that describes it. */
	ariaDescribedBy?: string;
}

export interface Modal extends ModalConfig {
	component: Type<unknown>;
	id?: number;
	progressPercentage?: Signal<number>;
	onClickOutside?: () => void;
	[x: string]: unknown;
}

export const DEFAULT_MODAL_CONFIG: ModalConfig = {
	size: 'mid',
	timeout: 0,
	class: '',
	panelClass: '',
	closable: true,
};
