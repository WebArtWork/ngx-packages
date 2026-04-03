import { isPlatformBrowser } from '@angular/common';
import {
	Directive,
	ElementRef,
	OnDestroy,
	OnInit,
	PLATFORM_ID,
	effect,
	inject,
	input,
	output,
} from '@angular/core';

import { ACE_CONFIG, AceConfig, AceConfigInterface } from './ace.interfaces';
import { ensureAce } from './ace.loader';

@Directive({
	selector: '[ace]',
	exportAs: 'ngxAce',
})
export class AceDirective implements OnInit, OnDestroy {
	private readonly _platformId = inject(PLATFORM_ID);
	private readonly _elRef = inject<ElementRef<HTMLElement>>(ElementRef);

	private readonly _defaults = inject<AceConfigInterface | null>(ACE_CONFIG, {
		optional: true,
	});

	private _instance: any | null = null;

	private _instanceEventListeners: Array<{
		eventName: string;
		callback: any;
	}> = [];
	private _selectionEventListeners: Array<{
		eventName: string;
		callback: any;
	}> = [];

	private _destroyed = false;
	private _initSeq = 0;

	private _pendingValue: { value: string; cursorPos: -1 | 1 } | null = null;

	// -------- inputs --------
	readonly disabled = input<boolean>(false);
	readonly readOnly = input<boolean>(false);

	readonly mode = input<string>('');
	readonly theme = input<string>('');

	// escape hatch: [config]="options"
	readonly config = input<AceConfigInterface | undefined>(undefined);

	// -------- outputs --------
	readonly blur = output();
	readonly focus = output();

	readonly copy = output();
	readonly paste = output();

	readonly change = output();

	readonly changeCursor = output();
	readonly changeSession = output();
	readonly changeSelection = output();

	constructor() {
		if (!isPlatformBrowser(this._platformId)) return;

		effect(() => {
			// ✅ read signals here so the effect tracks them
			this.disabled();
			this.readOnly();
			this.mode();
			this.theme();
			this.config();

			const editor = this._instance;
			if (!editor) return;

			void this.applyState(editor);
		});
	}

	ngOnInit(): void {
		if (!isPlatformBrowser(this._platformId)) return;

		this._destroyed = false;
		void this.initAce();
	}

	private _hostEl(): HTMLElement {
		return this._elRef.nativeElement;
	}

	private _scheduleResize(editor: any): void {
		requestAnimationFrame(() => {
			requestAnimationFrame(() => {
				try {
					editor.resize(true);
				} catch {
					// ignore
				}
			});
		});
	}

	private _normalizeMode(mode: string): string {
		const m = (mode || '').trim();
		const raw = m === '' ? 'text' : m.startsWith('ace/mode/') ? m.slice('ace/mode/'.length) : m;
		return `ace/mode/${raw}`;
	}

	private _normalizeTheme(theme: string): string {
		const t = (theme || '').trim();
		const raw =
			t === '' ? 'github' : t.startsWith('ace/theme/') ? t.slice('ace/theme/'.length) : t;
		return `ace/theme/${raw}`;
	}

	private _buildParams(): AceConfigInterface {
		const params = new AceConfig(this._defaults ?? {});
		params.assign(this.config() ?? {});
		if (params.useWorker === undefined) params.useWorker = false;
		if (params.showGutter === undefined) params.showGutter = true;
		if ((params as any).showLineNumbers === undefined) (params as any).showLineNumbers = true;

		// explicit inputs override config/defaults
		const mode = this.mode();
		const theme = this.theme();
		if (mode) params.mode = mode;
		if (theme) params.theme = theme;

		// normalize for Ace
		params.mode = this._normalizeMode(params.mode || '');
		params.theme = this._normalizeTheme(params.theme || '');

		// disabled implies readOnly
		const disabled = this.disabled();
		const readOnly = disabled ? true : this.readOnly() || params.readOnly === true;
		params.readOnly = readOnly;

		// active line highlight
		if (disabled) {
			params.highlightActiveLine = false;
		} else if (params.highlightActiveLine !== false) {
			params.highlightActiveLine = true;
		}

		return params;
	}

