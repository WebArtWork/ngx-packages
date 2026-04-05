import { spawnSync } from 'node:child_process';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const _rootDir = path.resolve(__dirname, '..');
const _ngCliPath = path.join(_rootDir, 'node_modules', '@angular', 'cli', 'bin', 'ng.js');

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
	'ngx-ui'
];

const _failedLibs = [];

for (const _lib of _libs) {
	console.log(`\n=== Building ${_lib} ===`);

	const _result = spawnSync(process.execPath, [_ngCliPath, 'build', _lib], {
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
