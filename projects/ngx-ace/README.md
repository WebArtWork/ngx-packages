# ngx-ace

`ngx-ace` is the extracted Ace editor package from the Web Art Work Angular packages workspace.

## Installation

```bash
npm i --save ngx-ace
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
