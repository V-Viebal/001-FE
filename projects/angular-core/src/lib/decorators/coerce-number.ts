import {
	coerceNumberProperty
} from '@angular/cdk/coercion';
import _ from 'lodash';

const PROPERTY_NAME: string
	= 'ɵɵmetadata';

export function CoerceNumber():
	PropertyDecorator {
	return function(
		target: Object,
		key: string | symbol
	) {
		Object.defineProperty(
			target,
			key,
			{
				get(): number {
					return this[ PROPERTY_NAME ]?.[ key ];
				},
				set( v: number ) {
					const metadata: any
						= this[ PROPERTY_NAME ] || {};

					metadata[ key ]
						= _.isNil( v )
							? v
							: coerceNumberProperty( v );

					this[ PROPERTY_NAME ]
						= metadata;
				},
				enumerable: true,
				configurable: true,
			}
		);
	};
}
