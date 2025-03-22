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
	selector		: 'home',
	templateUrl		: '../templates/home.pug',
	styleUrls		: [ '../styles/home.scss' ],
	host			: { class: 'home' },
	changeDetection	: ChangeDetectionStrategy.OnPush,
})
export class HomeComponent implements OnInit {

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
	protected openExplorePage() {

	}

	/**
	 * @return {void}
	 */
	private _initData() {
		this._cdRef.markForCheck();
	}

}
