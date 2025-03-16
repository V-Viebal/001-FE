import {
	Injectable,
	inject
} from '@angular/core';
import {
	Router
} from '@angular/router';
import {
	catchError,
	Observable,
	of,
	switchMap
} from 'rxjs';

import {
	CONSTANT as AUTH_CONSTANT
} from '@main/auth/resources';
import {
	AuthService
} from '@main/auth/services';

@Injectable({ providedIn: 'root' })
export class AuthGuard {

	private readonly _router: Router
		= inject( Router );
	private readonly _authService: AuthService
		= inject( AuthService );

	/**
	 * @return {boolean}
	 */
	public canActivateChild(): Observable<boolean> {
		if ( this._authService.isAccountAccessed ) {

			if ( !this._authService.isAccessTokenExpired ) return of( true );

			return this._authService
			.rotateAccessToken()
			.pipe(
				switchMap(() => {
					return of( true );
				}),
				catchError(() => {
					return this._cancelRequest();
				})
			);
		} else {
			return this._cancelRequest();
		}
	}

	private _cancelRequest() {
		this._authService.clearStoredAuth();
		this._router.navigate([ AUTH_CONSTANT.PATH.SIGN_IN ]);

		return of( false );
	}
}
