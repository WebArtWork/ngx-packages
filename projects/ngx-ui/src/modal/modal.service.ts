import { Injectable, Type, inject } from '@angular/core';
import { DomComponent, DomService } from '@wawjs/ngx-core';
import { ModalComponent } from './modal.component';
import { DEFAULT_MODAL_CONFIG, Modal, ModalConfig } from './modal.interface';

@Injectable({
	providedIn: 'root',
})
export class ModalService {
	private readonly _dom = inject(DomService);

	private _modals: Modal[] = [];
	private _config: ModalConfig = { ...DEFAULT_MODAL_CONFIG };

	show(opts: Modal | Type<unknown>): Modal {
		const config = this._withConfig(opts);

		if (
			config.unique &&
			this._modals.find((m) => m.unique === config.unique)
		) {
			return this._modals.find(
				(m) => m.unique === config.unique,
			) as Modal;
		}

		this._modals.push(config);

		config.class ||= '';
		config.panelClass ||= config.class || '';
		config.id ||= Math.floor(Math.random() * Date.now()) + Date.now();

		document.body.classList.add('modalOpened');

		let shell!: DomComponent<ModalComponent> | undefined;
		let content!: DomComponent<unknown> | undefined;

		config.close = () => {
			content?.remove();
			content = undefined;

			shell?.remove();
			shell = undefined;

			if (typeof config.onClose === 'function') {
				config.onClose();
			}

			this._modals = this._modals.filter((m) => m.id !== config.id);

			if (!this._modals.length) {
				document.body.classList.remove('modalOpened');
			}
		};

		if (typeof config.timeout === 'number' && config.timeout > 0) {
			setTimeout(() => config.close?.(), config.timeout);
		}

		// Shell modal (overlay + container)
		shell = this._dom.appendComponent(ModalComponent, config)!;

		// Content component injected into inner body div
		const host = shell.nativeElement.children[0].children[0]
			.children[0] as HTMLElement;

		content = this._dom.appendComponent(
			config.component,
			config as Partial<{ providedIn?: string }>,
			host,
		)!;

		return config;
	}

	open(opts: Modal | Type<unknown>): void {
		this.show(opts);
	}

	small(opts: Modal): void {
		this.show({ ...opts, size: 'small' });
	}

	mid(opts: Modal): void {
		this.show({ ...opts, size: 'mid' });
	}

	big(opts: Modal): void {
		this.show({ ...opts, size: 'big' });
	}

	full(opts: Modal): void {
		this.show({ ...opts, size: 'full' });
	}

	destroy(): void {
		for (let i = this._modals.length - 1; i >= 0; i--) {
			this._modals[i].close?.();
		}
	}

	setConfig(config: ModalConfig): void {
		this._config = {
			...this._config,
			...config,
		};
	}

	private _withConfig(opts: Modal | Type<unknown>): Modal {
		const config =
			typeof opts === 'function'
				? { ...this._config, component: opts }
				: { ...this._config, ...opts, component: opts.component };

		const normalized = config as Modal;

		if (!normalized.panelClass && normalized.class) {
			normalized.panelClass = normalized.class;
		}

		return normalized;
	}
}
