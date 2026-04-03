export interface ServiceMethodDoc {
	name: string;
	signature: string;
	description: string;
	details?: string[];
	example?: string;
	category?: string;
	docType?: 'Service' | 'Component' | 'Interface' | 'Type' | 'Const';
	sourceFile?: string;
}

export interface ServiceSectionDoc {
	title: string;
	items: string[];
	example?: string;
}

export interface ServiceDoc {
	slug: string;
	name: string;
	description: string;
	summary: string;
	highlights: string[];
	config?: string[];
	availableItems?: string[];
	properties?: ServiceMethodDoc[];
	methods: ServiceMethodDoc[];
	sections?: ServiceSectionDoc[];
	code: string;
}

export const serviceDocs: ServiceDoc[] = [
	{
		slug: 'rtc-service',
		name: 'RtcService',
		description:
			'SSR-guarded WebRTC helper for local media, peer creation, and offer/answer negotiation.',
		summary:
			'RtcService centralizes common WebRTC setup in one injectable feature. It initializes local camera and microphone access, keeps peer connections keyed by caller-defined ids, and wraps the core offer/answer flow without exposing browser-only APIs directly to every component.',
		highlights: [
			'Guards browser-only WebRTC access and throws clearly during SSR.',
			'Stores one local MediaStream and reuses its tracks across created peers.',
			'Covers the basic signaling lifecycle: peer creation, offers, answers, remote answers, ICE candidates, and cleanup.',
		],
		config: [
			'Configure with provideNgxRtc() to keep RTC setup isolated from the host app bootstrap.',
			'The current Config contract is intentionally minimal and reserved for future package-wide options.',
			'Browser permissions for camera and microphone are requested when initLocalStream() runs.',
		],
		availableItems: ['config.interface.ts', 'rtc.service.ts', 'provide-ngx-rtc.ts'],
		properties: [
			{
				name: 'Config',
				signature: 'interface Config',
				description:
					'Package-wide configuration contract used by provideNgxRtc() for future extension without changing the bootstrap shape.',
				category: 'Configuration',
				docType: 'Interface',
				sourceFile: 'config.interface.ts',
			},
			{
				name: 'CONFIG_TOKEN',
				signature: 'InjectionToken<Config>',
				description:
					'Injection token used internally to read resolved ngx-rtc configuration.',
				category: 'Configuration',
				docType: 'Const',
				sourceFile: 'config.interface.ts',
			},
			{
				name: 'DEFAULT_CONFIG',
				signature: 'const DEFAULT_CONFIG: Config',
				description:
					'Default ngx-rtc configuration used when provideNgxRtc() is called without overrides.',
				category: 'Configuration',
				docType: 'Const',
				sourceFile: 'config.interface.ts',
			},
		],
		methods: [
			{
				name: 'provideNgxRtc',
				signature: 'provideNgxRtc(config?: Config): EnvironmentProviders',
				description: 'Registers the shared config consumed by RtcService.',
				category: 'Bootstrap',
				docType: 'Const',
				sourceFile: 'provide-ngx-rtc.ts',
				example: `import { provideNgxRtc } from 'ngx-rtc';

export const appConfig = {
	providers: [
		provideNgxRtc(),
	],
};`,
			},
			{
				name: 'initLocalStream',
				signature: 'initLocalStream(): Promise<MediaStream>',
				description:
					'Requests camera and microphone access once and caches the local stream for later peer setup.',
				details: [
					'Throws during SSR because navigator.mediaDevices is browser-only.',
					'Subsequent calls return the existing stream instead of prompting again.',
				],
				category: 'Media',
				sourceFile: 'rtc.service.ts',
				example: `import { RtcService } from 'ngx-rtc';

private readonly _rtcService = inject(RtcService);

async startPreview() {
	const stream = await this._rtcService.initLocalStream();
	this.localVideo.nativeElement.srcObject = stream;
}`,
			},
			{
				name: 'createPeer',
				signature: 'createPeer(id: string): Promise<RTCPeerConnection>',
				description:
					'Creates and stores a peer connection, attaching local tracks when a stream is already available.',
				category: 'Peers',
				sourceFile: 'rtc.service.ts',
			},
			{
				name: 'getPeer',
				signature: 'getPeer(id: string): RTCPeerConnection | undefined',
				description: 'Returns a previously created peer connection by id.',
				category: 'Peers',
				sourceFile: 'rtc.service.ts',
			},
			{
				name: 'createOffer',
				signature: 'createOffer(id: string): Promise<RTCSessionDescriptionInit>',
				description:
					'Creates an SDP offer for an existing peer and stores it as the local description.',
				category: 'Negotiation',
				sourceFile: 'rtc.service.ts',
			},
			{
				name: 'createAnswer',
				signature:
					'createAnswer(id: string, offer: RTCSessionDescriptionInit): Promise<RTCSessionDescriptionInit>',
				description:
					'Applies a remote offer, creates an SDP answer, and stores it as the local description.',
				category: 'Negotiation',
				sourceFile: 'rtc.service.ts',
			},
			{
				name: 'setRemoteAnswer',
				signature:
					'setRemoteAnswer(id: string, answer: RTCSessionDescriptionInit): Promise<void>',
				description: 'Applies the remote answer to a previously created local-offer peer.',
				category: 'Negotiation',
				sourceFile: 'rtc.service.ts',
			},
			{
				name: 'addIceCandidate',
				signature: 'addIceCandidate(id: string, candidate: RTCIceCandidateInit): void',
				description: 'Adds a remote ICE candidate to an existing peer connection.',
				category: 'Negotiation',
				sourceFile: 'rtc.service.ts',
			},
			{
				name: 'getLocalStream',
				signature: 'getLocalStream(): MediaStream | null',
				description: 'Returns the cached local media stream when one has been initialized.',
				category: 'Media',
				sourceFile: 'rtc.service.ts',
			},
			{
				name: 'closePeer',
				signature: 'closePeer(id: string): void',
				description:
					'Closes one peer connection and removes it from the internal peer map.',
				category: 'Cleanup',
				sourceFile: 'rtc.service.ts',
			},
			{
				name: 'closeAll',
				signature: 'closeAll(): void',
				description:
					'Closes every peer connection, stops local media tracks, and clears cached RTC state.',
				category: 'Cleanup',
				sourceFile: 'rtc.service.ts',
			},
		],
		sections: [
			{
				title: 'Feature role',
				items: [
					'Use RtcService to keep WebRTC browser APIs behind one SSR-safe Angular service.',
					'The service focuses on peer and media primitives and leaves signaling transport to the host app.',
					'Peer ids are chosen by the caller so app-level session logic stays outside the library.',
				],
			},
		],
		code: `import { RtcService } from 'ngx-rtc';

private readonly _rtcService = inject(RtcService);

async startCall(id: string) {
	await this._rtcService.initLocalStream();
	await this._rtcService.createPeer(id);

	const offer = await this._rtcService.createOffer(id);
	console.log(offer);
}`,
	},
];

export const serviceDocMap = new Map(serviceDocs.map(doc => [doc.slug, doc]));
