import _ from 'lodash';

export type ThrottleOptions = {
	leading?: boolean;
	trailing?: boolean;
};

export function Throttle(
	throttleTime?: number,
	options?: ThrottleOptions
): MethodDecorator {
	return function(
		_t: Object,
		_k: string | symbol,
		descriptor:
			TypedPropertyDescriptor<any>
	) {
		const oldFn:
			( ...args: any[] ) => any
			= descriptor.value;
		const newFn:
			( ...args: any[] ) => any
			= _.throttle(
				oldFn,
				throttleTime,
				options
			);

		descriptor.value = function() {
			try {
				return newFn.apply(
					this,
					arguments
				);
			} catch {
				return oldFn.apply(
					this,
					arguments
				);
			}
		};
	};
}
