import {
	Injectable
} from '@angular/core';
import {
	Router
} from '@angular/router';
import {
	untilCmpDestroyed
} from 'angular-core';

import {
	CONSTANT
} from '../resources';

import {
	AuthService
} from './auth.service';

@Injectable({ providedIn: 'root' })
export class AuthGrantService {

	constructor(
		private _router: Router,
		private _authService: AuthService
	) {}

	/**
	 * @return {boolean}
	 */
	public canActivate(): boolean {
		if ( this._authService.isAccessTokenExpired ) {
			this._authService.rotateAccessToken()
			.pipe( untilCmpDestroyed( this ) )
			.subscribe({
				next: () => {
					const isAccountAccessed: boolean
						= this
						._authService
						.isAccountAccessed;

					if ( !isAccountAccessed ) {
						// this._authService.markLastPathBeforeSignOut(); // improve later
						this
						._router
						.navigate([ CONSTANT.PATH.SIGN_IN ]);
					}

					return isAccountAccessed;
				},
				error: () => {
					this._authService.signout();

					this._router.navigate([ CONSTANT.PATH.SIGN_IN ]);

					return false;
				},
			});
		}

		const isAccountAccessed: boolean
			= this
			._authService
			.isAccountAccessed;

		if ( !isAccountAccessed ) {
			this
			._router
			.navigate([ CONSTANT.PATH.SIGN_IN ]);
		}

		return isAccountAccessed;
	}

}
