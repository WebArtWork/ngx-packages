export interface ThemeTokens {
	/** Main brand color for buttons, active borders, and filled states. */
	primary?: string;
	/** Hover state of primary. */
	primaryHover?: string;
	/** Secondary or error color. */
	secondary?: string;
	/** Hover state of secondary. */
	secondaryHover?: string;
	/** Main body text. */
	textPrimary?: string;
	/** Text placed on strong or primary-colored backgrounds. */
	textSecondary?: string;
	/** Subdued text, icons, and hints. */
	textMuted?: string;
	/** Input placeholder text. */
	placeholder?: string;
	/** Page background behind component surfaces. */
	bgPrimary?: string;
	/** Card, input, modal, and popup surface backgrounds. */
	bgSecondary?: string;
	/** Hover surfaces, row highlights, and subtle fills. */
	bgTertiary?: string;
	/** Borders and dividers. */
	border?: string;
	/** Danger and badge background. */
	danger?: string;
	/** Foreground content on danger backgrounds. */
	onDanger?: string;
	/** Foreground content drawn on primary-filled elements. */
	onPrimary?: string;
	/** Focus outline as a full box-shadow value. */
	focusRing?: string;
	/** Small drop shadow. */
	shadowSm?: string;
	/** Medium drop shadow. */
	shadowMd?: string;
	/** Base font stack. */
	ffBase?: string;
	/** Global letter-spacing. */
	letterSpacing?: string;
	/** Standard transition duration. */
	motion?: string;
	/** Fast transition duration. */
	motionFast?: string;
	/** Standard easing curve. */
	easing?: string;
	/** Spacing scale step 1. */
	sp1?: string;
	/** Spacing scale step 2. */
	sp2?: string;
	/** Spacing scale step 3. */
	sp3?: string;
	/** Spacing scale step 4. */
	sp4?: string;
	/** Spacing scale step 5. */
	sp5?: string;
	/** Spacing scale step 6. */
	sp6?: string;
	/** General border radius. */
	radius?: string;
	/** Card or panel border radius. */
	radiusCard?: string;
	/** Button border radius. */
	radiusBtn?: string;
	/** Pill or full-circle border radius. */
	radiusPill?: string;
	/** Select body border radius. */
	bRadius?: string;
	/** Select popup border radius. */
	bRadiusCard?: string;
	/** Burger icon button size. */
	burgerSize?: string;
	/** Burger icon bar width. */
	barW?: string;
	/** Burger icon bar height. */
	barH?: string;
	/** Burger icon bar gap. */
	barGap?: string;
	/** Alert info background. */
	alertInfoBg?: string;
	/** Alert success background. */
	alertSuccessBg?: string;
	/** Alert warning background. */
	alertWarningBg?: string;
	/** Alert error background. */
	alertErrorBg?: string;
	/** Alert question background. */
	alertQuestionBg?: string;
	/** Alert info progress bar. */
	alertInfoBar?: string;
	/** Alert success progress bar. */
	alertSuccessBar?: string;
	/** Alert warning progress bar. */
	alertWarningBar?: string;
	/** Alert error progress bar. */
	alertErrorBar?: string;
	/** Alert question progress bar. */
	alertQuestionBar?: string;
}

/** Maps every ThemeTokens key to its CSS custom property name. */
export const TOKEN_VAR_MAP: Record<keyof ThemeTokens, string> = {
	primary: '--c-primary',
	primaryHover: '--c-primary-hover',
	secondary: '--c-secondary',
	secondaryHover: '--c-secondary-hover',
	textPrimary: '--c-text-primary',
	textSecondary: '--c-text-secondary',
	textMuted: '--c-text-muted',
	placeholder: '--c-placeholder',
	bgPrimary: '--c-bg-primary',
	bgSecondary: '--c-bg-secondary',
	bgTertiary: '--c-bg-tertiary',
	border: '--c-border',
	danger: '--c-danger',
	onDanger: '--c-on-danger',
	onPrimary: '--c-on-primary',
	focusRing: '--focus-ring',
	shadowSm: '--shadow-sm',
	shadowMd: '--shadow-md',
	ffBase: '--ff-base',
	letterSpacing: '--letter-spacing',
	motion: '--motion',
	motionFast: '--motion-fast',
	easing: '--easing',
	sp1: '--sp-1',
	sp2: '--sp-2',
	sp3: '--sp-3',
	sp4: '--sp-4',
	sp5: '--sp-5',
	sp6: '--sp-6',
	radius: '--radius',
	radiusCard: '--radius-card',
	radiusBtn: '--radius-btn',
	radiusPill: '--radius-pill',
	bRadius: '--b-radius',
	bRadiusCard: '--b-radius-card',
	burgerSize: '--burger-size',
	barW: '--bar-w',
	barH: '--bar-h',
	barGap: '--bar-gap',
	alertInfoBg: '--c-alert-info-bg',
	alertSuccessBg: '--c-alert-success-bg',
	alertWarningBg: '--c-alert-warning-bg',
	alertErrorBg: '--c-alert-error-bg',
	alertQuestionBg: '--c-alert-question-bg',
	alertInfoBar: '--c-alert-info-bar',
	alertSuccessBar: '--c-alert-success-bar',
	alertWarningBar: '--c-alert-warning-bar',
	alertErrorBar: '--c-alert-error-bar',
	alertQuestionBar: '--c-alert-question-bar',
};

