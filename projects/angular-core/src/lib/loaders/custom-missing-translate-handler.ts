import {
	isDevMode
} from '@angular/core';
import {
	MissingTranslationHandler,
	MissingTranslationHandlerParams
} from '@ngx-translate/core';

export class CustomMissingTranslationHandler
implements MissingTranslationHandler {

	/**
	 * @param {MissingTranslationHandlerParams} params
	 * @return {string}
	 */
	public handle(
		params: MissingTranslationHandlerParams
	): string {
		if ( isDevMode() ) {
			console.error( params );
		}

		return '';
	}

}
