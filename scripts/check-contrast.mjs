#!/usr/bin/env node
/**
 * Computes WCAG contrast ratios for ngx-ui's default theme token color pairs
 * and reports a pass/fail table against the WCAG 2.2 AA thresholds (4.5:1 for
 * normal text, 3:1 for large text / UI components). This is a reporting tool,
 * not a build gate — it does not exit non-zero on failure.
 *
 * Usage: node scripts/check-contrast.mjs
 */

function hexToRgb(hex) {
	const clean = hex.replace('#', '');
	const value =
		clean.length === 3
			? clean
					.split('')
					.map(c => c + c)
					.join('')
			: clean;
	const num = parseInt(value, 16);
	return {
		r: (num >> 16) & 255,
		g: (num >> 8) & 255,
		b: num & 255,
	};
}

function relativeLuminance({ r, g, b }) {
	const channel = c => {
		const value = c / 255;
		return value <= 0.03928 ? value / 12.92 : ((value + 0.055) / 1.055) ** 2.4;
	};
	return 0.2126 * channel(r) + 0.7152 * channel(g) + 0.0722 * channel(b);
}

function contrastRatio(hex1, hex2) {
	const l1 = relativeLuminance(hexToRgb(hex1));
	const l2 = relativeLuminance(hexToRgb(hex2));
	const [lighter, darker] = l1 > l2 ? [l1, l2] : [l2, l1];
	return (lighter + 0.05) / (darker + 0.05);
}

// Mirrors DEFAULT_LIGHT_TOKENS / DEFAULT_DARK_TOKENS in
// projects/ngx-ui/src/theme/theme.tokens.ts. Keep in sync manually — this
// script intentionally doesn't import the .ts file to stay a plain Node
// script with no build step.
const themes = {
	light: {
		textPrimary: '#0f172a',
		textSecondary: '#ffffff',
		textMuted: '#64748b',
		bgPrimary: '#f8fafc',
		bgSecondary: '#ffffff',
		primary: '#2563eb',
		danger: '#ef4444',
		onPrimary: '#ffffff',
		onDanger: '#ffffff',
	},
	dark: {
		textPrimary: '#f1f5f9',
		textSecondary: '#ffffff',
		textMuted: '#94a3b8',
		bgPrimary: '#020617',
		bgSecondary: '#1e293b',
		primary: '#3b82f6',
		danger: '#f87171',
		onPrimary: '#ffffff',
		onDanger: '#1f0a0a',
	},
};

// [foreground token, background token, threshold, note]
const pairs = [
	['textPrimary', 'bgPrimary', 4.5, 'body text on the page background'],
	['textPrimary', 'bgSecondary', 4.5, 'body text on cards/panels'],
	['textMuted', 'bgPrimary', 4.5, 'secondary/muted text on the page background'],
	['onPrimary', 'primary', 4.5, 'button label text on the primary color'],
	['onDanger', 'danger', 4.5, 'button label text on the danger color'],
];

let anyFailure = false;

for (const [themeName, tokens] of Object.entries(themes)) {
	console.log(`\n${themeName} theme`);
	console.log('-'.repeat(60));

	for (const [fg, bg, threshold, note] of pairs) {
		const ratio = contrastRatio(tokens[fg], tokens[bg]);
		const pass = ratio >= threshold;
		anyFailure ||= !pass;

		const status = pass ? 'PASS' : 'FAIL';
		console.log(
			`${status}  ${ratio.toFixed(2)}:1 (>= ${threshold}:1)  ${fg} on ${bg} — ${note}`,
		);
	}
}

console.log(
	`\n${anyFailure ? 'Some pairs are below their WCAG AA threshold — see FAIL rows above.' : 'All checked pairs meet WCAG AA.'}`,
);
