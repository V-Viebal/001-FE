import {
	Pipe,
	PipeTransform
} from '@angular/core';
import _ from 'lodash';

import {
	Memoize
} from '../decorators/memoize';

@Pipe({ name: 'timer' })
export class TimerPipe implements PipeTransform {

	/**
	 * @param {number} miliseconds
	 * @return {string}
	 */
	@Memoize()
	public transform( miliseconds: number ): string {
		const seconds: number = miliseconds / 1000;
		const h: string = this._padStart(
			( seconds / ( 60 * 60 ) )
		);
		const m: string = this._padStart(
			( seconds / 60 ) % 60
		);
		const s: string = this._padStart(
			seconds % 60
		);

		return `${h}:${m}:${s}`;
	}

	/**
	 * @param {number} n
	 * @return {string}
	 */
	@Memoize()
	private _padStart( n: number ): string {
		return _.padStart(
			String( Math.floor( n ) ),
			2,
			'0'
		);
	}

}
