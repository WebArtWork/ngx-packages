import { spawnSync } from 'node:child_process';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const _rootDir = path.resolve(__dirname, '..');
const _ngCommand = process.platform === 'win32' ? 'cmd.exe' : 'npx';
const _ngArgs = process.platform === 'win32' ? ['/d', '/s', '/c', 'npx.cmd', 'ng'] : ['ng'];

const _apps = [
	'ngx-datetime-app',
	'ngx-core-app',
	'ngx-ace-app',
	'ngx-fabric-app',
	'ngx-http-app',
	'ngx-crud-app',
	'ngx-socket-app',
	'ngx-rtc-app',
	'ngx-translate-app',
	'ngx-tinymce-app',
	'ngx-ui-app',
	'ngx-form-app',
	'ngx-map-app'
];

const _failedApps = [];

for (const _app of _apps) {
	console.log(`\n=== Building ${_app} ===`);

	const _result = spawnSync(_ngCommand, [..._ngArgs, 'build', _app], {
		cwd: _rootDir,
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
