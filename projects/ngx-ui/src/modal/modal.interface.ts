import { Signal, Type } from '@angular/core';

export const MODAL_SIZES = ['small', 'mid', 'big', 'full'] as const;
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
	closable?: boolean;

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
	onClose?: () => void;
	onOpen?: () => void;
	[x: string]: unknown;
}

export const DEFAULT_MODAL_CONFIG: ModalConfig = {
	size: 'mid',
	timeout: 0,
	class: '',
	panelClass: '',
	closable: true,
};
