import { isPlatformBrowser } from '@angular/common';
import {
	computed,
	effect,
	inject,
	Injector,
	PLATFORM_ID,
	signal,
	Signal,
	WritableSignal,
} from '@angular/core';
import { Observable, ReplaySubject } from 'rxjs';
import { StoreService } from '@wawjs/ngx-core';
import { HttpService, NetworkService } from '@wawjs/ngx-http';
import { CrudConfig, CrudDocument, CrudOptions, GetConfig } from './crud.interface';

type CrudOperation = 'create' | 'update' | 'unique' | 'delete';

interface QueuedMutation<Document> {
	id: string;
	operation: CrudOperation;
	doc: Document;
	name?: string;
}

/**
 * Signal-first base service for one CRUD document collection.
 *
 * The `documents` signal is the single source of truth. Mutations update it
 * immediately, persist the local state, and then sync with the API now or when
 * the network returns.
 */
export abstract class CrudService<Document extends CrudDocument<Document>> {
	private readonly _isBrowser = isPlatformBrowser(inject(PLATFORM_ID));
	private readonly _httpService = inject(HttpService);
	private readonly _storeService = inject(StoreService);
	private readonly _networkService = inject(NetworkService);
	private readonly _injector = inject(Injector);

	private readonly _url: string;
	private readonly _docsKey: string;
	private readonly _queueKey: string;
	private readonly _userKey: string;

	private _perPage = 20;
	private _objectIdCounter = Math.floor(Math.random() * 0xffffff);
	private readonly _objectIdRandom = this._randomHex(10);
	private _isFlushing = false;
	private _queue: QueuedMutation<Document>[] = [];
	private _documentSignals = new Map<string, WritableSignal<Document>>();

	private readonly _documents = signal<Document[]>([]);

	readonly documents = this._documents.asReadonly();
	readonly documentSignals = computed(() => this.documents().map(doc => this.getSignal(doc)));
	readonly isLoaded = signal(false);

	constructor(private readonly _config: CrudConfig<Document>) {
		this._url = '/api/' + this._config.name;
		this._docsKey = 'docs_' + this._config.name;
		this._queueKey = 'crud_queue_' + this._config.name;
		this._userKey = 'crud_user_' + this._config.name;

		void this._restore();

		effect(
			() => {
				if (this.isLoaded() && this._networkService.isOnline()) {
					void this.flushQueue();
				}
			},
			{ injector: this._injector },
		);
	}

	getSignal(docOrId: string | Document): WritableSignal<Document> {
		const doc = typeof docOrId === 'string' ? this._findDocument(docOrId) : this._ensureId(docOrId);
		const id = typeof docOrId === 'string' ? docOrId : this._identity(docOrId);
		const key = id || this._createId();
		const current = doc || ({ [this._idField()]: key } as unknown as Document);
		let docSignal = this._documentSignals.get(key);

		if (!docSignal) {
			docSignal = signal({ ...current });
			this._documentSignals.set(key, docSignal);
		} else {
			docSignal.set({ ...docSignal(), ...current });
		}

		return docSignal;
	}

	getSignals(field: string, value: unknown): Signal<WritableSignal<Document>[]> {
		return computed(() =>
			this.documents()
				.filter(doc => doc[field as keyof Document] === value)
				.map(doc => this.getSignal(doc)),
		);
	}

	getFieldSignals(field: string): Signal<Record<string, WritableSignal<Document>[]>> {
		return computed(() => {
			const byField: Record<string, WritableSignal<Document>[]> = {};

			for (const doc of this.documents()) {
				const key = String(doc[field as keyof Document]);
				byField[key] ||= [];
				byField[key].push(this.getSignal(doc));
			}

			return byField;
		});
	}

	prepareDocument(_id?: string): WritableSignal<Document> {
		if (_id) {
			return this.getSignal(_id);
		}

		return this.getSignal({
			_id: this._createId(),
		} as Document);
	}

	setPerPage(perPage: number): void {
		this._perPage = perPage;
	}

	restoreDocs(): Promise<void> {
		return this._restore();
	}

	clearDocs(): void {
		this._queue = [];
		this._documents.set([]);
		this._documentSignals.clear();
		void this._persist();
	}

