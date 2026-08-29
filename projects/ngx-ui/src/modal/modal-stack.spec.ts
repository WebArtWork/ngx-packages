import { Component } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { describe, expect, it } from 'vitest';
import { ModalService } from './modal.service';

@Component({ template: `<button>content</button>` })
class ContentComponent {}

describe('Stacked modals + Escape', () => {
	it('closes only the topmost modal per Escape press, not every open modal', async () => {
		await TestBed.configureTestingModule({}).compileComponents();

		const modalService = TestBed.inject(ModalService);

		const outer = modalService.show({ component: ContentComponent, ariaLabel: 'Outer' });
		await new Promise(resolve => setTimeout(resolve, 0));

		const inner = modalService.show({ component: ContentComponent, ariaLabel: 'Inner' });
		await new Promise(resolve => setTimeout(resolve, 0));

		expect(document.querySelectorAll('.wawjs-modal__content').length).toBe(2);

		document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }));
		await new Promise(resolve => setTimeout(resolve, 0));

		// Only the inner (topmost) modal should have closed.
		expect(document.querySelectorAll('.wawjs-modal__content').length).toBe(1);

		document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }));
		await new Promise(resolve => setTimeout(resolve, 0));

		expect(document.querySelectorAll('.wawjs-modal__content').length).toBe(0);

		outer.close?.();
		inner.close?.();
	});
});
