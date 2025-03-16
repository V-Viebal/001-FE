// eslint-disable-next-line @typescript-eslint/naming-convention
import CryptoJS
	from 'crypto-js';
import moment, {
	unitOfTime
} from 'moment-timezone';
import _ from 'lodash';

const AES_IV: CryptoJS.lib.WordArray
	= CryptoJS.enc.Hex
	.parse( '101112131415161718191a1b1c1d1e1f' );
const AES_HASH_KEY: CryptoJS.lib.WordArray
	= CryptoJS.enc.Hex
	.parse( '000102030405060708090a0b0c0d0e0f' );
const ACCENTED_CHARACTER_MAP: ObjectType<string> = {
	a: '[aàảãáạăằẳẵắặâầẩẫấậ]',
	d: '[dđ]',
	e: '[eèẻẽéẹêềểễếệ]',
	i: '[iìỉĩíị]',
	o: '[oòỏõóọôồổỗốộơờởỡớợ]',
	u: '[uùủũúụưừửữứự]',
	y: '[yỳỷỹýỵ]',
};
const IS_MACOS: boolean
	= /Mac/i.test( navigator.userAgent );

declare module 'lodash' {
	interface LoDashStatic {
		aesDecrypt(
			code: string,
			key?: string | CryptoJS.lib.WordArray,
			opts?: any
		): any;
		aesEncrypt(
			data: any,
			key?: string | CryptoJS.lib.WordArray,
			opts?: any
		): string;
		arrayInsert(
			arr: any[],
			item: any,
			index?: number
		): any[]; // Temp
		arrayJoin(
			arr: any[],
			joinSymbol?: string
		): string; // Temp
		arrayResert(
			arr: any[],
			item: any,
			index?: number,
			type?: string
		): any[]; // Temp
		arrayUpdate(
			arr: any[],
			item: any,
			index?: number
		): any[]; // Temp
		escapeRegExp(
			str: string
		): string;
		isCmdKey(
			e: KeyboardEvent
		): boolean;
		isStrictEmpty(
			value: any
		): boolean;
		matchAll(
			regex: RegExp,
			value: string
		): any[];
		median(
			arr: number[]
		): number;
		search(
			str: string,
			match: string
		): boolean;
		stripAccentedCharacters(
			str: string
		): string;
		stripHtml(
			html: string
		): string;
		toCommasSeparator(
			num: number,
			decimalPlaces?: number
		): string;
		toFileSizeUnit(
			fileSize: number
			): string;
		toPercent(
			num: number,
			decimalPlaces?: number,
			isIncludeUnit?: boolean
		): number | string;
		toRegExp(
			str: string,
			flags?: string
		): RegExp;
		toRgb(
			hex: string
		): RGB;
		toSearchRegExp(
			str: string,
			flags?: string
		): RegExp;
		toSearchString(
			str: string,
			ignoreWhitespace?: boolean
		): string;
		toThounsandUnit(
			num: number,
			decimalPlaces?: number
		): string;
	}
	// eslint-disable-next-line @typescript-eslint/naming-convention, @typescript-eslint/no-unused-vars
	interface LoDashExplicitWrapper<TValue> {
		aesDecrypt(
			key?: string | CryptoJS.lib.WordArray,
			opts?: any
		): LoDashExplicitWrapper<any>;
		aesEncrypt(
			key?: string | CryptoJS.lib.WordArray,
			opts?: any
		): LoDashExplicitWrapper<string>;
		arrayInsert(
			item: any,
			index?: number
		): LoDashExplicitWrapper<any[]>; // Temp
		arrayJoin(
			joinSymbol?: string
		): LoDashExplicitWrapper<string>; // Temp
		arrayResert(
			item: any,
			index?: number,
			type?: string
		): LoDashExplicitWrapper<any[]>; // Temp
		arrayUpdate(
			item: any,
			index?: number
		): LoDashExplicitWrapper<any[]>; // Temp
		escapeRegExp(): LoDashExplicitWrapper<string>;
		isCmdKey(): LoDashExplicitWrapper<boolean>;
		isStrictEmpty(): LoDashExplicitWrapper<boolean>;
		matchAll(
			value: string
		): LoDashExplicitWrapper<any[]>;
		median(
			arr: number[]
		): LoDashExplicitWrapper<number>;
		search(
			match: string
		): LoDashExplicitWrapper<boolean>;
		stripAccentedCharacters(): LoDashExplicitWrapper<string>;
		stripHtml(): LoDashExplicitWrapper<string>;
		toCommasSeparator(
			num: number,
			decimalPlaces?: number
		): string;
		toFileSizeUnit(
			fileSize: number
		): LoDashExplicitWrapper<string>;
		toPercent(
			num: number,
			decimalPlaces?: number,
			isIncludeUnit?: boolean
		): LoDashExplicitWrapper<number | string>;
		toRegExp(
			flags?: string
		): LoDashExplicitWrapper<RegExp>;
		toRgb(): LoDashExplicitWrapper<RGB>;
		toSearchRegExp(
			flags?: string
		): LoDashExplicitWrapper<RegExp>;
		toSearchString(
			ignoreWhitespace?: boolean
		): LoDashExplicitWrapper<string>;
		toThounsandUnit(
			num: number,
			decimalPlaces?: number
		): string;
	}
}

