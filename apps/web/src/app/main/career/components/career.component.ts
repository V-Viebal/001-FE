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
	selector		: 'career',
	templateUrl		: '../templates/career.pug',
	styleUrls		: [ '../styles/career.scss' ],
	host			: { class: 'career' },
	changeDetection	: ChangeDetectionStrategy.OnPush,
})
export class CareerComponent implements OnInit {

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
