import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';

interface ServiceDetailSectionItem {
	id: string;
	name: string;
	category: string;
	docType: string;
	signature: string;
	description: string;
	details: string[];
	example: string | null;
}

interface ServiceDetailSectionData {
	id: string;
	raw: string;
	label: string;
	items: ServiceDetailSectionItem[];
}

@Component({
	selector: 'app-service-detail-section',
	templateUrl: './service-detail-section.component.html',
	styleUrl: './service-detail-section.component.scss',
	changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ServiceDetailSectionComponent {
	readonly section = input.required<ServiceDetailSectionData>();
	readonly open = input(false);
	readonly copied = input(false);

	readonly toggle = output<string>();
	readonly copy = output<string>();
}
