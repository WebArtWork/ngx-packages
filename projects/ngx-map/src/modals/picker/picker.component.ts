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

			.picker__hint {
				margin: 0 0 var(--sp-2);
				color: var(--c-text-secondary);
				font-size: 0.9rem;
			}
		`,
	],
})
export class PickerComponent {
	mapClick!: (latLng: LatLngLiteral) => void;
	close!: () => void;
}
