import { execFileSync, spawnSync } from 'node:child_process';
import { existsSync, readFileSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const _rootDir = path.resolve(__dirname, '..');
const _rootPackageJsonPath = path.join(_rootDir, 'package.json');
const _ngCliPath = path.join(_rootDir, 'node_modules', '@angular', 'cli', 'bin', 'ng.js');
const _libraries = [
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
].map((_projectName) => ({
	projectName: _projectName,
	packageJsonPath: path.join(_rootDir, 'projects', _projectName, 'package.json'),
	distDir: path.join(_rootDir, 'dist', _projectName)
}));

function _readJson(_filePath) {
	return JSON.parse(readFileSync(_filePath, 'utf8'));
}

function _writeJson(_filePath, _value) {
	writeFileSync(_filePath, `${JSON.stringify(_value, null, '\t')}\n`);
}

function _runNpm(_args, _cwd) {
	if (process.platform === 'win32') {
		execFileSync('cmd.exe', ['/d', '/s', '/c', 'npm.cmd', ..._args], {
			cwd: _cwd,
			stdio: 'inherit'
		});
		return;
	}

	execFileSync('npm', _args, {
		cwd: _cwd,
		stdio: 'inherit'
	});
}

function _buildLibrary(_projectName) {
	const _result = spawnSync(process.execPath, [_ngCliPath, 'build', _projectName], {
		cwd: _rootDir,
		stdio: 'inherit',
		shell: false
	});

	if (_result.error) {
		throw _result.error;
	}

	if (_result.status !== 0) {
		throw new Error(`Build exited with code ${_result.status}`);
	}
}

function _getRootVersion() {
	return _readJson(_rootPackageJsonPath).version;
}

function _setVersion(_packageJsonPath, _version) {
	if (!existsSync(_packageJsonPath)) {
		throw new Error(`Missing package file: ${_packageJsonPath}`);
	}

	const _packageJson = _readJson(_packageJsonPath);
	_packageJson.version = _version;
	_writeJson(_packageJsonPath, _packageJson);
}

function _incrementPatchVersion(_version) {
	const _match = /^(\d+)\.(\d+)\.(\d+)$/.exec(_version);

	if (!_match) {
		throw new Error(`Unsupported version format: ${_version}`);
	}

	const [, _major, _minor, _patch] = _match;
	return `${_major}.${_minor}.${Number(_patch) + 1}`;
}

if (process.env.npm_command === 'publish') {
	console.error('Use "npm run publish" at the repo root. Do not run "npm publish" here.');
	process.exit(1);
}

if (!existsSync(_rootPackageJsonPath)) {
	console.error(`Missing root package file: ${_rootPackageJsonPath}`);
	process.exit(1);
}

if (!existsSync(_ngCliPath)) {
	console.error(`Missing Angular CLI entry point: ${_ngCliPath}`);
	process.exit(1);
}

const _publishVersion = _getRootVersion();
const _nextVersion = _incrementPatchVersion(_publishVersion);
const _failedLibraries = [];

console.log(`Publishing libraries with version ${_publishVersion}`);

for (const _library of _libraries) {
	_setVersion(_library.packageJsonPath, _publishVersion);
}

for (const _library of _libraries) {
	console.log(`\n=== Building ${_library.projectName} ${_publishVersion} ===`);

	try {
		_buildLibrary(_library.projectName);
	} catch (_error) {
		const _message = _error instanceof Error ? _error.message : String(_error);
		console.error(`Build failed for ${_library.projectName}: ${_message}`);
		_failedLibraries.push({
			projectName: _library.projectName,
			distDir: _library.distDir,
			reason: `build failed: ${_message}`
		});
		continue;
	}

	if (!existsSync(_library.distDir)) {
		console.error(`Build output not found for ${_library.projectName}: ${_library.distDir}`);
		_failedLibraries.push({
			projectName: _library.projectName,
			distDir: _library.distDir,
			reason: 'build output missing'
		});
		continue;
	}

	console.log(`Publishing ${_library.distDir}`);

	try {
		_runNpm(['publish', _library.distDir], _rootDir);
	} catch (_error) {
		const _message = _error instanceof Error ? _error.message : String(_error);
		console.error(`Publish failed for ${_library.projectName}: ${_message}`);
		console.error(`Publish ${_library.projectName} manually from ${_library.distDir}`);
		_failedLibraries.push({
			projectName: _library.projectName,
			distDir: _library.distDir,
			reason: `publish failed: ${_message}`
		});
	}
}

console.log(`\nBumping source version to ${_nextVersion}`);
_setVersion(_rootPackageJsonPath, _nextVersion);

for (const _library of _libraries) {
	_setVersion(_library.packageJsonPath, _nextVersion);
}

if (_failedLibraries.length > 0) {
	console.error('\nSome libraries were not published automatically.');

	for (const _library of _failedLibraries) {
		console.error(`- ${_library.projectName}: ${_library.reason}`);
		console.error(`  Publish manually: npm publish ${_library.distDir}`);
	}

	process.exitCode = 1;
} else {
	console.log('\nAll libraries were published successfully.');
}
