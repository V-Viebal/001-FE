import {
	coerceBooleanProperty
} from '@angular/cdk/coercion';
import _ from 'lodash';

const PROPERTY_NAME: string
	= 'ɵɵmetadata';

export function CoerceBoolean():
	PropertyDecorator {
	return function(
		target: Object,
		key: string | symbol
	) {
		Object.defineProperty(
			target,
			key,
			{
				get(): boolean {
					return this[ PROPERTY_NAME ]?.[ key ];
				},
				set( v: boolean ) {
					const metadata: any
						= this[ PROPERTY_NAME ] || {};

					metadata[ key ]
						= _.isNil( v )
							? v
							: coerceBooleanProperty( v );

					this[ PROPERTY_NAME ]
						= metadata;
				},
				enumerable: true,
				configurable: true,
			}
		);
	};
}
