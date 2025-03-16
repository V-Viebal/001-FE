import {
	inject
} from '@angular/core';
import {
	HttpClient
} from '@angular/common/http';
import {
	TranslateLoader
} from '@ngx-translate/core';
import {
	forkJoin,
	Observable
} from 'rxjs';
import {
	map,
	take
} from 'rxjs/operators';
import _ from 'lodash';

type Resources = {
	prefix: string;
	suffix: string;
};

export class MultiTranslateHttpLoader implements TranslateLoader {

	private readonly _http: HttpClient
		= inject( HttpClient );

	/**
	 * @constructor
	 * @param {Resources[]} resources
	 */
	constructor(
		public resources: Resources[] = [
			{ prefix: 'assets/i18n/', suffix: '.json' },
		]
	) {}

	/**
	 * @param {string} lang
	 * @return {Observable}
	 */
	public getTranslation(
		lang: string
	): Observable<ObjectType<unknown>> {
		return forkJoin(
			_.map(
				this.resources,
				( config: any ) => {
					return this._http
					.get( `${config.prefix}${lang}${config.suffix}` );
				}
			)
		)
		.pipe(
			map(( response: any ) => {
				return _.reduce(
					response,
					( a: any, b: any ) => _.assign( a, b )
				);
			}),
			take( 1 )
		);
	}

}
