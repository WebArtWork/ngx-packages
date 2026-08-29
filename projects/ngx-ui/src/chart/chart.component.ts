import { isPlatformBrowser } from '@angular/common';
import {
	Component,
	ElementRef,
	OnDestroy,
	PLATFORM_ID,
	ViewEncapsulation,
	computed,
	effect,
	inject,
	input,
	viewChild,
} from '@angular/core';
import {
	Chart,
	ChartConfiguration,
	ChartData,
	ChartOptions,
	ChartType,
	registerables,
} from 'chart.js';

@Component({
	selector: 'wchart',
	template: `
		<canvas
			#canvasEl
			class="wchart"
			role="img"
			[attr.aria-label]="description() || 'Chart'"
		></canvas>

		<table class="wchart__sr-table">
			<caption>
				{{
					description() || 'Chart data'
				}}
			</caption>
			<thead>
				<tr>
					<th scope="col">Label</th>
					@for (dataset of data().datasets; track $index) {
						<th scope="col">{{ dataset.label }}</th>
					}
				</tr>
			</thead>
			<tbody>
				@for (row of tableRows(); track $index) {
					<tr>
						<th scope="row">{{ row.label }}</th>
						@for (value of row.values; track $index) {
							<td>{{ value }}</td>
						}
					</tr>
				}
			</tbody>
		</table>
	`,
	styleUrl: './chart.component.scss',
	encapsulation: ViewEncapsulation.None,
})
export class ChartComponent implements OnDestroy {
	readonly type = input.required<ChartType>();
	readonly data = input.required<ChartData>();
	readonly options = input<ChartOptions>();

	/** Accessible summary of what the chart shows, also used as its `aria-label`. */
	readonly description = input<string>('');

	private readonly _canvasEl =
		viewChild<ElementRef<HTMLCanvasElement>>('canvasEl');

	private readonly _isBrowser = isPlatformBrowser(inject(PLATFORM_ID));
	private _chart?: Chart;

	readonly tableRows = computed(() => {
		const data = this.data();
		const labels = data.labels ?? [];

		return labels.map((label, i) => ({
			label: String(label),
			values: data.datasets.map(dataset => dataset.data[i] ?? ''),
		}));
	});

	constructor() {
		Chart.register(...registerables);

		effect(() => {
			const config: ChartConfiguration = {
				type: this.type(),
				data: this.data(),
				options: this.options(),
			};

			const canvasEl = this._canvasEl();

			if (!this._isBrowser || !canvasEl) {
				return;
			}

			this._chart?.destroy();
			this._chart = new Chart(canvasEl.nativeElement, config);
		});
	}

	ngOnDestroy(): void {
		this._chart?.destroy();
	}
}
