import { InjectionToken } from '@angular/core';

export interface NgxMapConfig {
	readonly photonUrl?: string;
	readonly predictionLimit?: number;
	readonly lastCenterStorageKey?: string;
	readonly resolveUserLocation?: boolean;
}

export const DEFAULT_CONFIG: Required<NgxMapConfig> = {
	photonUrl: '/api/proton',
	predictionLimit: 7,
	lastCenterStorageKey: 'waw_map_last_center',
	resolveUserLocation: true,
};

export const CONFIG_TOKEN = new InjectionToken<NgxMapConfig>('ngx-map.config');
