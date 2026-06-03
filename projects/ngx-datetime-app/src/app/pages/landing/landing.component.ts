import { isPlatformBrowser } from '@angular/common';
import { ChangeDetectionStrategy, Component, inject, PLATFORM_ID, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { DatetimePickerComponent, DatetimePickerValue, DatetimeRangeValue } from 'ngx-datetime';
import { serviceDocs } from '../../services/service-docs';

interface LandingFeatureGroup {
	title: string;
	description: string;
	items: string[];
}

@Component({
	imports: [RouterLink, DatetimePickerComponent],
	templateUrl: './landing.component.html',
	styleUrl: './landing.component.scss',
	changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LandingComponent {
	private readonly _platformId = inject(PLATFORM_ID);

	protected readonly copiedKey = signal('');
	protected readonly dateValue = signal<DatetimePickerValue>(new Date());
	protected readonly timeValue = signal<DatetimePickerValue>(new Date());
	protected readonly datetimeValue = signal<DatetimePickerValue>(new Date());
	protected readonly dateRangeValue = signal<DatetimePickerValue>({
		start: new Date(),
		end: new Date(new Date().setDate(new Date().getDate() + 5)),
	});
	protected readonly datetimeRangeValue = signal<DatetimePickerValue>({
		start: new Date(),
		end: new Date(new Date().setDate(new Date().getDate() + 2)),
	});
	protected readonly installCommand = 'npm i --save ngx-datetime';

	protected readonly services = serviceDocs;
	protected readonly featureGroups: LandingFeatureGroup[] = [
		{
			title: 'Bootstrap',
			description:
				'Focused setup centered on provideNgxDatetime() with configurable date naming and formatting defaults.',
			items: [
				'provideNgxDatetime(config)',
				'DatePipe dependency registration',
				'default format, timezone, locale, and week policy',
			],
		},
		{
			title: 'Picker components',
			description:
				'Two standalone components cover inline calendars plus date, time, datetime, and range pickers.',
			items: [
				'DatetimeCalendarComponent',
				'DatetimePickerComponent',
				'date, time, datetime, date-range, datetime-range modes',
			],
		},
		{
			title: 'Datetime service',
			description:
				'One focused injectable for common date naming, formatting, arithmetic, and range helpers.',
			items: [
				'TimeService',
				'Formatting, timezone conversion, and locale-aware week boundaries',
				'Day / week / month / year helpers plus date math',
			],
		},
	];

	protected readonly usageCopy = `import { provideNgxDatetime } from 'ngx-datetime';

export const appConfig = {
\tproviders: [provideNgxDatetime()],
};`;

	protected readonly configCopy = `import { provideNgxDatetime } from 'ngx-datetime';

export const appConfig = {
\tproviders: [
\t\tprovideNgxDatetime({
\t\t\tdefaultFormat: 'medium',
\t\t\tdefaultTimezone: 'UTC',
\t\t\tdefaultLocale: 'en-GB',
\t\t\tfirstDayOfWeek: 1,
\t\t}),
\t],
};`;

	protected readonly pickerCopy = `import { DatetimePickerComponent } from 'ngx-datetime';

@Component({
\timports: [DatetimePickerComponent],
\ttemplate: \`
\t\t<ngx-datetime-picker
\t\t\tmode="datetime-range"
\t\t\tlabel="Schedule"
\t\t\tplaceholder="Select range"
\t\t\t[(value)]="range"
\t\t/>
\t\`,
})
export class ExampleComponent {
\trange = signal({ start: null, end: null });
}`;

	protected formatDemoValue(value: DatetimePickerValue): string {
		if (!value) {
			return 'No value selected';
		}

		if (value instanceof Date) {
			return value.toLocaleString();
		}

		return this._formatRange(value);
	}

	protected copy(key: string, value: string): void {
		if (!isPlatformBrowser(this._platformId) || !navigator?.clipboard) {
			return;
		}

		navigator.clipboard.writeText(value).then(() => {
			this.copiedKey.set(key);
			setTimeout(() => {
				if (this.copiedKey() === key) {
					this.copiedKey.set('');
				}
			}, 1500);
		});
	}

	private _formatRange(value: DatetimeRangeValue): string {
		const start = value.start ? value.start.toLocaleString() : 'Start not selected';
		const end = value.end ? value.end.toLocaleString() : 'End not selected';

		return `${start} - ${end}`;
	}
}