	async checkUser(userId: string): Promise<void> {
		const previousUserId = await this._storeService.get(this._userKey);

		if (previousUserId && previousUserId !== userId) {
			this.clearDocs();
		}

		await this._storeService.set(this._userKey, userId);
	}

	addDocs(docs: Document[]): void {
		this._setDocuments(docs);
	}

	addDoc(doc: Document): void {
		this._upsert(doc);
	}

	get(config: GetConfig = {}, options: CrudOptions<Document> = {}): Observable<Document[]> {
		return this._run<Document[]>(async subject => {
			await this._waitForOnline();

			const page = typeof config.page === 'number' ? config.page : undefined;
			const perPage = config.perPage || this._perPage;
			const params =
				(page || config.query ? '?' : '') +
				(config.query || '') +
				(page ? `&skip=${perPage * (page - 1)}&limit=${perPage}` : '');
			const docs = await this._request<Document[]>('get', undefined, options.name, params);
			const nextDocs = docs || [];

			if (!page) {
				this._setDocuments(nextDocs);
			} else {
				this._setDocuments([...this.documents(), ...nextDocs]);
			}

			options.callback?.(nextDocs);
			subject.next(nextDocs);
		}, options);
	}

	create(doc: Document = {} as Document, options: CrudOptions<Document> = {}): Observable<Document> {
		return this._mutate('create', doc, options);
	}

	fetch(query: object = {}, options: CrudOptions<Document> = {}): Observable<Document> {
		return this._run<Document>(async subject => {
			query = await this.beforeFetch(query, options);

			await this._waitForOnline();

			const doc = await this._request<Document>('fetch', query, options.name);

			if (doc) {
				this._upsert(doc);
				options.callback?.(doc);
				await this.afterFetch(doc, query, options);
			}

			subject.next(doc);
		}, options);
	}

	updateAfterWhile(doc: Document, options: CrudOptions<Document> = {}): Observable<Document> {
		return this.update(doc, options);
	}

	update(doc: Document, options: CrudOptions<Document> = {}): Observable<Document> {
		return this._mutate('update', doc, options);
	}

	unique(doc: Document, options: CrudOptions<Document> = {}): Observable<Document> {
		return this._mutate('unique', doc, options);
	}

	delete(doc: Document, options: CrudOptions<Document> = {}): Observable<Document> {
		return this._mutate('delete', doc, options);
	}

	protected beforeCreate(doc: Document, _options: CrudOptions<Document>): Document | Promise<Document> {
		return doc;
	}

	protected afterCreate(_resp: unknown, _doc: Document, _options: CrudOptions<Document>): void | Promise<void> {}

	protected beforeUpdate(doc: Document, _options: CrudOptions<Document>): Document | Promise<Document> {
		return doc;
	}

	protected afterUpdate(_resp: unknown, _doc: Document, _options: CrudOptions<Document>): void | Promise<void> {}

	protected beforeUnique(doc: Document, _options: CrudOptions<Document>): Document | Promise<Document> {
		return doc;
	}

	protected afterUnique(_resp: unknown, _doc: Document, _options: CrudOptions<Document>): void | Promise<void> {}

	protected beforeDelete(doc: Document, _options: CrudOptions<Document>): Document | Promise<Document> {
		return doc;
	}

	protected afterDelete(_resp: unknown, _doc: Document, _options: CrudOptions<Document>): void | Promise<void> {}

	protected beforeFetch(query: object, _options: CrudOptions<Document>): object | Promise<object> {
		return query;
	}

	protected afterFetch(_resp: unknown, _query: object, _options: CrudOptions<Document>): void | Promise<void> {}

	private _mutate(
		operation: CrudOperation,
		sourceDoc: Document,
		options: CrudOptions<Document>,
	): Observable<Document> {
		return this._run<Document>(async subject => {
			const doc = await this._before(operation, { ...sourceDoc }, options);

			this._ensureId(doc);

			if (this._config.appId) {
				doc.appId = this._config.appId;
			}

			if (operation === 'delete') {
				this._remove(doc);
			} else {
				this._upsert(doc);
			}

			const queued = this._enqueue(operation, doc, options);

			if (this._networkService.isOnline()) {
				await this._syncMutation(queued, options);
			}

			options.callback?.(doc);
			subject.next(doc);
		}, options);
	}

