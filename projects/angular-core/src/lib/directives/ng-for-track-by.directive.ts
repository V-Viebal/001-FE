import {
	Directive,
	Host,
	Input,
	NgIterable
} from '@angular/core';
import {
	NgForOf
} from '@angular/common';
import _ from 'lodash';

@Directive({
	selector: '[ngForTrackByProperty]',
})
export class NgForTrackByPropertyDirective<T> {

	@Input() public ngForOf!: NgIterable<T>;
	@Input() public ngForTrackByProperty!: keyof T;

	/**
	 * @constructor
	 * @param {NgForOf} ngForOfDir
	 */
	constructor(
		@Host() public ngForOfDir: NgForOf<T>
	) {
		ngForOfDir.ngForTrackBy
			= ( _i: number, item: T ): T[ keyof T ] => {
				return _.get(
					item,
					this.ngForTrackByProperty
				);
			};
	}

}

@Directive({
	selector: '[ngForTrackByIndex]',
})
export class NgForTrackByIndexDirective<T> {

	@Input() public ngForOf!: NgIterable<T>;

	/**
	 * @constructor
	 * @param {NgForOf} ngForOfDir
	 */
	constructor(
		@Host() public ngForOfDir: NgForOf<T>
	) {
		ngForOfDir.ngForTrackBy
			= ( index: number ): number => index;
	}

}

@Directive({
	selector: '[ngForTrackByID]',
})
export class NgForTrackByIDDirective<
	T extends { id: number | string }
> {

	@Input() public ngForOf!: NgIterable<T>;

	/**
	 * @constructor
	 * @param {NgForOf} ngForOfDir
	 */
	constructor(
		@Host() public ngForOfDir: NgForOf<T>
	) {
		ngForOfDir.ngForTrackBy
			// eslint-disable-next-line @typescript-eslint/no-shadow
			= ( _i: number, item: T ) => _.get( item, 'id' );
	}

}

@Directive({
	selector: '[ngForTrackByValue]',
})
export class NgForTrackByValueDirective<
	T extends { value: number | string }
> {

	@Input() public ngForOf!: NgIterable<T>;

	/**
	 * @constructor
	 * @param {NgForOf} ngForOfDir
	 */
	constructor(
		@Host() public ngForOfDir: NgForOf<T>
	) {
		ngForOfDir.ngForTrackBy
			// eslint-disable-next-line @typescript-eslint/no-shadow
			= ( _i: number, item: T ) => _.get( item, 'value' );
	}

}
