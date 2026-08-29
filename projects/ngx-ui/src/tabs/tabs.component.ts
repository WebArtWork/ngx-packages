import {
	Component,
	ViewEncapsulation,
	computed,
	contentChildren,
	effect,
	model,
} from '@angular/core';
import { generateA11yId } from '@wawjs/ngx-core';
import { TranslateDirective } from '@wawjs/ngx-translate';
import { TabPanelComponent } from './tab-panel.component';

@Component({
	selector: 'wtabs',
	imports: [TranslateDirective],
	templateUrl: './tabs.component.html',
	styleUrl: './tabs.component.scss',
	encapsulation: ViewEncapsulation.None,
})
export class TabsComponent {
	readonly activeIndex = model<number>(0);

	readonly panels = contentChildren(TabPanelComponent);

	private readonly _idPrefix = generateA11yId('wtabs');

	constructor() {
		effect(() => {
			const panels = this.panels();
			const active = this.activeIndex();

			panels.forEach((panel, index) => {
				panel.active.set(index === active);
				panel.panelId.set(this.panelId(index));
				panel.tabId.set(this.tabId(index));
			});
		});
	}

	/**
	 * The tab that should hold the single roving `tabindex="0"` stop. Falls
	 * back to the first non-disabled tab if the active tab itself is
	 * disabled, so the tablist never becomes entirely Tab-unreachable.
	 */
	readonly rovingIndex = computed(() => {
		const panels = this.panels();
		const active = this.activeIndex();

		if (!panels[active]?.disabled()) {
			return active;
		}

		const fallback = panels.findIndex(panel => !panel.disabled());
		return fallback === -1 ? active : fallback;
	});

	tabId(index: number): string {
		return `${this._idPrefix}-tab-${index}`;
	}

	panelId(index: number): string {
		return `${this._idPrefix}-panel-${index}`;
	}

	select(index: number): void {
		if (this.panels()[index]?.disabled()) {
			return;
		}

		this.activeIndex.set(index);
	}

	onKeydown(event: KeyboardEvent, index: number): void {
		const panels = this.panels();
		if (!panels.length) return;

		const count = panels.length;
		const step = (from: number, delta: 1 | -1): number => {
			let next = from;
			for (let i = 0; i < count; i++) {
				next = (next + delta + count) % count;
				if (!panels[next]?.disabled()) return next;
			}
			return from;
		};

		let target: number | null = null;

		switch (event.key) {
			case 'ArrowRight':
				target = step(index, 1);
				break;
			case 'ArrowLeft':
				target = step(index, -1);
				break;
			case 'Home':
				target = !panels[0]?.disabled() ? 0 : step(-1, 1);
				break;
			case 'End':
				target = !panels[count - 1]?.disabled() ? count - 1 : step(count, -1);
				break;
			default:
				return;
		}

		event.preventDefault();

		if (target !== null) {
			this.select(target);

			const tabEl = (event.currentTarget as HTMLElement)
				?.closest('[role="tablist"]')
				?.querySelectorAll<HTMLElement>('[role="tab"]')[target];
			tabEl?.focus();
		}
	}
}
