import {
	Injectable,
	inject
} from '@angular/core';
// import {
// 	Platform
// } from '@angular/cdk/platform';
import {
	Observable,
	Observer,
	of,
	Subject
} from 'rxjs';
import {
	finalize,
	tap
} from 'rxjs/operators';
import moment from 'moment-timezone';
import _ from 'lodash';
import {
	HttpClient
} from '@angular/common/http';

import {
	HASH
} from '@environments/hash';
// import {
// 	ENVIRONMENT
// } from '@environments/environment';

import {
	ApiHeaders,
	ApiParams,
	PageService,
	ServiceWorkerService,
	StorageService,
	untilCmpDestroyed,
	WebSocketService
} from '@core';

import {
	Account,
	ResetPassword
} from '@main/account/interfaces/account.interface';
import {
	AccountService
} from '@main/account/services/account.service';
import {
	AccountApiService
} from '@main/account/services';

import {
	IAccountToken,
	IAccountAccessSignUp,
	IAuth,
	IVerifyData,
	IVerifySignUp,
	ISocialProfile,
	ISocialRequest,
	ISocialCredential
} from '../interfaces';
import {
	CONSTANT
} from '../resources';

@Injectable({ providedIn: 'root' })
export class AuthService {

	public static readonly IGNORE_MARK_LAST_PATHS: string[] = [
		CONSTANT.PATH.RESET_PASSWORD,
		CONSTANT.PATH.SIGN_IN,
		CONSTANT.PATH.SIGN_OUT,
	];

	public isRefreshing: boolean;

	private readonly _apiService: AccountApiService
		= inject( AccountApiService );
	private readonly _endPoint: string = '/Users';
	private _apiGoogleUrl: string
		= 'https://www.googleapis.com/oauth2/v1/userinfo';

	private _bufferTime: number = 3590;
	private _rotateTimeout: NodeJS.Timeout;
	private _storedAuth: IAuth;

	get isAccountAccessed(): boolean {
		return !!this.getStoredAuth()?.accountEmail;
	}

	get isAccessTokenExpired(): boolean {
		return moment().utc().add( this._bufferTime, 'seconds' )
		.isAfter(
			moment.unix( this.getStoredAuth().expiresAt ).utc()
		);
	}

	public $isExistAccount: Subject<boolean>
		= new Subject<boolean>();
	public $isReady: Subject<boolean>
		= new Subject<boolean>();

	constructor(
		private _storageService: StorageService,
		// private _platform: Platform,
		private _pageService: PageService,
		private _accountService: AccountService,
		private _serviceWorkerService: ServiceWorkerService,
		private _webSocketService: WebSocketService,
		private _httpClient: HttpClient
	) {
		// this._platform.SAFARI && this._storageService.setCookieOptions({ sameSite: 'Lax', secure: false });

		// window.addEventListener( 'beforeunload', () => {
		// 	if (
		// 		this._accountService.storedAccount
		// 		&& this._accountService.storedAccount.logoutSetting
		// 		&& this._accountService.storedAccount.logoutSetting.type
		// 			=== ACCOUNT_CONSTANT.LOGOUT_SETTING_TYPE.CLOSE_BROWSER
		// 	) {
		// 		this.signout()
		// 		.pipe(
		// 			switchMap( () => { return this._accountService.delete(); } )
		// 		)
		// 		.subscribe();
		// 	}
		// });
		this._scheduleRotateToken( this.getStoredAuth()?.expiresAt );
	}


	/**
	 * @return {Observable}
	 */
	public rotateAccessToken(): Observable<IAccountToken> {
		const refreshToken: string
			= this._storedAuth.refreshToken;

		if ( !refreshToken ) {
			return of( null );
		}

		return this
		._apiService
		.call(
			`${this._endPoint}/refresh`,
			'POST',
			{ refreshToken: refreshToken }
		).pipe(
			tap( ( result: IAccountToken ) => {
				this.setStoredAuth({
					accessToken: result.accessToken,
					expiresAt: moment().utc().add( result.expiresIn, 'seconds' ).unix(),
					refreshToken: result.refreshToken,
					tokenType: result.tokenType,
					accountEmail: this._storedAuth.accountEmail,
				});

				this._scheduleRotateToken(
					moment().utc().add( result.expiresIn, 'seconds' ).unix() );
			})
		);
	}

	/**
	 * @return {Observable}
	 */
	public accountInfo(): Observable<Account> {
		return this._apiService
		.call(
			`${this._endPoint}/info`,
			'GET'
		)
		.pipe(
			tap( ( account: Account ) => {
				this._accountService.storedAccount = account;
			} )
		);
	}

	/**
	 * @param {Account} account
	 * @return {Observable}
	 */
	public signin( account: Account ): Observable<IAccountToken> {
		const params: ApiParams
			= {
				email: account.email,
				password: account.password,
			};

		return this._apiService
		.call( `${this._endPoint}/login`, 'POST', params )
		.pipe( tap( ( result: IAccountToken ) => {
			this._accountService.storedAccount
				= {
					name: account.email,
					email: account.email,
					password: account.password,
				};

			this.setStoredAuth({
				accessToken: result.accessToken,
				expiresAt: moment().utc().add( result.expiresIn, 'seconds' ).unix(),
				refreshToken: result.refreshToken,
				tokenType: result.tokenType,
				accountEmail: account.email,
			});

			this._scheduleRotateToken( moment().utc().add( result.expiresIn, 'seconds' ).unix() );
		} ) );
	}

