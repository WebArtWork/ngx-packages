import { isPlatformBrowser } from '@angular/common';
import { PLATFORM_ID, Service, inject } from '@angular/core';
import { Config, CONFIG_TOKEN, DEFAULT_CONFIG } from '../config.interface';

type SocketListener = (message: unknown) => void;

interface PendingEmit {
	to: string;
	message: unknown;
	room: unknown;
}

@Service()
export class SocketService {
	private readonly _isBrowser = isPlatformBrowser(inject(PLATFORM_ID));
	private _config: Config = {
		...DEFAULT_CONFIG,
		...(inject(CONFIG_TOKEN, { optional: true }) || {}),
	};

	private _url = '';
	private _io: any;
	private _connected = false;
	private _opts: any = {};
	private readonly _listeners = new Map<string, Set<SocketListener>>();
	private readonly _boundListeners = new Map<string, Set<SocketListener>>();
	private _pendingEmits: PendingEmit[] = [];

	constructor() {
		if (!this._isBrowser || !this._config.io) {
			return;
		}

		const url = new URL(window.location.origin);

		if (typeof this._config.socket === 'object') {
			if (this._config.socket.port) {
				url.port = String(this._config.socket.port);
			}

			if (this._config.socket.opts) {
				this._opts = this._config.socket.opts;
			}

			this._url = this._config.socket.url ?? url.origin;
		} else {
			this._url = url.origin;
		}

		if (this._config.socket) {
			this.load();
		}
	}

	setUrl(url: string): void {
		this._url = url;

		if (!this._config.socket) {
			this._config.socket = true;
		}

		if (this._isBrowser) {
			this.load();
		}
	}

	private load(): void {
		if (!this._isBrowser || !this._config.io) {
			return;
		}

		this._io?.disconnect();
		this._connected = false;
		this._boundListeners.clear();

		const ioFunc = this._config.io.default ? this._config.io.default : this._config.io;

		this._io = ioFunc(this._url, this._opts);

		this._io.on('connect', () => {
			this._connected = true;
			this._bindListeners();
			this._flushPendingEmits();
		});

		this._io.on('disconnect', (reason: any) => {
			this._connected = false;
			console.warn('Socket disconnected', reason);
		});

		this._io.on('error', (err: any) => {
			this._connected = false;
			console.warn('Socket error', err);
		});
	}

	disconnect(): void {
		if (this._io) {
			this._io.disconnect();
		}

		this._connected = false;
		this._pendingEmits = [];
	}

	on(to: string, cb: SocketListener = () => {}): void {
		if (!this._config.socket) {
			return;
		}

		const listeners = this._listeners.get(to) || new Set<SocketListener>();
		listeners.add(cb);
		this._listeners.set(to, listeners);

		if (this._connected) {
			this._bindListener(to, cb);
		}
	}

	emit(to: string, message: unknown, room: unknown = false): void {
		if (!this._config.socket) {
			return;
		}

		if (!this._connected) {
			this._pendingEmits.push({ to, message, room });
			return;
		}

		this._io.emit(to, message, room);
	}

	private _bindListeners(): void {
		for (const [to, listeners] of this._listeners) {
			for (const listener of listeners) {
				this._bindListener(to, listener);
			}
		}
	}

	private _bindListener(to: string, listener: SocketListener): void {
		if (!this._io) {
			return;
		}

		const bound = this._boundListeners.get(to) || new Set<SocketListener>();
		if (bound.has(listener)) {
			return;
		}

		this._io.on(to, listener);
		bound.add(listener);
		this._boundListeners.set(to, bound);
	}

	private _flushPendingEmits(): void {
		const pendingEmits = this._pendingEmits;
		this._pendingEmits = [];

		for (const pending of pendingEmits) {
			this._io.emit(pending.to, pending.message, pending.room);
		}
	}
}
