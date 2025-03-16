import {
	Pipe,
	PipeTransform
} from '@angular/core';
import _ from 'lodash';

import {
	Memoize
} from '../decorators/memoize';

@Pipe({ name: 'convertPercent' })
export class ConvertPercentPipe implements PipeTransform {

	/**
	 * @param {number} input
	 * @param {number=} decimalPlaces
	 * @param {boolean=} isIncludeUnit
	 * @return {number | string}
	 */
	@Memoize()
	public transform(
		input: number,
		decimalPlaces?: number,
		isIncludeUnit?: boolean
	): number | string {
		return _.toPercent(
			input,
			decimalPlaces,
			isIncludeUnit
		);
	}

}
