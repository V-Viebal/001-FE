import {
	Pipe,
	PipeTransform
} from '@angular/core';

import {
	REGEXP
} from '../resources';
import {
	Memoize
} from '../decorators/memoize';

@Pipe({ name: 'emoji' })
export class EmojiPipe implements PipeTransform {

	/**
	 * @param {string} unified
	 * @return {string}
	 */
	@Memoize()
	public transform( unified: string ): string {
		if ( unified.match( REGEXP.EMOJI ) ) {
			return unified;
		}

		return unified
			? String.fromCodePoint(
				parseInt( unified, 16 )
			)
			: '';
	}

}
