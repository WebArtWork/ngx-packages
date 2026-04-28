import { isPlatformBrowser } from '@angular/common';
import { computed, inject, PLATFORM_ID, Signal, signal, WritableSignal } from '@angular/core';
import { Observable, ReplaySubject } from 'rxjs';
import { EmitterService } from '@wawjs/ngx-core';
import { CoreService } from '../core/core.service';
import { HttpService } from '../http/http.service';
import { NetworkService } from '../network/network.service';
import { StoreService } from '../store/store.service';
import { CrudConfig, CrudDocument, CrudOptions, GetConfig } from './crud.interface';

/**
 * Abstract class representing a CRUD (Create, Read, Update, Delete) service.
 *
 * This class provides methods for managing documents, interacting with an API,
 * and storing/retrieving data from local storage. It is designed to be extended
 * for specific document types.
 *
 * @template Document - The type of the document the service handles.
 */
export abstract class CrudService<Document extends CrudDocument<Document>> {
	private readonly _isBrowser = isPlatformBrowser(inject(PLATFORM_ID));
	/**
	 * Base URL for the API collection associated with this service.
	 */
	private _url = '/api/';

	/**
	 * Number of documents per page for paginated `get()` calls.
	 */
	private _perPage = 20;

	/**
	 * HTTP client wrapper used for API communication.
	 */
	protected __httpService = inject(HttpService);

	/**
	 * Key–value storage service used to persist documents locally.
	 */
	protected __storeService = inject(StoreService);

	/**
	 * Core helper service with utility methods (copy, debounce, toSignal, etc.).
	 */
	protected __coreService = inject(CoreService);

	/**
	 * Global event bus for cross-service communication.
	 */
	protected __emitterService = inject(EmitterService);

	/**
	 * Network status service used to queue work while offline.
	 */
	protected __networkService = inject(NetworkService);

	/**
	 * Signals whether the initial restore flow has completed.
	 */
	readonly isLoaded = signal(false);

	/**
	 * Cache of detached signals requested by id but not yet part of the collection.
	 */
	private _detachedSignals: Record<string, WritableSignal<Document>> = {};

	constructor(private _config: CrudConfig<Document>) {
		this._config.signalFields = this._config.signalFields || {};

		this._url += this._config.name;

		if (this._config.unauthorized) {
			void this.restoreDocs();
		} else if (this._isBrowser && localStorage.getItem('waw_user')) {
			const user = JSON.parse(localStorage.getItem('waw_user') as string);

			if (user._id === localStorage.getItem(this._config.name + 'waw_user_id')) {
				void this.restoreDocs();
			} else {
				this.isLoaded.set(true);
			}
		} else {
			this.isLoaded.set(true);
		}

		this.__emitterService.on('wipe').subscribe((): void => {
			this.clearDocs();
		});

		this.__emitterService.on('wacom_online').subscribe(() => {
			for (const callback of this._onOnline) {
				callback();
			}

			this._onOnline.length = 0;
		});
	}

	/**
	 * Cache of per-document signals indexed by document _id.
	 * Prevents creating multiple signals for the same document.
	 */
	private _signal: Record<string, WritableSignal<Document>> = {};

	/**
	 * Canonical signal-backed collection store.
	 */
	private _documentSignals = signal<WritableSignal<Document>[]>([]);

	/**
	 * Read-only signal with the current list of per-document signals.
	 */
	readonly documentSignals = this._documentSignals.asReadonly();

	/**
	 * Derived read-only signal exposing the current documents as plain values.
	 */
	readonly documents = computed(() => this._documentSignals().map(document => document()));

	/**
	 * Cache of per (field,value) lists of document signals.
	 * Key format: `${field}_${JSON.stringify(value)}`.
	 */
	private _signals: Record<string, Signal<WritableSignal<Document>[]>> = {};

	/**
	 * Cache of per-field maps: fieldValue -> array of document signals.
	 */
	private _fieldSignals: Record<string, Signal<Record<string, WritableSignal<Document>[]>>> = {};

	/**
	 * Returns a WritableSignal for a document instance or identifier.
	 * String lookups stay detached from the collection until the document is
	 * created or loaded through the normal collection flows.
	 *
	 * @param _id - Document identifier or a document instance.
	 */
	getSignal(_id: string | Document) {
		if (typeof _id !== 'string') {
			const existingSignalId = this._getSignalIds(_id).find(id => !!this._signal[id]);

			if (existingSignalId) {
				return this._signal[existingSignalId];
			}

			const docSignal = this.__coreService.toSignal(
				_id,
				this._config.signalFields,
			) as WritableSignal<Document>;

			for (const id of this._getSignalIds(_id)) {
				this._signal[id] = docSignal;
			}

			return docSignal;
		}

		// Reuse existing signal if present
		if (this._signal[_id]) {
			return this._signal[_id];
		}

		return this.prepareDocument(_id);
	}

