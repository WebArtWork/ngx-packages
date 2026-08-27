import { Language } from './language.interface';

export type LanguageDetectorName = 'browser' | 'timezone';

export type LanguageDetectorContext = {
	languages: Language[];
};

export type LanguageDetectorFn = (context: LanguageDetectorContext) => string | null | undefined;

export type LanguageDetector = LanguageDetectorName | LanguageDetectorFn;

export const DEFAULT_LANGUAGE_DETECTORS: readonly LanguageDetectorName[] = ['browser', 'timezone'];

/**
 * Maps IANA timezones to their dominant spoken language.
 *
 * Best-effort only: a timezone can span multiple languages (e.g. Switzerland),
 * so this is a coarse fallback signal, not a source of truth. Consumers can
 * override or extend it by passing a custom detector function instead of the
 * built-in `'timezone'` detector.
 */
export const DEFAULT_TIMEZONE_LANGUAGE_MAP: Record<string, string> = {
	'Europe/London': 'en',
	'Europe/Dublin': 'en',
	'Europe/Paris': 'fr',
	'Europe/Brussels': 'fr',
	'Europe/Luxembourg': 'fr',
	'Europe/Berlin': 'de',
	'Europe/Vienna': 'de',
	'Europe/Zurich': 'de',
	'Europe/Madrid': 'es',
	'Europe/Lisbon': 'pt',
	'America/New_York': 'en',
	'America/Chicago': 'en',
	'America/Denver': 'en',
	'America/Los_Angeles': 'en',
	'America/Toronto': 'en',
	'America/Vancouver': 'en',
	'America/Mexico_City': 'es',
	'America/Bogota': 'es',
	'America/Buenos_Aires': 'es',
	'America/Santiago': 'es',
	'America/Lima': 'es',
	'America/Sao_Paulo': 'pt',
	'Australia/Sydney': 'en',
	'Australia/Melbourne': 'en',
	'Pacific/Auckland': 'en',
};

/**
 * Detects a language code from the browser's `navigator.languages`
 * (falling back to `navigator.language`), in the user's own preference order.
 */
export function detectBrowserLanguage(): string | null {
	if (typeof navigator === 'undefined') {
		return null;
	}

	const candidates =
		navigator.languages && navigator.languages.length
			? navigator.languages
			: navigator.language
				? [navigator.language]
				: [];

	for (const candidate of candidates) {
		const code = extractLanguageCode(candidate);

		if (code) {
			return code;
		}
	}

	return null;
}

/**
 * Detects a language code from the device's IANA timezone using a coarse
 * timezone-to-language lookup. Pass a custom `timezoneLanguageMap` to override
 * or extend the built-in mapping.
 */
export function detectTimezoneLanguage(
	timezoneLanguageMap: Record<string, string> = DEFAULT_TIMEZONE_LANGUAGE_MAP,
): string | null {
	if (typeof Intl === 'undefined' || typeof Intl.DateTimeFormat !== 'function') {
		return null;
	}

	try {
		const timeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;

		return timezoneLanguageMap[timeZone] || null;
	} catch {
		return null;
	}
}

function extractLanguageCode(locale: string): string | null {
	const trimmed = (locale || '').trim();

	if (!trimmed) {
		return null;
	}

	return trimmed.split(/[-_]/)[0].toLowerCase() || null;
}
