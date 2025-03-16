import {
	Pipe,
	PipeTransform
} from '@angular/core';
import _ from 'lodash';

import {
	Memoize
} from '../decorators/memoize';

@Pipe({ name: 'fixed' })
export class FixedPipe implements PipeTransform {

	/**
	 * @param {number} input
	 * @param {number=} decimalPlaces
	 * @return {string | number}
	 */
	@Memoize()
	public transform(
		input: number,
		decimalPlaces: number = 2
	): string | number {
		return _.isFinite( input )
			? input.toFixed( decimalPlaces )
			: input;
	}

}
