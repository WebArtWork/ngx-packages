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
import type {
	Chart,
	ChartConfiguration,
	ChartData,
	ChartOptions,
	ChartType,
} from 'chart.js';

type ChartModule = typeof import('chart.js');

/**
 * `chart.js` is an optional peer dependency, so it is loaded on first use
 * instead of being imported statically. Apps that never render a `<wchart>`
 * do not need it installed.
 */
let chartModule: Promise<ChartModule> | undefined;

function loadChart(): Promise<ChartModule> {
	// The `.catch()` right after `import()` lets bundlers treat a missing
	// `chart.js` as a run-time failure instead of a build error.
	chartModule ??= import('chart.js')
		.catch(error => {
			chartModule = undefined;
			throw error;
		})
		.then(module => {
			module.Chart.register(...module.registerables);
			return module;
		});

	return chartModule;
}

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
	private _destroyed = false;
	private _renderId = 0;

	readonly tableRows = computed(() => {
		const data = this.data();
		const labels = data.labels ?? [];

		return labels.map((label, i) => ({
			label: String(label),
			values: data.datasets.map(dataset => dataset.data[i] ?? ''),
		}));
	});

	constructor() {
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

			void this._render(canvasEl.nativeElement, config);
		});
	}

	ngOnDestroy(): void {
		this._destroyed = true;
		this._chart?.destroy();
		this._chart = undefined;
	}

	private async _render(canvas: HTMLCanvasElement, config: ChartConfiguration): Promise<void> {
		const renderId = ++this._renderId;

		try {
			const { Chart } = await loadChart();

			// A newer render or destroy happened while chart.js was loading.
			if (this._destroyed || renderId !== this._renderId) {
				return;
			}

			this._chart?.destroy();
			this._chart = new Chart(canvas, config);
		} catch {
			console.error(
				'[ngx-ui] <wchart> needs the optional peer dependency "chart.js". Install it with: npm i chart.js',
			);
		}
	}
}