	public getGoogleProfile( accessToken: string ): Observable<ISocialProfile> {
		const headers: ApiHeaders = {
			// eslint-disable-next-line @typescript-eslint/naming-convention
			'Content-Type': 'application/json',
			// eslint-disable-next-line quote-props, @typescript-eslint/naming-convention
			'Authorization': `Bearer ${ accessToken }`,
		};

		return this._httpClient
		.get<ISocialProfile>( `${this._apiGoogleUrl}`, { headers } );
	}


	public authWithSocial(
		credential: ISocialRequest
	): Observable<ISocialCredential> {
		const params: ApiParams
			= {
				email: credential.email,
				token: _.aesEncrypt( credential.token ),
			};

		return this._apiService
		.call( `${this._endPoint}/check-available-social`, 'POST', params )
		.pipe( tap( ( result: ISocialCredential ) => {
			this._accountService.storedAccount = result.account;

			this.setStoredAuth({
				accessToken: result.accountToken,
				accountEmail: result.account?.email,
			});
		} ) );
	}

	public signout(): Observable<void> {
		return new Observable( ( observer: Observer<void> ) => {
			// Clear stored auth
			this.clearStoredAuth();

			// Clear stored account
			this._accountService.clearStoredAccount();

			// Clear all stored cookies
			this._storageService.clearAllCookies();

			// Reset cached current url
			this._pageService.setCurrentURL( null );

			// Disable service worker push notification
			this._serviceWorkerService.disablePushNotification();

			// Disconnect socket
			this._webSocketService.disconnect();

			observer.next();
		} );
	}

	/**
	 * @param {string} type
	 * @param {string} email
	 * @return {Observable}
	 */
	public sendOTP( type: string, email: string ): Observable<void> {
		const params: ApiParams = { email };

		switch ( type ) {
			case CONSTANT.SCREEN_TYPE.RESET_PASSWORD:
				return this._apiService.call( `${this._endPoint}/send-reset-password-otp`, 'POST', params );
		}
	}

	/**
	 * @param {IVerifyData} data
	 * @return {Observable}
	 */
	public verifySignUpOTP( data: IVerifyData ): Observable<IVerifySignUp> {
		return this._apiService
		.call(
			`${this._endPoint}/verify-signup-otp`,
			'POST',
			data
		);
	}

	/**
	 * @param {IVerifyData} data
	 * @return {Observable}
	 */
	public verifyResetPasswordOTP(
		data: IVerifyData
	): Observable<ResetPassword> {
		return this._apiService
		.call(
			`${this._endPoint}/verify-reset-password-otp`,
			'POST',
			data
		);
	}

	/**
	 * @param {string} token
	 * @param {Account} account
	 * @param {string=} referralCode
	 * @return {Observable}
	 */
	public signup(
		token: string,
		account: Account,
		referralCode?: string
	): Observable<IAccountAccessSignUp> {
		const params: ApiParams = {
			referralCode,
			email	: account.email,
			name	: account.name,
			password: _.aesEncrypt( account.password ),
		};

		return this._apiService
		.call(
			`${this._endPoint}/signup?token=${encodeURIComponent( token )}`,
			'POST',
			params
		);
	}

	/**
	 * @param {string} token
	 * @param {Account} account
	 * @return {Observable}
	 */
	public resetPassword(
		token: string,
		account: Account
	): Observable<void> {
		const params: ApiParams = {
			email	: account.email,
			password: _.aesEncrypt( account.password ),
		};

		return this._apiService
		.call(
			`${this._endPoint}
				/reset-password
				?token=${encodeURIComponent( token )}`,
			'POST',
			params
		);
	}

	/**
	 * @param {IAuth} authData
	 * @return {void}
	 */
	public setStoredAuth( authData: IAuth ) {
		this._storedAuth = authData;

		if ( !authData ) return;

		// // Enable service worker push notification
		// this._serviceWorkerService
		// .enablePushNotification({
		// 	onNotificationClicked: ( { notification }: { notification: NotificationOptions } ) => window.open(
		// 		`${ENVIRONMENT.APP_URL}/notification?notificationID=${notification?.data?.notificationID}`
		// 	),
		// });

		// Store authentication data
		this._storageService.setCookie(
			HASH.AUTHORIZED_KEY,
			authData,
			moment()
			.add( 2, 'y' )
			.toDate()
		);
	}

	/**
	 * @return {IAuth}
	 */
	public getStoredAuth(): IAuth {
		if ( !this._storedAuth ) {
			this._storedAuth
				= this
				._storageService
				.getCookie(
					HASH.AUTHORIZED_KEY
				);
		}

		return this._storedAuth;
	}

	/**
	 * @return {void}
	 */
	public clearStoredAuth() {
		this._storedAuth = undefined;
	}

	/**
	 * @return {void}
	 */
	private _scheduleRotateToken( expiresAt: number ) {
		const currentTimeWithBuffer: moment.Moment
			= moment().utc().add( this._bufferTime, 'seconds' );
		const tokenExpireMoment: moment.Moment
			= moment.unix( expiresAt ).utc();
		const remainingSeconds: number
			= tokenExpireMoment.diff( currentTimeWithBuffer, 'seconds' );

		if ( remainingSeconds ) {
			if ( this._rotateTimeout ) {
				clearTimeout( this._rotateTimeout );
			}

			this._rotateTimeout
				= setTimeout(
					() => {
						this.isRefreshing = true;

					this.rotateAccessToken()
					.pipe(
						finalize(() => {
							this.isRefreshing = false;
						}),
						untilCmpDestroyed( this )
					)
					.subscribe();
				},
				remainingSeconds * 1000
			);

		}

	}
}
