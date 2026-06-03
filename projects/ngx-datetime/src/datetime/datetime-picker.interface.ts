export type DatetimePickerMode = 'date' | 'time' | 'datetime' | 'date-range' | 'datetime-range';

export type DatetimeCalendarSelectionMode = 'single' | 'range';

export interface DatetimeRangeValue {
	start: Date | null;
	end: Date | null;
}

export type DatetimePickerValue = Date | DatetimeRangeValue | null;

export interface DatetimeCalendarDay {
	date: Date;
	label: number;
	inCurrentMonth: boolean;
	isToday: boolean;
	isSelected: boolean;
	isRangeStart: boolean;
	isRangeEnd: boolean;
	isInRange: boolean;
	isDisabled: boolean;
}
