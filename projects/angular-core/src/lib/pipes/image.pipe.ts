import {
	Pipe,
	PipeTransform
} from '@angular/core';
import {
	Observable,
	Observer
} from 'rxjs';

import {
	Memoize
} from '../decorators/memoize';

@Pipe({ name: 'image' })
export class ImagePipe implements PipeTransform {

	/**
	 * @param {string} url
	 * @param {string} defaultImage
	 * @return {Observable}
	 */
	@Memoize()
	public transform(
		url: string,
		defaultImage: string
	): Observable<string> {
		return new Observable(
			( observer: Observer<any> ) => {
				if ( !url ) {
					observer.next( defaultImage );
					observer.complete();
					return;
				}

				const img: HTMLImageElement = new Image();

				img.onload = () => {
					observer.next( url );
					observer.complete();
				};
				img.onerror = () => {
					observer.next( defaultImage );
					observer.complete();
				};
				img.src = url;
			}
		);
	}

}
