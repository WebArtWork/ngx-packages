/**
 * Operating system identifiers detected by `detectOs()` and `OsService`.
 */
export type OsName =
	| 'windows'
	| 'macos'
	| 'linux'
	| 'chromeos'
	| 'bsd'
	| 'android'
	| 'ios'
	| 'ipados'
	| 'harmonyos'
	| 'fireos'
	| 'kaios'
	| 'windows-phone'
	| 'meta-quest'
	| 'pico'
	| 'visionos'
	| 'tizen'
	| 'webos'
	| 'xbox'
	| 'playstation'
	| 'nintendo'
	| 'unknown';

/**
 * Kind of device the operating system runs on.
 */
export type OsFormFactor = 'desktop' | 'mobile' | 'tablet' | 'xr' | 'tv' | 'console' | 'unknown';

/**
 * CPU architecture of the operating system, when it can be determined.
 */
export type OsArchitecture = 'x64' | 'x86' | 'arm64' | 'arm' | 'unknown';

/**
 * Raw signals used to detect the operating system.
 *
 * All fields are optional so the same detector works in the browser
 * (`navigator.userAgent` + `navigator.userAgentData`) and on the server
 * (`User-Agent` + `Sec-CH-UA-*` request headers).
 */
export interface OsDetectInput {
	/** Full user agent string. */
	userAgent?: string;
	/** Client Hints platform, for example `Windows`, `macOS`, `Android`. */
	platform?: string;
	/** Client Hints platform version, for example `15.0.0` (Windows 11) or `14.4.1` (macOS). */
	platformVersion?: string;
	/** Client Hints architecture, `x86` or `arm`. */
	architecture?: string;
	/** Client Hints bitness, `64` or `32`. */
	bitness?: string;
	/** Client Hints device model, for example `Pixel 8`. */
	model?: string;
	/** `navigator.maxTouchPoints`, used to tell iPadOS desktop mode apart from macOS. */
	maxTouchPoints?: number;
}

/**
 * Detected operating system.
 */
export interface OsInfo {
	/** Stable identifier to branch on, for example `windows` or `meta-quest`. */
	name: OsName;
	/** Human readable name, for example `Windows` or `Meta Horizon OS`. */
	label: string;
	/** OS version when known, otherwise an empty string. */
	version: string;
	formFactor: OsFormFactor;
	architecture: OsArchitecture;
	/** Device model when known, for example `Quest 3` or `iPhone`. */
	device: string;
	/** Which signals produced the result. */
	source: 'user-agent' | 'client-hints' | 'none';
}
