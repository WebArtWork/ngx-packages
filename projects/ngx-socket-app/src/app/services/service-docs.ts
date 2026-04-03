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
		slug: 'socket-service',
		name: 'SocketService',
		description:
			'Socket.IO client wrapper for SSR-safe connection setup, event binding, and realtime emits.',
		summary:
			'SocketService centralizes client-side realtime connection logic around `config.socket` and `config.io`. It resolves the target URL from app config, opens the client only in the browser, coordinates connection state, and forwards lifecycle events through EmitterService.',
		highlights: [
			'Reads `socket` and `io` from provideNgxSocket() configuration instead of hardcoding client setup in components.',
			'Completes the `socket` task on connect and emits `socket_disconnect` and `socket_error` events through EmitterService.',
			'Queues `on()` and `emit()` calls until the socket is connected.',
		],
		config: [
			'Configure with provideNgxSocket({ socket, io }).',
			'`io` should be the Socket.IO client factory or module export.',
			'`socket` can be `true` for default origin connection or an object with `url`, `port`, and `opts`.',
		],
		availableItems: ['config.interface.ts', 'socket.service.ts', 'provide-ngx-socket.ts'],
		properties: [
			{
				name: 'SocketConfig',
				signature: 'interface SocketConfig',
				description:
					'Configuration contract for overriding the socket endpoint URL, port, and client options.',
				category: 'Configuration',
				docType: 'Interface',
				sourceFile: 'config.interface.ts',
			},
			{
				name: 'Config',
				signature: 'interface Config',
				description:
					'Package-wide configuration contract used by provideNgxSocket() for `socket` and `io` settings.',
				category: 'Configuration',
				docType: 'Interface',
				sourceFile: 'config.interface.ts',
			},
			{
				name: 'CONFIG_TOKEN',
				signature: 'InjectionToken<Config>',
				description:
					'Injection token used internally to read resolved ngx-socket configuration.',
				category: 'Configuration',
				docType: 'Const',
				sourceFile: 'config.interface.ts',
			},
			{
				name: 'DEFAULT_CONFIG',
				signature: 'const DEFAULT_CONFIG: Config',
				description:
					'Default ngx-socket configuration used when provideNgxSocket() is called without overrides.',
				category: 'Configuration',
				docType: 'Const',
				sourceFile: 'config.interface.ts',
			},
		],
		methods: [
			{
				name: 'provideNgxSocket',
				signature: 'provideNgxSocket(config?: Config): EnvironmentProviders',
				description: 'Registers the shared config consumed by SocketService.',
				category: 'Bootstrap',
				docType: 'Const',
				sourceFile: 'provide-ngx-socket.ts',
				example: `import { provideNgxSocket } from 'ngx-socket';
import { io } from 'socket.io-client';

export const appConfig = {
	providers: [
		provideNgxSocket({
			socket: { url: 'https://realtime.example.com' },
			io,
		}),
	],
};`,
			},
			{
				name: 'setUrl',
				signature: 'setUrl(url: string): void',
				description:
					'Sets the socket endpoint URL, enables socket config if needed, and reconnects in the browser.',
				category: 'Configuration',
				sourceFile: 'socket.service.ts',
			},
			{
				name: 'disconnect',
				signature: 'disconnect(): void',
				description:
					'Disconnects the active socket client and resets internal connection state.',
				category: 'Lifecycle',
				sourceFile: 'socket.service.ts',
			},
			{
				name: 'on',
				signature: 'on(to: string, cb?: (message: any) => void): void',
				description:
					'Subscribes to a socket event once the client is available and connected.',
				details: [
					'When called before connect, it retries until the socket is ready.',
					'Logs a warning and returns when socket support is not configured.',
				],
				category: 'Events',
				sourceFile: 'socket.service.ts',
				example: `import { SocketService } from 'ngx-socket';

private readonly _socketService = inject(SocketService);

ngOnInit() {
	this._socketService.on('project:updated', project => {
		console.log('project updated', project);
	});
}`,
			},
			{
				name: 'emit',
				signature: 'emit(to: string, message: any, room = false): void',
				description: 'Emits a payload to a socket event after the client is connected.',
				details: ['When called before connect, it retries until the socket is ready.'],
				category: 'Events',
				sourceFile: 'socket.service.ts',
			},
		],
		sections: [
			{
				title: 'Feature role',
				items: [
					'Use SocketService when the app already depends on Socket.IO and wants connection setup centralized under provideNgxSocket().',
					'The service resolves its browser endpoint lazily and never opens the client during SSR.',
					'EmitterService receives socket lifecycle events so other parts of the app can react without wiring directly into the client instance.',
				],
			},
		],
		code: `import { SocketService } from 'ngx-socket';

private readonly _socketService = inject(SocketService);

sendTyping() {
	this._socketService.emit('chat:typing', { room: 'project-42' });
}`,
	},
];

export const serviceDocMap = new Map(serviceDocs.map(doc => [doc.slug, doc]));
