import { JsonPipe } from '@angular/common';
import { Component, signal } from '@angular/core';
import { AddressComponent, GeoAddress, LatLngLiteral, LibMapMarker, MapComponent } from 'ngx-map';

@Component({
	imports: [AddressComponent, JsonPipe, MapComponent],
	templateUrl: './landing.component.html',
	styleUrl: './landing.component.scss',
})
export class LandingComponent {
	protected readonly address = signal<GeoAddress>({
		address: 'Kyiv, Ukraine',
		street: '',
		city: 'Kyiv',
		district: '',
		region: '',
		zip: '',
		country: 'Ukraine',
		lat: 50.4501,
		lng: 30.5234,
	});

	protected readonly center = signal<LatLngLiteral>({
		lat: 50.4501,
		lng: 30.5234,
	});

	protected readonly markers = signal<LibMapMarker[]>([
		{
			id: 'kyiv',
			position: { lat: 50.4501, lng: 30.5234 },
			title: 'Kyiv',
			label: 'K',
		},
	]);

	protected readonly lastClick = signal<LatLngLiteral | null>(null);

	protected onAddress(address: GeoAddress): void {
		const center = { lat: address.lat, lng: address.lng };

		this.address.set(address);
		this.center.set(center);
		this.markers.set([
			{
				id: 'address',
				position: center,
				title: address.address,
				label: 'A',
			},
		]);
	}

	protected onMapClick(latLng: LatLngLiteral): void {
		this.lastClick.set(latLng);
		this.center.set(latLng);
	}
}
