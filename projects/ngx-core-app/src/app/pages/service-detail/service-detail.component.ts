import { DOCUMENT, isPlatformBrowser } from '@angular/common';
import {
	ChangeDetectionStrategy,
	Component,
	computed,
	effect,
	inject,
	PLATFORM_ID,
	signal,
} from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { map } from 'rxjs';
import { MetaService } from 'ngx-core';
import { serviceDocMap, type ServiceDoc, type ServiceMethodDoc } from '../../services/service-docs';
import { ServiceDetailFeatureFilesComponent } from './service-detail-feature-files.component';

interface ServiceReferenceItem {
	id: string;
	name: string;
	group: string;
	category: string;
	docType: string;
	sourceFile: string | null;
	signature: string;
	description: string;
	details: string[];
	example: string | null;
}

interface ServiceReferenceGroup {
	name: string;
	items: ServiceReferenceItem[];
}

interface AvailableItemLabel {
	raw: string;
	label: string;
}

interface ServiceReferenceFileSection {
	id: string;
	raw: string;
	label: string;
	items: ServiceReferenceItem[];
}

@Component({
	imports: [RouterLink, ServiceDetailFeatureFilesComponent],
	templateUrl: './service-detail.component.html',
	styleUrl: './service-detail.component.scss',
	changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ServiceDetailComponent {
	private static readonly _AVAILABLE_ITEM_ORDER = [
		'provide',
		'service',
		'interface',
		'type',
		'directive',
		'pipe',
		'const',
	] as const;

	private readonly _route = inject(ActivatedRoute);
	private readonly _meta = inject(MetaService);
	private readonly _platformId = inject(PLATFORM_ID);
	private readonly _document = inject(DOCUMENT);

	protected readonly copied = signal(false);
	protected readonly openFile = signal<string | null>(null);
	private readonly _slug = toSignal(
		this._route.paramMap.pipe(map(params => params.get('slug') || '')),
		{ initialValue: this._route.snapshot.paramMap.get('slug') || '' },
	);
	protected readonly doc = computed(() => serviceDocMap.get(this._slug()) || null);
	protected readonly pageTitle = computed(() => this.doc()?.name.replace(/Service$/, '') || '');
	protected readonly items = computed(() => this._buildItems(this.doc()));
	protected readonly groups = computed(() => this._buildGroups(this.items()));
	protected readonly availableItems = computed(() =>
		this._sortAvailableItems(this.doc()?.availableItems || []),
	);
	protected readonly fileSections = computed(() =>
		this._buildFileSections(this.availableItems(), this.items()),
	);

	constructor() {
		effect(() => {
			const doc = this.doc();

			if (!doc) {
				this._meta.applyMeta({
					title: 'Service not found',
					description: 'The requested service documentation page does not exist.',
				});
				return;
			}

			this._meta.applyMeta({
				title: doc.name,
				description: doc.description,
			});
		});

		effect(() => {
			const sections = this.fileSections();
			const openedFile = this.openFile();

			if (!sections.length) {
				if (openedFile !== null) {
					this.openFile.set(null);
				}
				return;
			}

			if (openedFile && !sections.some(section => section.raw === openedFile)) {
				this.openFile.set(null);
			}
		});
	}

	protected copyExample(example: string | null): void {
		if (!example || !isPlatformBrowser(this._platformId) || !navigator?.clipboard) {
			return;
		}

		navigator.clipboard.writeText(this.formatExample(example)).then(() => {
			this.copied.set(true);
			setTimeout(() => this.copied.set(false), 1500);
		});
	}

	protected scrollToItem(itemId: string): void {
		if (!isPlatformBrowser(this._platformId)) {
			return;
		}

		const element = this._document.getElementById(itemId);
		if (!element) {
			return;
		}

		element.scrollIntoView({ behavior: 'smooth', block: 'start' });
		this._document.defaultView?.history?.replaceState(null, '', `#${itemId}`);
	}

	protected toggleFile(raw: string): void {
		this.openFile.set(this.openFile() === raw ? null : raw);
	}

	protected openFileSection(raw: string): void {
		if (this.openFile() !== raw) {
			this.openFile.set(raw);
		}

		this.scrollToItem(this._toFileId(raw));
	}

	protected isFileOpen(raw: string): boolean {
		return this.openFile() === raw;
	}

	private _buildItems(doc: ServiceDoc | null): ServiceReferenceItem[] {
		if (!doc) {
			return [];
		}

		return [
			...(doc.properties || []).map(item => this._mapItem(item, 'Property', doc.code)),
			...doc.methods.map(item => this._mapItem(item, 'Method', doc.code)),
		];
	}

	private _mapItem(
		item: ServiceMethodDoc,
		group: string,
		fallbackExample: string,
	): ServiceReferenceItem {
		return {
			id: this._toId(item.name),
			name: item.name,
			group,
			category: item.category || group,
			docType: item.docType || 'Service',
			sourceFile: item.sourceFile || null,
			signature: item.signature,
			description: item.description,
			details: item.details || [],
			example: item.example
				? this.formatExample(item.example)
				: (item.docType || 'Service') === 'Service'
					? this.formatExample(fallbackExample)
					: null,
		};
	}

	private _buildGroups(items: ServiceReferenceItem[]): ServiceReferenceGroup[] {
		const groups = new Map<string, ServiceReferenceItem[]>();

		for (const item of items) {
			const key = `${item.docType}: ${item.category}`;
			const bucket = groups.get(key) || [];
			bucket.push(item);
			groups.set(key, bucket);
		}

		return Array.from(groups.entries()).map(([name, groupedItems]) => ({
			name,
			items: groupedItems,
		}));
	}

	private _buildFileSections(
		files: AvailableItemLabel[],
		items: ServiceReferenceItem[],
	): ServiceReferenceFileSection[] {
		if (!files.length) {
			return [];
		}

		return files.map(file => ({
			id: this._toFileId(file.raw),
			raw: file.raw,
			label: file.label,
			items: items.filter(item => item.sourceFile === file.raw),
		}));
	}

	private _toId(value: string): string {
		return value
			.toLowerCase()
			.replace(/[^a-z0-9]+/g, '-')
			.replace(/^-|-$/g, '');
	}

	private _toFileId(value: string): string {
		return this._toId(`file-${value}`);
	}

	private _formatAvailableItem(value: string): string {
		return value
			.replace(/\.ts$/i, '')
			.replace(/\./g, ' ')
			.replace(/-/g, ' ')
			.replace(/\b\w/g, letter => letter.toUpperCase());
	}

	private _sortAvailableItems(items: string[]): AvailableItemLabel[] {
		return [...items]
			.sort((left, right) => {
				const rankDifference =
					this._getAvailableItemRank(left) - this._getAvailableItemRank(right);

				if (rankDifference !== 0) {
					return rankDifference;
				}

				return this._formatAvailableItem(left).localeCompare(
					this._formatAvailableItem(right),
				);
			})
			.map(item => ({
				raw: item,
				label: this._formatAvailableItem(item),
			}));
	}

	private _getAvailableItemRank(value: string): number {
		const normalizedValue = value.replace(/\.ts$/i, '');

		if (normalizedValue.startsWith('provide-')) {
			return ServiceDetailComponent._AVAILABLE_ITEM_ORDER.indexOf('provide');
		}

		for (const [index, part] of ServiceDetailComponent._AVAILABLE_ITEM_ORDER.entries()) {
			if (part !== 'provide' && normalizedValue.endsWith(`.${part}`)) {
				return index;
			}
		}

		return ServiceDetailComponent._AVAILABLE_ITEM_ORDER.length;
	}

	protected formatExample(example: string): string {
		return example.replace(/\t/g, '  ');
	}
}

