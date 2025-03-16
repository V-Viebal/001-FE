import {
	inject,
	Inject,
	Injectable,
	Optional
} from '@angular/core';
import {
	HttpClient,
	HttpHeaders,
	HttpResponse
} from '@angular/common/http';
import {
	Observable,
	Observer,
	Subject
} from 'rxjs';
import {
	take,
	takeWhile,
	takeUntil
} from 'rxjs/operators';
import pako from 'pako';
import {
	Buffer
} from 'buffer';
import _ from 'lodash';

import {
	SERVER_CONFIG,
	ServerConfig,
	STORAGE_CONFIG,
	StorageConfig
} from '../injection-token';

type Method = 'get'
	| 'head'
	| 'post'
	| 'put'
	| 'delete'
	| 'connect'
	| 'options'
	| 'trace'
	| 'patch';

export type ApiMethod
	= Method | Uppercase<Method>;
export type ApiHeaders
	= ObjectType<string>;
export type ApiParams
	= ObjectType;
export type UploadData
	= {
		files: File[],
	} & ObjectType;

@Injectable()
export class ApiService {

	public readonly errorCatcher$: Subject<any>
		= new Subject<any>();

	private readonly _http: HttpClient
		= inject( HttpClient );

	private _baseURL: string;
	private _accessToken: string;
	private _abortController: AbortController;
	private _cancelRequest$: Subject<void>;

	get abortController(): AbortController {
		this._abortController ||= new AbortController();

		return this._abortController;
	}
	set abortController(
		abortController: AbortController
	) {
		this._abortController
			= abortController;
	}

	get cancelRequest$(): Subject<void> {
		this._cancelRequest$ ||= new Subject<void>();

		return this._cancelRequest$;
	}
	set cancelRequest$(
		cancelRequest$: Subject<void>
	) {
		this._cancelRequest$
			= cancelRequest$;
	}

	/**
	 * @constructor
	 * @param {ServerConfig} serverConfig
	 * @param {StorageConfig} storageConfig
	 */
	constructor(
		@Optional() @Inject( SERVER_CONFIG )
		protected readonly serverConfig: ServerConfig,
		@Optional() @Inject( STORAGE_CONFIG )
		protected readonly storageConfig: StorageConfig
	) {
		this.setBaseURL(
			this.serverConfig.apiURL
		);
	}

	/**
	 * @param {string} url
	 * @return {void}
	 */
	public setBaseURL( url: string ) {
		this._baseURL = url;
	}

	/**
	 * @param {string} accessToken
	 * @return {void}
	 */
	public setAccessToken(
		accessToken: string
	) {
		this._accessToken = accessToken;
	}

	/**
	 * @param {string} url
	 * @param {ApiMethod=} method
	 * @param {ApiParams=} params
	 * @param {ApiHeaders=} headers
	 * @param {ObjectType=} options
	 * @return {Observable}
	 */
	public call(
		url: string,
		method: ApiMethod = 'get',
		params?: ApiParams | {
			queryParams: ApiParams;
			bodyParams: ApiParams;
		},
		headers?: ApiHeaders,
		options?: ObjectType
	): Observable<any> {
		return new Observable(
			( observer: Observer<any> ) => {
				const httpHeaders: HttpHeaders
					= this._createHttpHeaders({
						'Content-Type':
							'application/json;charset=UTF-8',

						...headers,
					});

				url = `${this._baseURL}${url}`;
				method = method.toLowerCase() as ApiMethod;
				options = {
					...options,

					headers: httpHeaders,
				};

				const isGetOrDeleteMethod: boolean
					= method === 'get'
						|| method === 'delete';
				const queryParams: ApiHeaders
					= isGetOrDeleteMethod
						? params
						: params?.queryParams;

				if ( queryParams ) {
					const searchParams: URLSearchParams
						= new URLSearchParams();

					_.forEach(
						queryParams,
						(
							value: any,
							key: string
						) => {
							searchParams
							.set( key, value );
						}
					);

					const paramStr: string
						= searchParams.toString();

					if ( paramStr ) {
						url += `?${paramStr}`;
					}
				}

				if ( isGetOrDeleteMethod ) {
					params = options;
				} else if ( params?.bodyParams ) {
					params = params.bodyParams;
				}

				this
				._http[ method ](
					url,
					params,
					options
				)
				.pipe(
					takeUntil( this.cancelRequest$ ),
					options.reportProgress
						? takeWhile(
							( res: HttpResponse<any> ) => {
								return res.type <= 4;
							}
						)
						: take( 1 )
				)
				.subscribe({
					next: ( response: any ) => {
						observer.next( response );
					},
					error: ( error: any ) => {
						observer.error(
							this._failCallback( error )
						);
					},
					complete: () => {
						this.cancelRequest$.complete();
						observer.complete();
					},
				});
			}
		);
	}

