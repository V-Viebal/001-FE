import {
	inject,
	Injectable
} from '@angular/core';
import {
	Observable
} from 'rxjs';

import {
	ENVIRONMENT
} from '@environments/environment';
import {
	HASH
} from '@environments/hash';

import {
	ApiService,
	StorageService,
	UploadData
} from '@core';

import {
	CUBIFileService,
	CUBUploadFileResponse
} from '@cub/material/file-picker';
import _ from 'lodash';

@Injectable()
export class FileService implements CUBIFileService {

	protected readonly apiService: ApiService
		= inject( ApiService );
	protected readonly storageService: StorageService
		= inject( StorageService );

	/**
	 * @constructor
	 */
	constructor() {
		this.apiService.setBaseURL( ENVIRONMENT.FILE_SYSTEM_API_URL );
	}

	/**
	 * @param {UploadData} data
	 * @param {string=} authorizedKey
	 * @param {string=} authorizedKey
	 * @param {string=} requestUrl
	 * @return {Observable}
	 */
	public upload(
		data: UploadData,
		authorizedKey?: string,
		options?: ObjectType,
		requestUrl: string = 'AttachmentItems'
	): Observable<CUBUploadFileResponse> {
		authorizedKey
			= this.storageService
			.getCookie( HASH.AUTHORIZED_KEY )?.accessToken;

		return this.apiService.upload(
			`/${requestUrl}`,
			data,
			// eslint-disable-next-line @typescript-eslint/naming-convention
			{ Authorization: `Bearer ${authorizedKey}` },
			options
		);
	}

}
