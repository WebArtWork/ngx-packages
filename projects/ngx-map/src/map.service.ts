import { Service, inject } from '@angular/core';
import { HttpService } from '@wawjs/ngx-http';
import { firstValueFrom } from 'rxjs';
import { CONFIG_TOKEN, DEFAULT_CONFIG, NgxMapConfig } from './config.interface';
import { GeoAddress, PhotonFeatureCollectionDTO, PhotonFeatureDTO } from './map.interface';

@Service()
export class MapService {
	private readonly _httpService = inject(HttpService);
	private readonly _providedConfig = inject(CONFIG_TOKEN, { optional: true }) ?? {};
	private readonly _config: Required<NgxMapConfig> = {
		photonUrl: this._providedConfig.photonUrl ?? DEFAULT_CONFIG.photonUrl,
		predictionLimit: this._providedConfig.predictionLimit ?? DEFAULT_CONFIG.predictionLimit,
		lastCenterStorageKey:
			this._providedConfig.lastCenterStorageKey ?? DEFAULT_CONFIG.lastCenterStorageKey,
		resolveUserLocation:
			this._providedConfig.resolveUserLocation ?? DEFAULT_CONFIG.resolveUserLocation,
	};

	async getPredictions(input: string): Promise<GeoAddress[]> {
		const q = input.trim();

		if (!q) {
			return [];
		}

		const res = (await firstValueFrom(
			this._httpService.get(
				`${this._config.photonUrl}?q=${encodeURIComponent(q)}&limit=${this._config.predictionLimit}`,
			),
		)) as PhotonFeatureCollectionDTO;

		return (res.features ?? [])
			.filter((f: PhotonFeatureDTO) => !!f?.geometry?.coordinates?.length)
			.map((f: PhotonFeatureDTO) => {
				const [lon, lat] = f.geometry.coordinates;

				return this._toGeoAddress(f, { lat, lng: lon });
			});
	}

	async reverseGeocode(lat: number, lng: number): Promise<string | null> {
		const geo = await this.reverseGeoAddress(lat, lng);

		return geo?.address ?? null;
	}

	async reverseGeoAddress(lat: number, lng: number): Promise<GeoAddress | null> {
		const res = (await firstValueFrom(
			this._httpService.get(
				`${this._config.photonUrl}/reverse?lat=${lat}&lon=${lng}&limit=1`,
			),
		)) as PhotonFeatureCollectionDTO;

		const f = res.features?.[0];

		if (!f) {
			return null;
		}

		return this._toGeoAddress(f, { lat, lng });
	}

	private _toGeoAddress(f: PhotonFeatureDTO, fallback: { lat: number; lng: number }): GeoAddress {
		const p = f.properties;
		const [lon, lat] = f.geometry?.coordinates ?? [fallback.lng, fallback.lat];
		const nameLooksLikeStreet = this._looksLikeStreet(p.name);

		let streetName = (p.street ?? p.name ?? '').trim();
		let house = (p.housenumber ?? '').trim();

		if (!streetName && nameLooksLikeStreet) {
			streetName = (p.name ?? '').trim();
		}

		if (nameLooksLikeStreet && !house) {
			const match = streetName.match(/\s(\d+[A-Za-z\u0400-\u04FF\-\/]*)\s*$/);

			if (match?.[1]) {
				house = match[1];
				streetName = streetName.replace(/\s(\d+[A-Za-z\u0400-\u04FF\-\/]*)\s*$/, '').trim();
			}
		}

		const street = [streetName, house].filter(Boolean).join(' ').trim();
		const address =
			this._formatAddress({
				...f,
				properties: {
					...p,
					street: streetName || p.street,
					housenumber: house || p.housenumber,
				},
			}) ||
			p.name ||
			`${lat.toFixed(6)}, ${lon.toFixed(6)}`;

		return {
			address,
			street,
			city: p.city ?? '',
			district: p.district ?? '',
			region: p.state ?? '',
			zip: p.postcode ?? '',
			country: p.country ?? '',
			lat,
			lng: lon,
		};
	}

	private _formatAddress(f: PhotonFeatureDTO): string {
		const p = f.properties;
		const line1 = [p.street, p.housenumber].filter(Boolean).join(' ').trim();
		const line2 = [p.postcode, p.city].filter(Boolean).join(' ').trim();
		const line3 = [p.state, p.country].filter(Boolean).join(', ').trim();
		const name = (p.name ?? '').trim();
		const main =
			name && line1.includes(name) ? line1 : [name, line1].filter(Boolean).join(', ').trim();

		return [main, line2, line3].filter(Boolean).join(', ').trim();
	}

	private _looksLikeStreet(name?: string): boolean {
		const s = (name ?? '').trim().toLowerCase();

		if (!s) {
			return false;
		}

		return /^(\u0432\u0443\u043B\u0438\u0446\u044F|\u0432\u0443\u043B\.|\u043F\u0440\u043E\u0441\u043F\u0435\u043A\u0442|\u043F\u0440\u043E\u0441\u043F\.|\u043F\u0440\u043E\u0432\u0443\u043B\u043E\u043A|\u043F\u0440\u043E\u0432\.|\u0431\u0443\u043B\u044C\u0432\u0430\u0440|\u0431\u0443\u043B\.|\u043F\u043B\u043E\u0449\u0430|\u043F\u043B\.|\u043D\u0430\u0431\u0435\u0440\u0435\u0436\u043D\u0430|\u0448\u043E\u0441\u0435|\u0430\u043B\u0435\u044F)\b/i.test(
			s,
		);
	}
}
