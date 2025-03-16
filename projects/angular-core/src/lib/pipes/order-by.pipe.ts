import {
	Pipe,
	PipeTransform
} from '@angular/core';
import _ from 'lodash';

import {
	Memoize
} from '../decorators/memoize';

@Pipe({ name: 'orderBy' })
export class OrderByPipe implements PipeTransform {

	/**
	 * @param {any} input
	 * @return {any}
	 */
	public transform(
		input: any,
		[ config = '+' ]: any
	): any {
		if ( !_.isArray( input ) ) {
			return input;
		}

		if ( !_.isArray( config )
			|| ( _.isArray( config )
				&& config.length === 1 ) ) {
			const propertyToCheck: string
				= !_.isArray( config )
					? config
					: config[ 0 ];
			const symbol: string
				= propertyToCheck.substring( 0, 1 );
			const desc: boolean
				= symbol === '-';

			if ( !propertyToCheck
				|| propertyToCheck === '-'
				|| propertyToCheck === '+' ) {
				return !desc
					? input.sort()
					: input.sort().reverse();
			}

			const property: string
				= symbol === '+'
					|| symbol === '-'
					? propertyToCheck.substring( 1 )
					: propertyToCheck;

			return input.sort(( a: any, b: any ) => {
				const comparison: number
					= this._orderByComparator(
						_.get( a, property ),
						_.get( b, property )
					);

				return desc
					? -comparison
					: comparison;
			});
		}

		return input.sort(( a: any, b: any ) => {
			for ( const c of config ) {
				const symbol: string
					= c.substring( 0, 1 );
				const desc: boolean
					= symbol === '-';
				const property: string
					= symbol === '+'
						|| symbol === '-'
						? c.substring( 1 )
						: c;
				const comparison: number
					= this._orderByComparator(
						_.get( a, property ),
						_.get( b, property )
					);

				if ( comparison !== 0 ) {
					return desc
						? -comparison
						: comparison;
				}
			}

			return 0;
		});
	}

	/**
	 * @param {any} a
	 * @param {any} b
	 * @return {number}
	 */
	@Memoize()
	private _orderByComparator(
		a: any,
		b: any
	): number {
		if ( _.isNil( a )
			&& _.isNil( b ) ) {
			return 0;
		}
		if ( _.isNil( a ) ) return -1;
		if ( _.isNil( b ) ) return 1;

		if ( ( _.isNaN( parseFloat( a ) )
				|| !_.isFinite( a ) )
			|| ( _.isNaN( parseFloat( b ) )
				|| !_.isFinite( b ) ) ) {
			// Isn't a number so lowercase the string to properly compare
			if ( _.toLower( a )
				< _.toLower( b ) ) {
				return -1;
			}

			if ( _.toLower( a )
				> _.toLower( b ) ) {
				return 1;
			}
		} else {
			// Parse strings as numbers to compare properly
			if ( parseFloat( a )
				< parseFloat( b ) ) {
				return -1;
			}

			if ( parseFloat( a )
				> parseFloat( b ) ) {
				return 1;
			}
		}

		return 0; // equal each other
	}

}
