import {
	Pipe,
	PipeTransform
} from '@angular/core';
import _ from 'lodash';

import {
	Memoize
} from '../decorators/memoize';

@Pipe({ name: 'thounsandUnit' })
export class ThounsandUnitPipe implements PipeTransform {

	/**
	 * @param {number} input
	 * @return {string}
	 */
	@Memoize()
	public transform( input: number ): string {
		return _.toThounsandUnit( input );
	}

}
