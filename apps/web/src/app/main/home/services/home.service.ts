import {
	Injectable,
	inject
} from '@angular/core';
import _ from 'lodash';
import {
	Observable
} from 'rxjs';

import {
	AccountApiService
} from '@main/account/services';

import {
	Data
} from '../interfaces';

@Injectable()
export class BaseService {

	private readonly _endPoint: string
		= '/endPoint';
	private readonly _apiService: AccountApiService
		= inject( AccountApiService );

	/**
	 * @param {NewsCreate=} data
	 * @return {Observable}
	 */
	public get(): Observable<Data> {
		return this._apiService
		.call( `${this._endPoint}`, 'POST' );
	}

}
