import {
	Pipe,
	PipeTransform
} from '@angular/core';
import _ from 'lodash';

import {
	Memoize
} from '../decorators/memoize';

@Pipe({ name: 'trackByFn' })
export class TrackByFnPipe implements PipeTransform {

	/**
	 * @param {string} property
	 * @return {( idx: number, item: ObjectType ) => any}
	 */
	@Memoize()
	public transform(
		property: string
	): ( idx: number, item: ObjectType ) => any {
		return ( _idx: number, item: ObjectType ) =>
			property
				? _.get( item, property )
				: item;
	}

}
