import {
	Injectable,
	inject
} from '@angular/core';

import {
	HASH
} from '@environments/hash';
import {
	ApiService,
	ApiHeaders
} from '@core';

@Injectable()
export class PublicAccessService {

	public readonly apiService: ApiService
		= inject( ApiService );

	public endPoint: string
		= '/shared/public_access';
	public headers: ApiHeaders
		= { Authorization: `Bearer ${HASH.SHARED_TOKEN}` };

}
