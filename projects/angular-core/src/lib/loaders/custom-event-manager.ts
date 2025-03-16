import {
	Inject,
	Injectable,
	NgZone
} from '@angular/core';
import {
	EVENT_MANAGER_PLUGINS,
	EventManager
} from '@angular/platform-browser';

@Injectable()
export class CustomEventManager extends EventManager {

	constructor(
		@Inject( EVENT_MANAGER_PLUGINS ) plugins: any[],
		private _ngZone: NgZone
	) {
		super( plugins, _ngZone );
	}

	public addEventListener(
		element: HTMLElement,
		eventName: string,
		handler: Function
	): Function {
		if ( eventName.endsWith( 'out-zone' ) ) {
			eventName = eventName.split( '.' )[ 0 ];

			return this._ngZone.runOutsideAngular(() =>
				super.addEventListener(
					element,
					eventName,
					handler
				)
			);
		}

		return super.addEventListener(
			element,
			eventName,
			handler
		);
	}

}
