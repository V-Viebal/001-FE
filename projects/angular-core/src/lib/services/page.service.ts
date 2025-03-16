import {
	inject,
	Inject,
	Injectable,
	Optional
} from '@angular/core';
import {
	Title
} from '@angular/platform-browser';
import {
	NavigationBehaviorOptions,
	Router
} from '@angular/router';
import {
	ReplaySubject
} from 'rxjs';

import {
	APP_CONFIG,
	AppConfig
} from '../injection-token';
import {
	StorageService
} from './storage.service';

@Injectable()
export class PageService {

	public cacheKey: string = '__curl2';

	private readonly _router: Router
		= inject( Router );
	private readonly _titleService: Title
		= inject( Title );
	private readonly _storageService: StorageService
		= inject( StorageService );
	private readonly _titleChange$: ReplaySubject<string>
		= new ReplaySubject<string>();
	private readonly _processChange$: ReplaySubject<boolean>
		= new ReplaySubject<boolean>();

	/**
	 * @return {ReplaySubject}
	 */
	get title(): ReplaySubject<string> {
		return this._titleChange$;
	}

	/**
	 * @return {ReplaySubject}
	 */
	get processing(): ReplaySubject<boolean> {
		return this._processChange$;
	}

	/**
	 * @constructor
	 * @param {AppConfig} appConfig
	 */
	constructor(
		@Optional() @Inject( APP_CONFIG )
		public readonly appConfig: AppConfig
	) {}

	/**
	 * @param {string} title
	 * @param {string=} prefix
	 * @return {void}
	 */
	public setTitle(
		title: string,
		prefix: string = this.appConfig.name
	) {
		this._titleService
		.setTitle( prefix + ' - ' + title );
		this._titleChange$.next( title );
	}

	/**
	 * @return {string}
	 */
	public getTitle(): string {
		return this._titleService.getTitle();
	}

	/**
	 * @param {string=} url
	 * @return {void}
	 */
	public setCurrentURL( url?: string ) {
		if ( url === undefined ) {
			url = window.location.pathname
				+ window.location.search
				+ window.location.hash;
		}

		url
			? this._storageService
			.setLocal( this.cacheKey, url )
			: this._storageService
			.removeLocal( this.cacheKey );
	}

	/**
	 * @return {string}
	 */
	public getCurrentURL(): string {
		return this._storageService.getLocal( this.cacheKey )
			|| this.appConfig.mainPath;
	}

	/**
	 * @param {NavigationBehaviorOptions=} extra
	 * @return {void}
	 */
	public navigateToCurrentURL(
		extra?: NavigationBehaviorOptions
	) {
		const url: string = this.getCurrentURL();

		if ( !url?.length ) return;

		this._router.navigateByUrl( url, extra );

		this.setCurrentURL( null );
	}

	/**
	 * @param {boolean} isProcessing
	 * @return {void}
	 */
	public setProcessing( isProcessing: boolean ) {
		isProcessing
			? this._processChange$.next( true )
			: setTimeout(
				() => this._processChange$.next( false ),
				1000
			);
	}

}
