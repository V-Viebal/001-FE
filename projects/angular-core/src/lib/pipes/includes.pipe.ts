import {
	Pipe,
	PipeTransform
} from '@angular/core';
import _ from 'lodash';

@Pipe({ name: 'includes' })
export class IncludesPipe implements PipeTransform {

	/**
	 * @param {any[]} arr
	 * @param {any} item
	 * @return {boolean}
	 */
	public transform(
		arr: any[],
		item: any
	): boolean {
		return _.includes( arr, item );
	}

}
