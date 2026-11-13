import { inject, Pipe } from '@angular/core';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';

/** Schemes the `safe` pipe trusts as resource URLs. */
const SAFE_SCHEMES = new Set(['http', 'https', 'blob']);

/** `data:` URLs are trusted only for these image media types. */
const SAFE_DATA_IMAGE = /^data:image\/(?:png|gif|jpe?g|webp|avif|bmp|x-icon|vnd\.microsoft\.icon);/i;

/**
 * Marks a URL as a trusted resource URL (for `iframe`/`embed`/`img` bindings).
 *
 * Only `http(s):`, `blob:`, relative URLs, and `data:image/*` (non-SVG) URLs are
 * trusted. Anything else (for example `javascript:`, `vbscript:`, `data:text/html`)
 * is blocked and an empty resource URL is returned instead.
 */
@Pipe({
	name: 'safe',
})
export class SafePipe {
	transform(html: any): SafeResourceUrl {
		const url = html === null || html === undefined ? '' : String(html);

		return this._sanitizer.bypassSecurityTrustResourceUrl(this._isAllowed(url) ? url : '');
	}

	private _isAllowed(url: string): boolean {
		// Browsers ignore control characters and whitespace when parsing the scheme.
		// eslint-disable-next-line no-control-regex
		const normalized = url.replace(/[\u0000- \u007f]/g, '');
		const scheme = /^([a-z][a-z\d+\-.]*):/i.exec(normalized)?.[1]?.toLowerCase();

		if (!scheme) {
			// Relative URL (path, query, fragment, or protocol-relative `//host`).
			return true;
		}

		if (SAFE_SCHEMES.has(scheme)) {
			return true;
		}

		return scheme === 'data' && SAFE_DATA_IMAGE.test(normalized);
	}

	private _sanitizer = inject(DomSanitizer);
}
