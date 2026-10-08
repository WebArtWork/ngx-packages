import { DOCUMENT, isPlatformBrowser } from '@angular/common';
import { PLATFORM_ID, Service, Type, inject } from '@angular/core';
import { DomComponent, DomService } from '@wawjs/ngx-core';
import { ModalComponent } from './modal.component';
import { DEFAULT_MODAL_CONFIG, Modal, ModalConfig } from './modal.interface';

@Service()
export class ModalService {
	private readonly _isBrowser = isPlatformBrowser(inject(PLATFORM_ID));
	private readonly _document = inject(DOCUMENT);
	private readonly _dom = inject(DomService);

	private _modals: Modal[] = [];
	private _config: ModalConfig = { ...DEFAULT_MODAL_CONFIG };

	show(opts: Modal | Type<unknown>): Modal {
		const config = this._withConfig(opts);

		if (!this._isBrowser) {
			config.close = () => config.onClose?.();
			return config;
		}

		if (config.unique && this._modals.find(m => m.unique === config.unique)) {
			return this._modals.find(m => m.unique === config.unique) as Modal;
		}

		this._modals.push(config);

		config.showClose ??= config.closable !== false;
		config.closeOnEscape ??= config.closable !== false;
		config.closeOnBackdrop ??= config.closable !== false;

		config.class ||= '';
		config.panelClass ||= config.class || '';
		config.id ||= Math.floor(Math.random() * Date.now()) + Date.now();

		this._document.body.classList.add('modalOpened');

		const previouslyFocused = this._document.activeElement as HTMLElement | null;

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

			this._modals = this._modals.filter(m => m.id !== config.id);

			if (!this._modals.length) {
				this._document.body.classList.remove('modalOpened');
			}

			if (
				previouslyFocused &&
				typeof previouslyFocused.focus === 'function' &&
				this._document.contains(previouslyFocused)
			) {
				previouslyFocused.focus();
			} else {
				(this._document.body as HTMLElement | null)?.focus?.();
			}
		};

		if (typeof config.timeout === 'number' && config.timeout > 0) {
			setTimeout(() => config.close?.(), config.timeout);
		}

		// Shell modal (overlay + container)
		shell = this._dom.appendComponent(ModalComponent, config)!;

		// Content component injected into inner body div
		const host = (shell.componentRef.instance.body()?.nativeElement ??
			shell.nativeElement.querySelector('.wawjs-modal__body')) as HTMLElement;

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

	fullscreen(opts: Modal): void {
		this.show({ ...opts, size: 'fullscreen' });
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
