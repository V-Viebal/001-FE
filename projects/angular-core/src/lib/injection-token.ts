import {
	InjectionToken
} from '@angular/core';

export type WeekStart = NumRange<8>;
export type TimeFormat = 'hh:mm a' | 'HH:mm';

export class AppConfig {

	private _name: string;
	private _logo: string;
	private _url: string;
	private _locale: string;
	private _mainPath: string;

	get name(): string {
		return this._name;
	}
	set name( value: string ) {
		this._name = value;
	}

	get logo(): string {
		return this._logo;
	}
	set logo( value: string ) {
		this._logo = value;
	}

	get url(): string {
		return this._url;
	}
	set url( value: string ) {
		this._url = value;
	}

	get locale(): string {
		return this._locale;
	}
	set locale( value: string ) {
		this._locale = value;
	}

	get mainPath(): string {
		return this._mainPath;
	}
	set mainPath( value: string ) {
		this._mainPath = value;
	}

}

export class ServerConfig {

	private _apiURL: string;
	private _wsURL: string;
	private _fcmPublicKey: string;
	private _fcmSubscriptionEndpoint: string;

	get apiURL(): string {
		return this._apiURL;
	}
	set apiURL( value: string ) {
		this._apiURL = value;
	}

	get wsURL(): string {
		return this._wsURL;
	}
	set wsURL( value: string ) {
		this._wsURL = value;
	}

	get fcmPublicKey(): string {
		return this._fcmPublicKey;
	}
	set fcmPublicKey( value: string ) {
		this._fcmPublicKey = value;
	}

	get fcmSubscriptionEndpoint(): string {
		return this._fcmSubscriptionEndpoint;
	}
	set fcmSubscriptionEndpoint( value: string ) {
		this._fcmSubscriptionEndpoint = value;
	}

}

export class DateTimeConfig {

	private _timezone: string;
	private _dateFormat: string;
	private _timeFormat: TimeFormat;
	private _weekStart: WeekStart;

	get timezone(): string {
		return this._timezone;
	}
	set timezone( value: string ) {
		this._timezone = value;
	}

	get dateFormat(): string {
		return this._dateFormat;
	}
	set dateFormat( value: string ) {
		this._dateFormat = value;
	}

	get timeFormat(): TimeFormat {
		return this._timeFormat;
	}
	set timeFormat( value: TimeFormat ) {
		this._timeFormat = value;
	}

	get weekStart(): WeekStart {
		return this._weekStart;
	}
	set weekStart( value: WeekStart ) {
		this._weekStart = value;
	}

}

export class StorageConfig {

	private _authorizedKey: string;
	private _hashKey: string;
	private _expireDays: number;

	get authorizedKey(): string {
		return this._authorizedKey;
	}
	set authorizedKey( value: string ) {
		this._authorizedKey = value;
	}

	get hashKey(): string {
		return this._hashKey;
	}
	set hashKey( value: string ) {
		this._hashKey = value;
	}

	get expireDays(): number {
		return this._expireDays;
	}
	set expireDays( value: number ) {
		this._expireDays = value;
	}

}

export const APP_CONFIG: InjectionToken<AppConfig>
	= new InjectionToken<AppConfig>( 'APP_CONFIG' );
export const SERVER_CONFIG: InjectionToken<AppConfig>
	= new InjectionToken<AppConfig>( 'SERVER_CONFIG' );
export const DATE_TIME_CONFIG: InjectionToken<DateTimeConfig>
	= new InjectionToken<DateTimeConfig>( 'DATE_TIME_CONFIG' );
export const STORAGE_CONFIG: InjectionToken<StorageConfig>
	= new InjectionToken<StorageConfig>( 'STORAGE_CONFIG' );
