# ngx-ui

`ngx-ui` is a focused Angular package for SSR-safe theme state.

It currently exposes:

- `provideTheme()`
- `ThemeService`
- `ThemeMode`, `ThemeDensity`, and `ThemeRadius`

## Install

```bash
npm i --save ngx-ui
```

## Bootstrap

```ts
import { provideTheme } from 'ngx-ui';

export const appConfig = {
	providers: [provideTheme()],
};
```

## Use the service

```ts
import { inject } from '@angular/core';
import { ThemeService } from 'ngx-ui';

const themeService = inject(ThemeService);

themeService.setMode('dark');
themeService.setDensity('comfortable');
themeService.setRadius('rounded');
```

`ThemeService` restores persisted values on the client, applies `data-mode`, `data-density`, and `data-radius` to the document root, and stays SSR-safe by guarding browser-only APIs.
