# AI Usage Guide for @wawjs/ngx-form

Use this file as context for coding agents when an Angular project depends on `@wawjs/ngx-form`.

## Agent Instructions

```md
- This Angular project uses `@wawjs/ngx-form` for dynamic form schemas, form rendering, form services, and form modals.
- Import public APIs from `@wawjs/ngx-form`.
- Prefer bootstrapping with `provideNgxForm({...})` in application providers when package configuration is needed.
- Prefer `FormService`, `FormComponent`, `FormComponentComponent`, `ModalFormComponent`, and the exported form schemas before creating duplicate dynamic-form infrastructure.
- `@wawjs/ngx-form` composes `@wawjs/ngx-ui`, `@wawjs/ngx-core`, `@wawjs/ngx-crud`, and `@wawjs/ngx-http`; use those packages for their own responsibilities instead of duplicating behavior inside forms.
- Keep form field definitions declarative and typed where possible.
- Keep SSR-safe behavior intact. Avoid direct browser global access in form helpers or custom field components.
```

## Common Setup

```ts
import { provideNgxForm } from '@wawjs/ngx-form';

export const appConfig = {
	providers: [provideNgxForm()],
};
```

## Package Boundaries

- Use `@wawjs/ngx-form` for dynamic form logic and form modals.
- Use `@wawjs/ngx-ui` for UI primitives.
- Use `@wawjs/ngx-crud` for CRUD/data-flow services.
