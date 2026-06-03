import {
	ChangeDetectionStrategy,
	Component,
	inject,
	input,
	model,
	output,
	signal,
} from '@angular/core';
import { InputComponent, InputIconAction, InputValue, ModalService } from '@wawjs/ngx-ui';
import { CoreService } from '@wawjs/ngx-core';
import { GeoAddress, LatLngLiteral } from '../../map.interface';
import { MapService } from '../../map.service';
import { PickerComponent } from '../../modals/picker/picker.component';

@Component({
	selector: 'lib-address',
	templateUrl: './address.component.html',
	styles: [
		`
			.waw-address {
				position: relative;
			}

			.waw-address__dropdown {
				position: absolute;
				top: calc(100% + var(--sp-1));
				left: 0;
				right: 0;
				background: var(--c-bg-primary);
				border: 1px solid var(--c-border);
				border-radius: var(--radius-card);
				box-shadow: var(--shadow-md);
				z-index: 10;
				max-height: 280px;
				overflow-y: auto;
			}

			.waw-address__item {
				display: block;
				width: 100%;
				padding: var(--sp-3);
				border: 0;
				background: transparent;
				color: var(--c-text-primary);
				text-align: left;
				cursor: pointer;
				transition: background var(--motion-fast) var(--easing);
			}

			.waw-address__item:hover,
			.waw-address__item:focus-visible {
				background: var(--c-bg-tertiary);
				outline: none;
			}

			.waw-address__loading {
				position: absolute;
				right: var(--sp-3);
				top: 50%;
				transform: translateY(-50%);
				color: var(--c-text-muted);
				pointer-events: none;
			}
		`,
	],
	changeDetection: ChangeDetectionStrategy.OnPush,
	imports: [InputComponent],
})
export class AddressComponent {
	private readonly _mapService = inject(MapService);
	private readonly _modalService = inject(ModalService);
	private readonly _coreService = inject(CoreService);
	private _blurTimer: ReturnType<typeof setTimeout> | null = null;

	label = input<string>('');
	placeholder = input<string>('Search address...');

	address = model<GeoAddress>({
		address: '',
		street: '',
		city: '',
		district: '',
		region: '',
		zip: '',
		country: '',
		lat: 0,
		lng: 0,
	});
	wChange = output<GeoAddress>();

	readonly search = signal('');
	readonly loading = signal(false);
	readonly predictions = signal<GeoAddress[]>([]);
	readonly focused = signal(false);

	readonly icons: InputIconAction[] = [
		{
			icon: 'place',
			click: () => {
				this._modalService.show({
					component: PickerComponent,
					mapClick: async (latLng: LatLngLiteral) => {
						await this._pickLatLng(latLng);
					},
				});
			},
		},
	];

	onFocus(): void {
		if (this._blurTimer) {
			clearTimeout(this._blurTimer);
		}

		this.focused.set(true);
	}

	onBlur(): void {
		this._blurTimer = setTimeout(() => {
			this.focused.set(false);
			this.predictions.set([]);
		}, 120);
	}

	onKeydown(e: KeyboardEvent): void {
		if (e.key === 'Escape') {
			this.predictions.set([]);
			this.focused.set(false);
		}
	}

	async onSearchChange(value: InputValue): Promise<void> {
		this._coreService.afterWhile(async () => {
			this.search.set((value ?? '') as string);

			if (!this.search().trim() || !this.focused()) {
				this.predictions.set([]);
				return;
			}

			this.loading.set(true);

			try {
				const results = await this._mapService.getPredictions(this.search());

				this.predictions.set(this.focused() ? results : []);
			} finally {
				this.loading.set(false);
			}

			const address = this.address();

			if (address.lat && address.lng) {
				const next = {
					...address,
					address: this.search(),
				};

				this.address.set(next);
				this.wChange.emit(next);
			}
		});
	}

	onPick(address: GeoAddress): void {
		if (this._blurTimer) {
			clearTimeout(this._blurTimer);
		}

		this.address.set(address);
		this.search.set(address.address);
		this.predictions.set([]);
		this.focused.set(false);
		this.loading.set(false);
		this.wChange.emit(address);
	}

	private async _pickLatLng(latLng: LatLngLiteral): Promise<void> {
		const geo = await this._mapService.reverseGeoAddress(latLng.lat, latLng.lng);
		const address =
			geo ??
			({
				address: `${latLng.lat.toFixed(6)}, ${latLng.lng.toFixed(6)}`,
				street: '',
				city: '',
				district: '',
				region: '',
				zip: '',
				country: '',
				lat: latLng.lat,
				lng: latLng.lng,
			} satisfies GeoAddress);

		this.address.set(address);
		this.search.set(address.address);
		this.focused.set(false);
		this.predictions.set([]);
		this.wChange.emit(address);
	}
}