	/**
	 * Returns a signal with an array of document signals that match
	 * a given field/value pair.
	 *
	 * Example:
	 *   const activitiesSig = service.getSignals('userId', currentUserId);
	 */
	getSignals(field: string, value: unknown) {
		const id = field + '_' + JSON.stringify(value);

		if (!this._signals[id]) {
			this._signals[id] = computed(() => this._getSignals(id));
		}

		return this._signals[id];
	}

	/**
	 * Builds the array of document signals for a given (field,value) key.
	 * Only documents with a real _id are included.
	 */
	private _getSignals(id: string): WritableSignal<Document>[] {
		const sep = id.indexOf('_');
		if (sep === -1) {
			return [];
		}

		const field = id.slice(0, sep) as keyof Document;
		const valueJson = id.slice(sep + 1);

		const list: WritableSignal<Document>[] = [];

		for (const doc of this.documents()) {
			if (JSON.stringify(doc[field] as unknown) !== valueJson) {
				continue;
			}

			const docId = this._id(doc);
			if (!docId) continue;

			list.push(this.getSignal(docId));
		}

		return list;
	}

	/**
	 * Returns a signal with a map: fieldValue -> array of document signals.
	 *
	 * Example:
	 *   const byStatusSig = service.getFieldSignals('status');
	 *   byStatusSig() might be { active: [sig1, sig2], draft: [sig3] }.
	 */
	getFieldSignals(field: string) {
		if (!this._fieldSignals[field]) {
			this._fieldSignals[field] = computed(() => this._getFieldSignals(field));
		}

		return this._fieldSignals[field];
	}

	/**
	 * Builds the map for a given field.
	 * Only documents with a real _id are included.
	 */
	private _getFieldSignals(field: string): Record<string, WritableSignal<Document>[]> {
		const byFields: Record<string, WritableSignal<Document>[]> = {};

		for (const doc of this.documents()) {
			const docId = this._id(doc);
			if (!docId) continue;

			const value = String(doc[field as keyof Document]);

			if (!byFields[value]) {
				byFields[value] = [];
			}

			byFields[value].push(this.getSignal(docId));
		}

		return byFields;
	}

	/**
	 * Restores documents from local storage (if present) into the
	 * canonical signal-backed collection.
	 */
	async restoreDocs() {
		const docs = await this.__storeService.getJson<Document[]>('docs_' + this._config.name);

		if (docs?.length) {
			const signals = docs.map(doc => this._materializeSignal(doc));

			this._documentSignals.set(this._dedupeSignals(signals));

			for (const doc of this.documents()) {
				if (doc.__deleted) {
					this.delete(doc, doc.__options?.['delete'] || {});
				} else if (!doc._id) {
					this.create(doc, doc.__options?.['create'] || {});
				} else if (doc.__modified?.length) {
					for (const id of doc.__modified) {
						if (id.startsWith('up')) {
							this.update(doc, doc.__options?.[id] || {});
						} else {
							this.unique(doc, doc.__options?.[id] || {});
						}
					}
				}
			}

		}

		this.isLoaded.set(true);
	}

	/**
	 * Saves the current set of documents to local storage.
	 */
	private setDocs(): void {
		this.__storeService.setJson<Document[]>('docs_' + this._config.name, this.documents());
	}

	/**
	 * Clears the current collection state and persists the empty result.
	 */
	clearDocs(): void {
		for (const doc of this.documents()) {
			for (const id of this._getSignalIds(doc)) {
				delete this._signal[id];
				delete this._detachedSignals[id];
			}
		}

		this._documentSignals.set([]);

		this.setDocs();
	}

	/**
	 * Adds multiple documents to the service and saves them to local storage.
	 *
	 * @param docs - An array of documents to add.
	 */
	addDocs(docs: Document[]): void {
		if (Array.isArray(docs)) {
			for (const doc of docs) {
				this.addDoc(doc);
			}
		}
	}

