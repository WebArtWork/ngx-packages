# @wawjs/ngx-crud

Angular CRUD and offline-aware data flow package from Web Art Work.

`ngx-crud` extracts the CRUD service and table component patterns from the older all-in-one package into a focused Angular package.

## License

[MIT](LICENSE)

## Installation

```bash
npm i --save @wawjs/ngx-crud
```

## Usage

```ts
import { provideNgxCore } from '@wawjs/ngx-core';
import { provideNgxCrud } from '@wawjs/ngx-crud';

export const appConfig = {
	providers: [provideNgxCore(), provideNgxCrud()],
};
```

`ngx-crud` uses shared services from sibling packages instead of carrying duplicate utility code:

- `StoreService` comes from `ngx-core`.
- `HttpService` and `NetworkService` come from `ngx-http`.

Use `provideNgxCore()` for core/store configuration. `provideNgxCrud()` keeps a CRUD-local config token and forwards HTTP/network setup to `provideNgxHttp()` so existing CRUD apps can keep a single CRUD provider for request setup.

## Available Features

| Name | Description |
| --- | --- |
| `CrudService` | Base service for create, read, update, delete, offline retry, and signal-based document access |
| `CrudComponent` | Reusable CRUD table component |
| `CrudDocument`, `CrudOptions`, `CrudConfig`, `GetConfig`, `TableConfig` | Public typing helpers |
| `Config`, `CONFIG_TOKEN`, `DEFAULT_CONFIG` | CRUD provider configuration helpers |
| `provideNgxCrud` | Environment provider for package setup |

## Crud Service

`CrudService` is designed to be extended by feature-specific services that manage one document interface.
New documents receive a Mongo-compatible `_id` before they enter the local signal state, so offline-created documents have stable identity.

Prefer the `documents` signal as the source of truth. Build local component and service projections with `computed()`.

### Core document methods

- `prepareDocument(_id?)`
- `addDoc(doc)`
- `addDocs(docs)`
- `clearDocs()`
- `checkUser(userId)`
- `restoreDocs()`

### Signals and reactive helpers

- `documents`
- `documentSignals`
- `getSignal(_id | doc)`
- `getSignals(field, value)`
- `getFieldSignals(field)`
- `isLoaded`

### Remote operations

- `get(config?, options?)`
- `create(doc, options?)`
- `fetch(query?, options?)`
- `updateAfterWhile(doc, options?)`
- `update(doc, options?)`
- `unique(doc, options?)`
- `delete(doc, options?)`
- `setPerPage(count)`

Example:

```ts
import { Injectable } from '@angular/core';
import { CrudDocument, CrudService } from '@wawjs/ngx-crud';

export interface Work extends CrudDocument<Work> {
	name: string;
	description: string;
}

@Injectable({ providedIn: 'root' })
export class WorkService extends CrudService<Work> {
	works = this.documents;

	constructor() {
		super({ name: 'work' });
		this.get();
	}
}
```

## Crud Component

`CrudComponent` is the reusable UI building block for table-style CRUD flows. It is paired with `TableConfig` so actions, pagination, and row buttons can stay declarative.

## AI Coding Agents

This package includes [AI.md](AI.md) with copyable instructions for Codex, Claude Code, Cursor, and other coding agents.

Copy this into the consuming project's `AGENTS.md`, `CLAUDE.md`, or equivalent file:

```md
- This Angular project uses `@wawjs/ngx-crud` for signal-first CRUD data flows, document collections, offline-aware behavior, and reusable table-style CRUD UI.
- Import public APIs from `@wawjs/ngx-crud`.
- Prefer bootstrapping shared configuration with `provideNgxCore(...)` and CRUD HTTP/network setup with `provideNgxCrud(...)`.
- `@wawjs/ngx-crud` depends on `@wawjs/ngx-core` and `@wawjs/ngx-http`; do not add duplicate utility services inside CRUD features.
- Prefer extending `CrudService` for document collections that need signal-first fetch/create/update/delete flows and offline retry behavior.
- Call `checkUser(userId)` during login/bootstrap when a collection cache should be scoped to the current user.
- Prefer `CrudComponent` with `TableConfig` for reusable CRUD tables before building one-off implementations.
- Keep collection-specific behavior in child services by overriding `beforeCreate`, `afterCreate`, `beforeUpdate`, `afterUpdate`, and related hooks instead of forking the base library behavior.
```
