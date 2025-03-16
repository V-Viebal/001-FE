import _ from 'lodash';

export function Memoize(
	hasher?:
		( ...args: any[] ) => any,
	validator?: Function
): MethodDecorator {
	return function(
		_t: Object,
		_k: string | symbol,
		descriptor:
			TypedPropertyDescriptor<any>
	) {
		hasher ||= function() {
			return JSON.stringify(
				arguments
			);
		};
		validator ||= function() {
			for ( const argument of arguments ) {
				const type: string
					= typeof argument;

				if ( type !== 'number'
					&& type !== 'string'
					&& type !== 'boolean' ) {
					throw new Error();
				}
			}
		};

		const oldFunction: any
			= descriptor.value;
		const newFunction: any
			= _.memoize(
				oldFunction,
				hasher
			);

		descriptor.value
			= function() {
				try {
					validator
					.apply( this, arguments );

					return newFunction
					.apply( this, arguments );
				} catch {
					return oldFunction
					.apply( this, arguments );
				}
			};
	};
}
