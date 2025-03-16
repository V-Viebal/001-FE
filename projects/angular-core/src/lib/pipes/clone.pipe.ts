import {
	Pipe,
	PipeTransform
} from '@angular/core';
import _ from 'lodash';

@Pipe({ name: 'clone' })
export class ClonePipe implements PipeTransform {

	/**
	 * @param {any} data
	 * @param {boolean=} isDeep
	 * @return {any}
	 */
	public transform(
		data: any,
		isDeep?: boolean
	): any {
		return isDeep
			? _.cloneDeep( data )
			: _.clone( data );
	}

}
