import { isPlatformBrowser } from '@angular/common';
import {
	Component,
	ElementRef,
	OnDestroy,
	PLATFORM_ID,
	ViewEncapsulation,
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
	template: `<canvas #canvasEl class="wchart"></canvas>`,
	styleUrl: './chart.component.scss',
	encapsulation: ViewEncapsulation.None,
})
export class ChartComponent implements OnDestroy {
	readonly type = input.required<ChartType>();
	readonly data = input.required<ChartData>();
	readonly options = input<ChartOptions>();

	private readonly _canvasEl =
		viewChild<ElementRef<HTMLCanvasElement>>('canvasEl');

	private readonly _isBrowser = isPlatformBrowser(inject(PLATFORM_ID));
	private _chart?: Chart;

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
