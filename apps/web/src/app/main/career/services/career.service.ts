import {
	Injectable,
	inject
} from '@angular/core';
import {
	Observable,
} from 'rxjs';
import {
	ULID
} from 'ulidx';
import _ from 'lodash';

import {
	AccountApiService
} from '@main/account/services';

import {
	Career,
	CareerCreate,
	CareerUpdate
} from '../interfaces';

@Injectable()
export class CareerService {

	private readonly _endPoint: string
		= '/api/career';
	private readonly _apiService: AccountApiService
		= inject( AccountApiService );

	/**
	 * @return {Observable}
	 */
	public getAll(): Observable<Career[]> {
		return this._apiService
		.call( `${this._endPoint}/list`, 'GET' );
	}

	/**
	 * @param {ULID} id
	 * @return {Observable}
	 */
	public getDetail( id: ULID ): Observable<Career> {
		return this._apiService
		.call( `${this._endPoint}/detail/${id}` );
	}

	/**
	 * @param {CareerCreate=} data
	 * @return {Observable}
	 */
	public create( data?: CareerCreate ): Observable<Career> {
		return this._apiService
		.call( `${this._endPoint}/create`, 'POST', data );
	}

	/**
	 * @param {ULID} id
	 * @param {CareerUpdate} data
	 * @return {Observable}
	 */
	public update( id: ULID, data: CareerUpdate ): Observable<Partial<Career>> {
		return this._apiService
		.call( `${this._endPoint}/update/${id}`, 'PUT', data );
	}

	/**
	 * @param {ULID} id
	 * @return {Observable}
	 */
	public delete( id: ULID ): Observable<void> {
		return this._apiService
		.call( `${this._endPoint}/delete/${id}`, 'DELETE' );
	}
}
