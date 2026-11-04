import { isPlatformBrowser } from '@angular/common';
import { PLATFORM_ID, REQUEST, Service, computed, inject, signal } from '@angular/core';
import { OsDetectInput, OsInfo } from './os.interface';
import { detectOs } from './os.util';

interface _UserAgentData {
	platform?: string;
	getHighEntropyValues?(hints: string[]): Promise<Record<string, unknown>>;
}

/**
 * Signal-based operating system detection.
 *
 * - Browser: reads `navigator.userAgent` synchronously, then refines the
 *   result with User-Agent Client Hints (real Windows 11 / macOS versions,
 *   CPU architecture, device model) where the browser supports them.
 * - Server: reads the `User-Agent` and `Sec-CH-UA-*` headers of the current
 *   request, so SSR can already render OS-specific content.
 * - Prerender / no request: resolves to `unknown`.
 */
@Service()
export class OsService {
	private readonly _isBrowser = isPlatformBrowser(inject(PLATFORM_ID));
	private readonly _request = inject(REQUEST, { optional: true });

	private readonly _os = signal<OsInfo>(detectOs(this._initialInput()));

	/** Detected operating system. */
	readonly os = this._os.asReadonly();

	readonly name = computed(() => this._os().name);
	readonly label = computed(() => this._os().label);
	readonly version = computed(() => this._os().version);
	readonly formFactor = computed(() => this._os().formFactor);
	readonly architecture = computed(() => this._os().architecture);

	readonly isWindows = computed(() => this.name() === 'windows');
	readonly isMacos = computed(() => this.name() === 'macos');
	readonly isLinux = computed(() => this.name() === 'linux');
	readonly isChromeos = computed(() => this.name() === 'chromeos');
	readonly isAndroid = computed(() => this.name() === 'android');
	readonly isIos = computed(() => this.name() === 'ios');
	readonly isIpados = computed(() => this.name() === 'ipados');
	readonly isMetaQuest = computed(() => this.name() === 'meta-quest');
	readonly isApple = computed(() => ['macos', 'ios', 'ipados', 'visionos'].includes(this.name()));

	readonly isDesktop = computed(() => this.formFactor() === 'desktop');
	readonly isMobile = computed(() => this.formFactor() === 'mobile');
	readonly isTablet = computed(() => this.formFactor() === 'tablet');
	readonly isXr = computed(() => this.formFactor() === 'xr');
	readonly isTv = computed(() => this.formFactor() === 'tv');
	readonly isConsole = computed(() => this.formFactor() === 'console');

	constructor() {
		if (this._isBrowser) void this.refine();
	}

	/**
	 * Re-detects the OS using high-entropy User-Agent Client Hints.
	 * Called automatically in the browser; safe to call again.
	 * Resolves with the current result when client hints are unavailable.
	 */
	async refine(): Promise<OsInfo> {
		if (!this._isBrowser) return this._os();

		const userAgentData = (navigator as Navigator & { userAgentData?: _UserAgentData })
			.userAgentData;

		if (!userAgentData?.getHighEntropyValues) return this._os();

		try {
			const hints = await userAgentData.getHighEntropyValues([
				'platformVersion',
				'architecture',
				'bitness',
				'model',
			]);

			this._os.set(
				detectOs({
					...this._initialInput(),
					platform: String(hints['platform'] ?? userAgentData.platform ?? ''),
					platformVersion: String(hints['platformVersion'] ?? ''),
					architecture: String(hints['architecture'] ?? ''),
					bitness: String(hints['bitness'] ?? ''),
					model: String(hints['model'] ?? ''),
				}),
			);
		} catch {
			// Client hints are best-effort; keep the user agent result.
		}

		return this._os();
	}

	private _initialInput(): OsDetectInput {
		if (this._isBrowser) {
			return {
				userAgent: navigator.userAgent,
				platform: (navigator as Navigator & { userAgentData?: _UserAgentData })
					.userAgentData?.platform,
				maxTouchPoints: navigator.maxTouchPoints,
			};
		}

		const headers = this._request?.headers;

		if (!headers) return {};

		return {
			userAgent: headers.get('user-agent') ?? undefined,
			platform: headers.get('sec-ch-ua-platform') ?? undefined,
			platformVersion: headers.get('sec-ch-ua-platform-version') ?? undefined,
			architecture: headers.get('sec-ch-ua-arch') ?? undefined,
			bitness: headers.get('sec-ch-ua-bitness') ?? undefined,
			model: headers.get('sec-ch-ua-model') ?? undefined,
		};
	}
}
