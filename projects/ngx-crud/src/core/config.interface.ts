import { InjectionToken } from '@angular/core';
import { HttpConfig } from '../http/http.interface';
import { NetworkConfig } from '../network/network.interface';
import { StoreConfig } from '../store/store.interface';

export interface Config {
	store?: StoreConfig;
	http?: HttpConfig;
	network?: NetworkConfig;
}

export const CONFIG_TOKEN = new InjectionToken<Config>('ngx-crud-config');

export const DEFAULT_CONFIG: Config = {
	store: {
		prefix: 'waStore',
	},
	http: {
		url: '',
		headers: {},
	},
	network: undefined,
};
