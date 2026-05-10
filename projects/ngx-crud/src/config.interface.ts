import { InjectionToken } from '@angular/core';
import { Config as NgxHttpConfig } from '@wawjs/ngx-http';

/**
 * Root configuration object used to initialize the CRUD package.
 * It keeps a local CRUD config token while forwarding shared HTTP
 * and network options to ngx-http.
 */
export interface Config extends NgxHttpConfig {
	readonly future?: never;
}

export const CONFIG_TOKEN = new InjectionToken<Config>('ngx-crud.config');

export const DEFAULT_CONFIG: Config = {};
