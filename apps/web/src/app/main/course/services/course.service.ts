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
	Course,
	CourseCreate,
	CourseUpdate
} from '../interfaces';

@Injectable()
export class CourseService {

	private readonly _endPoint: string
		= '/api/course';
	private readonly _apiService: AccountApiService
		= inject( AccountApiService );

	/**
	 * @return {Observable}
	 */
	public getAll(): Observable<Course[]> {
		return this._apiService
		.call( `${this._endPoint}/list`, 'GET' );
	}

	/**
	 * @param {ULID} id
	 * @return {Observable}
	 */
	public getDetail( id: ULID ): Observable<Course> {
		return this._apiService
		.call( `${this._endPoint}/detail/${id}` );
	}

	/**
	 * @param {CourseCreate=} data
	 * @return {Observable}
	 */
	public create( data?: CourseCreate ): Observable<Course> {
		return this._apiService
		.call( `${this._endPoint}/create`, 'POST', data );
	}

	/**
	 * @param {ULID} id
	 * @param {CourseUpdate} data
	 * @return {Observable}
	 */
	public update( id: ULID, data: CourseUpdate ): Observable<Partial<Course>> {
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
