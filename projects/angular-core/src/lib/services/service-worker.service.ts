import {
	inject,
	Inject,
	Injectable,
	Optional
} from '@angular/core';
import {
	SwPush,
	SwUpdate,
	VersionEvent
} from '@angular/service-worker';
import {
	Observable,
	Observer,
	Subscription
} from 'rxjs';
import {
	filter,
	single,
	take
} from 'rxjs/operators';

import {
	APP_CONFIG,
	AppConfig,
	SERVER_CONFIG,
	ServerConfig
} from '../injection-token';

import { ApiService } from './api.service';

declare const window: Window;

export interface ServiceWorkerOption {
	serverPublicKey?: string;
	subscriptionEndpoint?: string;
	onNotificationClicked?: ( arg: {
		action: string;
		notification: NotificationOptions & { title: string };
	}) => void;
	callback?: () => void;
}

@Injectable()
export class ServiceWorkerService {

	private readonly _swPush: SwPush
		= inject( SwPush );
	private readonly _swUpdate: SwUpdate
		= inject( SwUpdate );
	private readonly _apiService: ApiService
		= inject( ApiService );
	private _notificationClicks$$: Subscription
		= new Subscription();
	private _swPushMessages$$: Subscription
		= new Subscription();

	get canEnableSwPush(): boolean {
		return this._swPush.isEnabled
			&& !( 'safari' in window );
	}

	/**
	 * @constructor
	 * @param {AppConfig} appConfig
	 * @param {ServerConfig} serverConfig
	 */
	constructor(
		@Optional() @Inject( APP_CONFIG )
		public readonly appConfig: AppConfig,
		@Optional() @Inject( SERVER_CONFIG )
		public readonly serverConfig: ServerConfig
	) {}

	/**
	 * @return {void}
	 */
	public updateAvailableVersion() {
		this._swUpdate.versionUpdates
		.pipe(
			filter(( event: VersionEvent ) => {
				return event.type === 'VERSION_READY';
			})
		)
		.subscribe(() => {
			this._swUpdate
			.activateUpdate()
			.then( () => document.location.reload() );
		});
	}

	/**
	 * @param {ServiceWorkerOption=} options
	 * @param {(( subscription: PushSubscription ) => void)=} callback
	 * @return {void}
	 */
	public requestSubscription(
		options?: ServiceWorkerOption,
		callback?: ( subscription: PushSubscription ) => void
	) {
		if ( !this.canEnableSwPush ) return;

		const serverPublicKey: string
			= options?.serverPublicKey
				|| this.serverConfig.fcmPublicKey;

		if ( !serverPublicKey ) return;

		// Get current subscription
		this._swPush.subscription
		.pipe( take( 1 ) )
		.pipe( single() )
		.subscribe(( subscription: PushSubscription ) => {
			if ( subscription ) {
				// Send subscription to callback
				callback?.( subscription );
				return;
			}

			// Request new subscription
			this._swPush
			.requestSubscription({ serverPublicKey })
			.then(( newSubscription: PushSubscription ) => {
				// Send subscription to callback
				callback?.( newSubscription );
			});
		});
	}

	/**
	 * @param {ServiceWorkerOption=} options
	 * @param {(( subscription: PushSubscription ) => void)=} callback
	 * @return {void}
	 */
	public enablePushNotification(
		options?: ServiceWorkerOption,
		callback?: ( subscription: PushSubscription ) => void
	) {
		if ( !this.canEnableSwPush ) return;

		// Request subscription
		this.requestSubscription(
			options,
			( subscription: PushSubscription ) => {
				const subscriptionEndpoint: string
					= options?.subscriptionEndpoint
						|| this.serverConfig.fcmSubscriptionEndpoint;

				// Send subscription to the server
				if ( subscriptionEndpoint ) {
					this._apiService
					.call(
						subscriptionEndpoint,
						'post',
						{ subscription }
					)
					.subscribe();
				}

				// Send subscription to callback
				callback?.( subscription );
			}
		);

		// Handle click notification event
		this._notificationClicks$$.unsubscribe();
		this._notificationClicks$$ = this._swPush.notificationClicks
		.subscribe( options.onNotificationClicked.bind( this ) );
	}

	/**
	 * @return {void}
	 */
	public disablePushNotification() {
		if ( !this.canEnableSwPush ) return;

		// Unsubscribe all subscriptions
		this._swPush.subscription
		.pipe( take( 1 ) )
		.forEach(( subscription: PushSubscription ) => {
			subscription?.unsubscribe();
		});
	}

	/**
	 * @return {Observable}
	 */
	public listenPushNotification(): Observable<any> {
		return new Observable(( observer: Observer<any> ) => {
			if ( !this.canEnableSwPush ) {
				observer.next( undefined );
				observer.complete();
				return;
			}

			this._swPushMessages$$.unsubscribe();
			this._swPushMessages$$ = this._swPush.messages
			.subscribe({
				next: ( payload: any ) => observer.next( payload ),
				error: ( error: any ) => observer.error( error ),
				complete: () => observer.complete(),
			});
		});
	}

}
