import { Component } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { describe, expect, it } from 'vitest';
import { expectNoA11yViolations } from '../testing/axe';
import { TabPanelComponent } from './tab-panel.component';
import { TabsComponent } from './tabs.component';

@Component({
	imports: [TabsComponent, TabPanelComponent],
	template: `
		<wtabs>
			<wtab header="One">Panel one</wtab>
			<wtab header="Two">Panel two</wtab>
			<wtab header="Three">Panel three</wtab>
		</wtabs>
	`,
})
class HostComponent {}

describe('TabsComponent', () => {
	it('moves the roving tab stop and selection with ArrowRight/ArrowLeft', async () => {
		await TestBed.configureTestingModule({ imports: [HostComponent] }).compileComponents();

		const fixture = TestBed.createComponent(HostComponent);
		fixture.detectChanges();

		const root: HTMLElement = fixture.nativeElement;
		const tabs = root.querySelectorAll<HTMLButtonElement>('[role="tab"]');
		expect(tabs.length).toBe(3);
		expect(tabs[0].getAttribute('aria-selected')).toBe('true');
		expect(tabs[0].getAttribute('tabindex')).toBe('0');
		expect(tabs[1].getAttribute('tabindex')).toBe('-1');

		tabs[0].dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowRight', bubbles: true }));
		fixture.detectChanges();

		expect(tabs[1].getAttribute('aria-selected')).toBe('true');
		expect(tabs[1].getAttribute('tabindex')).toBe('0');
		expect(tabs[0].getAttribute('tabindex')).toBe('-1');

		const panels = root.querySelectorAll('[role="tabpanel"]');
		expect(panels[1].getAttribute('aria-labelledby')).toBe(tabs[1].id);
		expect(tabs[1].getAttribute('aria-controls')).toBe(panels[1].id);

		await expectNoA11yViolations(fixture.nativeElement);
	});
});
