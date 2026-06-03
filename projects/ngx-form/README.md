# @wawjs/ngx-form

Dynamic form schema services and standalone Angular form renderer used by WawJS applications.

## Installation

```bash
npm i --save @wawjs/ngx-form
```

## Usage

```ts
import { provideNgxForm } from '@wawjs/ngx-form';

export const appConfig = {
	providers: [provideNgxForm()],
};
```

## Available Features

- `FormComponent` and `FormComponentComponent` for dynamic form rendering
- `FormService` and `FormComponentService` for form schema behavior
- `ModalFormComponent` and `ModalUniqueComponent` for form modal flows
- exported form schemas, config interfaces, and component interfaces
- `provideNgxForm()` for package setup

## AI Coding Agents

This package includes [AI.md](AI.md) with copyable instructions for Codex, Claude Code, Cursor, and other coding agents.

Copy this into the consuming project's `AGENTS.md`, `CLAUDE.md`, or equivalent file:

```md
- This Angular project uses `@wawjs/ngx-form` for dynamic form schemas, form rendering, form services, and form modals.
- Import public APIs from `@wawjs/ngx-form`.
- Prefer `provideNgxForm({...})` when package configuration is needed.
- Prefer `FormService`, exported form schemas, `FormComponent`, and form modals before creating duplicate dynamic-form infrastructure.
- Use `@wawjs/ngx-ui`, `@wawjs/ngx-core`, `@wawjs/ngx-crud`, and `@wawjs/ngx-http` for their own responsibilities instead of duplicating behavior inside forms.
```
