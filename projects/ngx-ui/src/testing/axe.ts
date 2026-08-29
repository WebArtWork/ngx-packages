import axe from 'axe-core';

/**
 * Runs axe-core against a rendered DOM node and throws with a readable
 * message if any violations are found. `color-contrast` is disabled because
 * jsdom (used by the Vitest unit-test environment) has no real layout engine
 * and cannot compute rendered colors.
 */
export async function expectNoA11yViolations(element: Element): Promise<void> {
	const results = await axe.run(element, {
		rules: {
			'color-contrast': { enabled: false },
		},
	});

	if (results.violations.length) {
		const message = results.violations
			.map(
				violation =>
					`${violation.id}: ${violation.help} (${violation.nodes.length} node(s))`,
			)
			.join('\n');

		throw new Error(`axe-core found accessibility violations:\n${message}`);
	}
}
