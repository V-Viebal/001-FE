import {
	Inject,
	Injectable,
	Optional
} from '@angular/core';
import {
	Observable,
	Observer,
	ReplaySubject
} from 'rxjs';
import io, {
	ManagerOptions,
	Socket,
	SocketOptions
} from 'socket.io-client';
import _ from 'lodash';

import {
	SERVER_CONFIG,
	ServerConfig,
	STORAGE_CONFIG,
	StorageConfig
} from '../injection-token';

import {
	StorageService
} from './storage.service';

export type WebSocketOptions = SocketOptions | ManagerOptions;

export interface WebSocketConfig {
	url?: string;
	namespace?: string;
	options?: WebSocketOptions;
}

@Injectable({ providedIn: 'root' })
export class WebSocketService {

	private readonly _socketChange$: ReplaySubject<Socket>
		= new ReplaySubject<Socket>();

	private _accessToken: string;
	private _socket: Socket;

	get socketChange$(): ReplaySubject<Socket> {
		return this._socketChange$;
	}

	/**
	 * @constructor
	 * @param {ServerConfig} serverConfig
	 * @param {ServerConfig} storageConfig
	 * @param {StorageService} _storageService
	 */
	constructor(
		@Optional() @Inject( SERVER_CONFIG )
		public readonly serverConfig: ServerConfig,
		@Optional() @Inject( STORAGE_CONFIG )
		public readonly storageConfig: StorageConfig,
		private _storageService: StorageService
	) {}

	/**
	 * @param {string} accessToken
	 * @return {void}
	 */
	public setAccessToken( accessToken: string ) {
		this._accessToken = accessToken;
	}

	/**
	 * @param {WebSocketConfig=} config
	 * @return {Observable}
	 */
	public connect(
		config?: WebSocketConfig
	): Observable<Socket> {
		return new Observable(
			( observer: Observer<Socket> ) => {
				const url: string = config?.url
					|| this.serverConfig.wsURL;
				const namespace: string = config?.namespace;
				const authorized: any
					= this._storageService
					.getCookie( this.storageConfig.authorizedKey );
				const token: string = this._accessToken
					|| authorized?.workspaceToken
					|| authorized?.accountToken;
				const uri: string = _.join( [ url, namespace ], '/' );
				const options: WebSocketOptions = {
					auth: { token },
					...config?.options,
				};

				this._socket = io( uri, options );

				this._socket.on(
					'connect',
					() => {
						this._socketChange$.next( this._socket );
						observer.next( this._socket );
					}
				);
			}
		);
	}

	/**
	 * @param {string} event
	 * @param {any} data
	 * @return {void}
	 */
	public emit( event: string, data: any ) {
		this._socket?.emit( event, data );
	}

	/**
	 * @param {string} event
	 * @return {Observable}
	 */
	public on( event: string ): Observable<any> {
		return new Observable(
			( observer: Observer<any> ) => {
				this._socket?.on(
					event,
					( data: any ) => observer.next( data )
				);
			}
		);
	}

	/**
	 * @return {void}
	 */
	public disconnect() {
		this._socket?.disconnect();
	}

}
