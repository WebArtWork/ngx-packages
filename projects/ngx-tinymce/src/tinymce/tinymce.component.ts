import { DOCUMENT, NgTemplateOutlet } from '@angular/common';
import {
	ChangeDetectionStrategy,
	Component,
	TemplateRef,
	ViewEncapsulation,
	afterNextRender,
	booleanAttribute,
	effect,
	forwardRef,
	inject,
	input,
	numberAttribute,
	output,
	signal,
} from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';
import {
	TINYMCE_CONFIG,
	TinymceConfig,
	TinymceEditor,
	TinymceGlobal,
	TinymceInitOptions,
} from './tinymce.interface';

let _loaderPromise: Promise<void> | null = null;

@Component({
	selector: 'tinymce',
	exportAs: 'ngxTinymce',
	template: `
		@if (inline()) {
			<div [attr.id]="_editorId()"><ng-content /></div>
		} @else {
			<textarea
				class="tinymce-selector"
				[attr.id]="_editorId()"
				[attr.placeholder]="placeholder()"
			></textarea>
		}

		@if (load()) {
			<div class="loading">
				@if (_loading()) {
					{{ _loading() }}
				} @else if (_loadingTpl()) {
					<ng-template [ngTemplateOutlet]="_loadingTpl()" />
				}
			</div>
		}
	`,
	imports: [NgTemplateOutlet],
	styles: [
		`
			tinymce .tinymce-selector {
				display: none;
			}
		`,
	],
	providers: [
		{
			provide: NG_VALUE_ACCESSOR,
			useExisting: forwardRef(() => TinymceComponent),
			multi: true,
		},
	],
	preserveWhitespaces: false,
	encapsulation: ViewEncapsulation.None,
	changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TinymceComponent implements ControlValueAccessor {
	private readonly _config = inject<TinymceConfig | null>(TINYMCE_CONFIG, { optional: true });
	private readonly _document = inject(DOCUMENT);
	private _instance?: TinymceEditor | null;
	private _value = '';
	private _onChange?: (value: string) => void;
	private _onTouched?: () => void;
	private _configRefreshVersion = 0;

	protected readonly load = signal(true);
	protected readonly _loading = signal<string | null>(null);
	protected readonly _loadingTpl = signal<TemplateRef<unknown> | null>(null);
	protected readonly _editorId = signal(`_tinymce-${Math.random().toString(36).slice(2)}`);
	private readonly _disabled = signal(false);

	readonly config = input<TinymceInitOptions | null>(null);
	readonly placeholder = input('');
	readonly inline = input(false, { transform: booleanAttribute });
	readonly disabled = input(false, { transform: booleanAttribute });
	readonly delay = input(0, { transform: numberAttribute });
	readonly loading = input<
		string | TemplateRef<unknown> | null,
		string | TemplateRef<unknown> | null
	>(null, {
		transform: (value: string | TemplateRef<unknown> | null) => {
			if (value instanceof TemplateRef) {
				this._loading.set(null);
				this._loadingTpl.set(value);
			} else {
				this._loading.set(value);
				this._loadingTpl.set(null);
			}
			return value;
		},
	});
	readonly ready = output<TinymceEditor>();

	get instance(): TinymceEditor | undefined | null {
		return this._instance;
	}

	constructor() {
		afterNextRender(() => {
			if (!this._isBrowser()) {
				return;
			}

			void this._ensureEditor();
		});

		effect(() => {
			this.disabled();
			this._applyDisabledState();
		});

		effect(() => {
			this.config();

			if (!this._instance) {
				return;
			}

			const refreshVersion = ++this._configRefreshVersion;
			this._destroyEditor();
			this.load.set(true);

			queueMicrotask(() => {
				if (refreshVersion !== this._configRefreshVersion) {
					return;
				}

				void this._ensureEditor();
			});
		});
	}

	writeValue(value: string | null): void {
		this._value = value ?? '';
		this._instance?.setContent(this._value);
	}

	registerOnChange(fn: (value: string) => void): void {
		this._onChange = fn;
	}

	registerOnTouched(fn: () => void): void {
		this._onTouched = fn;
	}

	setDisabledState(isDisabled: boolean): void {
		this._disabled.set(isDisabled);
		this._applyDisabledState();
	}

	ngOnDestroy(): void {
		this._destroyEditor();
	}

	private async _ensureEditor(): Promise<void> {
		await this._loadScript();
		this._initEditorAfterDelay();
	}

	private _initEditorAfterDelay(): void {
		if (!this._isBrowser()) {
			return;
		}

		const waitMs = Math.max(0, this.delay() || this._config?.delay || 0);
		setTimeout(() => this._initEditor(), waitMs);
	}

	private _initEditor(): void {
		if (this._instance) {
			return;
		}

		const tinymce = this._tinymce();
		if (!tinymce) {
			throw new Error('Tinymce script failed to load.');
		}

		const configuredBaseUrl = this._config?.baseURL;
		if (configuredBaseUrl) {
			tinymce.baseURL = configuredBaseUrl.replace(/\/$/, '');
		}

		const userOptions = {
			...(this._config?.config || {}),
			...(this.config() || {}),
		};

		const options: TinymceInitOptions = {
			selector: `#${this._editorId()}`,
			inline: this.inline(),
			placeholder: this.placeholder(),
			...(this._config?.config || {}),
			...(this.config() || {}),
			setup: editor => {
				this._instance = editor;
				editor.on('change keyup input undo redo', () => {
					this._value = editor.getContent();
					this._onChange?.(this._value);
				});
				editor.on('blur', () => this._onTouched?.());
				userOptions.setup?.(editor);
			},
			init_instance_callback: editor => {
				if (this._value) {
					editor.setContent(this._value);
				}
				this._applyDisabledState();
				userOptions.init_instance_callback?.(editor);
				this.load.set(false);
				this.ready.emit(editor);
			},
		};

		if (userOptions.auto_focus) {
			options.auto_focus = this._editorId();
		}

		tinymce.init(options);
	}

	private async _loadScript(): Promise<void> {
		if (!this._isBrowser()) {
			return;
		}

		if (this._tinymce()) {
			return;
		}

		if (!_loaderPromise) {
			const config = this._config;
			const baseUrl = config?.baseURL ?? './assets/tinymce/';
			const fileName = config?.fileName ?? 'tinymce.min.js';
			const url = `${baseUrl}${fileName}`;

			_loaderPromise = new Promise<void>((resolve, reject) => {
				const existingScript = this._document.querySelector(
					`script[data-ngx-tinymce="${url}"]`,
				) as HTMLScriptElement | null;

				if (existingScript) {
					existingScript.addEventListener('load', () => resolve(), { once: true });
					existingScript.addEventListener(
						'error',
						() => reject(new Error(`Failed to load Tinymce script: ${url}`)),
						{ once: true },
					);
					return;
				}

				const script = this._document.createElement('script');
				script.src = url;
				script.async = true;
				script.defer = true;
				script.dataset['ngxTinymce'] = url;
				script.onload = () => resolve();
				script.onerror = () => reject(new Error(`Failed to load Tinymce script: ${url}`));
				this._document.head.appendChild(script);
			}).catch(error => {
				_loaderPromise = null;
				throw error;
			});
		}

		return _loaderPromise;
	}

	private _applyDisabledState(): void {
		if (!this._instance) {
			return;
		}

		const mode: 'readonly' | 'design' =
			this.disabled() || this._disabled() ? 'readonly' : 'design';
		if (typeof this._instance.setMode === 'function') {
			this._instance.setMode(mode);
			return;
		}

		this._instance.mode?.set(mode);
	}

	private _destroyEditor(): void {
		if (!this._instance) {
			return;
		}

		this._instance.off();
		this._instance.remove();
		this._instance = null;
	}

	private _tinymce(): TinymceGlobal | null {
		return (
			(this._document.defaultView as (Window & { tinymce?: TinymceGlobal }) | null)
				?.tinymce || null
		);
	}

	private _isBrowser(): boolean {
		return typeof this._document === 'object' && !!this._document.defaultView;
	}
}
