import { InjectionToken } from '@angular/core';

/**
 * Work the startup screen waits for. Runs in an injection context, so it may call `inject()`.
 * Return a Promise (or nothing for synchronous work). Convert Observables with `firstValueFrom()`.
 * A task should handle its own errors; a rejection is logged and the app opens anyway.
 */
export type StartupTask = () => unknown;

export interface StartupTaskEntry {
	name: string;
	task: StartupTask;
}

export interface StartupConfig {
	/** Maximum wait in ms before the app opens even if tasks are still pending. Default 10000. */
	timeout?: number;
	/**
	 * Minimum time in ms the screen stays up once it is shown, counted from the start of the page
	 * load (when the inline script shows it), so a fast start does not blink the screen in and out.
	 * It never delays an app that did not show the screen. Default 250.
	 */
	minDuration?: number;
	/** `id` of the startup screen element in `index.html`. Default `wstartup`. */
	elementId?: string;
	/** Class on `<html>` that shows the screen (set by the inline script). Default `wstartup-pending`. */
	pendingClass?: string;
}

export const DEFAULT_STARTUP_CONFIG: Required<StartupConfig> = {
	timeout: 10000,
	minDuration: 250,
	elementId: 'wstartup',
	pendingClass: 'wstartup-pending',
};

export const STARTUP_CONFIG = new InjectionToken<StartupConfig>('STARTUP_CONFIG');

export const STARTUP_TASKS = new InjectionToken<StartupTaskEntry[]>('STARTUP_TASKS');
