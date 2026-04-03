# ngx-tinymce

`ngx-tinymce` is the extracted TinyMCE feature package from the Web Art Work Angular workspace.

## Install

```bash
npm i --save ngx-tinymce
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
