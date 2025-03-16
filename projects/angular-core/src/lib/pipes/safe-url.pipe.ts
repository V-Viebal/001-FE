import {
	inject,
	Pipe,
	PipeTransform
} from '@angular/core';
import {
	DomSanitizer,
	SafeResourceUrl
} from '@angular/platform-browser';

import {
	Memoize
} from '../decorators/memoize';

@Pipe({ name: 'safeUrl' })
export class SafeUrlPipe implements PipeTransform {

	private readonly _sanitizer: DomSanitizer
		= inject( DomSanitizer );

	/**
	 * @param {string} value
	 * @return {SafeUrl}
	 */
	@Memoize()
	public transform( value: string ): SafeResourceUrl  {
		return value
			? this._sanitizer
			.bypassSecurityTrustResourceUrl( value )
			: '';
	}

}
