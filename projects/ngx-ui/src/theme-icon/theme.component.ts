import { TitleCasePipe } from '@angular/common';
import {
	ChangeDetectionStrategy,
	Component,
	computed,
	inject,
	input,
} from '@angular/core';
import { TranslateDirective } from '@wawjs/ngx-translate';
import { ThemeDensity, ThemeMode, ThemeRadius } from '../theme/theme.type';
import { ThemeService } from '../theme/theme.service';

@Component({
	changeDetection: ChangeDetectionStrategy.OnPush,
	selector: 'icon-theme',
	templateUrl: './theme.component.html',
	styles: [
		`
			.icon-theme {
				display: inline-flex;
				align-items: center;
				gap: 8px;
				cursor: pointer;
				line-height: 1;
				user-select: none;
			}

			.icon-theme__box {
				position: relative;
				display: inline-block;
				flex: 0 0 auto;
			}

			.icon-theme__svg {
				position: absolute;
				inset: 0;
				width: 100%;
				height: 100%;
			}

			.icon-theme__mode {
				position: absolute;
				inset: 0;
				display: grid;
				place-items: center;
				line-height: 1;
				font-size: 1em;
			}

			.icon-theme__text {
				display: inline-flex;
				align-items: center;
				white-space: nowrap;
				line-height: 1;
				font-size: 14px;
			}
		`,
	],
	imports: [TitleCasePipe, TranslateDirective],
})
export class ThemeComponent {
	private readonly _themeService = inject(ThemeService);

	// Theme inputs
	mode = input<ThemeMode>();
	radius = input<ThemeRadius>();
	density = input<ThemeDensity>();
	color = input('currentColor');

	// Size inputs
	size = input<number | string>();
	width = input<number | string>();
	height = input<number | string>();

	showText = input(false);

	readonly resolvedWidth = computed(() => {
		const s = this.size();
		const w = this.width();
		if (s != null) return this.normalizeSize(s);
		if (w != null) return this.normalizeSize(w);
		return '50px';
	});

	readonly resolvedHeight = computed(() => {
		const s = this.size();
		const h = this.height();
		if (s != null) return this.normalizeSize(s);
		if (h != null) return this.normalizeSize(h);
		return '50px';
	});

	private normalizeSize(v: number | string): string {
		return typeof v === 'number' ? `${v}px` : v;
	}

	readonly resolvedMode = computed<ThemeMode>(
		() => this.mode() ?? this._themeService.mode() ?? 'light',
	);
	readonly resolvedRadius = computed<ThemeRadius>(
		() => this.radius() ?? this._themeService.radius() ?? 'rounded',
	);
	readonly resolvedRadiusName = computed<ThemeRadius>(() =>
		(this.radius() ?? this._themeService.radius() ?? 'rounded') ===
		'rounded'
			? 'Round'
			: 'Square',
	);
	readonly resolvedDensity = computed<ThemeDensity>(
		() => this.density() ?? this._themeService.density() ?? 'comfortable',
	);
	readonly resolvedDensityName = computed<ThemeDensity>(() =>
		(this.density() ?? this._themeService.density() ?? 'comfortable') ===
		'comfortable'
			? 'Wide'
			: 'Tight',
	);

	readonly radiusPath = computed(() => {
		const r = this.resolvedRadius();
		const d = this.resolvedDensity();

		const inset = d === 'compact' ? 5 : 3;
		const x = inset;
		const y = inset;
		const w = 24 - inset * 2;
		const h = 24 - inset * 2;

		if (r === 'square') return `M${x} ${y}H${x + w}V${y + h}H${x}Z`;

		const cr = 2;
		return (
			`M${x + cr} ${y}` +
			`H${x + w - cr}` +
			`A${cr} ${cr} 0 0 1 ${x + w} ${y + cr}` +
			`V${y + h - cr}` +
			`A${cr} ${cr} 0 0 1 ${x + w - cr} ${y + h}` +
			`H${x + cr}` +
			`A${cr} ${cr} 0 0 1 ${x} ${y + h - cr}` +
			`V${y + cr}` +
			`A${cr} ${cr} 0 0 1 ${x + cr} ${y}` +
			`Z`
		);
	});

	nextTheme() {
		this._themeService.nextTheme();
	}
}
