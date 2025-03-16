import {
	Injectable,
	ModuleWithProviders,
	NgModule
} from '@angular/core';
import {
	coerceArray
} from '@angular/cdk/coercion';
import {
	MissingTranslationHandler,
	TranslateLoader,
	TranslateModule,
	TranslateModuleConfig,
	USE_EXTEND,
	USE_STORE
} from '@ngx-translate/core';
import { of, Observable } from 'rxjs';
import { delay } from 'rxjs/operators';

import {
	CustomMissingTranslationHandler,
	WEBPACK_TRANSLATE_SOURCE,
	WebpackTranslateLoader,
	WebpackTranslateSource
} from './loaders';
import { LocaleService } from './services';
import { CONSTANT } from './resources';

const sources: WebpackTranslateSource[] = [];

@Injectable()
export class LazyTranslateGuard {

	/**
	 * @constructor
	 * @param {LocaleService} _localeService
	 */
	constructor( private _localeService: LocaleService ) {}

	/**
	 * @return {Observable}
	 */
	public canActivateChild(): Observable<boolean> {
		return this._localeService
		.useLocale()
		.pipe( () => of( true ), delay( 50 ) );
	}

}

@NgModule({
	imports: [
		TranslateModule.forRoot({
			defaultLanguage: CONSTANT.LOCALE,
		}),
	],
	exports: [
		TranslateModule,
	],
	declarations: [],
	providers: [],
})
export class I18nLazyTranslateModule {

	/**
	 * @param {WebpackTranslateSource | WebpackTranslateSource[]} source
	 * @param {TranslateModuleConfig} config
	 * @return {ModuleWithProviders<TranslateModule>}
	 */
	public static forRoot(
		source: WebpackTranslateSource | WebpackTranslateSource[],
		config?: TranslateModuleConfig
	): ModuleWithProviders<TranslateModule> {
		sources.push( ...coerceArray( source ) );

		return {
			ngModule: TranslateModule,
			providers: [
				...TranslateModule.forRoot( config ).providers,
				{
					provide: WEBPACK_TRANSLATE_SOURCE,
					useValue: coerceArray( sources ),
				},
				{
					provide: TranslateLoader,
					useClass: WebpackTranslateLoader,
					deps: [ WEBPACK_TRANSLATE_SOURCE ],
				},
				{
					provide: MissingTranslationHandler,
					useClass: CustomMissingTranslationHandler,
				},
				{
					provide: USE_STORE,
					useValue: true,
				},
				{
					provide: USE_EXTEND,
					useValue: false,
				},
				LazyTranslateGuard,
			],
		};
	}

	/**
	 * @param {WebpackTranslateSource | WebpackTranslateSource[]} source
	 * @param {TranslateModuleConfig} config
	 * @return {ModuleWithProviders<TranslateModule>}
	 */
	public static forChild(
		source: WebpackTranslateSource | WebpackTranslateSource[],
		config?: TranslateModuleConfig
	): ModuleWithProviders<TranslateModule> {
		sources.push( ...coerceArray( source ) );

		return {
			ngModule: TranslateModule,
			providers: [
				...TranslateModule.forChild( config ).providers,
				{
					provide: WEBPACK_TRANSLATE_SOURCE,
					useValue: coerceArray( sources ),
				},
				{
					provide: TranslateLoader,
					useClass: WebpackTranslateLoader,
					deps: [ WEBPACK_TRANSLATE_SOURCE ],
				},
				{
					provide: MissingTranslationHandler,
					useClass: CustomMissingTranslationHandler,
				},
				{
					provide: USE_STORE,
					useValue: false,
				},
				{
					provide: USE_EXTEND,
					useValue: true,
				},
				LazyTranslateGuard,
			],
		};
	}

}
