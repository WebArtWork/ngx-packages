// Global Vitest setup for @wawjs/ngx-ui. jsdom (the unit-test environment)
// doesn't implement `window.matchMedia`, which `@wawjs/ngx-core`'s
// `CoreService` calls during construction to detect the viewport. Stub it so
// any component that transitively injects `CoreService` can be unit tested.
if (typeof window !== 'undefined' && !window.matchMedia) {
	window.matchMedia = (query: string) =>
		({
			matches: false,
			media: query,
			onchange: null,
			addListener: () => {},
			removeListener: () => {},
			addEventListener: () => {},
			removeEventListener: () => {},
			dispatchEvent: () => false,
		}) as unknown as MediaQueryList;
}

// jsdom doesn't implement layout, so `scrollIntoView` is missing entirely.
if (typeof Element !== 'undefined' && !Element.prototype.scrollIntoView) {
	Element.prototype.scrollIntoView = () => {};
}
