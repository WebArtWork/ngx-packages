import { Component, inject, signal } from '@angular/core';
import {
	AlertService,
	BurgerComponent,
	ButtonComponent,
	FileComponent,
	InputComponent,
	MaterialComponent,
	ModalService,
	SelectComponent,
	TableComponent,
	ThemeComponent,
	ThemeService,
} from 'ngx-ui';
import { SelectValue } from 'ngx-ui';

interface UiRow {
	_id: string;
	name: string;
	status: string;
	owner: string;
}

@Component({
	imports: [
		BurgerComponent,
		ButtonComponent,
		FileComponent,
		InputComponent,
		MaterialComponent,
		SelectComponent,
		TableComponent,
		ThemeComponent,
	],
	templateUrl: './landing.component.html',
	styleUrl: './landing.component.scss',
})
export class LandingComponent {
	private readonly _alertService = inject(AlertService);
	private readonly _modalService = inject(ModalService);
	protected readonly themeService = inject(ThemeService);

	protected readonly search = signal('');
	protected readonly selectedStatus = signal<string | null>('ready');
	protected readonly selectedFiles = signal<File[]>([]);
	protected readonly burgerOpen = signal(false);

	protected readonly statusItems = [
		{ _id: 'ready', name: 'Ready' },
		{ _id: 'review', name: 'Review' },
		{ _id: 'blocked', name: 'Blocked' },
	];

	protected readonly columns = ['name', 'status', 'owner'];
	protected readonly rows: UiRow[] = [
		{ _id: '1', name: 'Button', status: 'Ready', owner: 'ngx-ui' },
		{ _id: '2', name: 'File picker', status: 'Ready', owner: 'ngx-ui' },
		{ _id: '3', name: 'Dynamic form renderer', status: 'Review', owner: 'ngx-form' },
	];

	protected readonly tableConfig = {
		allDocs: true,
		perPage: -1,
		buttons: [
			{
				icon: 'visibility',
				click: (row: UiRow) => this.showAlert(`${row.name} selected`),
			},
		],
	};

	protected onFiles(files: File[]): void {
		this.selectedFiles.set(files);
	}

	protected onStatusChange(value: SelectValue): void {
		this.selectedStatus.set(typeof value === 'string' ? value : null);
	}

	protected showAlert(text = 'ngx-ui alert is wired'): void {
		this._alertService.info({ text });
	}

	protected showModal(): void {
		this._modalService.show({
			component: DemoModalComponent,
			size: 'small',
			title: 'Modal',
		});
	}
}

@Component({
	imports: [ButtonComponent],
	template: `
		<div class="demo-modal">
			<h2>Modal content</h2>
			<p>ModalService can render package-local standalone components.</p>
			<wbutton type="primary" [disableSubmit]="true" (wClick)="close()">
				Close
			</wbutton>
		</div>
	`,
	styles: [
		`
			.demo-modal {
				display: grid;
				gap: 14px;
			}

			h2,
			p {
				margin: 0;
			}
		`,
	],
})
export class DemoModalComponent {
	close: () => void = () => {};
}
