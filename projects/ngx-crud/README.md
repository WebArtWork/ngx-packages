# ngx-crud

Angular CRUD and offline-aware data flow package from Web Art Work.

`ngx-crud` extracts the CRUD service and table component patterns from the older all-in-one package into a focused Angular package.

## License

[MIT](LICENSE)

## Installation

```bash
npm i --save ngx-crud
```

## Usage

```ts
import { provideNgxCrud } from 'ngx-crud';

export const appConfig = {
	providers: [provideNgxCrud()],
};
```

`provideNgxCrud()` registers the package config token and Angular `HttpClient` with `fetch` support.

## Available Features

| Name | Description |
| --- | --- |
| `CrudService` | Base service for create, read, update, delete, offline retry, and signal-based document access |
| `CrudComponent` | Reusable CRUD table component |
| `CrudDocument`, `CrudOptions`, `CrudConfig`, `GetConfig`, `TableConfig` | Public typing helpers |
| `provideNgxCrud` | Environment provider for package setup |

## Crud Service

`CrudService` is designed to be extended by feature-specific services that manage a particular document type.

### Core document methods

- `new(doc?)`
- `doc(_id)`
- `getDocs(filter?)`
- `getDoc(find)`
- `addDoc(doc)`
- `addDocs(docs)`
- `clearDocs()`
- `setDocs()`
- `restoreDocs()`

### Signals and reactive helpers

- `getSignal(_id | doc)`
- `getSignals(field, value)`
- `getFieldSignals(field)`
- `removeSignals(exceptIds?)`
- `loaded`
- `getted`

### Remote operations

- `get(config?, options?)`
- `create(doc, options?)`
- `fetch(query?, options?)`
- `updateAfterWhile(doc, options?)`
- `update(doc, options?)`
- `unique(doc, options?)`
- `delete(doc, options?)`
- `setPerPage(count)`
- `filteredDocuments(storeObjectOrArray, config?)`

Example:

```ts
import { Injectable } from '@angular/core';
import { CrudDocument, CrudService } from 'ngx-crud';

export interface Work extends CrudDocument<Work> {
	name: string;
	description: string;
}

@Injectable({ providedIn: 'root' })
export class WorkService extends CrudService<Work> {
	works = this.getDocs();

	constructor() {
		super({ name: 'work' });
		this.get();
	}
}
```

## Crud Component

`CrudComponent` is the reusable UI building block for table-style CRUD flows. It is paired with `TableConfig` so actions, pagination, and row buttons can stay declarative.

## AGENTS.md

Copy this into your project `AGENTS.md` when using `ngx-crud`:

```md
- This project uses `ngx-crud`, an Angular utility library for CRUD data flows and reusable table behavior.
- Prefer bootstrapping with `provideNgxCrud()` in application providers.
- Prefer extending `CrudService` for document collections that need fetch/create/update/delete flows, offline retry behavior, and reactive document access.
- Prefer `CrudComponent` with `TableConfig` for reusable CRUD tables before building one-off implementations.
- Keep collection-specific behavior in child services by overriding `beforeCreate`, `afterCreate`, `beforeUpdate`, `afterUpdate`, and related hooks instead of forking the base library behavior.
```
