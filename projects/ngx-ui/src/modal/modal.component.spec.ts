import { Component } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { describe, expect, it } from 'vitest';
import { ModalService } from './modal.service';

@Component({
	template: `<button id="modal-body-trigger">trigger</button>`,
})
class ModalContentComponent {}

describe('ModalComponent (via ModalService)', () => {
	it('renders dialog semantics, traps focus, and restores focus on close', async () => {
		await TestBed.configureTestingModule({}).compileComponents();

		const triggerButton = document.createElement('button');
		triggerButton.textContent = 'open';
		document.body.appendChild(triggerButton);
		triggerButton.focus();

		const modalService = TestBed.inject(ModalService);

		const modal = modalService.show({
			component: ModalContentComponent,
			ariaLabel: 'Test modal',
		});

		// FocusTrap resolves asynchronously (Promise-based focus scheduling).
		await new Promise(resolve => setTimeout(resolve, 0));
		await new Promise(resolve => setTimeout(resolve, 0));

		const panel = document.querySelector('.wawjs-modal__content');
		expect(panel).toBeTruthy();
		expect(panel?.getAttribute('role')).toBe('dialog');
		expect(panel?.getAttribute('aria-modal')).toBe('true');
		expect(panel?.getAttribute('aria-label')).toBe('Test modal');

		// Focus should have moved inside the modal (onto the content button or the panel itself).
		expect(panel?.contains(document.activeElement)).toBe(true);

		modal.close?.();

		await new Promise(resolve => setTimeout(resolve, 0));

		expect(document.querySelector('.wawjs-modal__content')).toBeFalsy();
		expect(document.activeElement).toBe(triggerButton);

		triggerButton.remove();
	});
});
