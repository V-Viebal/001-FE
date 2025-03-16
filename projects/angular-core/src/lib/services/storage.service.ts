import {
	inject,
	Inject,
	Injectable,
	Optional
} from '@angular/core';
import {
	CookieService
} from 'ngx-cookie-service';
import {
	Subject
} from 'rxjs';
import moment
	from 'moment-timezone';
import _ from 'lodash';

import {
	STORAGE_CONFIG,
	StorageConfig
} from '../injection-token';

interface DataChange {
	key: string;
	data: any;
}

export enum CookieSameSiteOption {
	None = 'None',
	Lax = 'Lax',
	Strict = 'Strict',
}

export interface CookieOptions {
	expires?: number | Date;
	path?: string;
	domain?: string;
	secure?: boolean;
	sameSite?: CookieSameSiteOption;
}

export interface CookieDataChange extends DataChange {}

export interface LocalDataChange extends DataChange {}

@Injectable()
export class StorageService {

	public cookieChange$: Subject<CookieDataChange>
		= new Subject<CookieDataChange>();
	public localChange$: Subject<LocalDataChange>
		= new Subject<LocalDataChange>();

	private readonly _cookieService: CookieService
		= inject( CookieService );

	private _cookieOptions: CookieOptions = {
		path: '/',
		sameSite: CookieSameSiteOption.None,
		secure: true,
	};

	/**
	 * @constructor
	 * @param {StorageConfig} storageConfig
	 */
	constructor(
		@Optional() @Inject( STORAGE_CONFIG )
		public readonly storageConfig: StorageConfig
	) {}

	/**
	 * @param {CookieOptions} options
	 * @return {void}
	 */
	public setCookieOptions(
		options: CookieOptions
	) {
		this._cookieOptions = _.assign(
			this._cookieOptions,
			options
		);
	}

	/**
	 * @param {string} key
	 * @param {any} data
	 * @param {(number | Date)=} expires
	 * @return {void}
	 */
	public setCookie(
		key: string,
		data: any,
		expires: number | Date
		= this.storageConfig.expireDays
	) {
		const hashKey: string
			= this.storageConfig.hashKey;

		if ( !hashKey ) return;

		const hashValue: any
			= _.aesEncrypt( data, hashKey );
		const options: CookieOptions
			= this._mergeCookieOptions( expires );

		this._cookieService.set(
			key,
			hashValue,
			options.expires,
			options.path,
			options.domain,
			options.secure,
			options.sameSite
		);

		this.cookieChange$.next({
			key,
			data,
		});
	}

	/**
	 * @param {string} key
	 * @return {any}
	 */
	public getCookie(
		key: string
	): any {
		const hashKey: string
			= this.storageConfig.hashKey;
		const hashValue: string
			= this._cookieService.get( key );

		if ( !hashKey
			|| !hashValue ) {
			return;
		}

		return _.aesDecrypt(
			hashValue,
			hashKey
		);
	}

	/**
	 * @param {string} key
	 * @param {any} updateData
	 * @return {void}
	 */
	public updateCookie(
		key: string,
		updateData: any
	) {
		const data: any
			= this.getCookie( key );

		this.setCookie(
			key,
			{
				...data,
				...updateData,
			}
		);

		this.cookieChange$.next({
			key,
			data: {
				...data,
				...updateData,
			},
		});
	}

	/**
	 * @param {string} key
	 * @return {void}
	 */
	public removeCookie( key: string ) {
		this._cookieService.delete(
			key,
			this._cookieOptions.path,
			this._cookieOptions.domain,
			this._cookieOptions.secure,
			this._cookieOptions.sameSite
		);

		this.cookieChange$.next({
			key,
			data: null,
		});
	}

	/**
	 * @return {void}
	 */
	public clearAllCookies() {
		this._cookieService.deleteAll(
			this._cookieOptions.path,
			this._cookieOptions.domain,
			this._cookieOptions.secure,
			this._cookieOptions.sameSite
		);

		this.cookieChange$.next({
			key: null,
			data: null,
		});
	}

	/**
	 * @param {string} key
	 * @param {any} data
	 * @return {void}
	 */
	public setLocal(
		key: string,
		data: any
	) {
		const hashKey: string
			= this.storageConfig.hashKey;

		if ( !hashKey ) return;

		const hashValue: any
			= _.aesEncrypt( data, hashKey );

		localStorage.setItem(
			key,
			hashValue
		);

		this.localChange$.next({
			key,
			data,
		});
	}

	/**
	 * @param {string} key
	 * @return {any}
	 */
	public getLocal(
		key: string
	): any {
		const hashKey: string
			= this.storageConfig.hashKey;
		const hashValue: string
			= localStorage.getItem( key );

		if ( !hashKey
			|| !hashValue ) {
			return;
		}

		return _.aesDecrypt(
			hashValue,
			hashKey
		);
	}

	/**
	 * @param {string} key
	 * @param {any} updateData
	 * @return {void}
	 */
	public updateLocal(
		key: string,
		updateData: any
	) {
		const data: any
			= this.getLocal( key );

		this.setLocal(
			key,
			{
				...data,
				...updateData,
			}
		);

		this.localChange$.next({
			key,
			data: {
				...data,
				...updateData,
			},
		});
	}

	/**
	 * @param {string} key
	 * @return {void}
	 */
	public removeLocal( key: string ) {
		localStorage.removeItem( key );

		this.localChange$.next({
			key,
			data: null,
		});
	}

	/**
	 * @return {void}
	 */
	public clearAllLocals() {
		localStorage.clear();

		this.localChange$.next({
			key: null,
			data: null,
		});
	}

	/**
	 * @param {number | Date} expires
	 * @return {CookieOptions} options
	 */
	private _mergeCookieOptions(
		expires: number | Date
	): CookieOptions {
		const options: CookieOptions = {};

		if ( expires ) {
			options.expires
				= expires instanceof Date
					? expires
					: moment(
						+moment()
							+ 24
							* 60
							* 60
							* 1000
							* expires
					).toDate();
		}

		return _.assign(
			options,
			this._cookieOptions
		);
	}

}
