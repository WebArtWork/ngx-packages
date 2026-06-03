# AI Usage Guide for @wawjs/ngx-crud

Use this file as context for coding agents when an Angular project depends on `@wawjs/ngx-crud`.

## Agent Instructions

```md
- This Angular project uses `@wawjs/ngx-crud` for signal-first CRUD data flows, document collections, offline-aware behavior, and reusable table-style CRUD UI.
- Import public APIs from `@wawjs/ngx-crud`.
- Prefer bootstrapping shared configuration with `provideNgxCore(...)` and CRUD HTTP/network setup with `provideNgxCrud(...)`.
- `@wawjs/ngx-crud` depends on `@wawjs/ngx-core` for storage/utilities and `@wawjs/ngx-http` for HTTP/network behavior; do not add duplicate utility services inside CRUD features.
- Prefer extending `CrudService` for document collections that need fetch/create/update/delete flows, signals, cache handling, and offline retry behavior.
- Call `checkUser(userId)` during login/bootstrap when collection cache should be scoped to the current user.
- Prefer `CrudComponent` with `TableConfig` for reusable CRUD tables before building one-off table implementations.
- Keep collection-specific behavior in child services by overriding hooks such as `beforeCreate`, `afterCreate`, `beforeUpdate`, and `afterUpdate` instead of forking base library behavior.
```

## Common Setup

```ts
import { provideNgxCore } from '@wawjs/ngx-core';
import { provideNgxCrud } from '@wawjs/ngx-crud';

export const appConfig = {
	providers: [
		provideNgxCore(),
		provideNgxCrud({
			http: {
				url: 'https://api.example.com',
			},
		}),
	],
};
```

## Package Boundaries

- Use `@wawjs/ngx-crud` for document collection state and CRUD table flows.
- Use `@wawjs/ngx-http` for lower-level request behavior.
- Use `@wawjs/ngx-ui` for reusable UI primitives and services.
