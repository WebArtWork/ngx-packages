import { DOCUMENT, inject } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { provideStartup, provideStartupTask } from './provide-startup';
import { StartupService } from './startup.service';

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
		TestBed.tick();
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
		TestBed.tick();
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
		TestBed.tick();
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
		TestBed.tick();
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
		TestBed.tick();
		await startup.whenReady();

		expect(startup.ready()).toBe(true);
		expect(startup.pending()).toEqual(['stuck']);
		expect(warn).toHaveBeenCalled();
	});
});
