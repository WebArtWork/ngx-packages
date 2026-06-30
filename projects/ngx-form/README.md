# @wawjs/ngx-form

Dynamic form schema, form renderer, and form modal services for Angular applications by Web Art Work.

`ngx-form` composes `@wawjs/ngx-ui`, `@wawjs/ngx-core`, `@wawjs/ngx-crud`, and `@wawjs/ngx-http` to provide a complete, schema-driven form system with built-in modal integration.

## License

[MIT](LICENSE)

## Installation

```bash
npm i --save @wawjs/ngx-form
```

## Setup

```ts
import { provideNgxForm } from '@wawjs/ngx-form';

export const appConfig = {
  providers: [
    provideNgxForm(),
  ],
};
```

Override default modal components or supply a custom modal service:

```ts
provideNgxForm({
  modalFormComponent: CustomFormModalComponent,
  modalUniqueComponent: CustomUniqueModalComponent,
})
```

## Available Exports

| Name | Description |
|------|-------------|
| `provideNgxForm()` | Environment provider for package setup |
| `FormService` | Schema-driven form state and field lifecycle management |
| `FormComponentService` | Form component instance registry |
| `FormComponent` | Standalone dynamic form renderer |
| `FormComponentComponent` | Embeddable form component renderer |
| `ModalFormComponent` | Default modal wrapper for form schemas |
| `ModalUniqueComponent` | Default modal wrapper for unique-value form flows |
| `NgxFormConfig` | Provider configuration interface |
| `NgxFormModal` | Modal descriptor interface |
| `NGX_FORM_CONFIG` | Injection token for runtime config access |

## NgxFormConfig

| Property | Type | Description |
|----------|------|-------------|
| `appId` | `string` | Optional application identifier scoping form state |
| `modalService` | `NgxFormModalService` | Alternative modal service for displaying form modals |
| `modalFormComponent` | `Type<unknown>` | Custom component to use as the form modal wrapper |
| `modalUniqueComponent` | `Type<unknown>` | Custom component for unique-value modal flows |

## NgxFormModal

Passed to the modal service `show()` method when opening form modals:

| Property | Type | Description |
|----------|------|-------------|
| `component` | `Type<unknown>` | The modal content component |
| `class` | `string` | CSS class applied to the modal host |
| `panelClass` | `string` | CSS class applied to the modal content panel |
| `size` | `'small' \| 'mid' \| 'big' \| 'full'` | Modal size variant |
| `onClose` | `() => void` | Callback fired when the modal closes |
| `[x: string]` | `unknown` | Additional data passed through to the component |

## Package Boundaries

- `@wawjs/ngx-form` — dynamic form logic, field schemas, form services, and form modal flows.
- `@wawjs/ngx-ui` — UI primitives (inputs, buttons, select, modal) consumed inside form fields and form modals.
- `@wawjs/ngx-crud` — CRUD/data-flow services used for form data sources and submissions.
- `@wawjs/ngx-http` — HTTP request behavior for form submissions and remote data loading.
- `@wawjs/ngx-core` — SSR-safe base services, store, and metadata utilities.

## AI Coding Agents

This package includes [AI.md](AI.md) with copyable instructions for Claude Code, Cursor, Copilot, and other coding agents.

Copy the agent instructions block into your project's `AGENTS.md`, `CLAUDE.md`, or equivalent file:

```md
- This Angular project uses `@wawjs/ngx-form` for dynamic form schemas, form rendering, form services, and form modals.
- Import public APIs from `@wawjs/ngx-form`.
- Prefer `provideNgxForm({...})` in application providers when package configuration is needed.
- Prefer `FormService`, `FormComponent`, `FormComponentComponent`, `ModalFormComponent`, and exported form schemas before creating duplicate dynamic-form infrastructure.
- `@wawjs/ngx-form` composes `@wawjs/ngx-ui`, `@wawjs/ngx-core`, `@wawjs/ngx-crud`, and `@wawjs/ngx-http`. Use those packages for their own responsibilities rather than duplicating their behavior inside form logic.
- Keep form field definitions declarative and typed. Avoid imperative DOM manipulation in form helpers or custom field components.
- Keep SSR safety intact. Avoid direct browser global access in form helpers or custom field components.
```
