import {
	Pipe,
	PipeTransform
} from '@angular/core';
import _ from 'lodash';

import {
	Memoize
} from '../decorators/memoize';


@Pipe({ name: 'capitalizeFirst' })
export class CapitalizeFirstPipe implements PipeTransform {

	/**
	 * @param {string} value
	 * @return {string}
	 */
	@Memoize()
	public transform( value: string ): string {
		return !_.isNil( value )
			? _.toUpper( value.charAt( 0 ) )
				+ _.toLower( value.substring( 1 ) )
			: value;
	}

}
