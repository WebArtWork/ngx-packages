import { execFileSync, spawnSync } from 'node:child_process';
import { existsSync, readFileSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const _rootDir = path.resolve(__dirname, '..');
const _rootPackageJsonPath = path.join(_rootDir, 'package.json');
const _ngCliPath = path.join(_rootDir, 'node_modules', '@angular', 'cli', 'bin', 'ng.js');
const _libraryNames = [
	'ngx-core',
	'ngx-http',
	'ngx-crud',
	'ngx-ace',
	'ngx-fabric',
	'ngx-datetime',
	'ngx-socket',
	'ngx-rtc',
	'ngx-translate',
	'ngx-tinymce',
	'ngx-ui'
];
const _libraries = _libraryNames.map((_projectName) => ({
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

function _parseArgs(_args) {
	const _options = {
		access: '',
		dryRun: false,
		noBump: false,
		otp: '',
		registry: '',
		tag: ''
	};

	for (let _index = 0; _index < _args.length; _index += 1) {
		const _arg = _args[_index];

		if (_arg === '--dry-run') {
			_options.dryRun = true;
		} else if (_arg === '--no-bump') {
			_options.noBump = true;
		} else if (_arg === '--tag') {
			_options.tag = _readOptionValue(_args, _index, _arg);
			_index += 1;
		} else if (_arg.startsWith('--tag=')) {
			_options.tag = _arg.slice('--tag='.length);
		} else if (_arg === '--otp') {
			_options.otp = _readOptionValue(_args, _index, _arg);
			_index += 1;
		} else if (_arg.startsWith('--otp=')) {
			_options.otp = _arg.slice('--otp='.length);
		} else if (_arg === '--registry') {
			_options.registry = _readOptionValue(_args, _index, _arg);
			_index += 1;
		} else if (_arg.startsWith('--registry=')) {
			_options.registry = _arg.slice('--registry='.length);
		} else if (_arg === '--access') {
			_options.access = _readOptionValue(_args, _index, _arg);
			_index += 1;
		} else if (_arg.startsWith('--access=')) {
			_options.access = _arg.slice('--access='.length);
		} else if (_arg === '--help' || _arg === '-h') {
			_printUsage();
			process.exit(0);
		} else {
			throw new Error(`Unknown option: ${_arg}`);
		}
	}

	return _options;
}

function _readOptionValue(_args, _index, _arg) {
	const _value = _args[_index + 1];

	if (!_value || _value.startsWith('--')) {
		throw new Error(`Missing value for ${_arg}`);
	}

	return _value;
}

function _printUsage() {
	console.log(`Usage: npm run publish -- [options]

Options:
  --dry-run          Build and run npm publish with --dry-run, without bumping versions.
  --no-bump          Do not bump source versions after a successful publish.
  --tag <tag>        Publish with an npm dist-tag.
  --otp <code>       Pass an npm one-time password.
  --registry <url>   Publish to a specific npm registry.
  --access <value>   Pass npm publish access, usually public or restricted.
`);
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

function _setPackageVersion(_packageJsonPath, _version) {
	const _packageJson = _readJson(_packageJsonPath);
	_packageJson.version = _version;
	_syncInternalWawRanges(_packageJson, _version);
	_writeJson(_packageJsonPath, _packageJson);
}

function _syncInternalWawRanges(_packageJson, _version) {
	const _wawPackageNames = new Set(_libraries.map((_library) => _readJson(_library.packageJsonPath).name));

	for (const _dependencyKey of ['dependencies', 'peerDependencies', 'optionalDependencies', 'devDependencies']) {
		const _dependencies = _packageJson[_dependencyKey];

		if (!_dependencies) {
			continue;
		}

		for (const _packageName of Object.keys(_dependencies)) {
			if (_wawPackageNames.has(_packageName)) {
				_dependencies[_packageName] = `>=${_version}`;
			}
		}
	}
}

function _incrementPatchVersion(_version) {
	const _match = /^(\d+)\.(\d+)\.(\d+)$/.exec(_version);

	if (!_match) {
		throw new Error(`Unsupported version format: ${_version}`);
	}

	const [, _major, _minor, _patch] = _match;
	return `${_major}.${_minor}.${Number(_patch) + 1}`;
}

function _validateSetup(_publishVersion) {
	if (!existsSync(_rootPackageJsonPath)) {
		throw new Error(`Missing root package file: ${_rootPackageJsonPath}`);
	}

	if (!existsSync(_ngCliPath)) {
		throw new Error(`Missing Angular CLI entry point: ${_ngCliPath}`);
	}

	_incrementPatchVersion(_publishVersion);

	for (const _library of _libraries) {
		if (!existsSync(_library.packageJsonPath)) {
			throw new Error(`Missing package file: ${_library.packageJsonPath}`);
		}
	}
}

function _syncSourcePackages(_version) {
	_setPackageVersion(_rootPackageJsonPath, _version);

	for (const _library of _libraries) {
		_setPackageVersion(_library.packageJsonPath, _version);
	}
}

function _buildLibraries(_publishVersion) {
	const _failedLibraries = [];

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
		}
	}

	return _failedLibraries;
}

function _createPublishArgs(_library, _options) {
	const _args = ['publish', _library.distDir];

	if (_options.dryRun) {
		_args.push('--dry-run');
	}

	if (_options.tag) {
		_args.push('--tag', _options.tag);
	}

	if (_options.otp) {
		_args.push('--otp', _options.otp);
	}

	if (_options.registry) {
		_args.push('--registry', _options.registry);
	}

	if (_options.access) {
		_args.push('--access', _options.access);
	}

	return _args;
}

function _publishLibraries(_options) {
	const _failedLibraries = [];

	for (const _library of _libraries) {
		console.log(`\nPublishing ${_library.distDir}`);

		try {
			_runNpm(_createPublishArgs(_library, _options), _rootDir);
		} catch (_error) {
			const _message = _error instanceof Error ? _error.message : String(_error);
			console.error(`Publish failed for ${_library.projectName}: ${_message}`);
			_failedLibraries.push({
				projectName: _library.projectName,
				distDir: _library.distDir,
				reason: `publish failed: ${_message}`
			});
		}
	}

	return _failedLibraries;
}

function _printFailures(_title, _failedLibraries) {
	console.error(`\n${_title}`);

	for (const _library of _failedLibraries) {
		console.error(`- ${_library.projectName}: ${_library.reason}`);
		console.error(`  Retry manually: npm publish ${_library.distDir}`);
	}
}

try {
	if (process.env.npm_command === 'publish') {
		throw new Error('Use "npm run publish" at the repo root. Do not run "npm publish" here.');
	}

	const _options = _parseArgs(process.argv.slice(2));
	const _publishVersion = _getRootVersion();
	const _nextVersion = _incrementPatchVersion(_publishVersion);

	_validateSetup(_publishVersion);

	console.log(`Publishing libraries with version ${_publishVersion}`);

	if (_options.dryRun) {
		console.log('Dry run enabled: npm publish will receive --dry-run and source versions will not be bumped.');
	}

	_syncSourcePackages(_publishVersion);

	const _buildFailures = _buildLibraries(_publishVersion);

	if (_buildFailures.length > 0) {
		_printFailures('Publishing stopped because one or more builds failed.', _buildFailures);
		process.exit(1);
	}

	const _publishFailures = _publishLibraries(_options);

	if (_publishFailures.length > 0) {
		_printFailures('Some libraries were not published automatically. Source versions were not bumped.', _publishFailures);
		process.exit(1);
	}

	if (_options.dryRun) {
		console.log('\nDry run completed successfully. Source versions were not bumped.');
	} else if (_options.noBump) {
		console.log('\nAll libraries were published successfully. Source versions were left unchanged because --no-bump was used.');
	} else {
		console.log(`\nBumping source version to ${_nextVersion}`);
		_syncSourcePackages(_nextVersion);
		console.log('\nAll libraries were published successfully.');
	}
} catch (_error) {
	const _message = _error instanceof Error ? _error.message : String(_error);
	console.error(_message);
	process.exit(1);
}
