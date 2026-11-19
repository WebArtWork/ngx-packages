import { TranslateFirebaseFirestore } from '@wawjs/ngx-translate-firebase';

/**
 * A tiny in-memory stand-in for Firestore, so the demo works without a Firebase project.
 * In a real app return the helpers of `firebase/firestore` instead (see the package README).
 */
export function createMemoryFirestore(seed: Record<string, unknown[]> = {}): TranslateFirebaseFirestore {
	const collections = new Map<string, Map<string, unknown>>();
	let nextId = 1;

	const table = (path: string) => {
		let rows = collections.get(path);

		if (!rows) {
			rows = new Map((seed[path] ?? []).map((data) => [`seed-${nextId++}`, data]));
			collections.set(path, rows);
		}

		return rows;
	};

	return {
		db: {},
		collection: (_db, path) => ({ path }),
		doc: (_db, path, id) => ({ path, id }),
		getDocs: async (col) => ({
			docs: [...table(col.path)].map(([id, data]) => ({ id, data: () => data })),
		}),
		addDoc: async (col, data) => {
			const id = `doc-${nextId++}`;

			table(col.path).set(id, data);

			return { id };
		},
		setDoc: async (ref, data) => void table(ref.path).set(ref.id, data),
		deleteDoc: async (ref) => void table(ref.path).delete(ref.id),
	};
}
