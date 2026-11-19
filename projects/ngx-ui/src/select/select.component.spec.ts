import { Component, signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { FormsModule } from '@angular/forms';
import { describe, expect, it } from 'vitest';
import { SelectComponent } from './select.component';

@Component({
	imports: [SelectComponent, FormsModule],
	template: `
		<wselect
			label="Fruit"
			bindLabel="label"
			bindValue="value"
			[items]="items"
			[(ngModel)]="value"
		/>
	`,
})
class HostComponent {
	value: string | null = null;
	items = [
		{ label: 'Apple', value: 'apple' },
		{ label: 'Banana', value: 'banana' },
		{ label: 'Cherry', value: 'cherry' },
	];
}

describe('SelectComponent', () => {
	it('wires combobox/listbox ARIA relationships and updates aria-activedescendant on arrow navigation', async () => {
		await TestBed.configureTestingModule({ imports: [HostComponent] }).compileComponents();

		const fixture = TestBed.createComponent(HostComponent);
		fixture.detectChanges();

		const root: HTMLElement = fixture.nativeElement;
		const combobox = root.querySelector('.wselect__body') as HTMLElement;

		expect(combobox.getAttribute('role')).toBe('combobox');
		expect(combobox.getAttribute('aria-haspopup')).toBe('listbox');
		expect(combobox.getAttribute('aria-expanded')).toBe('false');

		combobox.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowDown', bubbles: true }));
		fixture.detectChanges();

		expect(combobox.getAttribute('aria-expanded')).toBe('true');

		const listbox = root.querySelector('[role="listbox"]') as HTMLElement;
		expect(listbox).toBeTruthy();
		expect(combobox.getAttribute('aria-controls')).toBe(listbox.id);

		const activeId = combobox.getAttribute('aria-activedescendant');
		expect(activeId).toBeTruthy();
		expect(listbox.querySelector(`#${activeId}`)).toBeTruthy();

		combobox.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowDown', bubbles: true }));
		fixture.detectChanges();

		const nextActiveId = combobox.getAttribute('aria-activedescendant');
		expect(nextActiveId).not.toBe(activeId);
	});
});

@Component({
	imports: [SelectComponent],
	template: `<wselect [items]="items" [formField]="field" [raw]="true" />`,
})
class FieldHostComponent {
	readonly value = signal<string | null>(null);
	readonly field = (() => ({ value: this.value })) as never;
	readonly items = ['Dashboard', 'Settings'];
}

describe('SelectComponent signal form bridge', () => {
	it('keeps the picked option and writes it to the field', async () => {
		await TestBed.configureTestingModule({ imports: [FieldHostComponent] }).compileComponents();

		const fixture = TestBed.createComponent(FieldHostComponent);
		fixture.detectChanges();

		const root: HTMLElement = fixture.nativeElement;

		(root.querySelector('.wselect__header') as HTMLElement).click();
		fixture.detectChanges();

		const option = Array.from(root.querySelectorAll<HTMLElement>('.wselect__item')).find((item) =>
			item.textContent?.includes('Settings'),
		) as HTMLElement;

		option.click();
		fixture.detectChanges();
		await fixture.whenStable();
		fixture.detectChanges();

		expect(fixture.componentInstance.value()).toBe('Settings');
		expect(root.querySelector('.wselect__value')?.textContent).toContain('Settings');
	});
});
