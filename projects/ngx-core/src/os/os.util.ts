import { OsArchitecture, OsDetectInput, OsFormFactor, OsInfo, OsName } from './os.interface';

/**
 * Human readable labels for every `OsName`.
 */
export const OS_LABELS: Readonly<Record<OsName, string>> = {
	windows: 'Windows',
	macos: 'macOS',
	linux: 'Linux',
	chromeos: 'ChromeOS',
	bsd: 'BSD',
	android: 'Android',
	ios: 'iOS',
	ipados: 'iPadOS',
	harmonyos: 'HarmonyOS',
	fireos: 'Fire OS',
	kaios: 'KaiOS',
	'windows-phone': 'Windows Phone',
	'meta-quest': 'Meta Horizon OS',
	pico: 'PICO OS',
	visionos: 'visionOS',
	tizen: 'Tizen',
	webos: 'webOS',
	xbox: 'Xbox',
	playstation: 'PlayStation',
	nintendo: 'Nintendo',
	unknown: 'Unknown',
};

const _WINDOWS_NT_VERSIONS: Readonly<Record<string, string>> = {
	'10.0': '10',
	'6.3': '8.1',
	'6.2': '8',
	'6.1': '7',
	'6.0': 'Vista',
	'5.2': 'XP',
	'5.1': 'XP',
};

const _CLIENT_HINT_PLATFORMS: Readonly<Record<string, OsName>> = {
	windows: 'windows',
	macos: 'macos',
	linux: 'linux',
	'chrome os': 'chromeos',
	chromeos: 'chromeos',
	'chromium os': 'chromeos',
	android: 'android',
	ios: 'ios',
};

/**
 * Detects the operating system from a user agent string and optional
 * User-Agent Client Hints.
 *
 * Pure and framework-free: safe to call in the browser, during SSR, or in
 * server middleware with request headers.
 *
 * @example
 * detectOs({ userAgent: navigator.userAgent });
 * detectOs({ userAgent: req.headers['user-agent'], platform: 'Windows', platformVersion: '15.0.0' });
 */
export function detectOs(input: OsDetectInput = {}): OsInfo {
	const os = _detectFromUserAgent(input.userAgent?.trim() || '', input.maxTouchPoints ?? 0);

	return _applyClientHints(os, input);
}

function _result(
	name: OsName,
	formFactor: OsFormFactor,
	version = '',
	device = '',
	architecture: OsArchitecture = 'unknown',
): OsInfo {
	return {
		name,
		label: OS_LABELS[name],
		version,
		formFactor,
		architecture,
		device,
		source: name === 'unknown' ? 'none' : 'user-agent',
	};
}

function _match(ua: string, regex: RegExp): string {
	return regex.exec(ua)?.[1]?.replace(/_/g, '.') || '';
}

function _detectFromUserAgent(ua: string, maxTouchPoints: number): OsInfo {
	if (!ua) return _result('unknown', 'unknown');

	const os = _detectName(ua, maxTouchPoints);

	if (os.architecture === 'unknown') {
		os.architecture = _architectureFromUserAgent(ua, os.name);
	}

	return os;
}

