import { spawnSync } from 'node:child_process';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const _rootDir = path.resolve(__dirname, '..');
const _ngCliPath = path.join(_rootDir, 'node_modules', '@angular', 'cli', 'bin', 'ng.js');

const _apps = [
	'ngx-datetime-app',
	'ngx-core-app',
	'ngx-app',
	'ngx-ace-app',
	'ngx-fabric-app',
	'ngx-http-app',
	'ngx-crud-app',
	'ngx-socket-app',
	'ngx-rtc-app',
	'ngx-translate-app',
	'ngx-tinymce-app',
	'ngx-ui-app'
];

const _failedApps = [];

for (const _app of _apps) {
	console.log(`\n=== Building ${_app} ===`);

	const _result = spawnSync(process.execPath, [_ngCliPath, 'build', _app], {
		stdio: 'inherit',
		shell: false
	});

	if (_result.error || _result.status !== 0) {
		if (_result.error) {
			console.error(`Failed to start build for ${_app}: ${_result.error.message}`);
		}

		_failedApps.push(_app);
	}
}

if (_failedApps.length > 0) {
	console.error('\nApp build check failed.');
	console.error(`Failed apps: ${_failedApps.join(', ')}`);
	process.exit(1);
}

console.log('\nAll app builds passed.');
