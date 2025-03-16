import {
	coerceCssPixelValue
} from '@angular/cdk/coercion';
import _ from 'lodash';

const PROPERTY_NAME: string
	= 'ɵɵmetadata';

export function CoerceCssPixel():
	PropertyDecorator {
	return function(
		target: Object,
		key: string | symbol
	) {
		Object.defineProperty(
			target,
			key,
			{
				get(): string {
					return this[ PROPERTY_NAME ]?.[ key ];
				},
				set( v: string ) {
					const metadata: any
						= this[ PROPERTY_NAME ] || {};

					metadata[ key ]
						= _.isNil( v )
							? v
							: coerceCssPixelValue( v );

					this[ PROPERTY_NAME ]
						= metadata;
				},
				enumerable: true,
				configurable: true,
			}
		);
	};
}
