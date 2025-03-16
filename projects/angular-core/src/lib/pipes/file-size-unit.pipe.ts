import {
	Pipe,
	PipeTransform
} from '@angular/core';
import _ from 'lodash';

import {
	Memoize
} from '../decorators/memoize';

@Pipe({ name: 'fileSizeUnit' })
export class FileSizeUnitPipe implements PipeTransform {

	/**
	 * @param {number} input
	 * @return {string}
	 */
	@Memoize()
	public transform( input: number ): string {
		return _.toFileSizeUnit( input );
	}

}