	/**
	 * @param {string} url
	 * @param {UploadData} data
	 * @param {ApiHeaders=} headers
	 * @param {ObjectType=} options
	 * @return {Observable}
	 */
	public upload(
		url: string,
		data: UploadData,
		headers: ApiHeaders,
		options?: ObjectType
	): Observable<any> {
		return new Observable(
			( observer: Observer<any> ) => {
				const httpHeaders: HttpHeaders
					= this._createHttpHeaders( headers );

				url = `${this._baseURL}${url}`;
				options = {
					...options,
					headers: httpHeaders,
				};

				const formData: FormData
					= new FormData();

				_.forEach(
					_.omit( data, [ 'files' ] ),
					( d: any, key: string ) => {
						formData.append(
							key,
							d
						);
					}
				);

				_.forEach(
					data.files,
					( file: File ) => {
						formData.append(
							'files[]',
							file,
							file.name
						);
					}
				);

				this
				._http
				.post(
					url,
					formData,
					options
				)
				.pipe(
					takeUntil( this.cancelRequest$ ),
					options.reportProgress
						? takeWhile(
							( res: HttpResponse<any> ) => {
								return res.type <= 4;
							}
						)
						: take( 1 )
				)
				.subscribe({
					next: ( response: any ) => {
						observer.next( response );
					},
					error: ( error: any ) => {
						observer.error(
							this._failCallback( error )
						);
					},
					complete: () => {
						this.cancelRequest$.complete();
						observer.complete();
					},
				});
			}
		);
	}

	/**
	 * @param {string} url
	 * @param {ApiMethod} method
	 * @param {ApiParams} body
	 * @param {HeadersInit} headers
	 * @return {Observable}
	 */
	public stream(
		url: string,
		method: ApiMethod = 'get',
		body?: ApiParams,
		headers?: HeadersInit
	): Observable<any> {
		return new Observable(
			( observer: Observer<any> ) => {
				const headersInit: HeadersInit
					= this._createFetchHeaders({
						'Content-Type':
							'application/json;charset=UTF-8',

						...headers,
					});

				url = `${this._baseURL}${url}`;
				method = method.toLowerCase() as ApiMethod;

				fetch(
					url,
					{
						method,
						headers: headersInit,
						body: JSON.stringify( body ),
						signal: this.abortController.signal,
					}
				)
				.then(
					( response: Response ) => {
						if (
							!response.ok
						) {
							throw response;
						}

						const delimiterCode: string
							= '@#&';
						const reader: ReadableStreamDefaultReader
							= response.body.getReader();

						return new ReadableStream({
							start(
								controller: ReadableStreamDefaultController
							) {
								let data: string = '';

								function push() {
									reader
									.read()
									.then(
										(
											result: {
												done: boolean;
												value: any;
											}
										) => {
											if (
												result?.done
												&& !data
											) {
												controller.close();
												observer.complete();
												return;
											}

											const strV: string
												= new TextDecoder()
												.decode( result?.value );

											data += strV;
											const hasDelimiter: RegExpMatchArray
												= data.match( delimiterCode );

											if (
												hasDelimiter?.index > -1
											) {
												const base64String: string
													= data.substring(
														0,
														hasDelimiter.index
													);
												const buffString: Buffer
													= Buffer.from(
														base64String,
														'base64'
													);
												const zippedData: string
													= pako.ungzip(
														buffString,
														{ to: 'string' }
													);
												const dataJSON: any
													= JSON.parse( zippedData );

												data
													= data.substring(
														hasDelimiter.index
														+ delimiterCode.length
													);

												observer.next( dataJSON );
											}

											push();
										}
									)
									.catch(
										( error: any ) => {
											controller.error( error );
											observer.error( error );
										}
									);
								};

								push();
							},
						});
					}
				)
				.catch(
					( error: any ) => {
						observer.error(
							this._failCallback( error )
						);
					}
				);
			}
		);
	}

	/**
	 * @param {any?} reason
	 * @return {void}
	 */
	public abort(
		reason: any = 'cancel'
	) {
		this
		.abortController
		.abort( reason );
	}

	/**
	 * @return {void}
	 */
	public cancelRequest() {
		this.cancelRequest$.next();
	}

	/**
	 * @param {ApiHeaders} headers
	 * @return {HttpHeaders}
	 */
	private _createHttpHeaders(
		headers: ApiHeaders
	): HttpHeaders {
		const accessToken: string
			= this._accessToken;

		if (
			accessToken
			&& !_.has(
				headers,
				'Authorization'
			)
		) {
			_.set(
				headers,
				'Authorization',
				`Bearer ${accessToken}`
			);
		}

		return new HttpHeaders( headers );
	}

	/**
	 * @param {HeadersInit} headers
	 * @return {HttpHeaders}
	 */
	private _createFetchHeaders(
		headers: HeadersInit
	): HeadersInit {
		const accessToken: string
			= this._accessToken;

		if (
			accessToken
			&& !_.has(
				headers,
				'Authorization'
			)
		) {
			headers ||= {};

			_.set(
				headers,
				'Authorization',
				`Bearer ${accessToken}`
			);
		}

		return new Headers( headers );
	}

	/**
	 * @param {any} error
	 * @return {any}
	 */
	private _failCallback(
		error: any
	): any {
		this
		.errorCatcher$
		.next( error );

		return error;
	}

}
