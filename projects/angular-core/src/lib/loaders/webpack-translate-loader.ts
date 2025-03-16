import {
	Inject
} from '@angular/core';
import {
	coerceArray
} from '@angular/cdk/coercion';
import {
	TranslateLoader
} from '@ngx-translate/core';
import {
	Observable,
	from
} from 'rxjs';
import {
	concatMap,
	map,
	reduce,
	take
} from 'rxjs/operators';
import _ from 'lodash';

export const WEBPACK_TRANSLATE_SOURCE: string
	= 'WEBPACK_TRANSLATE_SOURCE';

export type WebpackTranslateSource= {
	loader: ( lang: string ) => Promise<any>;
	prefix?: string;
};

export class WebpackTranslateLoader implements TranslateLoader {

	/**
	 * @constructor
	 * @param {WebpackTranslateSource[]} sources
	 */
	constructor(
		@Inject( WEBPACK_TRANSLATE_SOURCE )
		protected sources: WebpackTranslateSource[]
	) {}

	/**
	 * @param {string} lang
	 * @return {Observable}
	 */
	public getTranslation(
		lang: string
	): Observable<ObjectType<string>> {
		return from( coerceArray( this.sources ) )
		.pipe(
			concatMap(( { loader, prefix }: WebpackTranslateSource ) => {
				return from( loader( lang ) )
				.pipe(
					map(( { default: translation }: ObjectType<string> ) => {
						return prefix
							? _.set( {}, prefix, translation )
							: translation;
					})
				);
			}),
			reduce(
				(
					memo: ObjectType<string>,
					translation: ObjectType<string>
				) => _.merge( memo, translation ),
				{}
			),
			take( 1 )
		);
	}

}
