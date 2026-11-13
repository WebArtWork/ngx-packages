import { Component, signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { describe, expect, it } from 'vitest';
import { EditorComponent } from './editor.component';

@Component({
	imports: [EditorComponent],
	template: `<weditor [(wModel)]="value" />`,
})
class HostComponent {
	readonly value = signal('');
}

describe('EditorComponent', () => {
	it('sanitizes model HTML before writing it into the editable area', async () => {
		await TestBed.configureTestingModule({ imports: [HostComponent] }).compileComponents();

		const fixture = TestBed.createComponent(HostComponent);
		fixture.componentInstance.value.set(
			'<b>bold</b><img src="x" onerror="alert(1)"><script>alert(2)</script>',
		);
		fixture.detectChanges();
		await fixture.whenStable();

		const content: HTMLElement = fixture.nativeElement.querySelector('.weditor__content');

		expect(content.querySelector('b')?.textContent).toBe('bold');
		expect(content.innerHTML).not.toContain('onerror');
		expect(content.querySelector('script')).toBeNull();
	});
});
