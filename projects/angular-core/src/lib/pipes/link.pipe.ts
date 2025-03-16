import {
	Pipe,
	PipeTransform
} from '@angular/core';

import {
	Memoize
} from '../decorators/memoize';

const HTTP_PROTOCOL_REGEXP: RegExp = /^http(s)?/;

@Pipe({ name: 'link' })
export class LinkPipe implements PipeTransform {

	/**
	 * @param {string} link
	 * @return {string}
	 */
	@Memoize()
	public transform( link: string ): string {
		if ( !link ) return;

		return link.match( HTTP_PROTOCOL_REGEXP )
			? link
			: `//${link}`;
	}

}
