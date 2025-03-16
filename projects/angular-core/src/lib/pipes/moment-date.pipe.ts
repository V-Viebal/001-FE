import {
	Inject,
	Optional,
	Pipe,
	PipeTransform
} from '@angular/core';
import moment, {
	Moment
} from 'moment-timezone';
import _ from 'lodash';

import {
	CONSTANT
} from '../resources';
import {
	DateTimeConfig,
	DATE_TIME_CONFIG
} from '../injection-token';
import {
	Memoize
} from '../decorators/memoize';

@Pipe({ name: 'momentDate' })
export class MomentDatePipe implements PipeTransform {

	/**
	 * @constructor
	 * @param {DateTimeConfig} _dateTimeConfig
	 */
	constructor(
		@Optional() @Inject( DATE_TIME_CONFIG )
		private _dateTimeConfig: DateTimeConfig
	) {}

	/**
	 * @param {any} input
	 * @param {string=} format
	 * @param {boolean=} showTime
	 * @return {string}
	 */
	@Memoize()
	public transform(
		input: any,
		format?: string,
		showTime?: boolean
	): string {
		if ( _.isNil( input ) ) return input;

		const output: Moment = moment( input );

		if ( !output.isValid() ) return input;

		if ( format === undefined ) {
			const dateFormat: string
				= this._dateTimeConfig.dateFormat
					|| CONSTANT.DATE_FORMAT;

			format = dateFormat;

			if ( showTime ) {
				const timeFormat: string
					= this._dateTimeConfig.timeFormat
						|| CONSTANT.TIME_FORMAT;

				format += ` ${timeFormat}`;
			}
		}

		return output.format( format );
	}

}
