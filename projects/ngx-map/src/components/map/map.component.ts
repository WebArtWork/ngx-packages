import {
	Component,
	computed,
	effect,
	inject,
	input,
	output,
	PLATFORM_ID,
	signal,
} from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { GoogleMap, MapMarker } from '@angular/google-maps';
import { CONFIG_TOKEN, DEFAULT_CONFIG, NgxMapConfig } from '../../config.interface';
import { LatLngLiteral, LibMapMarker } from '../../map.interface';

@Component({
	selector: 'lib-map',
	imports: [GoogleMap, MapMarker],
	templateUrl: './map.component.html',
	styles: [
		`
			.waw-map {
				position: relative;
				border: 1px solid var(--c-border);
				border-radius: var(--radius-card);
				background: var(--c-bg-secondary);
				overflow: hidden;
				box-shadow: var(--shadow-sm);
			}

			.waw-map__canvas {
				display: block;
			}
		`,
	],
})
export class MapComponent {
	private readonly _platformId = inject(PLATFORM_ID);
	private readonly _isBrowser = isPlatformBrowser(this._platformId);
	private readonly _providedConfig = inject(CONFIG_TOKEN, { optional: true }) ?? {};
	private readonly _config: Required<NgxMapConfig> = {
		photonUrl: this._providedConfig.photonUrl ?? DEFAULT_CONFIG.photonUrl,
		predictionLimit: this._providedConfig.predictionLimit ?? DEFAULT_CONFIG.predictionLimit,
		lastCenterStorageKey:
			this._providedConfig.lastCenterStorageKey ?? DEFAULT_CONFIG.lastCenterStorageKey,
		resolveUserLocation:
			this._providedConfig.resolveUserLocation ?? DEFAULT_CONFIG.resolveUserLocation,
	};
	private readonly _clickMarkerId = '__waw_click_marker__';
	private readonly _clickMarkerLocal = signal<LatLngLiteral | null>(null);
	private readonly _userCenter = signal<LatLngLiteral | null>(null);

	center = input<LatLngLiteral>({ lat: 50.4501, lng: 30.5234 });
	zoom = input<number>(13);
	height = input<string>('360px');
	width = input<string>('100%');
	markers = input<LibMapMarker[]>([]);
	disableDefaultUI = input<boolean>(false);
	clickableIcons = input<boolean>(false);
	placeMarkerOnClick = input<boolean>(false);
	clickMarker = input<LatLngLiteral | null>(null);

	markerSelected = output<LibMapMarker>();
	mapClick = output<LatLngLiteral>();

	readonly centerResolved = computed<LatLngLiteral>(() => this._userCenter() ?? this.center());

	readonly options = computed<google.maps.MapOptions>(() => ({
		disableDefaultUI: this.disableDefaultUI(),
		clickableIcons: this.clickableIcons(),
	}));

	readonly markersResolved = computed<LibMapMarker[]>(() => {
		const base = this.markers();
		const pos = this._clickMarkerLocal();

		if (!pos) {
			return base;
		}

		const clickMarker: LibMapMarker = {
			id: this._clickMarkerId,
			position: pos,
			title: 'Selected location',
			draggable: false,
		};

		return base.some(m => m.id === this._clickMarkerId)
			? base.map(m => (m.id === this._clickMarkerId ? clickMarker : m))
			: [...base, clickMarker];
	});

	constructor() {
		effect(() => {
			this._clickMarkerLocal.set(this.clickMarker());
		});

		effect(() => {
			const ids = this.markersResolved().map(m => m.id);

			if (this._isBrowser && ids.length !== new Set(ids).size) {
				console.warn('[lib-map] Duplicate marker ids detected:', ids);
			}
		});

		this._tryResolveUserLocation();
	}

	onMapClick(ev: google.maps.MapMouseEvent): void {
		const latLng = ev.latLng?.toJSON();

		if (!latLng) {
			return;
		}

		this.mapClick.emit(latLng);

		if (this.placeMarkerOnClick()) {
			this._clickMarkerLocal.set(latLng);
			this._userCenter.set(latLng);
			this._persistUserCenter(latLng);
		}
	}

	markerOptions(m: LibMapMarker): google.maps.MarkerOptions {
		return {
			title: m.title,
			label: m.label,
			draggable: m.draggable ?? false,
			icon: m.iconUrl ? { url: m.iconUrl } : undefined,
		};
	}

	private _tryResolveUserLocation(): void {
		if (!this._isBrowser) {
			return;
		}

		this._readSavedCenter();

		if (!this._config.resolveUserLocation) {
			return;
		}

		if (!('geolocation' in navigator)) {
			return;
		}

		navigator.geolocation.getCurrentPosition(
			pos => {
				const center: LatLngLiteral = {
					lat: pos.coords.latitude,
					lng: pos.coords.longitude,
				};

				this._userCenter.set(center);
				this._persistUserCenter(center);
			},
			() => undefined,
			{
				enableHighAccuracy: true,
				timeout: 8000,
				maximumAge: 60000,
			},
		);
	}

	private _readSavedCenter(): void {
		try {
			const raw = localStorage.getItem(this._config.lastCenterStorageKey);

			if (!raw) {
				return;
			}

			const saved = JSON.parse(raw) as Partial<LatLngLiteral>;

			if (typeof saved?.lat === 'number' && typeof saved?.lng === 'number') {
				this._userCenter.set({ lat: saved.lat, lng: saved.lng });
			}
		} catch {
			// Storage can be unavailable in locked-down browser contexts.
		}
	}

	private _persistUserCenter(center: LatLngLiteral): void {
		if (!this._isBrowser) {
			return;
		}

		try {
			localStorage.setItem(this._config.lastCenterStorageKey, JSON.stringify(center));
		} catch {
			// Storage can be unavailable in locked-down browser contexts.
		}
	}
}
