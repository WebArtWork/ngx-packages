import {
	EnvironmentProviders,
	inject,
	makeEnvironmentProviders,
	provideEnvironmentInitializer,
} from '@angular/core';
import { STARTUP_CONFIG, STARTUP_TASKS, StartupConfig, StartupTask } from './startup.interface';
import { StartupService } from './startup.service';

/**
 * Enables the startup screen: it is released after the first render once every registered task
 * has settled, or after `config.timeout` (10s by default). Needs the screen markup and inline
 * script in `index.html` plus `@wawjs/ngx-ui/startup.css` (see the ngx-ui README).
 */
export function provideStartup(config: StartupConfig = {}): EnvironmentProviders {
	return makeEnvironmentProviders([
		{ provide: STARTUP_CONFIG, useValue: config },
		provideEnvironmentInitializer(() => inject(StartupService).start()),
	]);
}

/**
 * Adds a named task the startup screen waits for, e.g.
 * `provideStartupTask('user', () => inject(UserService).whenLoaded())`.
 */
export function provideStartupTask(name: string, task: StartupTask): EnvironmentProviders {
	return makeEnvironmentProviders([{ provide: STARTUP_TASKS, multi: true, useValue: { name, task } }]);
}
