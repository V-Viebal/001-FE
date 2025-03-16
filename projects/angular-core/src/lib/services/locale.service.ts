import {
	inject,
	Inject,
	Injectable,
	InjectionToken,
	Optional
} from '@angular/core';
import {
	DOCUMENT
} from '@angular/common';
import {
	LangChangeEvent,
	TranslateService
} from '@ngx-translate/core';
import {
	Observable,
	ReplaySubject
} from 'rxjs';
import moment from 'moment-timezone';
import _ from 'lodash';

import {
	APP_CONFIG,
	AppConfig
} from '../injection-token';

moment.updateLocale(
	'vi', {
		months: _.split(
			'Tháng 1_Tháng 2_Tháng 3_Tháng 4_Tháng 5_Tháng 6_Tháng 7_Tháng 8_Tháng 9_Tháng 10_Tháng 11_Tháng 12',
			'_'
		),
		weekdays: _.split(
			'Chủ nhật_Thứ hai_Thứ ba_Thứ tư_Thứ năm_Thứ sáu_Thứ bảy',
			'_'
		),
	}
);

export const USE_STORAGE: InjectionToken<Storage>
	= new InjectionToken<Storage>( 'USE_STORAGE' );
export const USE_STORAGE_KEY: InjectionToken<string>
	= new InjectionToken<string>( 'USE_STORAGE_KEY' );

@Injectable()
export class LocaleService {

	public localeChange$: ReplaySubject<string>
		= new ReplaySubject<string>();

	private readonly _translateService: TranslateService
		= inject( TranslateService );

	get locale(): string {
		return this._translateService.currentLang
			|| this.storage.getItem( this.storageKey )
			|| this.appConfig.locale;
	}

	/**
	 * @constructor
	 * @param {AppConfig} appConfig
	 * @param {Storage} storage
	 * @param {string} storageKey
	 * @param {Document} _document
	 */
	constructor(
		@Optional() @Inject( APP_CONFIG )
		public readonly appConfig: AppConfig,
		@Optional() @Inject( USE_STORAGE )
		public readonly storage: Storage,
		@Optional() @Inject( USE_STORAGE_KEY )
		public readonly storageKey: string,
		@Inject( DOCUMENT )
		private _document: Document
	) {
		this.storage ||= localStorage;
		this.storageKey ||= 'LOCALE';

		this._translateService.onLangChange
		.subscribe(( { lang }: LangChangeEvent ) => {
			// Set moment locale
			moment.locale( lang );

			// Set document language
			this._document.documentElement.lang = lang;

			// Store locale
			this.storage.setItem( this.storageKey, lang );

			// Emit locale change
			this.localeChange$.next( lang );
		});
	}

	/**
	 * @param {string=} locale
	 * @return {Observable<any>}
	 */
	public useLocale(
		locale: string = this.locale
	): Observable<any> {
		return this._translateService
		.use( locale );
	}

}