	private async _syncMutation(
		mutation: QueuedMutation<Document>,
		options: CrudOptions<Document> = {},
	): Promise<void> {
		const resp = await this._request<Document>(
			mutation.operation,
			mutation.doc,
			mutation.name,
		);

		this._removeQueued(mutation.id);

		if (mutation.operation === 'delete') {
			await this._after(mutation.operation, resp, mutation.doc, options);
			return;
		}

		const syncedDoc = resp || mutation.doc;
		this._replaceLocal(mutation.doc, syncedDoc);
		this._patchQueuedLocalDoc(mutation.doc, syncedDoc);
		await this._after(mutation.operation, resp, syncedDoc, options);
	}

	async flushQueue(): Promise<void> {
		if (this._isFlushing || !this._networkService.isOnline()) {
			return;
		}

		this._isFlushing = true;

		try {
			for (const mutation of [...this._queue]) {
				await this._syncMutation(mutation);
			}
		} finally {
			this._isFlushing = false;
		}
	}

	private _enqueue(
		operation: CrudOperation,
		doc: Document,
		options: CrudOptions<Document>,
	): QueuedMutation<Document> {
		const mutation: QueuedMutation<Document> = {
			id: this._nextMutationId(),
			operation,
			doc: { ...doc },
			name: options.name,
		};

		this._queue = [...this._queue, mutation];
		void this._persist();

		return mutation;
	}

	private _removeQueued(id: string): void {
		this._queue = this._queue.filter(mutation => mutation.id !== id);
		void this._persist();
	}

	private _setDocuments(docs: Document[]): void {
		const nextDocs = docs.map(doc => this._normalize(doc));

		this._documents.set(nextDocs);
		this._syncDocumentSignals(nextDocs);
		void this._persist();
	}

	private _upsert(doc: Document): void {
		const normalized = this._normalize(doc);
		const key = this._documentKey(normalized);
		const existingIndex = this.documents().findIndex(current => this._documentKey(current) === key);
		const nextDocs = [...this.documents()];

		if (existingIndex === -1) {
			nextDocs.push(normalized);
		} else {
			nextDocs[existingIndex] = { ...nextDocs[existingIndex], ...normalized };
		}

		this._setDocuments(nextDocs);
	}

	private _remove(doc: Document): void {
		const key = this._documentKey(doc);
		this._setDocuments(this.documents().filter(current => this._documentKey(current) !== key));
	}

	private _replaceLocal(localDoc: Document, syncedDoc: Document): void {
		const localKey = this._documentKey(localDoc);
		const synced = this._normalize({ ...localDoc, ...syncedDoc });

		this._setDocuments(
			this.documents().map(doc => (this._documentKey(doc) === localKey ? synced : doc)),
		);
	}

	private _patchQueuedLocalDoc(localDoc: Document, syncedDoc: Document): void {
		const localKey = this._documentKey(localDoc);

		this._queue = this._queue.map(mutation =>
			this._documentKey(mutation.doc) === localKey
				? { ...mutation, doc: { ...mutation.doc, ...syncedDoc } }
				: mutation,
		);

		void this._persist();
	}

	private _syncDocumentSignals(docs: Document[]): void {
		const activeKeys = new Set<string>();

		for (const doc of docs) {
			const key = this._documentKey(doc);
			activeKeys.add(key);

			const docSignal = this._documentSignals.get(key);

			if (docSignal) {
				docSignal.set({ ...doc });
			} else {
				this._documentSignals.set(key, signal({ ...doc }));
			}
		}

		for (const key of this._documentSignals.keys()) {
			if (!activeKeys.has(key)) {
				this._documentSignals.delete(key);
			}
		}
	}

	private _findDocument(id: string): Document | undefined {
		return this.documents().find(doc => this._documentKey(doc) === id || this._identity(doc) === id);
	}

	private _normalize(doc: Document): Document {
		const normalized = { ...doc };

		this._ensureId(normalized);

		this._config.replace?.(normalized);

		return normalized;
	}

	private _documentKey(doc: Document): string {
		return this._identity(doc);
	}

