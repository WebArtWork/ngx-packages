import {
	Component,
	computed,
	forwardRef,
	input,
	model,
	signal,
} from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';
import { DatetimeCalendarComponent } from './datetime-calendar.component';
import {
	DatetimePickerMode,
	DatetimePickerValue,
	DatetimeRangeValue,
} from './datetime-picker.interface';

@Component({
	selector: 'ngx-datetime-picker',
	imports: [DatetimeCalendarComponent],
	providers: [
		{
			provide: NG_VALUE_ACCESSOR,
			useExisting: forwardRef(() => DatetimePickerComponent),
			multi: true,
		},
	],
	templateUrl: './datetime-picker.component.html',
	styleUrl: './datetime-picker.component.css',
})
export class DatetimePickerComponent implements ControlValueAccessor {
	readonly mode = input<DatetimePickerMode>('date');
	readonly label = input('');
	readonly placeholder = input('');
	readonly min = input<Date | null>(null);
	readonly max = input<Date | null>(null);
	readonly locale = input('');
	readonly disabledDates = input<readonly Date[]>([]);

	readonly value = model<DatetimePickerValue>(null);

	protected readonly isOpen = signal(false);
	protected readonly isDisabled = signal(false);
	protected readonly activeDate = signal(new Date());
	protected readonly startTime = signal('00:00');
	protected readonly endTime = signal('00:00');

	protected readonly isRangeMode = computed(
		() => this.mode() === 'date-range' || this.mode() === 'datetime-range',
	);
	protected readonly includesDate = computed(() => this.mode() !== 'time');
	protected readonly includesTime = computed(
		() =>
			this.mode() === 'time' ||
			this.mode() === 'datetime' ||
			this.mode() === 'datetime-range',
	);
	protected readonly calendarValue = computed(() => this._dateValue(this.value()));
	protected readonly rangeValue = computed(() => this._rangeValue(this.value()));
	protected readonly displayValue = computed(() => this._formatDisplayValue(this.value()));

	private _onChange: (value: DatetimePickerValue) => void = () => {};
	private _onTouched: () => void = () => {};

	writeValue(value: DatetimePickerValue): void {
		this.value.set(this._normalizeValue(value));
		this._syncTimeInputs(this.value());
	}

	registerOnChange(fn: (value: DatetimePickerValue) => void): void {
		this._onChange = fn;
	}

	registerOnTouched(fn: () => void): void {
		this._onTouched = fn;
	}

	setDisabledState(isDisabled: boolean): void {
		this.isDisabled.set(isDisabled);
	}

	protected toggle(): void {
		if (this.isDisabled()) {
			return;
		}

		this.isOpen.update(isOpen => !isOpen);
	}

	protected close(): void {
		this.isOpen.set(false);
		this._onTouched();
	}

	protected selectDate(date: Date): void {
		const next = this.includesTime()
			? this._applyTime(date, this.startTime())
			: this._stripTime(date);
		this._setValue(next);

		if (this.mode() === 'date') {
			this.close();
		}
	}

	protected selectRange(range: DatetimeRangeValue): void {
		const next = {
			start: range.start
				? this.includesTime()
					? this._applyTime(range.start, this.startTime())
					: this._stripTime(range.start)
				: null,
			end: range.end
				? this.includesTime()
					? this._applyTime(range.end, this.endTime())
					: this._stripTime(range.end)
				: null,
		};

		this._setValue(next);

		if (this.mode() === 'date-range' && next.start && next.end) {
			this.close();
		}
	}

	protected updateSingleTime(time: string): void {
		this.startTime.set(time);
		const current = this._dateValue(this.value()) || new Date();
		this._setValue(this._applyTime(current, time));
	}

	protected updateStartTime(time: string): void {
		this.startTime.set(time);
		const current = this._rangeValue(this.value());
		this._setValue({
			start: current.start ? this._applyTime(current.start, time) : null,
			end: current.end,
		});
	}

	protected updateEndTime(time: string): void {
		this.endTime.set(time);
		const current = this._rangeValue(this.value());
		this._setValue({
			start: current.start,
			end: current.end ? this._applyTime(current.end, time) : null,
		});
	}

	protected inputValue(event: Event): string {
		return (event.target as HTMLInputElement | null)?.value || '';
	}

	protected apply(): void {
		if (this.mode() === 'time' && !this.value()) {
			this._setValue(this._applyTime(new Date(), this.startTime()));
		}

		this.close();
	}

	protected clear(): void {
		this._setValue(this.isRangeMode() ? { start: null, end: null } : null);
	}

	private _setValue(value: DatetimePickerValue): void {
		const normalized = this._normalizeValue(value);
		this.value.set(normalized);
		this._syncTimeInputs(normalized);
		this._onChange(normalized);
	}

	private _normalizeValue(value: DatetimePickerValue): DatetimePickerValue {
		if (!value) {
			return this.isRangeMode() ? { start: null, end: null } : null;
		}

		if (value instanceof Date) {
			return new Date(value);
		}

		return {
			start: value.start ? new Date(value.start) : null,
			end: value.end ? new Date(value.end) : null,
		};
	}

	private _dateValue(value: DatetimePickerValue): Date | null {
		return value instanceof Date ? value : null;
	}

	private _rangeValue(value: DatetimePickerValue): DatetimeRangeValue {
		if (value && !(value instanceof Date)) {
			return value;
		}

		return { start: null, end: null };
	}

	private _stripTime(date: Date): Date {
		const next = new Date(date);
		next.setHours(0, 0, 0, 0);
		return next;
	}

	private _applyTime(date: Date, time: string): Date {
		const [hours = '0', minutes = '0'] = time.split(':');
		const next = new Date(date);
		next.setHours(Number(hours), Number(minutes), 0, 0);
		return next;
	}

	private _formatDisplayValue(value: DatetimePickerValue): string {
		if (!value) {
			return '';
		}

		if (value instanceof Date) {
			return this._formatDate(value);
		}

		const start = value.start ? this._formatDate(value.start) : '';
		const end = value.end ? this._formatDate(value.end) : '';

		return start || end ? `${start || '...'} - ${end || '...'}` : '';
	}

	private _formatDate(date: Date): string {
		if (this.mode() === 'time') {
			return this._formatTime(date);
		}

		if (this.includesTime()) {
			return `${date.toLocaleDateString(this.locale() || undefined)} ${this._formatTime(date)}`;
		}

		return date.toLocaleDateString(this.locale() || undefined);
	}

	private _formatTime(date: Date): string {
		return `${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}`;
	}

	private _syncTimeInputs(value: DatetimePickerValue): void {
		if (value instanceof Date) {
			this.startTime.set(this._formatTime(value));
			this.activeDate.set(value);
			return;
		}

		if (value) {
			if (value.start) {
				this.startTime.set(this._formatTime(value.start));
				this.activeDate.set(value.start);
			}

			if (value.end) {
				this.endTime.set(this._formatTime(value.end));
			}
		}
	}
}
