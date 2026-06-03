import { spawnSync } from 'node:child_process';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const _rootDir = path.resolve(__dirname, '..');
const _ngCommand = process.platform === 'win32' ? 'cmd.exe' : 'npx';
const _ngArgs = process.platform === 'win32' ? ['/d', '/s', '/c', 'npx.cmd', 'ng'] : ['ng'];

const _libs = [
	'ngx-ace',
	'ngx-fabric',
	'ngx-core',
	'ngx-datetime',
	'ngx-http',
	'ngx-crud',
	'ngx-socket',
	'ngx-rtc',
	'ngx-translate',
	'ngx-tinymce',
	'ngx-ui',
	'ngx-form',
	'ngx-map'
];

const _failedLibs = [];

for (const _lib of _libs) {
	console.log(`\n=== Building ${_lib} ===`);

	const _result = spawnSync(_ngCommand, [..._ngArgs, 'build', _lib], {
		cwd: _rootDir,
		stdio: 'inherit',
		shell: false
	});

	if (_result.error || _result.status !== 0) {
		if (_result.error) {
			console.error(`Failed to start build for ${_lib}: ${_result.error.message}`);
		}

		_failedLibs.push(_lib);
	}
}

if (_failedLibs.length > 0) {
	console.error('\nLibrary build check failed.');
	console.error(`Failed libs: ${_failedLibs.join(', ')}`);
	process.exit(1);
}

console.log('\nAll library builds passed.');
