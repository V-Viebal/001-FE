const PROPERTY_NAME: string
	= 'ɵɵmetadata';

export function AliasOf(
	alias: string
): PropertyDecorator {
	return function(
		target: Object,
		key: string | symbol
	) {
		Object.defineProperty(
			target,
			key,
			{
				get(): any {
					return this[ PROPERTY_NAME ]?.[ alias ];
				},
				set( v: any ) {
					const metadata: any
						= this[ PROPERTY_NAME ] || {};

					this[ alias ]
						= metadata[ alias ]
						= v;

					this[ PROPERTY_NAME ]
						= metadata;
				},
				enumerable: true,
				configurable: true,
			}
		);
	};
}