	private async applyState(editor: any): Promise<void> {
		const host = this._hostEl();
		const disabled = this.disabled();
		const params = this._buildParams();

		host.classList.toggle('ace--disabled', disabled);

		try {
			// Important: do NOT use pointer-events for readonly (only for disabled)
			host.style.pointerEvents = disabled ? 'none' : '';
		} catch {
			// ignore
		}

		try {
			await ensureAce({
				platformId: this._platformId,
				mode: typeof params.mode === 'string' ? params.mode.replace('ace/mode/', '') : null,
				theme:
					typeof params.theme === 'string'
						? params.theme.replace('ace/theme/', '')
						: null,
			});

			editor.setOptions?.(params);
			editor.setReadOnly?.(params.readOnly === true);

			const hlActive = params.highlightActiveLine !== false;
			editor.setHighlightActiveLine?.(disabled ? false : hlActive);

			const session = editor.getSession?.();
			session?.setUseWorker?.(params.useWorker === true);

			// renderer options (NOT covered by setOptions)
			const showGutter = params.showGutter !== false;
			const showLineNumbers = (params as any).showLineNumbers !== false;

			editor.renderer?.setShowGutter?.(showGutter);
			editor.renderer?.setShowLineNumbers?.(showLineNumbers);

			if (params.mode) {
				const modePath =
					typeof params.mode === 'string' && params.mode.startsWith('ace/mode/')
						? params.mode
						: `ace/mode/${params.mode}`;
				session?.setMode?.(modePath);
			}

			if (params.theme) {
				const themePath =
					typeof params.theme === 'string' && params.theme.startsWith('ace/theme/')
						? params.theme
						: `ace/theme/${params.theme}`;
				editor.setTheme?.(themePath);
			}

			if (disabled) editor.blur?.();

			// ensure layout refresh after toggling renderer flags
			editor.renderer?.updateFull?.();
		} catch {
			// ignore
		}

		this._scheduleResize(editor);
	}

	private async initAce(): Promise<void> {
		const seq = ++this._initSeq;

		const host = this._hostEl();

		// capture initial inner text (directive demo uses it)
		const initialText = host.textContent ?? '';

		// load ace + requested mode/theme before edit()
		const params = this._buildParams();
		const ace = await ensureAce({
			platformId: this._platformId,
			mode: typeof params.mode === 'string' ? params.mode.replace('ace/mode/', '') : null,
			theme: typeof params.theme === 'string' ? params.theme.replace('ace/theme/', '') : null,
		});

		if (this._destroyed || seq !== this._initSeq) return;
		if (!ace) return;

		// Prevent any host text from ever becoming editable content.
		host.textContent = '';

		this._instance = ace.edit(host);
		this._instance.$blockScrolling = Infinity as any;

		// Initial apply
		await this.applyState(this._instance);

		// Apply initial value:
		// 1) component-driven value (stored earlier) wins
		if (this._pendingValue) {
			this.setValue(this._pendingValue.value, this._pendingValue.cursorPos);
			this._pendingValue = null;
		} else {
			// 2) directive demo inner text fallback
			const v = initialText.trim();
			if (v) this.setValue(v, -1);
		}

		const bind = (target: any, eventName: string, emitter: any) => {
			const callback = (...args: any[]) => emitter.emit(args.length === 1 ? args[0] : args);
			target.on(eventName, callback);
			return callback;
		};

		const editor = this._instance;

		this._instanceEventListeners.push({
			eventName: 'blur',
			callback: bind(editor, 'blur', this.blur),
		});
		this._instanceEventListeners.push({
			eventName: 'focus',
			callback: bind(editor, 'focus', this.focus),
		});
		this._instanceEventListeners.push({
			eventName: 'copy',
			callback: bind(editor, 'copy', this.copy),
		});
		this._instanceEventListeners.push({
			eventName: 'paste',
			callback: bind(editor, 'paste', this.paste),
		});
		this._instanceEventListeners.push({
			eventName: 'change',
			callback: bind(editor, 'change', this.change),
		});
		this._instanceEventListeners.push({
			eventName: 'changeSession',
			callback: bind(editor, 'changeSession', this.changeSession),
		});

		const sel = editor.selection;
		if (sel?.on) {
			this._selectionEventListeners.push({
				eventName: 'changeCursor',
				callback: bind(sel, 'changeCursor', this.changeCursor),
			});
			this._selectionEventListeners.push({
				eventName: 'changeSelection',
				callback: bind(sel, 'changeSelection', this.changeSelection),
			});
		}

		this._scheduleResize(editor);
	}

	ngOnDestroy(): void {
		this._destroyed = true;
		this._initSeq++;

		const editor = this._instance;
		if (!editor) return;

		try {
			this._instanceEventListeners.forEach(({ eventName, callback }) => {
				editor.off?.(eventName, callback);
			});
		} catch {
			// ignore
		}
		this._instanceEventListeners = [];

		try {
			this._selectionEventListeners.forEach(({ eventName, callback }) => {
				editor.selection?.off?.(eventName, callback);
			});
		} catch {
			// ignore
		}
		this._selectionEventListeners = [];

		try {
			editor.destroy?.();
		} catch {
			// ignore
		}

		this._instance = null;
	}

	// -------- public API used by component --------

	ace(): any | null {
		return this._instance;
	}

	clear(): void {
		if (!this._instance) return;
		this._instance.setValue('');
		this._instance.clearSelection();
	}

	getValue(): string | undefined {
		return this._instance?.getValue();
	}

	setValue(value: string, cursorPos: -1 | 1 = 1): void {
		const v = value || '';

		if (!this._instance) {
			this._pendingValue = { value: v, cursorPos };
			return;
		}

		this._instance.setValue(v, cursorPos);
	}
}
