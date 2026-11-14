import { APP_BOOTSTRAP_LISTENER, DOCUMENT, inject } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { provideStartup, provideStartupTask } from './provide-startup';
import { StartupService } from './startup.service';

/** Runs what Angular runs after the root component's first render. */
function bootstrap(): void {
	for (const listener of TestBed.inject(APP_BOOTSTRAP_LISTENER)) {
		listener(null as never);
	}
}

function deferred(): { promise: Promise<void>; resolve: () => void } {
	let resolve!: () => void;
	const promise = new Promise<void>(done => (resolve = done));
	return { promise, resolve };
}

describe('StartupService', () => {
	beforeEach(() => {
		document.documentElement.classList.add('wstartup-pending');
		const screen = document.createElement('div');
		screen.id = 'wstartup';
		document.body.appendChild(screen);
		// The page "loaded" long ago, so the default minDuration adds no wait unless a test says so.
		vi.spyOn(performance, 'now').mockReturnValue(60000);
	});

	afterEach(() => {
		document.documentElement.classList.remove('wstartup-pending');
		document.getElementById('wstartup')?.remove();
		vi.restoreAllMocks();
	});

	it('keeps the screen until every task settles, then releases it', async () => {
		const user = deferred();
		TestBed.configureTestingModule({
			providers: [provideStartup(), provideStartupTask('user', () => user.promise)],
		});

		const startup = TestBed.inject(StartupService);
		bootstrap();
		await Promise.resolve();

		expect(startup.ready()).toBe(false);
		expect(startup.pending()).toEqual(['user']);
		expect(document.documentElement.classList.contains('wstartup-pending')).toBe(true);

		user.resolve();
		await startup.whenReady();

		expect(startup.ready()).toBe(true);
		expect(startup.pending()).toEqual([]);
		expect(document.documentElement.classList.contains('wstartup-pending')).toBe(false);
	});

	it('stays up through render passes that run before the app has bootstrapped', async () => {
		// In a zoneless app change detection can run while app initializers (e.g. loading the
		// saved language) are still pending; that must not release the screen.
		TestBed.configureTestingModule({ providers: [provideStartup()] });

		const startup = TestBed.inject(StartupService);
		TestBed.tick();
		await new Promise(resolve => setTimeout(resolve));

		expect(startup.ready()).toBe(false);
		expect(document.documentElement.classList.contains('wstartup-pending')).toBe(true);

		bootstrap();
		await startup.whenReady();

		expect(startup.ready()).toBe(true);
		expect(document.documentElement.classList.contains('wstartup-pending')).toBe(false);
	});

	it('keeps a shown screen up until minDuration has passed since the page started loading', async () => {
		vi.spyOn(performance, 'now').mockReturnValue(0);
		TestBed.configureTestingModule({ providers: [provideStartup({ minDuration: 60 })] });

		const startup = TestBed.inject(StartupService);
		bootstrap();
		await new Promise(resolve => setTimeout(resolve, 20));

		expect(startup.ready()).toBe(false);
		expect(document.documentElement.classList.contains('wstartup-pending')).toBe(true);

		await startup.whenReady();

		expect(document.documentElement.classList.contains('wstartup-pending')).toBe(false);
	});

	it('does not wait for minDuration when the screen was not shown', async () => {
		document.documentElement.classList.remove('wstartup-pending');
		vi.spyOn(performance, 'now').mockReturnValue(0);
		TestBed.configureTestingModule({ providers: [provideStartup({ minDuration: 10000 })] });

		const startup = TestBed.inject(StartupService);
		bootstrap();
		await startup.whenReady();

		expect(startup.ready()).toBe(true);
	});

	it('runs tasks in an injection context and awaits tasks registered later', async () => {
		let sawDocument = false;
		const late = deferred();
		TestBed.configureTestingModule({
			providers: [
				provideStartup(),
				provideStartupTask('theme', () => {
					sawDocument = inject(DOCUMENT) === document;
				}),
			],
		});

		const startup = TestBed.inject(StartupService);
		startup.register('language', late.promise);
		bootstrap();
		await Promise.resolve();

		expect(sawDocument).toBe(true);
		expect(startup.ready()).toBe(false);

		late.resolve();
		await startup.whenReady();
		expect(startup.ready()).toBe(true);
	});

	it('makes the page inert while the screen shows, then restores autofocus', async () => {
		const app = document.createElement('main');
		const field = document.createElement('input');
		field.setAttribute('autofocus', '');
		app.appendChild(field);
		document.body.appendChild(app);

		const user = deferred();
		TestBed.configureTestingModule({
			providers: [provideStartup(), provideStartupTask('user', () => user.promise)],
		});

		const startup = TestBed.inject(StartupService);
		bootstrap();
		await Promise.resolve();

		expect(app.hasAttribute('inert')).toBe(true);
		expect(document.getElementById('wstartup')?.hasAttribute('inert')).toBe(false);

		user.resolve();
		await startup.whenReady();

		expect(app.hasAttribute('inert')).toBe(false);
		expect(document.activeElement).toBe(field);
		app.remove();
	});

	it('opens the app when a task fails', async () => {
		const error = vi.spyOn(console, 'error').mockImplementation(() => undefined);
		TestBed.configureTestingModule({
			providers: [
				provideStartup(),
				provideStartupTask('broken', () => Promise.reject(new Error('boom'))),
			],
		});

		const startup = TestBed.inject(StartupService);
		bootstrap();
		await startup.whenReady();

		expect(startup.ready()).toBe(true);
		expect(error).toHaveBeenCalled();
	});

	it('opens the app after the timeout when a task never settles', async () => {
		const warn = vi.spyOn(console, 'warn').mockImplementation(() => undefined);
		TestBed.configureTestingModule({
			providers: [
				provideStartup({ timeout: 20 }),
				provideStartupTask('stuck', () => new Promise(() => undefined)),
			],
		});

		const startup = TestBed.inject(StartupService);
		bootstrap();
		await startup.whenReady();

		expect(startup.ready()).toBe(true);
		expect(startup.pending()).toEqual(['stuck']);
		expect(warn).toHaveBeenCalled();
	});
});
