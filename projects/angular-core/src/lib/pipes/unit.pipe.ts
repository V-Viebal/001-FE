import {
	Pipe,
	PipeTransform
} from '@angular/core';
import _ from 'lodash';

import {
	Memoize
} from '../decorators/memoize';

@Pipe({ name: 'unit' })
export class UnitPipe implements PipeTransform {

	/**
	 * @param {number | string} data
	 * @param {string=} unit
	 * @return {string}
	 */
	@Memoize()
	public transform(
		data: number | string,
		unit: string = ''
	): string {
		if ( !_.isFinite( data )
			&& !_.isString( data ) ) {
			return;
		}

		return `${data}${unit}`;
	}

}
