/*
 *	Core
 */
export * from './src/core/arr.pipe';
export * from './src/core/click-outside.directive';
export * from './src/core/config.interface';
export * from './src/core/core.prototype';
export * from './src/core/core.service';
export * from './src/core/core.type';
export * from './src/core/mongodate.pipe';
export * from './src/core/number.pipe';
export * from './src/core/pagination.pipe';
export * from './src/core/safe.pipe';
export * from './src/core/search.pipe';
export * from './src/core/splice.pipe';
export * from './src/core/split.pipe';
export * from './src/core/util.service';

/*
 *	Dom
 */
export * from './src/dom/dom.interface';
export * from './src/dom/dom.service';

/*
 *	Emitter
 */
export * from './src/emitter/emitter.service';

/*
 *	Store
 */
export * from './src/store/store.interface';
export * from './src/store/store.service';

/*
 *	Meta
 */
export * from './src/meta/meta.guard';
export * from './src/meta/meta.interface';
export * from './src/meta/meta.service';

/*
 *	Initial
 *
 *	make different kind of modules, one which import all, other for piece by piece
 */
export * from './src/provide-ngx-core';
/*
 *	End of Support
 */
