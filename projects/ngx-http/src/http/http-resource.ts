import {
	httpResource,
	type HttpResourceOptions,
	type HttpResourceRef,
	type HttpResourceRequest,
} from '@angular/common/http';
import { inject, type ResourceParamsContext } from '@angular/core';
import { HttpService } from './http.service';

export type NgxHttpResourceValue = string | HttpResourceRequest;

export type NgxHttpResourceRequest = (
	ctx: ResourceParamsContext,
) => NgxHttpResourceValue | undefined;

export function ngxHttpResource<TResult = unknown>(
	request: NgxHttpResourceRequest,
	options: HttpResourceOptions<TResult, unknown> & {
		defaultValue: TResult;
	},
): HttpResourceRef<TResult>;
export function ngxHttpResource<TResult = unknown>(
	request: NgxHttpResourceRequest,
	options?: HttpResourceOptions<TResult, unknown>,
): HttpResourceRef<TResult | undefined>;
export function ngxHttpResource<TResult = unknown>(
	request: NgxHttpResourceRequest,
	options?: HttpResourceOptions<TResult, unknown>,
): HttpResourceRef<TResult | undefined> {
	const httpService = inject(HttpService);

	return httpResource<TResult>((ctx) => {
		const next = request(ctx);

		if (!next) {
			return undefined;
		}

		return httpService.resourceRequest(
			typeof next === 'string' ? { url: next } : next,
		);
	}, options);
}
