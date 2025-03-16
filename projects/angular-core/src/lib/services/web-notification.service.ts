import {
	Inject,
	Injectable,
	Optional
} from '@angular/core';
import {
	Observable,
	Observer
} from 'rxjs';
import {
	take
} from 'rxjs/operators';
import _ from 'lodash';

import {
	APP_CONFIG,
	AppConfig
} from '../injection-token';

@Injectable()
export class WebNotificationService {

	public permission: NotificationPermission;

	/**
	 * @constructor
	 * @param {AppConfig} appConfig
	 */
	constructor(
		@Optional() @Inject( APP_CONFIG )
		public readonly appConfig: AppConfig
	) {
		this.permission = this.isSupported()
			? 'default'
			: 'denied';
	}

	/**
	 * @return {boolean}
	 */
	public isSupported(): boolean {
		return 'Notification' in window;
	}

	/**
	 * @return {void}
	 */
	public requestPermission() {
		if ( 'Notification' in window ) {
			Notification.requestPermission(
				( status: NotificationPermission ) => {
					this.permission = status;
				}
			);
		}
	}

	/**
	 * @param {string} title
	 * @param {NotificationOptions=} options
	 * @return {Observable}
	 */
	public create(
		title: string,
		options?: NotificationOptions
	): Observable<any> {
		return new Observable(( observer: Observer<any> ) => {
			if ( !( 'Notification' in window ) ) {
				observer.complete();
			}

			if ( this.permission !== 'granted' ) {
				observer.complete();
			}

			const notify: Notification
				= new Notification( title, options );

			notify.onshow = ( event: Event ) => {
				return observer.next({
					notification: notify,
					event,
				});
			};

			notify.onclick = ( event: Event ) => {
				return observer.next({
					notification: notify,
					event,
				});
			};

			notify.onerror = ( event: Event ) => {
				return observer.next({
					notification: notify,
					event,
				});
			};

			notify.onclose = () => observer.complete();
		});
	}

	/**
	 * @param {{ title: string; alertContent: string }[]} source
	 * @return {Observable}
	 */
	public generateNotification(
		source: { title: string; alertContent: string }[]
	) {
		_.forEach(
			source,
			( item: { title: string; alertContent: string } ) => {
				const options: NotificationOptions = {
					body: item.alertContent,
					icon: this.appConfig.logo,
				};

				this.create( item.title, options )
				.pipe( take( 1 ) )
				.subscribe();
			}
		);
	}

}
