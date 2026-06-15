import {
	inject,
	resource,
	type PromiseResourceOptions,
	type ResourceLoader,
	type ResourceLoaderParams,
	type ResourceOptions,
	type ResourceRef,
} from '@angular/core';
import { StoreService } from '../store/store.service';

export type NgxResourceKey<R> =
	| string
	| ((params: Exclude<R, undefined>) => string);

export type NgxResourceStoreMode =
	| 'network-first'
	| 'cache-first'
	| 'store-only';

export type NgxResourceOptions<T, R> = ResourceOptions<T, R> & {
	key?: NgxResourceKey<R>;
	store?: NgxResourceStoreMode;
};

type NgxResourceStoredOptions<T, R> = Omit<
	PromiseResourceOptions<T, R>,
	'loader'
> & {
	key: NgxResourceKey<R>;
	store?: NgxResourceStoreMode;
	loader?: ResourceLoader<T, R>;
	debugName?: string;
};

interface NgxResourceCache<T> {
	__ngxResource: true;
	value: T;
}

export function ngxResource<T, R>(
	options: NgxResourceStoredOptions<T, R> & {
		defaultValue: T;
	},
): ResourceRef<T>;
export function ngxResource<T, R>(
	options: NgxResourceStoredOptions<T, R>,
): ResourceRef<T | undefined>;
export function ngxResource<T, R>(
	options: ResourceOptions<T, R> & {
		defaultValue: T;
	},
): ResourceRef<T>;
export function ngxResource<T, R>(
	options: ResourceOptions<T, R>,
): ResourceRef<T | undefined>;
export function ngxResource<T, R>(
	options: NgxResourceOptions<T, R> | NgxResourceStoredOptions<T, R>,
): ResourceRef<T | undefined> {
	if (!options.key) {
		return resource(options as ResourceOptions<T, R>);
	}

	if ('stream' in options && options.stream) {
		throw new Error('ngxResource storage keys are supported only with loader resources.');
	}

	const storeService = inject(StoreService);
	const { key, store = 'network-first', loader, ...resourceOptions } =
		options as NgxResourceStoredOptions<T, R>;
	const hasDefaultValue = Object.prototype.hasOwnProperty.call(
		resourceOptions,
		'defaultValue',
	);

	return resource<T, R>({
		...resourceOptions,
		loader: async (params) => {
			return _loadStoredResource({
				key,
				store,
				loader,
				params,
				storeService,
				defaultValue: resourceOptions.defaultValue,
				hasDefaultValue,
			});
		},
	});
}

async function _loadStoredResource<T, R>({
	key,
	store,
	loader,
	params,
	storeService,
	defaultValue,
	hasDefaultValue,
}: {
	key: NgxResourceKey<R>;
	store: NgxResourceStoreMode;
	loader?: ResourceLoader<T, R>;
	params: ResourceLoaderParams<R>;
	storeService: StoreService;
	defaultValue?: T;
	hasDefaultValue: boolean;
}): Promise<T> {
	const storageKey = _resourceKey(key, params.params);

	if (store === 'cache-first' || store === 'store-only') {
		const cached = await _readResourceCache<T>(storeService, storageKey);

		if (cached.found) {
			return cached.value;
		}

		if (store === 'store-only') {
			if (hasDefaultValue) {
				return defaultValue as T;
			}

			throw new Error(`No stored resource value for "${storageKey}".`);
		}
	}

	if (!loader) {
		throw new Error(`No resource loader configured for "${storageKey}".`);
	}

	try {
		const value = await loader(params);

		if (!params.abortSignal.aborted) {
			await storeService.setJson<NgxResourceCache<T>>(storageKey, {
				__ngxResource: true,
				value,
			});
		}

		return value;
	} catch (err) {
		if (store === 'network-first') {
			const cached = await _readResourceCache<T>(
				storeService,
				storageKey,
			);

			if (cached.found) {
				return cached.value;
			}
		}

		throw err;
	}
}

function _resourceKey<R>(
	key: NgxResourceKey<R>,
	params: Exclude<R, undefined>,
): string {
	return typeof key === 'function' ? key(params) : key;
}

async function _readResourceCache<T>(
	storeService: StoreService,
	key: string,
): Promise<{ found: true; value: T } | { found: false }> {
	const cached = await storeService.getJson<NgxResourceCache<T> | T>(key);

	if (cached === null) {
		return { found: false };
	}

	if (
		typeof cached === 'object' &&
		cached !== null &&
		'__ngxResource' in cached &&
		cached.__ngxResource === true
	) {
		return {
			found: true,
			value: cached.value,
		};
	}

	return {
		found: true,
		value: cached as T,
	};
}
