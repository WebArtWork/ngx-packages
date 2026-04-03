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
	protected readonly installCommand = 'npm i --save ngx-socket';

	protected readonly services = serviceDocs;
	protected readonly featureGroups: LandingFeatureGroup[] = [
		{
			title: 'Bootstrap and configuration',
			description:
				'Standalone-first setup centered on provideNgxSocket() for realtime defaults.',
			items: [
				'provideNgxSocket()',
				'socket / io config',
				'SSR-safe browser-only client startup',
			],
		},
		{
			title: 'Realtime service',
			description:
				'Focused runtime behavior for Socket.IO event binding, connection state, and emits.',
			items: [
				'SocketService',
				'Config, SocketConfig, CONFIG_TOKEN',
				'Emitter-backed lifecycle notifications',
			],
		},
	];

	protected readonly usageCopy = `import { provideNgxSocket } from 'ngx-socket';

export const appConfig = {
	providers: [provideNgxSocket()],
};`;

	protected readonly configCopy = `import { provideNgxSocket } from 'ngx-socket';
import { io } from 'socket.io-client';

export const appConfig = {
	providers: [
		provideNgxSocket({
			socket: {
				url: 'https://realtime.example.com',
				opts: { transports: ['websocket'] },
			},
			io,
		}),
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
