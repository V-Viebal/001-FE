import {
	Pipe,
	PipeTransform
} from '@angular/core';
import _ from 'lodash';

import {
	RGB
} from '../lodash-mixin';
import {
	Memoize
} from '../decorators/memoize';

@Pipe({ name: 'isContrast' })
export class IsContrastPipe implements PipeTransform {

	/**
	 * @param {string} hex
	 * @return {boolean}
	 */
	@Memoize()
	public transform( hex: string ): boolean {
		if ( !hex ) return false;

		const rgb: RGB = _.toRgb( hex );

		if ( !rgb ) return false;

		const contrast: number = (
			Math.round( rgb.r * 299 )
				+ Math.round( rgb.g * 587 )
				+ Math.round( rgb.b * 114 ) ) / 1000;

		return contrast < 180;
	}

}
