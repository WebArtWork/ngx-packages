import { Component, inject, signal } from '@angular/core';
import {
	AccordionComponent,
	AccordionPanelComponent,
	AlertService,
	AvatarComponent,
	BadgeComponent,
	BreadcrumbComponent,
	BurgerComponent,
	ButtonComponent,
	CardComponent,
	ChipComponent,
	ConfirmPopupDirective,
	ConfirmPopupStylesComponent,
	ConfirmService,
	DividerComponent,
	EditorComponent,
	FileComponent,
	InputComponent,
	LinkComponent,
	MaterialComponent,
	MenuComponent,
	MenubarComponent,
	MenuItem,
	MeterGroupComponent,
	ModalService,
	OrderListComponent,
	ProgressBarComponent,
	SelectComponent,
	SpinnerComponent,
	TableComponent,
	TabPanelComponent,
	TabsComponent,
	TagComponent,
	ThemeComponent,
	ThemeService,
	TimelineComponent,
	ToggleComponent,
	TooltipDirective,
	TooltipStylesComponent,
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
		AccordionComponent,
		AccordionPanelComponent,
		AvatarComponent,
		BadgeComponent,
		BreadcrumbComponent,
		BurgerComponent,
		ButtonComponent,
		CardComponent,
		ChipComponent,
		ConfirmPopupDirective,
		ConfirmPopupStylesComponent,
		DividerComponent,
		EditorComponent,
		FileComponent,
		InputComponent,
		LinkComponent,
		MaterialComponent,
		MenuComponent,
		MenubarComponent,
		MeterGroupComponent,
		OrderListComponent,
		ProgressBarComponent,
		SelectComponent,
		SpinnerComponent,
		TableComponent,
		TabPanelComponent,
		TabsComponent,
		TagComponent,
		ThemeComponent,
		TimelineComponent,
		ToggleComponent,
		TooltipDirective,
		TooltipStylesComponent,
	],
	templateUrl: './landing.component.html',
	styleUrl: './landing.component.scss',
})
export class LandingComponent {
	private readonly _alertService = inject(AlertService);
	private readonly _modalService = inject(ModalService);
	private readonly _confirmService = inject(ConfirmService);
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

	protected readonly activeTab = signal(0);
	protected readonly notificationsEnabled = signal(true);
	protected readonly uploadPercent = signal(64);
	protected readonly bioHtml = signal('<p>Write something <strong>bold</strong>.</p>');
	protected readonly priorityList = signal(['Button', 'File picker', 'Dynamic form renderer']);
	protected readonly deletedCount = signal(0);

	protected readonly menuItems: MenuItem[] = [
		{ label: 'View', icon: 'visibility', command: () => this.showAlert('View selected') },
		{ label: 'Edit', icon: 'edit', command: () => this.showAlert('Edit selected') },
		{ separator: true, label: '' },
		{ label: 'Delete', icon: 'delete', command: () => this.showAlert('Delete selected') },
	];

	protected readonly navItems: MenuItem[] = [
		{ label: 'Dashboard', icon: 'dashboard' },
		{
			label: 'Components',
			icon: 'widgets',
			items: [
				{ label: 'Buttons', icon: 'smart_button' },
				{ label: 'Tables', icon: 'table_chart' },
			],
		},
		{ label: 'Settings', icon: 'settings' },
	];

	protected readonly breadcrumbItems = [
		{ label: 'ngx-ui' },
		{ label: 'Components' },
		{ label: 'Landing' },
	];

	protected readonly meterItems = [
		{ label: 'Ready', value: this.statusItems.length },
		{ label: 'Review', value: 1 },
		{ label: 'Blocked', value: 0 },
	];

	protected readonly timelineItems = [
		{ label: 'Package published', date: 'Aug 1', icon: 'inventory_2' },
		{ label: 'New components added', date: 'Aug 20', icon: 'widgets' },
		{ label: 'Docs updated', date: 'Aug 26', icon: 'check' },
	];

	protected confirmDelete(): void {
		this._confirmService.confirm({
			message: 'Delete this item?',
			accept: () => this.deletedCount.set(this.deletedCount() + 1),
		});
	}

	protected onPriorityChange(): void {
		// items model updates in place via [(items)]
	}

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
