/*
 *	Core
 */
export * from './src/core/core.prototype';
export * from './src/core/core.service';
export * from './src/core/core.type';
export * from './src/core/config.interface';
export * from './src/core/click-outside.directive';
export * from './src/core/arr.pipe';
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
 *	Theme
 */
export * from './src/theme/provide-theme';
export * from './src/theme/theme.service';
export * from './src/theme/theme.type';

/*
 *	Meta
 */
export * from './src/meta/meta.guard';
export * from './src/meta/meta.interface';
export * from './src/meta/meta.service';

/*
 *	Network
 */
export * from './src/network/network.interface';
export * from './src/network/network.service';

/*
 *	Http
 */
export * from './src/http/http.interface';
export * from './src/http/http.service';

/*
 *	Rtc
 */
export * from './src/rtc/rtc.service';

/*
 *	Socket
 */
export * from './src/socket/socket.service';

/*
 *	Crud
 */
export * from './src/crud/crud.component';
export * from './src/crud/crud.interface';
export * from './src/crud/crud.service';

/*
 *	Translate
 */
export * from './src/translate/provide-translate';
export * from './src/translate/translate.directive';
export * from './src/translate/translate.interface';
export * from './src/translate/translate.pipe';
export * from './src/translate/translate.service';
export * from './src/translate/translate.type';

/*
 *	Language
 */
export * from './src/language/language.const';
export * from './src/language/language.interface';
export * from './src/language/language.service';
export * from './src/language/provide-language';

/*
 *	Datetime
 */
export * from './src/datetime/time.service';

/*
 *	Initial
 *
 *	make different kind of modules, one which import all, other for piece by piece
 */
export * from './src/provide-ngx-core';
/*
 *	End of Support
 */
