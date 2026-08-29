import { Component } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { describe, expect, it } from 'vitest';
import { ButtonDirective } from './button.directive';

@Component({
	imports: [ButtonDirective],
	template: `<button wbutton [ariaLabel]="'Save'" [disabled]="true">Save</button>`,
})
class HostComponent {}

describe('ButtonDirective', () => {
	it('exposes an accessible name and reflects the disabled state natively', async () => {
		await TestBed.configureTestingModule({
			imports: [HostComponent],
		}).compileComponents();

		const fixture = TestBed.createComponent(HostComponent);
		fixture.detectChanges();

		const button: HTMLButtonElement = fixture.nativeElement.querySelector('button');

		expect(button.getAttribute('aria-label')).toBe('Save');
		expect(button.disabled).toBe(true);
	});
});
