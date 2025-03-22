import {
	Component,
	ChangeDetectorRef,
	ChangeDetectionStrategy,
	OnInit,
	inject
} from '@angular/core';
import _ from 'lodash';

import {
	Unsubscriber
} from '@core';


@Unsubscriber()
@Component({
	selector		: 'course',
	templateUrl		: '../templates/course.pug',
	styleUrls		: [ '../styles/course.scss' ],
	host			: { class: 'course' },
	changeDetection	: ChangeDetectionStrategy.OnPush,
})
export class CourseComponent implements OnInit {

	private readonly _cdRef: ChangeDetectorRef
		= inject( ChangeDetectorRef );

	/**
	 * @constructor
	 */
	ngOnInit() {
		this._initData();
	}

	/**
	 * @return {void}
	 */
	private _initData() {
		this._cdRef.markForCheck();
	}

}
