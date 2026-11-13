import { Service, WritableSignal, signal } from '@angular/core';
import {
	BehaviorSubject,
	Observable,
	Subject,
	combineLatest,
	filter,
	map,
	merge,
	take,
	takeUntil,
	timeout,
} from 'rxjs';

type Any = unknown;

@Service()
export class EmitterService {
	/**
	 * One hot Subject per event channel. Subjects (not signals) back `on()` so
	 * every `emit()` is delivered synchronously, multiple emits in the same tick
	 * are not collapsed, and subscribing does not require an injection context.
	 */
	private _channels = new Map<string, Subject<Any>>();

	private _getChannel(id: string): Subject<Any> {
		let channel = this._channels.get(id);
		if (!channel) {
			channel = new Subject<Any>();
			this._channels.set(id, channel);
		}
		return channel;
	}

	/** Emit an event */
	emit<T = Any>(id: string, data?: T): void {
		this._getChannel(id).next(data as Any);
	}

	/** Listen for events (hot, completes when off(id) is called) */
	on<T = Any>(id: string): Observable<T> {
		return this._getChannel(id).asObservable() as Observable<T>;
	}

	/** Complete and remove a channel */
	off(id: string): void {
		const channel = this._channels.get(id);
		if (channel) {
			this._channels.delete(id);
			channel.complete();
		}
	}

	offAll(): void {
		for (const id of Array.from(this._channels.keys())) this.off(id);
	}

	has(id: string): boolean {
		return this._channels.has(id);
	}

	private _done = new Map<string, WritableSignal<Any | undefined>>();
	private _done$ = new Map<string, BehaviorSubject<Any | undefined>>();

	private _getDoneSignal(id: string): WritableSignal<Any | undefined> {
		let s = this._done.get(id);
		if (!s) {
			s = signal<Any | undefined>(undefined);
			this._done.set(id, s);
		}
		return s;
	}

	private _getDoneSubject(id: string): BehaviorSubject<Any | undefined> {
		let s = this._done$.get(id);
		if (!s) {
			s = new BehaviorSubject<Any | undefined>(this._getDoneSignal(id)());
			this._done$.set(id, s);
		}
		return s;
	}

	private _setDone(id: string, value: Any | undefined): void {
		this._getDoneSignal(id).set(value);
		this._done$.get(id)?.next(value);
	}

	/** Mark task as completed with a payload (default: true) */
	complete<T = Any>(task: string, value: T = true as unknown as T): void {
		this._setDone(task, value as Any);
	}

	/** Clear completion so it can be awaited again */
	clearCompleted(task: string): void {
		this._setDone(task, undefined);
	}

	/** Read current completion payload (undefined => not completed) */
	completed(task: string): Any | undefined {
		return this._getDoneSignal(task)();
	}

	isCompleted(task: string): boolean {
		return this._getDoneSignal(task)() !== undefined;
	}

	onComplete(
		tasks: string | string[],
		opts?: {
			mode?: 'all' | 'any';
			timeoutMs?: number;
			abort?: AbortSignal;
		},
	): Observable<Any | Any[]> {
		const list = (Array.isArray(tasks) ? tasks : [tasks]).filter(Boolean);
		const streams = list.map(id =>
			this._getDoneSubject(id).pipe(
				filter((v): v is Any => v !== undefined),
				map(v => v as Any),
			),
		);

		let source$: Observable<Any | Any[]>;

		if (list.length <= 1) {
			// single-task await
			source$ = streams[0]?.pipe(take(1)) ?? new Observable<never>();
		} else if (opts?.mode === 'any') {
			source$ = merge(...streams).pipe(take(1));
		} else {
			source$ = combineLatest(streams).pipe(take(1));
		}

		if (opts?.timeoutMs && Number.isFinite(opts.timeoutMs)) {
			source$ = source$.pipe(timeout({ first: opts.timeoutMs }));
		}

		if (opts?.abort) {
			const abort$ = new Observable<void>(sub => {
				const handler = () => {
					sub.next();
					sub.complete();
				};
				opts.abort!.addEventListener('abort', handler);
				return () => opts.abort!.removeEventListener('abort', handler);
			});
			source$ = source$.pipe(takeUntil(abort$));
		}

		return source$;
	}
}