export interface RGB {
	r: number;
	g: number;
	b: number;
}

// eslint-disable-next-line @typescript-eslint/typedef, @typescript-eslint/explicit-function-return-type, @typescript-eslint/explicit-module-boundary-types
export const LODASH_MIXIN = {
	aesEncrypt: (
		data: any,
		key: string | CryptoJS.lib.WordArray
		= AES_HASH_KEY,
		opts?: any
	): string => {
		let exp: number;

		if ( opts
			&& _.isString( opts.exp ) ) {
			const matched: RegExpExecArray
				= opts.exp.match( /([0-9]+)([a-z]+)/ );
			const expNum: number
				= parseFloat( _.get( matched, 1 ) );
			const expUnit: string
				= _.get( matched, 2 );

			exp = expNum
				? +moment().add(
					expNum,
					expUnit as unitOfTime.DurationConstructor
				)
				: undefined;
		}

		data = JSON.stringify({
			data,
			exp,
			salt: _.get( opts, 'salt' ),
		});

		return CryptoJS.AES
		.encrypt(
			data,
			key,
			{ iv: AES_IV }
		).toString();
	},
	aesDecrypt: (
		code: string,
		key: string | CryptoJS.lib.WordArray
		= AES_HASH_KEY,
		opts?: any
	): any => {
		try {
			const bytes: CryptoJS.lib.WordArray
				= CryptoJS.AES.decrypt(
					code,
					key,
					{ iv: AES_IV }
				);
			let decoded: any
				= bytes.toString( CryptoJS.enc.Utf8 );

			if ( !decoded ) {
				throw new Error();
			}

			decoded = JSON.parse( decoded );

			if ( ( decoded.salt
					&& decoded.salt !== _.get( opts, 'salt' ) )
				|| ( decoded.exp
						&& moment( decoded.exp )
						.isBefore( moment() ) ) ) {
				throw new Error();
			}

			return decoded.data;
		} catch {}
	},
	arrayInsert: ( // Temp
		arr: any[],
		item: any,
		index?: number
	): any[] => {
		arr = _.isArray( arr )
			? arr
			: [];

		if ( index === -1
			|| _.isNil( index ) ) {
			arr.push( item );
		} else {
			arr.splice( index, 0, item );
		}

		return arr;
	},
	arrayJoin: ( // Temp
		arr: any[],
		joinSymbol: string = ', '
	): string => {
		return _.chain( arr )
		.filter(( item: any ) => {
			return !_.isNil( item )
				&& item !== '';
		})
		.join( joinSymbol )
		.value();
	},
	arrayUpsert: ( // Temp
		arr: any[],
		item: any,
		index?: number,
		type: string = 'push'
	): any[] => {
		arr = _.isArray( arr )
			? arr
			: [];

		index = _.isNil( index )
			? _.indexOf( arr, item )
			: index;

		if ( index === -1 ) {
			type === 'push'
				? arr.push( item )
				: arr.unshift( item );
		} else {
			arr[ index ] = item;
		}

		return arr;
	},
	arrayResert: ( // Temp
		arr: any[],
		item: any,
		index?: number,
		type: string = 'push'
	): any[] => {
		arr = _.isArray( arr )
			? arr
			: [];

		index = _.isNil( index )
			? _.indexOf( arr, item )
			: index;

		if ( index === -1 ) {
			type === 'push'
				? arr.push( item )
				: arr.unshift( item );
		} else {
			arr.splice( index, 1 );
		}

		return arr;
	},
	arrayUpdate: ( // Temp
		arr: any[],
		item: any,
		index?: number
	): any[] => {
		arr = _.isArray( arr )
			? arr
			: [];

		index = _.isNil( index )
			? _.indexOf( arr, item )
			: index;

		if ( index !== -1 ) {
			arr[ index ] = item;
		}

		return arr;
	},
	escapeRegExp: ( str: string ): string => {
		return _.chain( str )
		.replace( /[|\\{}()[\]^$+*?.]/g, '\\$&' )
		.replace( /-/g, '\\x2d' )
		.value();
	},
	isCmdKey: ( e: KeyboardEvent ): boolean => {
		return IS_MACOS
			? e.metaKey
			: e.ctrlKey;
	},
	isStrictEmpty: ( value: any ): boolean => {
		return _.isNil( value )
			|| _.isEqual( value, {} )
			|| _.isEqual( value, [] )
			|| _.isEqual( _.trim( value ), '' );
	},
	matchAll: (
		regex: RegExp,
		value: string
	): any[] => {
		if ( !regex
			|| !value ) {
			return [];
		}

		const matches: string[]
			= value.match( new RegExp( regex ) );

		return _.map(
			matches,
			( match: string ) => {
				return new RegExp( regex )
				.exec( match );
			}
		);
	},
	median: ( arr: number[] ): number => {
		if ( arr.length === 0 ) return;

		arr.sort(
			( a: number, b: number ) => a - b
		);

		const midpoint: number
			= Math.floor( arr.length / 2 );

		return arr.length % 2 === 1
			? arr[ midpoint ]
			: ( arr[ midpoint - 1 ]
				+ arr[ midpoint ] ) / 2;
	},
	search: (
		str: string,
		match: string
	): boolean => {
		if ( !_.isString( str ) ) {
			return false;
		}

		const searchRegExp: RegExp
			= _.toSearchRegExp( match );

		return str.search( searchRegExp ) >= 0;
	},
	stripAccentedCharacters: (
		str: string
	): string => {
		return str?.length
			? _.chain( str.normalize( 'NFD' ) )
			.replace( /\p{Diacritic}/gu, '' )
			.replace( /đ/g, 'd' )
			.replace( /Đ/g, 'D' )
			.value()
			: '';
	},
	stripHtml: ( html: string ): string => {
		return _.replace(
			html,
			/<[^>]*>?/gm,
			''
		);
	},
	toCommasSeparator(
		num: number,
		decimalPlaces?: number
	): string {
		if ( !_.isFinite( num ) ) {
			return num as any;
		}

		const rgx: RegExp = /(\d+)(\d{3})/;
		const arr: string[] = num
		.toFixed( decimalPlaces )
		.split( '.' );
		let str: string = arr[ 0 ];

		while ( rgx.test( str ) ) {
			str = _.replace(
				str,
				rgx,
				`$1,$2`
			);
		}

		if ( arr[ 1 ] ) {
			str += `.${arr[ 1 ]}`;
		}

		return str;
	},
	toFileSizeUnit: (
		fileSize: number
	): string => {
		if ( !fileSize
			|| _.isNaN( fileSize ) ) {
			fileSize = 0;
		}

		let n: number = fileSize;
		let unit: string = 'B';

		if ( fileSize >= 1073741824 ) {
			n = fileSize / 1024 / 1024 / 1024;
			unit = 'GB';
		} else if ( fileSize >= 1048576 ) {
			n = fileSize / 1024 / 1024;
			unit = 'MB';
		} else if ( fileSize >= 1024 ) {
			n = fileSize / 1024;
			unit = 'KB';
		}

		return _.toCommasSeparator(
			n,
			_.isInteger( n )
				? 0
				: 2
		) + unit;
	},
	toPercent(
		num: number,
		decimalPlaces?: number,
		isIncludeUnit?: boolean
	): number | string {
		const str: string = _.isFinite( num )
			? ( num * 100 ).toFixed( decimalPlaces )
			: num as unknown as string;

		if ( !isIncludeUnit ) {
			return _.isFinite( num )
				? Number( str )
				: str;
		}

		return `${str}%`;
	},
	toRegExp: (
		str: string,
		flags: string = 'g'
	): RegExp => {
		return new RegExp(
			_.escapeRegExp( str ),
			flags
		);
	},
	toRgb: ( hex: string ): RGB => {
		const shorthandRegex: RegExp
			= /^#?([a-f\d])([a-f\d])([a-f\d])$/i;

		hex = _.replace(
			hex,
			shorthandRegex,
			(
				_m: string,
				r: string,
				g: string,
				b: string
			) => r + r + g + g + b + b
		);

		const result: RegExpExecArray
			= /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec( hex );

		return result
			? {
				r: parseInt( result[ 1 ], 16 ),
				g: parseInt( result[ 2 ], 16 ),
				b: parseInt( result[ 3 ], 16 ),
			}
			: undefined;
	},
	toSearchRegExp: (
		str: string,
		flags: string = 'gi'
	): RegExp => {
		if ( _.isEmpty( str ) ) return;

		const arr: string[] = _.split( str, '' );

		_.forEach(
			arr,
			( char: string, index: number ) => {
				arr[ index ]
					= ACCENTED_CHARACTER_MAP[ _.toLower( char ) ]
						|| _.escapeRegExp( char );
			}
		);

		return new RegExp(
			arr.join( '' ),
			flags
		);
	},
	toSearchString: (
		str: string,
		ignoreWhitespace?: boolean
	): string => {
		str = _.chain( str )
		.stripAccentedCharacters()
		.toLower()
		.value();

		if ( ignoreWhitespace ) {
			_.replace( str, / /g, '' );
		}

		return str;
	},
	toThounsandUnit(
		num: number,
		decimalPlaces?: number
	): string {
		let n: number = num;
		let unit: string = '';

		if ( Math.abs( num ) >= 1e9 ) {
			n = num / 1e9;
			unit = 'B';
		} else if ( Math.abs( num ) >= 1e6 ) {
			n = num / 1e6;
			unit = 'M';
		} else if ( Math.abs( num ) >= 1e3 ) {
			n = num / 1e3;
			unit = 'K';
		}

		return _.toCommasSeparator(
			n,
			decimalPlaces
		) + unit;
	},
} as const;

_.mixin( LODASH_MIXIN );
