import {
	Pipe,
	PipeTransform
} from '@angular/core';
import moment, {
	Moment
} from 'moment-timezone';
import _ from 'lodash';

@Pipe({ name: 'momentFromNow' })
export class MomentFromNowPipe implements PipeTransform {

	/**
	 * @param {any} input
	 * @return {string}
	 */
	public transform( input: any ): string {
		if ( _.isNil( input ) ) return input;

		const output: Moment = moment( input );

		return output.isValid()
			? output.fromNow()
			: input;
	}

}
