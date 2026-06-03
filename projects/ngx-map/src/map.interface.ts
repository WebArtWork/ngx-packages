export interface LatLngLiteral {
	lat: number;
	lng: number;
}

export interface GeoAddress {
	address: string;
	street: string;
	city: string;
	district: string;
	region: string;
	zip: string;
	country: string;
	lat: number;
	lng: number;
}

export interface PhotonFeatureDTO {
	type: 'Feature';
	geometry: { type: 'Point'; coordinates: [number, number] };
	properties: {
		osm_id: number;
		osm_type: string;
		name?: string;
		housenumber?: string;
		street?: string;
		postcode?: string;
		city?: string;
		state?: string;
		district?: string;
		country?: string;
	};
}

export interface PhotonFeatureCollectionDTO {
	type: 'FeatureCollection';
	features: PhotonFeatureDTO[];
}

export interface LibMapMarker {
	id: string;
	position: LatLngLiteral;
	title?: string;
	label?: string;
	draggable?: boolean;
	iconUrl?: string;
}
