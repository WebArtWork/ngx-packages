import { isPlatformBrowser } from '@angular/common';
import {
	ApplicationRef,
	DOCUMENT,
	EnvironmentInjector,
	PLATFORM_ID,
	Service,
	inject,
	runInInjectionContext,
	signal,
} from '@angular/core';
import {
	DEFAULT_STARTUP_CONFIG,
	STARTUP_CONFIG,
	STARTUP_TASKS,
	StartupConfig,
	StartupTask,
} from './startup.interface';

/** How long the fade-out in `startup.css` runs before the screen element is removed. */
const FADE_OUT_MS = 250;

/**
 * Collects named startup tasks and hides the startup screen once the first render is done and
 * every task has settled (or the timeout passed). Enable it with `provideStartup()`.
 */
@Service()
export class StartupService {
	private readonly _config: Required<StartupConfig> = {
		...DEFAULT_STARTUP_CONFIG,
		...(inject(STARTUP_CONFIG, { optional: true }) || {}),
	};
	private readonly _document = inject(DOCUMENT);
	private readonly _appRef = inject(ApplicationRef);
	private readonly _isBrowser = isPlatformBrowser(inject(PLATFORM_ID));
	private readonly _tasks = new Map<string, Promise<void>>();
	private readonly _pending = signal<string[]>([]);
	private readonly _ready = signal(false);
	private _started = false;
	private _settling = false;
	private _inertElements: Element[] = [];
	private _resolveReady!: () => void;
	private readonly _readyPromise = new Promise<void>(resolve => (this._resolveReady = resolve));

	/** Names of tasks that have not settled yet. */
	readonly pending = this._pending.asReadonly();
	/** True once the startup screen has been released. */
	readonly ready = this._ready.asReadonly();

	/** Resolves once the startup screen has been released. */
	whenReady(): Promise<void> {
		return this._readyPromise;
	}

	/**
	 * Adds work the startup screen waits for. Call it before the first render finishes (from a
	 * constructor, an initializer, or `provideStartupTask()`). Later registrations still run but
	 * are no longer awaited.
	 */
	register(name: string, task: StartupTask | PromiseLike<unknown>): void {
		let result: Promise<unknown>;

		try {
			result = Promise.resolve(typeof task === 'function' ? task() : task);
		} catch (error) {
			result = Promise.reject(error);
		}

		if (this._ready()) {
			console.warn(`[ngx-ui] startup task "${name}" was registered after startup finished; it is not awaited.`);
			result.catch(error => console.error(`[ngx-ui] startup task "${name}" failed.`, error));
			return;
		}

		const key = this._tasks.has(name) ? `${name}#${this._tasks.size}` : name;

		this._pending.update(names => [...names, key]);
		this._tasks.set(
			key,
			result
				.then(
					() => undefined,
					error => console.error(`[ngx-ui] startup task "${name}" failed; the app opens anyway.`, error),
				)
				.finally(() => this._pending.update(names => names.filter(item => item !== key))),
		);
	}

	/** @internal Called once by `provideStartup()`; runs inside the environment injector. */
	start(): void {
		if (this._started) {
			return;
		}

		this._started = true;

		const injector = inject(EnvironmentInjector);

		for (const entry of inject(STARTUP_TASKS, { optional: true }) || []) {
			this.register(entry.name, () => runInInjectionContext(injector, entry.task));
		}

		if (!this._isBrowser) {
			// Nothing to hide on the server; the screen is only ever shown by the browser script.
			this._markReady();
			return;
		}

		this._lockPage();
	}

	/**
	 * @internal Called by `provideStartup()` through `APP_BOOTSTRAP_LISTENER`, after the root
	 * component's first render. Every app initializer (e.g. translations) has finished by then and
	 * components have had their chance to register tasks in their constructors.
	 *
	 * Do not use `afterNextRender` from `start()` instead: in a zoneless app any change detection
	 * that runs while app initializers are still pending also runs render hooks, which would
	 * release the screen before the saved language is loaded.
	 */
	bootstrapped(): void {
		if (!this._started || !this._isBrowser || this._settling || this._ready()) {
			return;
		}

		this._settling = true;
		void this._settle();
	}

	private async _settle(): Promise<void> {
		let timedOut = false;
		let timer: ReturnType<typeof setTimeout> | undefined;
		const timeout = new Promise<void>(resolve => {
			timer = setTimeout(() => {
				timedOut = true;
				resolve();
			}, this._config.timeout);
		});

		// Tasks may register more tasks while they run, so wait until the set stops growing. Then
		// wait for the app to be stable as well: work started by the first render (a directive
		// that writes translated text in a follow-up render, HTTP requests) finishes before the
		// page is revealed.
		while (!timedOut) {
			const count = this._tasks.size;

			await Promise.race([Promise.all(this._tasks.values()), timeout]);

			if (!timedOut) {
				await Promise.race([this._appRef.whenStable(), timeout]);
			}

			if (this._tasks.size === count) {
				break;
			}
		}

		clearTimeout(timer);

		if (timedOut) {
			console.warn(
				`[ngx-ui] startup timed out after ${this._config.timeout}ms; opening the app while waiting for: ${this._pending().join(', ')}`,
			);
		}

		await this._waitMinDuration();

		this._markReady();
		this._hideScreen();
	}

	/** Keeps a shown screen up until `minDuration` has passed since the page started loading. */
	private async _waitMinDuration(): Promise<void> {
		const shown = this._document.documentElement.classList.contains(this._config.pendingClass);
		const elapsed = this._document.defaultView?.performance?.now() ?? Infinity;
		const remaining = this._config.minDuration - elapsed;

		if (shown && remaining > 0) {
			await new Promise(resolve => setTimeout(resolve, remaining));
		}
	}

	private _markReady(): void {
		this._ready.set(true);
		this._resolveReady();
	}

	/**
	 * While the screen is shown, the page underneath must not take focus: an autofocused input
	 * would open the on-screen keyboard on mobile behind the spinner. Everything in <body> except
	 * the screen becomes `inert` until the screen is released.
	 */
	private _lockPage(): void {
		const root = this._document.documentElement;

		if (!root.classList.contains(this._config.pendingClass)) {
			return;
		}

		for (const element of Array.from(this._document.body?.children || [])) {
			if (element.id !== this._config.elementId && !element.hasAttribute('inert')) {
				element.setAttribute('inert', '');
				this._inertElements.push(element);
			}
		}

		const active = this._document.activeElement as HTMLElement | null;

		if (active && active !== this._document.body) {
			active.blur?.();
		}
	}

	private _unlockPage(): void {
		for (const element of this._inertElements) {
			element.removeAttribute('inert');
		}

		const locked = this._inertElements.length > 0;
		this._inertElements = [];

		// Give the page the focus it asked for while it was locked (e.g. an `autofocus` field).
		if (locked && (!this._document.activeElement || this._document.activeElement === this._document.body)) {
			this._document.querySelector<HTMLElement>('[autofocus]')?.focus();
		}
	}

	private _hideScreen(): void {
		this._document.documentElement.classList.remove(this._config.pendingClass);
		this._unlockPage();

		setTimeout(() => this._document.getElementById(this._config.elementId)?.remove(), FADE_OUT_MS);
	}
}