function _detectName(ua: string, maxTouchPoints: number): OsInfo {
	// XR headsets report Android or Linux tokens, so they must be checked first.
	// Their browsers may report "Linux x86_64", but the headsets are ARM.
	if (/OculusBrowser|\bQuest\b/i.test(ua)) {
		return _result(
			'meta-quest',
			'xr',
			'',
			_match(ua, /\b(Quest(?: Pro| \d+S?)?)\b/i) || 'Quest',
			'arm64',
		);
	}

	if (/PicoBrowser|\bPico\b/i.test(ua)) {
		return _result(
			'pico',
			'xr',
			'',
			_match(ua, /\b(Pico[ \w]*?)(?:[;)]| Build)/i) || 'Pico',
			'arm64',
		);
	}

	if (/visionOS|Apple Vision/i.test(ua)) {
		return _result('visionos', 'xr', _match(ua, /visionOS[ /]([\d._]+)/i), 'Apple Vision Pro');
	}

	// Consoles report Windows or other desktop tokens.
	if (/Xbox/i.test(ua)) {
		return _result('xbox', 'console', '', _match(ua, /(Xbox (?:One|Series [SX]))/i) || 'Xbox');
	}

	if (/PlayStation/i.test(ua)) {
		return _result(
			'playstation',
			'console',
			_match(ua, /PlayStation [\w ]+?[ /]([\d.]+)/i),
			_match(ua, /(PlayStation(?: \d| Vita| Portable)?)/i) || 'PlayStation',
		);
	}

	if (/Nintendo/i.test(ua)) {
		return _result(
			'nintendo',
			'console',
			'',
			_match(ua, /(Nintendo [\w ]+?)[;)]/i) || 'Nintendo',
		);
	}

	// Mobile and TV systems that also report Android or Linux tokens.
	if (/Windows Phone|Windows Mobile/i.test(ua)) {
		return _result('windows-phone', 'mobile', _match(ua, /Windows Phone(?: OS)? ([\d.]+)/i));
	}

	if (/HarmonyOS|OpenHarmony/i.test(ua)) {
		return _result(
			'harmonyos',
			/Tablet/i.test(ua) ? 'tablet' : 'mobile',
			_match(ua, /Harmony(?:OS)?[ /]?([\d.]+)/i),
		);
	}

	if (/KAIOS/i.test(ua)) {
		return _result('kaios', 'mobile', _match(ua, /KAIOS\/([\d.]+)/i));
	}

	if (/Tizen/i.test(ua)) {
		return _result(
			'tizen',
			/SMART-TV|SmartTV|\bTV\b/i.test(ua) ? 'tv' : 'mobile',
			_match(ua, /Tizen[ /]?([\d.]+)/i),
		);
	}

	if (/Web0S|webOS|hpwOS/i.test(ua)) {
		return _result('webos', /Web0S|SmartTV|\bTV\b/i.test(ua) ? 'tv' : 'mobile');
	}

	if (/\bSilk\/|\bKF[A-Z]{2,5}\b|\bAFT[A-Z]/.test(ua)) {
		return _result(
			'fireos',
			/\bAFT[A-Z]/.test(ua) ? 'tv' : 'tablet',
			'',
			_match(ua, /\b((?:KF|AFT)[A-Z0-9]+)\b/),
		);
	}

	if (/Android/i.test(ua)) {
		const isTv = /\bTV\b|GoogleTV|AndroidTV|BRAVIA|AFT/i.test(ua);

		return _result(
			'android',
			isTv ? 'tv' : /Mobile/i.test(ua) ? 'mobile' : 'tablet',
			_match(ua, /Android[ /]?([\d.]+)/i),
			_androidModel(ua),
		);
	}

	if (/CrOS/.test(ua)) {
		return _result('chromeos', 'desktop', _match(ua, /CrOS \S+ ([\d.]+)/));
	}

	if (/iPhone|iPod/.test(ua)) {
		return _result(
			'ios',
			'mobile',
			_match(ua, /OS ([\d_]+) like Mac OS X/),
			/iPod/.test(ua) ? 'iPod' : 'iPhone',
			'arm64',
		);
	}

	if (/iPad/.test(ua)) {
		return _result(
			'ipados',
			'tablet',
			_match(ua, /OS ([\d_]+) like Mac OS X/),
			'iPad',
			'arm64',
		);
	}

	if (/Macintosh|Mac OS X/.test(ua)) {
		// iPadOS Safari requests desktop sites with a Mac user agent.
		if (maxTouchPoints > 1) {
			return _result('ipados', 'tablet', _match(ua, /Version\/([\d.]+)/), 'iPad', 'arm64');
		}

		// Browsers freeze this at 10.15.7; client hints provide the real version.
		return _result('macos', 'desktop', _match(ua, /Mac OS X ([\d_.]+)/));
	}

	if (/Windows/i.test(ua)) {
		const nt = _match(ua, /Windows NT ([\d.]+)/i);

		return _result('windows', 'desktop', _WINDOWS_NT_VERSIONS[nt] || nt);
	}

	if (/FreeBSD|OpenBSD|NetBSD|DragonFly/i.test(ua)) {
		return _result('bsd', 'desktop', '', _match(ua, /(FreeBSD|OpenBSD|NetBSD|DragonFly)/i));
	}

	if (/Linux|X11/i.test(ua)) {
		return _result(
			'linux',
			'desktop',
			'',
			_match(ua, /(Ubuntu|Fedora|Debian|Arch Linux|Manjaro|Mint|SUSE|CentOS|Red Hat)/i),
		);
	}

	return _result('unknown', 'unknown');
}

function _androidModel(ua: string): string {
	const model = _match(
		ua,
		/Android[ /]?[\d.]*;(?: [a-z]{2}[-_][a-z]{2};)? ([^;)]+?)(?: Build\/|[;)])/i,
	);

	// Reduced user agents replace the model with "K".
	return model === 'K' ? '' : model;
}

function _architectureFromUserAgent(ua: string, name: OsName): OsArchitecture {
	// macOS always reports "Intel Mac OS X", even on Apple silicon.
	if (name === 'macos') return 'unknown';
	if (/aarch64|arm64/i.test(ua)) return 'arm64';
	if (/\barmv?\d*l?\b/i.test(ua)) return 'arm';
	if (/x86_64|x86-64|Win64|x64|WOW64|amd64/i.test(ua)) return 'x64';
	if (/i[3-6]86|\bx86\b/i.test(ua)) return 'x86';

	return 'unknown';
}

function _applyClientHints(os: OsInfo, input: OsDetectInput): OsInfo {
	const platform = _clean(input.platform).toLowerCase();
	const platformVersion = _clean(input.platformVersion);
	const architecture = _clean(input.architecture).toLowerCase();
	const bitness = _clean(input.bitness);
	const model = _clean(input.model);

	if (!platform && !platformVersion && !architecture && !model) return os;

	const result = { ...os };
	const hintedName = _CLIENT_HINT_PLATFORMS[platform];

	if (hintedName && result.name === 'unknown') {
		Object.assign(
			result,
			_result(
				hintedName,
				hintedName === 'android' || hintedName === 'ios' ? 'mobile' : 'desktop',
			),
		);
	}

	// Only trust the version hint when it describes the detected OS.
	if (platformVersion && (!hintedName || hintedName === result.name)) {
		const version = _versionFromHint(result.name, platformVersion);

		if (version) result.version = version;
	}

	if (architecture === 'arm') {
		result.architecture = bitness === '32' ? 'arm' : 'arm64';
	} else if (architecture === 'x86') {
		result.architecture = bitness === '32' ? 'x86' : 'x64';
	}

	if (model) result.device = model;

	result.source = 'client-hints';

	return result;
}

function _versionFromHint(name: OsName, platformVersion: string): string {
	if (name === 'windows') {
		// https://learn.microsoft.com/microsoft-edge/web-platform/how-to-detect-win11
		const major = parseInt(platformVersion, 10);

		if (major >= 13) return '11';
		if (major > 0) return '10';

		return '';
	}

	return platformVersion.replace(/(\.0)+$/, '');
}

function _clean(value: string | undefined): string {
	return (value || '').trim().replace(/^"|"$/g, '');
}
