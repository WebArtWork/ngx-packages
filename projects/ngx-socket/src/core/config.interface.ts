import { InjectionToken } from '@angular/core';

export interface SocketConfig {
	url?: string;
	port?: string | number;
	opts?: Record<string, unknown>;
}

/**
 * Root configuration object used to initialize the socket package.
 */
export interface Config {
	/** Optional socket connection configuration. */
	socket?: boolean | SocketConfig;
	/** Raw Socket.IO client factory or module export. */
	io?: any;
}

export const CONFIG_TOKEN = new InjectionToken<Config>('ngx-socket.config');

export const DEFAULT_CONFIG: Config = {
	socket: false,
};
