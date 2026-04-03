import { InjectionToken } from '@angular/core';
import { HttpConfig } from '../http/http.interface';
import { NetworkConfig } from '../network/network.interface';

export interface Config {
	http?: HttpConfig;
	network?: NetworkConfig;
}

export const CONFIG_TOKEN = new InjectionToken<Config>('ngx-http-config');

export const DEFAULT_CONFIG: Config = {
	http: {
		url: '',
		headers: {},
	},
	network: undefined,
};
