import { isPlatformBrowser } from '@angular/common';
import { Inject, inject, Injectable, Optional, PLATFORM_ID } from '@angular/core';
import { Config, CONFIG_TOKEN, DEFAULT_CONFIG } from '../core/config.interface';
import { EmitterService } from '../emitter/emitter.service';

@Injectable({
	providedIn: 'root',
})
export class SocketService {
	private readonly _isBrowser = isPlatformBrowser(inject(PLATFORM_ID));
	private readonly _emitterService = inject(EmitterService);

	private _url = '';
	private _io: any;
	private _connected = false;
	private _opts: any = {};

	constructor(@Inject(CONFIG_TOKEN) @Optional() private _config: Config) {
		this._config = { ...DEFAULT_CONFIG, ...(this._config || {}) };

		if (!this._isBrowser || !this._config.io) {
			return;
		}

		const url = new URL(window.location.origin);

		if (typeof this._config.socket === 'object') {
			if (this._config.socket.port) {
				url.port = this._config.socket.port;
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

		const ioFunc = this._config.io.default ? this._config.io.default : this._config.io;

		this._io = ioFunc(this._url, this._opts);

		this._io.on('connect', () => {
			this._connected = true;
			this._emitterService.complete('socket');
		});

		this._io.on('disconnect', (reason: any) => {
			this._connected = false;
			this._emitterService.emit('socket_disconnect', reason);
			console.warn('Socket disconnected', reason);
		});

		this._io.on('error', (err: any) => {
			this._connected = false;
			this._emitterService.emit('socket_error', err);
			console.warn('Socket error', err);
		});
	}

	disconnect(): void {
		if (this._io) {
			this._io.disconnect();
		}

		this._connected = false;
	}

	on(to: string, cb: (message: any) => void = () => {}): void {
		if (!this._config.socket) {
			return;
		}

		if (!this._io) {
			console.warn('Socket client not loaded.');
			return;
		}

		if (!this._connected) {
			setTimeout(() => {
				this.on(to, cb);
			}, 100);
			return;
		}

		this._io.on(to, cb);
	}

	emit(to: string, message: any, room: any = false): void {
		if (!this._config.socket) {
			return;
		}

		if (!this._io) {
			console.warn('Socket client not loaded.');
			return;
		}

		if (!this._connected) {
			setTimeout(() => {
				this.emit(to, message, room);
			}, 100);
			return;
		}

		this._io.emit(to, message, room);
	}
}