/** Typography, motion, and component geometry shared by every mode. */
export const DEFAULT_STATIC_TOKENS: ThemeTokens = {
	ffBase: 'system-ui, -apple-system, "Segoe UI", sans-serif',
	letterSpacing: '0',
	motion: '200ms',
	motionFast: '120ms',
	easing: 'cubic-bezier(0.4, 0, 0.2, 1)',
	burgerSize: '44px',
	barW: '24px',
	barH: '2px',
	barGap: '8px',
};

export const DEFAULT_LIGHT_TOKENS: ThemeTokens = {
	primary: '#2563eb',
	primaryHover: '#1d4ed8',
	secondary: '#dc2626',
	secondaryHover: '#b91c1c',
	textPrimary: '#0f172a',
	textSecondary: '#ffffff',
	textMuted: '#64748b',
	placeholder: '#94a3b8',
	bgPrimary: '#f8fafc',
	bgSecondary: '#ffffff',
	bgTertiary: '#f1f5f9',
	border: '#e2e8f0',
	danger: '#ef4444',
	onDanger: '#ffffff',
	onPrimary: '#ffffff',
	focusRing: '0 0 0 3px rgba(37, 99, 235, 0.3)',
	shadowSm: '0 1px 3px rgba(0, 0, 0, 0.1)',
	shadowMd: '0 8px 24px rgba(15, 23, 42, 0.12)',
	alertInfoBg: 'rgba(186, 230, 253, 0.9)',
	alertSuccessBg: 'rgba(167, 243, 208, 0.9)',
	alertWarningBg: 'rgba(253, 230, 138, 0.9)',
	alertErrorBg: 'rgba(254, 205, 211, 0.9)',
	alertQuestionBg: 'rgba(254, 240, 138, 0.9)',
	alertInfoBar: '#7dd3fc',
	alertSuccessBar: '#6ee7b7',
	alertWarningBar: '#fcd34d',
	alertErrorBar: '#fda4af',
	alertQuestionBar: '#fde047',
};

export const DEFAULT_DARK_TOKENS: ThemeTokens = {
	primary: '#3b82f6',
	primaryHover: '#2563eb',
	secondary: '#ef4444',
	secondaryHover: '#dc2626',
	textPrimary: '#f1f5f9',
	textSecondary: '#ffffff',
	textMuted: '#94a3b8',
	placeholder: '#64748b',
	bgPrimary: '#020617',
	bgSecondary: '#1e293b',
	bgTertiary: '#0f172a',
	border: '#334155',
	danger: '#f87171',
	onDanger: '#1f0a0a',
	onPrimary: '#ffffff',
	focusRing: '0 0 0 3px rgba(59, 130, 246, 0.4)',
	shadowSm: '0 1px 3px rgba(0, 0, 0, 0.3)',
	shadowMd: '0 12px 32px rgba(0, 0, 0, 0.45)',
	alertInfoBg: 'rgba(12, 74, 110, 0.9)',
	alertSuccessBg: 'rgba(6, 95, 70, 0.9)',
	alertWarningBg: 'rgba(113, 63, 18, 0.9)',
	alertErrorBg: 'rgba(127, 29, 29, 0.9)',
	alertQuestionBg: 'rgba(113, 63, 18, 0.9)',
	alertInfoBar: '#38bdf8',
	alertSuccessBar: '#34d399',
	alertWarningBar: '#fbbf24',
	alertErrorBar: '#fb7185',
	alertQuestionBar: '#facc15',
};

export const DEFAULT_COMFORTABLE_TOKENS: ThemeTokens = {
	sp1: '4px',
	sp2: '8px',
	sp3: '12px',
	sp4: '16px',
	sp5: '20px',
	sp6: '24px',
};

export const DEFAULT_COMPACT_TOKENS: ThemeTokens = {
	sp1: '2px',
	sp2: '6px',
	sp3: '8px',
	sp4: '12px',
	sp5: '14px',
	sp6: '18px',
};

export const DEFAULT_ROUNDED_TOKENS: ThemeTokens = {
	radius: '6px',
	radiusCard: '12px',
	radiusBtn: '8px',
	radiusPill: '9999px',
	bRadius: '6px',
	bRadiusCard: '12px',
};

export const DEFAULT_SQUARE_TOKENS: ThemeTokens = {
	radius: '2px',
	radiusCard: '4px',
	radiusBtn: '4px',
	radiusPill: '4px',
	bRadius: '2px',
	bRadiusCard: '4px',
};