	/**
	 * Adds a single document to the service. If it already exists, it will be updated.
	 *
	 * @param doc - The document to add.
	 */
	addDoc(doc: Document): void {
		if (this._config.replace) {
			this._config.replace(doc);
		}

		const signal = this._materializeSignal(doc);

		if (!this._documentSignals().includes(signal)) {
			this._documentSignals.update(documents => [...documents, signal]);
		}

		this.setDocs();
	}

	/**
	 * Returns a detached per-document signal or draft signal.
	 * If the document is already in the collection, the canonical collection signal is used.
	 * Otherwise a detached signal is created and optionally hydrated by `fetch()`.
	 *
	 * @param _id - Optional document id to search for or hydrate.
	 * @returns A writable signal for the prepared document.
	 */
	prepareDocument(_id?: string): WritableSignal<Document> {
		if (!_id) {
			const doc = {
				_id: undefined,
				_localId: this._localId(),
				__modified: [],
			} as unknown as Document;
			const docSignal = this.__coreService.toSignal(
				doc,
				this._config.signalFields,
			) as WritableSignal<Document>;

			this._registerSignal(docSignal, doc);

			for (const id of this._getSignalIds(doc)) {
				this._detachedSignals[id] = docSignal;
			}

			return docSignal;
		}

		if (this._signal[_id]) {
			return this._signal[_id];
		}

		if (this._detachedSignals[_id]) {
			return this._detachedSignals[_id];
		}

		const existingDoc = this.documentSignals().find(
			document => this._getSignalIds(document()).includes(_id),
		);

		if (existingDoc) {
			this._signal[_id] = existingDoc;

			return existingDoc;
		}

		const docSignal = this.__coreService.toSignal(
			{ _id } as Document,
			this._config.signalFields,
		) as WritableSignal<Document>;

		this._signal[_id] = docSignal;
		this._detachedSignals[_id] = docSignal;

		if (!this.documentSignals().find(document => this._getSignalIds(document()).includes(_id)) && !this._fetchingId[_id]) {
			this._fetchingId[_id] = true;

			setTimeout(() => {
				this.fetch({ _id }).subscribe((_doc: Document) => {
					this._fetchingId[_id] = false;

					if (_doc) {
						docSignal.set({ ..._doc });
					}
				},
				() => {
					this._fetchingId[_id] = false;
				});
			});
		}

		return docSignal;
	}

	/**
	 * Sets the number of documents to display per page.
	 *
	 * @param _perPage - Number of documents per page.
	 */
	setPerPage(_perPage: number): void {
		this._perPage = _perPage;
	}

	/**
	 * Middleware hooks (override in child services).
	 * Can be sync or async. Must return the document to be sent.
	 */
	protected beforeCreate(
		doc: Document,
		options: CrudOptions<Document>,
	): Document | Promise<Document> {
		return doc;
	}

	protected afterCreate(
		resp: unknown,
		doc: Document,
		options: CrudOptions<Document>,
	): void | Promise<void> {}

	protected beforeUpdate(
		doc: Document,
		options: CrudOptions<Document>,
	): Document | Promise<Document> {
		return doc;
	}

	protected afterUpdate(
		resp: unknown,
		doc: Document,
		options: CrudOptions<Document>,
	): void | Promise<void> {}

	protected beforeUnique(
		doc: Document,
		options: CrudOptions<Document>,
	): Document | Promise<Document> {
		return doc;
	}

	protected afterUnique(
		resp: unknown,
		doc: Document,
		options: CrudOptions<Document>,
	): void | Promise<void> {}

	protected beforeDelete(
		doc: Document,
		options: CrudOptions<Document>,
	): Document | Promise<Document> {
		return doc;
	}

	protected afterDelete(
		resp: unknown,
		doc: Document,
		options: CrudOptions<Document>,
	): void | Promise<void> {}

	protected beforeFetch(query: object, options: CrudOptions<Document>): object | Promise<object> {
		return query;
	}

	protected afterFetch(
		resp: unknown,
		query: object,
		options: CrudOptions<Document>,
	): void | Promise<void> {}

	/**
	 * Small helper to normalize sync/async hooks.
	 */
	private _mw<T>(value: T | Promise<T>): Promise<T> {
		return Promise.resolve(value);
	}

	/**
	 * Runs an operation immediately and replays its result to later subscribers.
	 */
	private _hot<T>(run: (subject: ReplaySubject<T>) => void | Promise<void>): Observable<T> {
		const subject = new ReplaySubject<T>(1);

		void Promise.resolve(run(subject)).catch(err => subject.error(err));

		return subject.asObservable();
	}

