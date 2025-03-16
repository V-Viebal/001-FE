import {
	NgModule
} from '@angular/core';
import {
	MissingTranslationHandler,
	TranslateLoader,
	TranslateModule,
	TranslateStore
} from '@ngx-translate/core';

import {
	CustomMissingTranslationHandler,
	WEBPACK_TRANSLATE_SOURCE,
	WebpackTranslateLoader,
	WebpackTranslateSource
} from './loaders';
import {
	CONSTANT
} from './resources';

const webpackSources: WebpackTranslateSource[] = [];

export function I18n(
	source?: WebpackTranslateSource
): ClassDecorator {
	return function f() {
		webpackSources.push( source );
	};
}

@NgModule({
	imports: [
		TranslateModule.forRoot({
			defaultLanguage: CONSTANT.LOCALE,
			loader: {
				provide: TranslateLoader,
				useClass: WebpackTranslateLoader,
				deps: [ WEBPACK_TRANSLATE_SOURCE ],
			},
			missingTranslationHandler: {
				provide: MissingTranslationHandler,
				useClass: CustomMissingTranslationHandler,
			},
		}),
	],
	exports: [
		TranslateModule,
	],
	declarations: [],
	providers: [
		TranslateStore,
		{
			provide: WEBPACK_TRANSLATE_SOURCE,
			useValue: webpackSources,
		},
	],
})
export class I18nTranslateModule {}
