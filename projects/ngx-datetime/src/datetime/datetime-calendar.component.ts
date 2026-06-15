import {
	Component,
	computed,
	inject,
	input,
	model,
	output,
} from '@angular/core';
import {
	DatetimeCalendarDay,
	DatetimeCalendarSelectionMode,
	DatetimeRangeValue,
} from './datetime-picker.interface';
import { TimeService } from './time.service';

@Component({
	selector: 'ngx-datetime-calendar',
	templateUrl: './datetime-calendar.component.html',
	styleUrl: './datetime-calendar.component.css',
})
export class DatetimeCalendarComponent {
	private readonly _timeService = inject(TimeService);

	readonly selectionMode = input<DatetimeCalendarSelectionMode>('single');
	readonly min = input<Date | null>(null);
	readonly max = input<Date | null>(null);
	readonly locale = input('');
	readonly disabledDates = input<readonly Date[]>([]);

	readonly value = model<Date | null>(null);
	readonly rangeValue = model<DatetimeRangeValue>({ start: null, end: null });
	readonly activeDate = model<Date>(new Date());

	readonly selected = output<Date>();
	readonly rangeSelected = output<DatetimeRangeValue>();

	protected readonly weekDays = computed(() => {
		const start = this._timeService.startOfWeek(this.activeDate(), this.locale());

		return Array.from({ length: 7 }, (_, index) =>
			this._timeService.getDayName(this._timeService.addDays(start, index), 'short'),
		);
	});

	protected readonly monthLabel = computed(() => {
		const activeDate = this.activeDate();

		return `${this._timeService.getMonthName(activeDate.getMonth())} ${activeDate.getFullYear()}`;
	});

	protected readonly calendarDays = computed(() => {
		const activeDate = this.activeDate();
		const monthStart = this._timeService.startOfMonth(activeDate);
		const gridStart = this._timeService.startOfWeek(monthStart, this.locale());
		const selectedDate = this.value();
		const rangeValue = this.rangeValue();
		const disabledDates = this.disabledDates();

		return Array.from({ length: 42 }, (_, index) => {
			const date = this._timeService.addDays(gridStart, index);
			const isRangeStart = this._isSameDay(date, rangeValue.start);
			const isRangeEnd = this._isSameDay(date, rangeValue.end);

			return {
				date,
				label: date.getDate(),
				inCurrentMonth: date.getMonth() === activeDate.getMonth(),
				isToday: this._timeService.isSameDay(date, new Date()),
				isSelected: this._isSameDay(date, selectedDate) || isRangeStart || isRangeEnd,
				isRangeStart,
				isRangeEnd,
				isInRange: this._isInRange(date, rangeValue),
				isDisabled: this._isDisabled(date, disabledDates),
			};
		});
	});

	protected previousMonth(): void {
		this.activeDate.set(this._timeService.addMonths(this.activeDate(), -1));
	}

	protected nextMonth(): void {
		this.activeDate.set(this._timeService.addMonths(this.activeDate(), 1));
	}

	protected selectDay(day: DatetimeCalendarDay): void {
		if (day.isDisabled) {
			return;
		}

		const selectedDate = this._mergeDateAndTime(
			day.date,
			this.value() || this.rangeValue().start,
		);
		this.activeDate.set(selectedDate);

		if (this.selectionMode() === 'range') {
			this._selectRangeDate(selectedDate);
			return;
		}

		this.value.set(selectedDate);
		this.selected.emit(selectedDate);
	}

	private _selectRangeDate(date: Date): void {
		const current = this.rangeValue();
		const shouldStartNewRange =
			!current.start || current.end || date.getTime() < current.start.getTime();
		const next = shouldStartNewRange
			? { start: date, end: null }
			: { start: current.start, end: date };

		this.rangeValue.set(next);
		this.rangeSelected.emit(next);
	}

	private _mergeDateAndTime(date: Date, timeSource: Date | null): Date {
		const next = this._timeService.startOfDay(date);

		if (timeSource) {
			next.setHours(
				timeSource.getHours(),
				timeSource.getMinutes(),
				timeSource.getSeconds(),
				timeSource.getMilliseconds(),
			);
		}

		return next;
	}

	private _isInRange(date: Date, range: DatetimeRangeValue): boolean {
		if (!range.start || !range.end) {
			return false;
		}

		const time = this._timeService.startOfDay(date).getTime();
		const start = this._timeService.startOfDay(range.start).getTime();
		const end = this._timeService.startOfDay(range.end).getTime();

		return time > start && time < end;
	}

	private _isDisabled(date: Date, disabledDates: readonly Date[]): boolean {
		const day = this._timeService.startOfDay(date).getTime();
		const min = this.min();
		const max = this.max();

		if (min && day < this._timeService.startOfDay(min).getTime()) {
			return true;
		}

		if (max && day > this._timeService.startOfDay(max).getTime()) {
			return true;
		}

		return disabledDates.some(
			disabledDate => this._timeService.startOfDay(disabledDate).getTime() === day,
		);
	}

	private _isSameDay(date: Date, other: Date | null): boolean {
		return !!other && this._timeService.isSameDay(date, other);
	}
}