	/**
	 * Fetches a list of documents from the API with optional pagination.
	 *
	 * @param config - Optional pagination configuration.
	 * @param options - Optional callback and error handling configuration.
	 * @returns An observable that resolves with the list of documents.
	 */
	get(config: GetConfig = {}, options: CrudOptions<Document> = {}): Observable<Document[]> {
		if (!this.__networkService.isOnline()) {
			return new Observable(observer => {
				this._onOnline.push(() => {
					this.get(config, options).subscribe(observer);
				});
			});
		}

		if (this._isBrowser && !this._config.unauthorized && localStorage.getItem('waw_user')) {
			const user = JSON.parse(localStorage.getItem('waw_user') as string);

			localStorage.setItem(this._config.name + 'waw_user_id', user._id);
		}

		const url = `${this._url}/get${options.name || ''}`;

		const params =
			(typeof config.page === 'number' || config.query ? '?' : '') +
			(config.query || '') +
			(typeof config.page === 'number'
				? `&skip=${this._perPage * (config.page - 1)}&limit=${this._perPage}`
				: '');

		const obs = this.__httpService.get(`${url}${params}`);

		obs.subscribe({
			next: (resp: unknown): void => {
				resp = resp || [];

				if (typeof config.page !== 'number') {
					this.clearDocs();
				}

				(resp as Document[]).forEach(doc => this.addDoc(doc));

				if (options.callback) {
					options.callback(resp as Document[]);
				}
			},
			error: (err: unknown): void => {
				if (options.errCallback) {
					options.errCallback(err);
				}
			},
		});

		return obs as Observable<Document[]>;
	}

	/**
	 * Sends a request to the API to create a new document.
	 *
	 * @param doc - The document to create.
	 * @param options - Optional callback and error handling configuration.
	 * @returns An observable that resolves with the created document, or emits an error if already created.
	 */
	create(
		doc: Document = {} as Document,
		options: CrudOptions<Document> = {},
	): Observable<Document> {
		return this._hot<Document>(async subject => {
			doc = ((await this._mw(this.beforeCreate(doc, options))) || doc) as Document;

			if (doc._id) {
				this.update(doc, options).subscribe(subject);

				return;
			}

			doc._localId ||= this._localId();

			doc.__options ||= {};
			doc.__options['create'] = options;

			this.addDoc(doc);

			if (!this.__networkService.isOnline()) {
				this._onOnline.push(() => {
					this.create(doc, options).subscribe(subject);
				});

				return;
			}

			if (doc.__creating) {
				subject.error(new Error('Document is currently already creating.'));

				return;
			}

			if (this._config.appId) {
				doc.appId = this._config.appId;
			}

			doc.__creating = true;

			const obs = this.__httpService.post(
				`${this._url}/create${options.name || ''}`,
				doc,
			) as Observable<Document>;

			obs.subscribe({
				next: resp => {
					if (resp) {
						this.__coreService.copy(resp, doc);
						doc.__creating = false;

						this.addDoc(doc);

						if (options.callback) options.callback(doc);

						void this._mw(this.afterCreate(resp, doc, options));
					} else {
						doc.__creating = false;

						if (options.errCallback) options.errCallback(resp);
					}

					subject.next(resp);
				},
				error: (err: unknown) => {
					doc.__creating = false;
					if (options.errCallback) options.errCallback(err);
					subject.error(err);
				},
				complete: () => subject.complete(),
			});
		});
	}

	/**
	 * Fetches a document from the API based on a query.
	 *
	 * @param query - The query object used to filter documents.
	 * @param options - Optional callback and error handling configuration.
	 * @returns An observable that resolves with the fetched document.
	 */
	fetch(query: object = {}, options: CrudOptions<Document> = {}): Observable<Document> {
		return this._hot<Document>(async subject => {
			query = ((await this._mw(this.beforeFetch(query, options))) || query) as object;

			if (!this.__networkService.isOnline()) {
				this._onOnline.push(() => {
					this.fetch(query, options).subscribe(subject);
				});

				return;
			}

			const obs = this.__httpService.post(
				`${this._url}/fetch${options.name || ''}`,
				query,
			) as Observable<Document>;

			obs.subscribe({
				next: doc => {
					if (doc) {
						this.addDoc(doc);

						if (options.callback) options.callback(doc);

						void this._mw(this.afterFetch(doc, query, options));
					} else {
						if (options.errCallback) options.errCallback(doc);
					}

					subject.next(doc);
				},
				error: (err: unknown) => {
					if (options.errCallback) options.errCallback(err);
					subject.error(err);
				},
				complete: () => subject.complete(),
			});
		});
	}

