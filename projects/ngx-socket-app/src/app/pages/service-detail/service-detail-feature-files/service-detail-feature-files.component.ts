import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';

interface FeatureFileItem {
	id: string;
	name: string;
	docType: string;
}

interface FeatureFileSection {
	raw: string;
	label: string;
	items: FeatureFileItem[];
}

@Component({
	selector: 'app-service-detail-feature-files',
	templateUrl: './service-detail-feature-files.component.html',
	styleUrl: './service-detail-feature-files.component.scss',
	changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ServiceDetailFeatureFilesComponent {
	readonly fileSections = input.required<FeatureFileSection[]>();
	readonly openFile = input<string | null>(null);

	readonly fileOpen = output<string>();
	readonly fileToggle = output<string>();
	readonly itemOpen = output<string>();

	protected isFileOpen(raw: string): boolean {
		return this.openFile() === raw;
	}
}
