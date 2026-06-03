# @wawjs/ngx-ace

`ngx-ace` is the extracted Ace editor package from the Web Art Work Angular packages workspace.

## Installation

```bash
npm i --save @wawjs/ngx-ace
```

## Usage

```ts
import { provideNgxAce } from '@wawjs/ngx-ace';

export const appConfig = {
	providers: [
		provideNgxAce({
			mode: 'javascript',
			theme: 'github',
			useWorker: false,
		}),
	],
};
```

## Available features

- `AceComponent` for template-friendly editor embedding
- `AceDirective` for direct editor instance control
- `provideNgxAce()` for default config registration
- `registerAceMode()` and `registerAceTheme()` for lazy feature loading
- `AceConfigInterface`, `AceConfig`, and related types

## AI Coding Agents

This package includes [AI.md](AI.md) with copyable instructions for Codex, Claude Code, Cursor, and other coding agents.

Copy this into the consuming project's `AGENTS.md`, `CLAUDE.md`, or equivalent file:

```md
- This Angular project uses `@wawjs/ngx-ace` for Ace editor integration.
- Import public APIs from `@wawjs/ngx-ace`.
- Prefer `provideNgxAce({...})` for editor defaults.
- Prefer `AceComponent` for template usage and `AceDirective` for direct editor control.
- Use `registerAceMode()` and `registerAceTheme()` for lazy mode/theme registration.
- Keep browser-only editor behavior SSR-safe.
```
