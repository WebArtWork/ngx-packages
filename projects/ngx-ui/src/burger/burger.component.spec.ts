import { Component, signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { describe, expect, it } from 'vitest';
import { expectNoA11yViolations } from '../testing/axe';
import { BurgerComponent } from './burger.component';

@Component({
	imports: [BurgerComponent],
	template: `
		<icon-burger [state]="state()" [controls]="'main-nav'" (updated)="onToggle()" />
		<nav id="main-nav"></nav>
	`,
})
class HostComponent {
	readonly state = signal<'three-lines' | 'cross'>('three-lines');
	onToggle(): void {
		this.state.set(this.state() === 'cross' ? 'three-lines' : 'cross');
	}
}

describe('BurgerComponent', () => {
	it('exposes aria-expanded/aria-controls and updates them on toggle', async () => {
		await TestBed.configureTestingModule({ imports: [HostComponent] }).compileComponents();

		const fixture = TestBed.createComponent(HostComponent);
		fixture.detectChanges();

		const button: HTMLButtonElement = fixture.nativeElement.querySelector('button');

		expect(button.getAttribute('aria-controls')).toBe('main-nav');
		expect(button.getAttribute('aria-expanded')).toBe('false');

		button.click();
		fixture.detectChanges();

		expect(button.getAttribute('aria-expanded')).toBe('true');

		await expectNoA11yViolations(fixture.nativeElement);
	});
});
