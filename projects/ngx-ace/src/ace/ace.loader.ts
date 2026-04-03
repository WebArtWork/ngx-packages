/// <reference path="./ace-builds.d.ts" />
import { isPlatformBrowser } from '@angular/common';
import { AceMode, AceTheme, EnsureAceArgs } from './ace.types';

let aceInstance: any | null = null;
let acePromise: Promise<any> | null = null;

const loadedModes = new Set<string>();
const loadedThemes = new Set<string>();

const modeLoaders = new Map<string, () => Promise<unknown>>();
const themeLoaders = new Map<string, () => Promise<unknown>>();

export function registerAceMode(mode: AceMode, loader: () => Promise<unknown>): void {
	modeLoaders.set(mode, loader);
}

export function registerAceTheme(theme: AceTheme, loader: () => Promise<unknown>): void {
	themeLoaders.set(theme, loader);
}

// register your defaults inside the lib
registerAceMode('text', () => import('ace-builds/src-noconflict/mode-text'));
registerAceMode('javascript', () => import('ace-builds/src-noconflict/mode-javascript'));

registerAceTheme('github', () => import('ace-builds/src-noconflict/theme-github'));
registerAceTheme('clouds', () => import('ace-builds/src-noconflict/theme-clouds'));

export async function ensureAce(args: EnsureAceArgs): Promise<any | null> {
	const { platformId, mode, theme } = args;

	if (!isPlatformBrowser(platformId)) return null;

	const ace = await loadAceCore(platformId);
	if (!ace) return null;

	await Promise.all([
		mode ? ensureMode(mode) : Promise.resolve(),
		theme ? ensureTheme(theme) : Promise.resolve(),
	]);

	return ace;
}

async function loadAceCore(platformId: object): Promise<any | null> {
	if (!isPlatformBrowser(platformId)) return null;

	if (aceInstance) return aceInstance;
	if (acePromise) return acePromise;

	acePromise = (async () => {
		const mod = await import('ace-builds/src-noconflict/ace');
		aceInstance = (mod as any).default ?? mod;
		return aceInstance;
	})();

	return acePromise;
}

async function ensureMode(mode: AceMode): Promise<void> {
	if (loadedModes.has(mode)) return;

	const loader = modeLoaders.get(mode);
	if (!loader) throw new Error(`Ace mode "${mode}" is not registered.`);

	await loader();
	loadedModes.add(mode);
}

async function ensureTheme(theme: AceTheme): Promise<void> {
	if (loadedThemes.has(theme)) return;

	const loader = themeLoaders.get(theme);
	if (!loader) throw new Error(`Ace theme "${theme}" is not registered.`);

	await loader();
	loadedThemes.add(theme);
}
