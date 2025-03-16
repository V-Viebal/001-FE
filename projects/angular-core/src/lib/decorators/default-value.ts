import _ from 'lodash';

const PROPERTY_NAME: string
	= 'ɵɵdefaultvalue';

export function DefaultValue():
	PropertyDecorator {
	return function(
		target: Object,
		key: string | symbol
	) {
		Object.defineProperty(
			target,
			key,
			{
				get(): any {
					return this[ PROPERTY_NAME ]?.[ key ];
				},
				set( v: any ) {
					let defaultValue: any
						= this[ PROPERTY_NAME ]?.[ key ];

					if ( defaultValue
							=== undefined ) {
						defaultValue = v;
					}

					const metadata: any
						= this[ PROPERTY_NAME ] || {};

					metadata[ key ] = v === ''
						|| v === undefined
						? defaultValue
						: _.isFinite( v )
							? parseFloat( v )
							: v;

					this[ PROPERTY_NAME ] = metadata;
				},
				enumerable: true,
				configurable: true,
			}
		);
	};
}
