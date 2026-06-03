# @wawjs/ngx-rtc

Angular WebRTC helper package from Web Art Work.

`ngx-rtc` extracts the WebRTC peer and local media helpers from the older all-in-one package into a focused Angular package.

## License

[MIT](LICENSE)

## Installation

```bash
npm i --save @wawjs/ngx-rtc
```

## Usage

```ts
import { provideNgxRtc } from '@wawjs/ngx-rtc';

export const appConfig = {
	providers: [provideNgxRtc()],
};
```

## Available Features

| Name | Description |
| --- | --- |
| `RtcService` | WebRTC helper for local media, peers, offers, answers, and ICE candidates |
| `provideNgxRtc` | Environment provider for package setup |
| `Config` | Public configuration type |

## Rtc Service

`RtcService` wraps local media stream creation and peer connection lifecycle.

### Methods

- `initLocalStream(): Promise<MediaStream>`
- `createPeer(id: string): Promise<RTCPeerConnection>`
- `getPeer(id: string): RTCPeerConnection | undefined`
- `createOffer(id: string): Promise<RTCSessionDescriptionInit>`
- `createAnswer(id: string, offer: RTCSessionDescriptionInit): Promise<RTCSessionDescriptionInit>`
- `setRemoteAnswer(id: string, answer: RTCSessionDescriptionInit): Promise<void>`
- `addIceCandidate(id: string, candidate: RTCIceCandidateInit): void`
- `getLocalStream(): MediaStream | null`
- `closePeer(id: string): void`
- `closeAll(): void`

Example:

```ts
import { RtcService } from '@wawjs/ngx-rtc';

constructor(private rtcService: RtcService) {}

async connect(id: string) {
	await this.rtcService.initLocalStream();
	await this.rtcService.createPeer(id);
	const offer = await this.rtcService.createOffer(id);
	console.log(offer);
}
```

## SSR Safety

`RtcService` guards browser-only APIs. Methods that require a browser runtime throw during SSR instead of touching WebRTC globals directly.

## AI Coding Agents

This package includes [AI.md](AI.md) with copyable instructions for Codex, Claude Code, Cursor, and other coding agents.

Copy this into the consuming project's `AGENTS.md`, `CLAUDE.md`, or equivalent file:

```md
- This Angular project uses `@wawjs/ngx-rtc` for WebRTC peer and local media helpers.
- Import public APIs from `@wawjs/ngx-rtc`.
- Prefer bootstrapping with `provideNgxRtc()` in application providers.
- Prefer `RtcService` for local stream initialization, peer management, offers, answers, and ICE candidate handling before adding direct WebRTC utilities.
- Keep SSR-safe behavior intact. Do not add unguarded access to `navigator.mediaDevices`, `RTCPeerConnection`, or related browser-only globals outside the service.
```
