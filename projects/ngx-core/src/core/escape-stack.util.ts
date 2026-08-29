type EscapeHandler = () => void;

const _stack: EscapeHandler[] = [];
let _listening = false;

function _ensureListener(doc: Document): void {
	if (_listening) {
		return;
	}

	_listening = true;

	doc.addEventListener('keydown', (event: Event) => {
		const keyboardEvent = event as KeyboardEvent;

		if (keyboardEvent.key !== 'Escape' || !_stack.length) {
			return;
		}

		// Only the topmost registered overlay reacts, so stacked
		// modals/popups close one at a time instead of all at once.
		_stack[_stack.length - 1]();
	});
}

/**
 * Registers an Escape-to-close handler for a modal/popup/overlay and returns
 * an unregister function to call when it closes. Only the most-recently
 * registered (topmost) handler runs on Escape, so stacked overlays close one
 * at a time rather than every open overlay reacting to the same keypress.
 */
export function pushEscapeHandler(doc: Document, handler: EscapeHandler): () => void {
	_ensureListener(doc);
	_stack.push(handler);

	return () => {
		const index = _stack.lastIndexOf(handler);

		if (index !== -1) {
			_stack.splice(index, 1);
		}
	};
}
