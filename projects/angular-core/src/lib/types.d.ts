type _NumRange<
	T extends number,
	R extends unknown[]
> = R[ 'length' ] extends T
	? R[ number ]
	: _NumRange<T, [ R[ 'length' ], ...R ]>;

type Nullish = null | undefined;
type NumRange<T extends number>
	= number extends T
		? number
		: _NumRange<T, []>;
type MapObjectValue<T> = T[ keyof T ];
type ObjectType<T = any> = Record<string, T>;
