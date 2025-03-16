import {
	Injectable
} from '@angular/core';
import {
	fromEvent,
	interval,
	merge,
	Observable
} from 'rxjs';
import {
	map
} from 'rxjs/operators';

@Injectable()
export class NetworkService {

	/**
	 * @param {number=} intervalMs
	 * @return {Observable}
	 */
	public detectOnline(
		intervalMs: number = 5000
	): Observable<boolean> {
		return merge(
			interval( intervalMs )
			.pipe( map( () => navigator.onLine ) ),
			fromEvent( window, 'offline' )
			.pipe( map( () => false ) ),
			fromEvent( window, 'online' )
			.pipe( map( () => true ) )
		);
	}

}
