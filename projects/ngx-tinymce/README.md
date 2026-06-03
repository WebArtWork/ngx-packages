# @wawjs/ngx-tinymce

`ngx-tinymce` is the extracted TinyMCE feature package from the Web Art Work Angular workspace.

## Install

```bash
npm i --save @wawjs/ngx-tinymce
```

## Bootstrap

```ts
import { provideNgxTinymce } from '@wawjs/ngx-tinymce';

export const appConfig = {
	providers: [
		provideNgxTinymce({
			baseURL: '/assets/tinymce/',
			fileName: 'tinymce.min.js',
			config: {
				menubar: false,
				plugins: 'lists link code table',
				toolbar: 'undo redo | bold italic | bullist numlist | code',
			},
		}),
	],
};
```

## Exports

- `TinymceComponent` for form-friendly editor embedding
- `provideNgxTinymce()` and `provideTinymce()` for app-level defaults
- `TINYMCE_CONFIG` and `TinymceConfig` for advanced configuration access
- editor instance and option interfaces for typed integrations

## Notes

- The component is SSR-safe and only touches the TinyMCE global in the browser.
- TinyMCE script loading is lazy; configure `baseURL` and `fileName` to match where you host the editor assets.
- Per-instance `config` input merges over the defaults registered with `provideNgxTinymce()`.

## AI Coding Agents

This package includes [AI.md](AI.md) with copyable instructions for Codex, Claude Code, Cursor, and other coding agents.

Copy this into the consuming project's `AGENTS.md`, `CLAUDE.md`, or equivalent file:

```md
- This Angular project uses `@wawjs/ngx-tinymce` for TinyMCE editor integration.
- Import public APIs from `@wawjs/ngx-tinymce`.
- Prefer `provideNgxTinymce({...})` for editor defaults.
- Prefer `TinymceComponent` before adding another TinyMCE wrapper.
- Configure TinyMCE asset loading with `baseURL` and `fileName`.
- Keep browser-only editor behavior SSR-safe.
```