	private _ensureId(doc: Document): Document {
		if (!this._identity(doc)) {
			(doc as unknown as Record<string, string>)[this._idField()] = this._createId();
		}

		return doc;
	}

	private _identity(doc?: Document): string {
		const value = doc?.[this._idField() as keyof Document];

		return value === undefined || value === null ? '' : String(value);
	}

	private _idField(): string {
		return this._config._id || '_id';
	}

	private _nextMutationId(): string {
		return this._createId();
	}

	private _createId(): string {
		const timestamp = Math.floor(Date.now() / 1000)
			.toString(16)
			.padStart(8, '0');
		const counter = this._nextObjectIdCounter()
			.toString(16)
			.padStart(6, '0');

		return timestamp + this._objectIdRandom + counter;
	}

	private _nextObjectIdCounter(): number {
		this._objectIdCounter = (this._objectIdCounter + 1) % 0x1000000;

		return this._objectIdCounter;
	}

	private _randomHex(length: number): string {
		const bytesLength = Math.ceil(length / 2);
		const bytes = new Uint8Array(bytesLength);
		const cryptoRef = this._isBrowser ? globalThis.crypto : undefined;

		if (cryptoRef?.getRandomValues) {
			cryptoRef.getRandomValues(bytes);
		} else {
			for (let i = 0; i < bytes.length; i++) {
				bytes[i] = Math.floor(Math.random() * 256);
			}
		}

		return Array.from(bytes)
			.map(byte => byte.toString(16).padStart(2, '0'))
			.join('')
			.slice(0, length);
	}

	private async _restore(): Promise<void> {
		const [docs, queue] = await Promise.all([
			this._storeService.getJson<Document[]>(this._docsKey, { defaultValue: [] }),
			this._storeService.getJson<QueuedMutation<Document>[]>(this._queueKey, { defaultValue: [] }),
		]);

		this._queue = queue || [];
		this._setDocuments(docs || []);
		this.isLoaded.set(true);

		void this.flushQueue();
	}

	private async _persist(): Promise<void> {
		await Promise.all([
			this._storeService.setJson(this._docsKey, this.documents()),
			this._storeService.setJson(this._queueKey, this._queue),
		]);
	}

	private _run<T>(
		work: (subject: ReplaySubject<T>) => void | Promise<void>,
		options: CrudOptions<Document> = {},
	): Observable<T> {
		const subject = new ReplaySubject<T>(1);

		void Promise.resolve(work(subject))
			.then(() => subject.complete())
			.catch(error => {
				options.errCallback?.(error);
				subject.error(error);
			});

		return subject.asObservable();
	}

	private async _waitForOnline(): Promise<void> {
		if (this._networkService.isOnline()) {
			return;
		}

		await new Promise<void>(resolve => {
			let onlineEffect = effect(
				() => {
					if (!this._networkService.isOnline()) {
						return;
					}

					onlineEffect.destroy();
					resolve();
				},
				{ injector: this._injector },
			);
		});
	}

	private async _request<T>(
		action: CrudOperation | 'get' | 'fetch',
		body?: unknown,
		name = '',
		params = '',
	): Promise<T> {
		const endpoint = `${this._url}/${action}${name || ''}${params}`;
		const obs =
			action === 'get'
				? this._httpService.get(endpoint)
				: this._httpService.post(endpoint, body);

		return await new Promise<T>((resolve, reject) => {
			obs.subscribe({
				next: response => resolve(response as T),
				error: reject,
			});
		});
	}

	private async _before(
		operation: CrudOperation,
		doc: Document,
		options: CrudOptions<Document>,
	): Promise<Document> {
		if (operation === 'create') return await this.beforeCreate(doc, options);
		if (operation === 'update') return await this.beforeUpdate(doc, options);
		if (operation === 'unique') return await this.beforeUnique(doc, options);

		return await this.beforeDelete(doc, options);
	}

	private async _after(
		operation: CrudOperation,
		resp: unknown,
		doc: Document,
		options: CrudOptions<Document>,
	): Promise<void> {
		if (operation === 'create') return await this.afterCreate(resp, doc, options);
		if (operation === 'update') return await this.afterUpdate(resp, doc, options);
		if (operation === 'unique') return await this.afterUnique(resp, doc, options);

		return await this.afterDelete(resp, doc, options);
	}
}