	/**
	 * Updates a document after a specified delay and returns an observable.
	 *
	 * @param doc - The document to update.
	 * @param options - Optional callback and error handling configuration.
	 * @returns An observable that emits the updated document.
	 */
	updateAfterWhile(doc: Document, options: CrudOptions<Document> = {}): Observable<Document> {
		return new Observable<Document>(observer => {
			this.__coreService.afterWhile(this._id(doc), () => {
				this.update(doc, options).subscribe({
					next: updatedDoc => {
						observer.next(updatedDoc); // Emit the updated document
					},
					error: err => {
						observer.error(err); // Forward the error
					},
					complete: () => {
						observer.complete(); // Complete the observable
					},
				});
			});
		});
	}

	/**
	 * Updates a document in the API.
	 *
	 * @param doc - The document to update.
	 * @param options - Optional callback and error handling configuration.
	 * @returns An observable that resolves with the updated document.
	 */
	update(doc: Document, options: CrudOptions<Document> = {}): Observable<Document> {
		return this._hot<Document>(async subject => {
			doc = ((await this._mw(this.beforeUpdate(doc, options))) || doc) as Document;

			doc = this._updateModified(doc, 'up' + (options.name || ''), options);

			if (!this.__networkService.isOnline()) {
				this._onOnline.push(() => {
					this.update(doc, options).subscribe(subject);
				});

				return;
			}

			const obs = this.__httpService.post(
				`${this._url}/update${options.name || ''}`,
				doc,
			) as Observable<Document>;

			obs.subscribe({
				next: resp => {
					if (resp) {
						this._removeModified(doc, 'up' + (options.name || ''));

						this.__coreService.copy(resp, doc);
						this.getSignal(doc._id as string).set({ ...resp });

						if (options.callback) options.callback(doc);

						void this._mw(this.afterUpdate(resp, doc, options));
					} else {
						if (options.errCallback) options.errCallback(resp);
					}

					subject.next(resp);
				},
				error: (err: unknown) => {
					if (options.errCallback) options.errCallback(err);
					subject.error(err);
				},
				complete: () => subject.complete(),
			});
		});
	}

	/**
	 * Unique update a document field in the API.
	 *
	 * @param doc - The document to update.
	 * @param options - Optional callback and error handling configuration.
	 * @returns An observable that resolves with the updated document.
	 */
	unique(doc: Document, options: CrudOptions<Document> = {}): Observable<Document> {
		return this._hot<Document>(async subject => {
			doc = ((await this._mw(this.beforeUnique(doc, options))) || doc) as Document;

			doc = this._updateModified(doc, 'un' + (options.name || ''), options);

			if (!this.__networkService.isOnline()) {
				this._onOnline.push(() => {
					this.unique(doc, options).subscribe(subject);
				});

				return;
			}

			const obs = this.__httpService.post(
				`${this._url}/unique${options.name || ''}`,
				doc,
			) as Observable<Document>;

			obs.subscribe({
				next: resp => {
					if (resp) {
						this._removeModified(doc, 'un' + (options.name || ''));

						(doc as any)[options.name as string] = resp;

						this._syncSignalForDoc(doc);

						if (options.callback) options.callback(doc);

						void this._mw(this.afterUnique(resp, doc, options));
					} else {
						if (options.errCallback) options.errCallback(resp);
					}

					subject.next(resp);
				},
				error: (err: unknown) => {
					if (options.errCallback) options.errCallback(err);
					subject.error(err);
				},
				complete: () => subject.complete(),
			});
		});
	}

	/**
	 * Deletes a document from the API.
	 *
	 * @param doc - The document to delete.
	 * @param options - Optional callback and error handling configuration.
	 * @returns An observable that resolves with the deleted document.
	 */
	delete(doc: Document, options: CrudOptions<Document> = {}): Observable<Document> {
		return this._hot<Document>(async subject => {
			doc = ((await this._mw(this.beforeDelete(doc, options))) || doc) as Document;

			doc.__deleted = true;

			doc.__options ||= {};
			doc.__options['delete'] = options;

			this.addDoc(doc);

			if (!this.__networkService.isOnline()) {
				this._onOnline.push(() => {
					this.delete(doc, options).subscribe(subject);
				});

				return;
			}

			const obs = this.__httpService.post(
				`${this._url}/delete${options.name || ''}`,
				doc,
			) as Observable<Document>;

			obs.subscribe({
				next: resp => {
					if (resp) {
						const signal = this._resolveSignal(doc);
						if (signal) {
							this._documentSignals.update(documents =>
								documents.filter(document => document !== signal),
							);
						}

						this._syncSignalForDoc({
							...doc,
							__deleted: true,
						} as Document);

						this.setDocs();

						if (options.callback) options.callback(doc);

						void this._mw(this.afterDelete(resp, doc, options));
					} else {
						if (options.errCallback) options.errCallback(resp);
					}

					subject.next(resp);
				},
				error: (err: unknown) => {
					if (options.errCallback) options.errCallback(err);
					subject.error(err);
				},
				complete: () => subject.complete(),
			});
		});
	}

