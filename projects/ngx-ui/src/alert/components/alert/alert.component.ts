import { CommonModule } from '@angular/common';
import {
	AfterViewInit,
	ChangeDetectionStrategy,
	Component,
	ElementRef,
	OnDestroy,
	viewChild,
} from '@angular/core';
import {
	AlertButton,
	AlertPosition,
	AlertType,
} from '../../interfaces/alert.interface';

@Component({
	selector: 'alert',
	templateUrl: './alert.component.html',
	styles: [
		`
			@keyframes alert-bounce-in-up {
				0% {
					opacity: 0;
					transform: translateY(200px);
				}
				50% {
					opacity: 1;
					transform: translateY(-10px);
				}
				70% {
					transform: translateY(5px);
				}
				to {
					transform: translateY(0);
				}
			}

			@keyframes alert-progress {
				from {
					width: 100%;
				}
				to {
					width: 0%;
				}
			}

			.animate-alert-bounce-in-up {
				animation: alert-bounce-in-up 0.7s ease-in-out both;
			}

			.animate-alert-progress {
				animation-name: alert-progress;
				animation-timing-function: linear;
				animation-fill-mode: both;
			}
		`,
	],
	imports: [CommonModule],
	changeDetection: ChangeDetectionStrategy.OnPush,
})
/**
 * Displays an individual alert message with optional icon, actions and
 * auto-dismiss behaviour. All inputs are configured by the service when the
 * component is created dynamically.
 */
export class AlertComponent implements AfterViewInit, OnDestroy {
	/** Reference to the DOM element hosting the alert. */
	alertRef = viewChild<ElementRef<HTMLDivElement>>('alertRef');

	/** Callback invoked to remove the alert from the DOM. */
	close!: () => void;

	/** Text content displayed inside the alert. */
	text!: string;

	/** Additional CSS classes applied to the alert container. */
	class!: string;

	/** Type of alert which determines styling and icon. */
	type: AlertType = 'info';

	/** Position on the screen where the alert appears. */
	position: AlertPosition = 'bottom';

	/** Whether a progress bar indicating remaining time is shown. */
	progress!: boolean;

	/** Icon name displayed alongside the message. */
	icon!: string;

	/** Time in milliseconds before the alert auto closes. */
	timeout!: number;

	/** Determines if a manual close button is visible. */
	closable!: boolean;

	/** Flag used to trigger the deletion animation. */
	delete_animation = false;

	/** Optional action buttons rendered within the alert. */
	buttons: AlertButton[] = [];

	private _timer: number | null = null;
	private _start = 0;
	private _remaining = 0;

	private readonly _onEnter = () => {
		if (this._timer) {
			window.clearTimeout(this._timer);
			this._timer = null;
		}
		this._remaining -= Date.now() - this._start;
	};

	private readonly _onLeave = () => {
		this._start = Date.now();
		if (this._timer) window.clearTimeout(this._timer);
		this._timer = window.setTimeout(() => this.remove(), this._remaining);
	};

	/**
	 * Starts the auto-dismiss timer and pauses it while the alert is
	 * hovered, resuming when the mouse leaves.
	 */
	ngAfterViewInit(): void {
		const elRef = this.alertRef();
		if (!elRef || !this.timeout) return;

		this._remaining = this.timeout;
		this._start = Date.now();
		this._timer = window.setTimeout(() => this.remove(), this._remaining);

		const el = elRef.nativeElement;
		el.addEventListener('mouseenter', this._onEnter, false);
		el.addEventListener('mouseleave', this._onLeave, false);
	}

	ngOnDestroy(): void {
		const elRef = this.alertRef();

		if (this._timer) window.clearTimeout(this._timer);
		this._timer = null;

		if (elRef) {
			const el = elRef.nativeElement;
			el.removeEventListener('mouseenter', this._onEnter, false);
			el.removeEventListener('mouseleave', this._onLeave, false);
		}
	}

	/**
	 * Triggers the closing animation and invokes the provided close
	 * callback once finished.
	 */
	remove(callback?: () => void) {
		if (this._removed) return;

		this._removed = true;

		callback?.();

		this.delete_animation = true;

		setTimeout(() => {
			this.close();

			this.delete_animation = false;
		}, 350);
	}

	private _removed = false;
}
