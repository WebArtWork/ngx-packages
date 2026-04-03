import { InjectionToken } from '@angular/core';

/**
 * Root configuration object used to initialize the RTC package.
 * The shape stays intentionally minimal so bootstrap can evolve
 * without changing the public provider contract.
 */
export interface Config {
	readonly future?: never;
}

export const CONFIG_TOKEN = new InjectionToken<Config>('ngx-rtc.config');

export const DEFAULT_CONFIG: Config = {};
