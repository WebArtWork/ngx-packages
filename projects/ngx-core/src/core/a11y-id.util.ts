let _nextA11yId = 0;

/**
 * Generates a stable, monotonically increasing id for wiring ARIA
 * relationships (`aria-describedby`, `aria-labelledby`, `aria-controls`, ...)
 * on components that don't otherwise have a natural unique id.
 *
 * Uses a simple incrementing counter (the same technique Angular CDK/Material
 * use) rather than `crypto.randomUUID()` so ids stay stable and identical
 * between server-rendered and client-hydrated output, since both render the
 * same components in the same order.
 */
export function generateA11yId(prefix = 'wid'): string {
	return `${prefix}-${++_nextA11yId}`;
}
