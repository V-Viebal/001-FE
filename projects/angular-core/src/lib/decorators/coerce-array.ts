import {
	coerceArray
} from '@angular/cdk/coercion';
import _ from 'lodash';

const PROPERTY_NAME: string
	= 'ɵɵmetadata';

export function CoerceArray<T>():
	PropertyDecorator {
	return function(
		target: Object,
		key: string | symbol
	) {
		Object.defineProperty(
			target,
			key,
			{
				get(): T {
					return this[ PROPERTY_NAME ]?.[ key ];
				},
				set( v: T ) {
					const metadata: any
						= this[ PROPERTY_NAME ] || {};

					metadata[ key ]
						= _.isNil( v )
							? v
							: coerceArray<T>( v );

					this[ PROPERTY_NAME ]
						= metadata;
				},
				enumerable: true,
				configurable: true,
			}
		);
	};
}
