import {
	Pipe,
	PipeTransform
} from '@angular/core';
import _ from 'lodash';

@Pipe({ name: 'filter' })
export class FilterPipe implements PipeTransform {

	private _previous: any[];

	/**
	 * @param {any[]} items
	 * @param {any} key
	 * @param {any} matchValue
	 * @param {boolean=} diffComparison
	 * @return {any[]}
	 */
	public transform(
		items: any[],
		key: any,
		matchValue: any,
		diffComparison: boolean = false
	): any[] {
		if ( !items ) return [];

		const hasMatchValue: boolean
			= arguments.length >= 3;
		const filteredItems: any[] = _.filter(
			items,
			( item: any ) => {
				const value: any = key
					? _.get( item, key )
					: item;

				if ( hasMatchValue ) {
					const matched: boolean
						= _.isArray( matchValue )
							? _.includes( matchValue, value )
							: matchValue === value;

					return diffComparison
						? !matched
						: matched;
				}

				return _.isNil( value );
			}
		);
		const isDiff: boolean = !this._previous
			|| filteredItems.length
				!== this._previous.length
			|| !!_.difference(
				filteredItems,
				this._previous
			).length
			|| !!_.difference(
				this._previous,
				filteredItems
			).length;

		if ( isDiff ) {
			this._previous = filteredItems;

			return filteredItems;
		}

		return this._previous;
	}

}
