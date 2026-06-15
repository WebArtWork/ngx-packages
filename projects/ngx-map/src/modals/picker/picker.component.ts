import { Component } from '@angular/core';
import { MapComponent } from '../../components/map/map.component';
import { LatLngLiteral } from '../../map.interface';

@Component({
	imports: [MapComponent],
	templateUrl: './picker.component.html',
	styles: [
		`
			:host {
				display: block;
			}
		`,
	],
})
export class PickerComponent {
	mapClick!: (latLng: LatLngLiteral) => void;
	close!: () => void;
}
