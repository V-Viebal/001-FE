import {
	Directive,
	Host,
	Input,
	NgIterable
} from '@angular/core';
import {
	CdkVirtualForOf
} from '@angular/cdk/scrolling';
import _ from 'lodash';

@Directive({
	selector: '[cdkVirtualForTrackByProperty]',
})
export class CdkVirtualForTrackByPropertyDirective<T> {

	@Input() public cdkVirtualForOf!: NgIterable<T>;
	@Input() public cdkVirtualForTrackByProperty!: keyof T;

	/**
	 * @constructor
	 * @param {CdkVirtualForOf} cdkVirtualForOfDir
	 */
	constructor(
		@Host() public cdkVirtualForOfDir: CdkVirtualForOf<T>
	) {
		cdkVirtualForOfDir.cdkVirtualForTrackBy
			= ( _i: number, item: T ): T[ keyof T ] => {
				return _.get(
					item,
					this.cdkVirtualForTrackByProperty
				);
			};
	}

}

@Directive({
	selector: '[cdkVirtualForTrackByIndex]',
})
export class CdkVirtualForTrackByIndexDirective<T> {

	@Input() public cdkVirtualForOf!: NgIterable<T>;

	/**
	 * @constructor
	 * @param {CdkVirtualForOf} cdkVirtualForOfDir
	 */
	constructor(
		@Host() public cdkVirtualForOfDir: CdkVirtualForOf<T>
	) {
		cdkVirtualForOfDir.cdkVirtualForTrackBy
			= ( index: number ): number => index;
	}

}

@Directive({
	selector: '[cdkVirtualForTrackByID]',
})
export class CdkVirtualForTrackByIDDirective<
	T extends { id: number | string }
> {

	@Input() public cdkVirtualForOf!: NgIterable<T>;

	/**
	 * @constructor
	 * @param {CdkVirtualForOf} cdkVirtualForOfDir
	 */
	constructor(
		@Host() public cdkVirtualForOfDir: CdkVirtualForOf<T>
	) {
		cdkVirtualForOfDir.cdkVirtualForTrackBy
			// eslint-disable-next-line @typescript-eslint/no-shadow
			= ( _i: number, item: T ) => _.get( item, 'id' );
	}

}

@Directive({
	selector: '[cdkVirtualForTrackByValue]',
})
export class CdkVirtualForTrackByValueDirective<
	T extends { value: number | string }
> {

	@Input() public cdkVirtualForOf!: NgIterable<T>;

	/**
	 * @constructor
	 * @param {CdkVirtualForOf} cdkVirtualForOfDir
	 */
	constructor(
		@Host() public cdkVirtualForOfDir: CdkVirtualForOf<T>
	) {
		cdkVirtualForOfDir.cdkVirtualForTrackBy
			// eslint-disable-next-line @typescript-eslint/no-shadow
			= ( _i: number, item: T ) => _.get( item, 'value' );
	}

}
