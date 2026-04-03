# ngx-crud

`ngx-crud` extracts the `CrudService` and `CrudComponent` feature from `ngx-core` into a focused Angular package.

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

## Exports

- `provideNgxCrud`
- `CrudService`
- `CrudComponent`
- `CrudDocument`
- `CrudOptions`
- `CrudConfig`
- `GetConfig`
- `TableConfig`