	/**
	 * Track pending fetch-by-id requests to avoid duplicate calls.
	 */
	private _fetchingId: Record<string, boolean> = {};

	/**
	 * Queue of operations that must be retried when network comes back online.
	 */
	private _onOnline: (() => void)[] = [];

	/**
	 * Local counter used to build unique local identifiers together with Date.now().
	 */
	private _randomCount = 0;

	/**
	 * Generates a unique ID for a document when using local-only identifiers.
	 *
	 * @returns The unique ID as a number.
	 */
	private _localId() {
		return Number(Date.now() + '' + this._randomCount++);
	}

	/**
	 * Returns all cache keys that can identify a document signal.
	 */
	private _getSignalIds(doc: Document): string[] {
		const ids = [
			this._id(doc),
			typeof doc._localId === 'number' ? doc._localId.toString() : undefined,
		].filter((id): id is string => !!id);

		return [...new Set(ids)];
	}

	/**
	 * Returns the configured identity field for the given document as string.
	 *
	 * @param doc - The document for which to generate the ID.
	 * @returns The unique ID as a string.
	 */
	private _id(doc: Document): string {
		return (doc as unknown as Record<string, unknown>)[
			this._config._id || '_id'
		]?.toString() as string;
	}

	/**
	 * Marks a document as modified for a given operation id and
	 * keeps the document in the store until the operation is confirmed.
	 */
	private _updateModified(doc: Document, id: string, options: CrudOptions<Document>): Document {
		const signal = this._resolveSignal(doc);
		const target = signal ? signal() : doc;

		target.__modified ||= [];

		target.__options ||= {};

		target.__options[id] = options;

		if (!target.__modified.includes(id)) {
			target.__modified.push(id);
		}

		this._syncSignalForDoc(target);
		this.addDoc(target);

		return target;
	}

	/**
	 * Removes a modification mark from the document once the
	 * server operation is confirmed.
	 */
	private _removeModified(doc: Document, id: string) {
		doc.__modified ||= [];

		if (doc.__modified.find(m => m === id)) {
			doc.__modified.splice(
				doc.__modified.findIndex(m => m === id),
				1,
			);

			this.addDoc(doc);
		}
	}

	/**
	 * Syncs a single document signal with the latest plain object data.
	 */
	private _syncSignalForDoc(doc: Document) {
		const ids = this._getSignalIds(doc);
		const existingSignal = ids.map(id => this._signal[id]).find(signal => !!signal);

		if (existingSignal) {
			existingSignal.update(current => {
				this.__coreService.copy(doc, current);

				return current;
			});

			this.__coreService.copy(existingSignal(), doc);
			this._registerSignal(existingSignal, existingSignal());

			for (const id of ids) {
				delete this._detachedSignals[id];
			}
		}
	}

	private _registerSignal(signal: WritableSignal<Document>, doc: Document) {
		for (const id of this._getSignalIds(doc)) {
			this._signal[id] = signal;
		}
	}

	private _resolveSignal(doc: Document) {
		return this._getSignalIds(doc)
			.map(id => this._signal[id] || this._detachedSignals[id])
			.find(signal => !!signal);
	}

	private _materializeSignal(doc: Document): WritableSignal<Document> {
		const signal =
			this._resolveSignal(doc) ||
			(this.__coreService.toSignal(doc, this._config.signalFields) as WritableSignal<Document>);

		signal.update(current => {
			this.__coreService.copy(doc, current);

			return current;
		});

		this.__coreService.copy(signal(), doc);
		this._registerSignal(signal, signal());

		for (const id of this._getSignalIds(signal())) {
			delete this._detachedSignals[id];
		}

		return signal;
	}

	private _dedupeSignals(signals: WritableSignal<Document>[]) {
		return signals.filter((signal, index) => signals.indexOf(signal) === index);
	}
}
