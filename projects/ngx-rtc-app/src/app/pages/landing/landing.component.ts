import { isPlatformBrowser } from '@angular/common';
import { ChangeDetectionStrategy, Component, inject, PLATFORM_ID, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { serviceDocs } from '../../services/service-docs';

interface LandingFeatureGroup {
	title: string;
	description: string;
	items: string[];
}

@Component({
	imports: [RouterLink],
	templateUrl: './landing.component.html',
	styleUrl: './landing.component.scss',
	changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LandingComponent {
	private readonly _platformId = inject(PLATFORM_ID);

	protected readonly copiedKey = signal('');
	protected readonly installCommand = 'npm i --save ngx-rtc';

	protected readonly services = serviceDocs;
	protected readonly featureGroups: LandingFeatureGroup[] = [
		{
			title: 'Bootstrap and configuration',
			description:
				'Standalone-first setup centered on provideNgxRtc() with SSR-safe browser guards.',
			items: ['provideNgxRtc()', 'future-ready config token', 'SSR-safe media access'],
		},
		{
			title: 'WebRTC service',
			description:
				'Focused runtime behavior for local media, peer creation, and offer/answer flow.',
			items: [
				'RtcService',
				'MediaStream and RTCPeerConnection helpers',
				'Offer, answer, ICE, and cleanup methods',
			],
		},
	];

	protected readonly usageCopy = `import { provideNgxRtc } from 'ngx-rtc';

export const appConfig = {
	providers: [provideNgxRtc()],
};`;

	protected readonly configCopy = `import { provideNgxRtc } from 'ngx-rtc';
import { provideNgxCore } from 'ngx-core';

export const appConfig = {
	providers: [
		provideNgxCore({
			meta: {
				applyFromRoutes: true,
			},
		}),
		provideNgxRtc(),
	],
};`;

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
}
