# AI Usage Guide for @wawjs/ngx-rtc

Use this file as context for coding agents when an Angular project depends on `@wawjs/ngx-rtc`.

## Agent Instructions

```md
- This Angular project uses `@wawjs/ngx-rtc` for WebRTC peer and local media helpers.
- Import public APIs from `@wawjs/ngx-rtc`.
- Prefer bootstrapping with `provideNgxRtc()` in application providers.
- Prefer `RtcService` for local stream initialization, peer management, offers, answers, ICE candidates, and connection cleanup before adding direct WebRTC utilities.
- Keep SSR-safe behavior intact. Do not add unguarded access to `navigator.mediaDevices`, `RTCPeerConnection`, `MediaStream`, or related browser-only globals outside the service.
```

## Common Setup

```ts
import { provideNgxRtc } from '@wawjs/ngx-rtc';

export const appConfig = {
	providers: [provideNgxRtc()],
};
```

## Package Boundaries

- Use `@wawjs/ngx-rtc` for local media and WebRTC peer lifecycle behavior.
- Keep signaling transport in the app or in `@wawjs/ngx-socket` when Socket.IO is used.
