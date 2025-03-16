import {
	inject,
	Injectable
} from '@angular/core';
import {
	Router
} from '@angular/router';
import {
	HttpEvent,
	HttpInterceptor,
	HttpHandler,
	HttpRequest,
	HttpErrorResponse
} from '@angular/common/http';
import {
	Observable,
	of,
	throwError
} from 'rxjs';
import {
	catchError,
	finalize,
	switchMap
} from 'rxjs/operators';

import {
	CONSTANT as AUTH_CONSTANT
} from '@main/auth/resources';

import {
	AuthService
} from '../services';

@Injectable()
export class AuthInterceptor implements HttpInterceptor {

	private readonly _authService: AuthService
		= inject( AuthService );
	private readonly _router: Router
		= inject( Router );

	private _isRefreshing: boolean;

	public intercept(
		req: HttpRequest<any>,
		next: HttpHandler
	): Observable<HttpEvent<any>> {
		return next.handle( req )
		.pipe(
			catchError( ( error: Error ) => {
				if (
					error instanceof HttpErrorResponse
					&&
					error.status === 401
				) {
					return this._handle401Error( req, next );
				}

				return throwError( () => error );
			})
		);
	}

	private _handle401Error(
		request: HttpRequest<any>,
		next: HttpHandler
	) {
		if ( !this._isRefreshing ) {
			this._isRefreshing = true;

			return this._authService
			.rotateAccessToken()
			.pipe(
				switchMap(() => {
					const accessToken: string
						= this._authService.getStoredAuth()
						.accessToken;

					const newRequest: HttpRequest<any>
						= request.clone({
							setHeaders:
								{ Authorization: `Bearer ${accessToken}` },
						});

					return next.handle( newRequest );
				}),
				catchError(() => {
					this._authService.clearStoredAuth();
					this._router.navigate([ AUTH_CONSTANT.PATH.SIGN_IN ]);

					return of( null );
				}),
				finalize(() => {
					this._isRefreshing = false;
				})
			);
		}

		return next.handle( request );
	}
}
