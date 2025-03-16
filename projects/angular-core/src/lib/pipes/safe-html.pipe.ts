import {
	inject,
	Pipe,
	PipeTransform
} from '@angular/core';
import {
	DomSanitizer,
	SafeHtml
} from '@angular/platform-browser';

import {
	Memoize
} from '../decorators/memoize';

@Pipe({ name: 'safeHtml' })
export class SafeHtmlPipe implements PipeTransform {

	private readonly _sanitizer: DomSanitizer
		= inject( DomSanitizer );

	/**
	 * @param {string} value
	 * @return {SafeHtml}
	 */
	@Memoize()
	public transform( value: string ): SafeHtml {
		return value
			? this._sanitizer
			.bypassSecurityTrustHtml( value )
			: '';
	}

}
