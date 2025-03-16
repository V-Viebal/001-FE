import {
	Injectable,
	inject
} from '@angular/core';
import {
	ScrollEvent
} from '@core';
import _ from 'lodash';

import {
	AccountApiService
} from '@main/account/services';
import { Email } from '../interfaces';
import { Observable, Subject } from 'rxjs';

@Injectable()
export class BaseService {

	public readonly toast$: Subject<any>
		= new Subject<any>();
	public readonly footer$: Subject<IntersectionObserverEntry>
		= new Subject<IntersectionObserverEntry>();
	public readonly scrollEvent$: Subject<ScrollEvent>
		= new Subject<ScrollEvent>();

	private readonly _endPoint: string
		= '/CustomerRegistrations';
	private readonly _apiService: AccountApiService
		= inject( AccountApiService );

	/**
	 * @param {NewsCreate=} data
	 * @return {Observable}
	 */
	public sendEmail( data?: Email ): Observable<void> {
		return this._apiService
		.call( `${this._endPoint}`, 'POST', data );
	}

}
