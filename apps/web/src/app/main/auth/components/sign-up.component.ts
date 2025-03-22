import {
	ChangeDetectionStrategy,
	ChangeDetectorRef,
	Component,
	OnInit
} from '@angular/core';
import {
	FormBuilder,
	FormGroup,
	Validators
} from '@angular/forms';
import {
	ActivatedRoute,
	Params
} from '@angular/router';
import {
	ULID
} from 'ulidx';
import {
	of,
	finalize,
	switchMap,
	catchError
} from 'rxjs';
import _ from 'lodash';

import {
	untilCmpDestroyed,
	Unsubscriber,
	EqualValidators
} from '@core';

import {
	IError
} from '@error/interfaces';
import {
	CONSTANT as ERROR_CONSTANT
} from '@error/resources';

import {
	Account
} from '@main/account/interfaces';

import {
	REGEXP,
} from '@resources';
import {
	ENVIRONMENT
} from '@environments/environment';

import {
	IScreenType,
	ISocialCredential,
	ISocialProfile,
	ISocialRequest,
	IToken
} from '../interfaces';
import {
	CONSTANT
} from '../resources';
import {
	AuthService
} from '../services';

import {
	AuthBase
} from './auth-base';

declare const google: any;
declare const gapi: any;
declare const msal: any;

interface ISignupStep {
	signUp: number;
	otp: number;
	submit: number;
};

@Unsubscriber()
@Component({
	selector		: 'sign-up',
	templateUrl		: '../templates/sign-up.pug',
	styleUrls		: [ '../styles/auth.scss', '../styles/sign-up.scss' ],
	host			: { class: 'auth sign-up' },
	changeDetection	: ChangeDetectionStrategy.OnPush,
})
export class SignUpComponent extends AuthBase
	implements OnInit {

	public static readonly SIGNUP_STEP: ISignupStep
		= { signUp: 1, otp: 2, submit: 3 };

	protected readonly SIGNUP_STEP: ISignupStep
		= SignUpComponent.SIGNUP_STEP;
	protected readonly SIGN_IN_PATH: typeof CONSTANT.PATH.SIGN_IN
		= CONSTANT.PATH.SIGN_IN;
	protected readonly screenType: IScreenType
		= CONSTANT.SCREEN_TYPE.SIGNUP;

	protected token: string;
	protected existAccounts: string[];
	protected isExistAccount: boolean;
	protected fieldTextType: boolean = true;
	protected step: number;
	protected signUpForm: FormGroup;
	protected socialProfile: ISocialProfile;

	private _auth2: any;

	get auth2(): any { return this._auth2; }
	set auth2( value: any ) {
		if ( value ) {
			this._auth2 = value;
			this.auth2.requestAccessToken();
		}
	}

	constructor(
		private _fb: FormBuilder,
		private _cdRef: ChangeDetectorRef,
		private _activatedRoute: ActivatedRoute,
		private _authService: AuthService
	) {
		super();

		this.step
			= SignUpComponent.SIGNUP_STEP.signUp;
		this.signUpForm
			= this._fb.group({
				email: [
					undefined,
					[
						Validators.required,
						Validators.maxLength( 255 ),
						Validators.pattern( REGEXP.EMAIL ),
					],
				],
			});
	}

	ngOnInit() {
		const queryParams: Params
			= this._activatedRoute.snapshot.queryParams;

		this.account.email = queryParams.email;
		this.account.name = queryParams.name;
		this.token = queryParams.token;

		if ( this.token ) {
			this.verifyComplete( this.token );
		} else if (
			this._activatedRoute.snapshot.routeConfig?.path
				=== CONSTANT.PATH.SIGN_UP
		) {
			this.stateNavigate([ CONSTANT.PATH.SIGN_IN ]);
		}
	}

	/**
	 * @return {void}
	 */
	protected signup() {
		this.isSubmitting
			= true;

		this._authService
		.sendOTP( CONSTANT.SCREEN_TYPE.SIGNUP, this.account.email )
		.pipe(
			finalize( () => {
				this.isSubmitting
					= false;

				this._cdRef.markForCheck();
			} ),
			untilCmpDestroyed( this )
		)
		.subscribe({
			next: () => this.step = SignUpComponent.SIGNUP_STEP.otp,
			error: ( err: IError ) => {
				if (
					err.error.message
						=== ERROR_CONSTANT.MESSAGE.ACCOUNT_EXISTS
				) {
					super.stateNavigate(
						[ CONSTANT.PATH.SIGN_IN ],
						{ email: this.account.email }
					);
				};

				if (
					err.error.key
					=== ERROR_CONSTANT.KEY.ACCOUNT_EMAIL_EXISTED
				) {
					this.existAccounts
						? this.existAccounts
							= [ ...this.existAccounts, this.account.email ]
						: this.existAccounts
							= [ this.account.email ];

					this.isExistAccount
						= true;
				};
			},
		});
	}

	/**
	 * @param {string} email
	 * @return {void}
	 */
	protected emailChange( email: string ) {
		if ( !this.existAccounts ) return;

		this.isExistAccount
			= _.includes( this.existAccounts, email );
	}

	/**
	 * @return {void}
	 */
	protected submitAccountInfo() {
		if ( !this.account || !this.token ) return;

		this.isSubmitting
			= true;

		this._authService
		.signup(
			this.token,
			this.account as Account,
			this._activatedRoute.snapshot.queryParams.referralCode
		)
		.pipe(
			finalize( () => {
				this.isSubmitting = false;

				this._cdRef.markForCheck();
			} ),
			untilCmpDestroyed( this )
		)
		.subscribe({
			next: () => {
				this._authService
				.signin( this.account as Account )
				.pipe( untilCmpDestroyed( this ) )
				.subscribe( ( ) => {
					super.stateNavigate(
						[ CONSTANT.PATH.SIGN_IN ],
						undefined,
						'merge'
					);
				} );
			},
		});
	}

	/**
	 * @param {string} accessData
	 * @return {void}
	 */
	protected verifyComplete( accessData: string ) {
		this.signUpForm = this._fb.group(
			{
				name: [
					undefined,
					[
						Validators.required,
						Validators.maxLength( 255 ),
					],
				],
				// email: [
				// 	undefined,
				// 	[
				// 		Validators.required,
				// 		Validators.maxLength( 255 ),
				// 		Validators.pattern( REGEXP.EMAIL ),
				// 	],
				// ],
				newPassword: [
					undefined,
					[
						Validators.required,
						Validators.maxLength( 255 ),
						Validators.minLength( 1 ),
					],
				],
				confirmNewPassword: [
					undefined,
					[
						Validators.required,
						Validators.maxLength( 255 ),
						Validators.minLength( 1 ),
					],
				],
			},
			{
				validators: [ EqualValidators.matchPassword ],
			}
		);

		this.token = accessData;
		this.step = SignUpComponent.SIGNUP_STEP.submit;
	}

	/**
	 * @return {void}
	 */
	protected signUpByGoogle() {
		gapi.load('client', () => {});

		this.auth2 = google.accounts.oauth2.initTokenClient({
			// eslint-disable-next-line @typescript-eslint/naming-convention
			client_id: ENVIRONMENT.GOOGLE_CLIENT_ID,
			scope: CONSTANT.GOOGLE_SCOPE,
			callback: this._onGoogleResponse.bind(this),
			// eslint-disable-next-line @typescript-eslint/naming-convention
			error_callback: ( response: { type: string } ) => {
				if ( response.type ) {
					this._cdRef.markForCheck();
				};
			},
		});
	}

	/**
	 * @param {any} response
	 * @return {void}
	 */
	private _onGoogleResponse( response: any ) {
		if ( response.error !== undefined ) {
			throw response;
		}

		const accessToken: string
			= gapi.client.getToken().access_token;

		this._authService
		.getGoogleProfile( accessToken )
		.pipe(
			finalize( () => {
				this._cdRef.markForCheck();
			} ),
			untilCmpDestroyed( this )
		)
		.subscribe({
			next: ( profile: ISocialProfile ) => {
				this.socialProfile = profile;

				const token: IToken = {
					socialID: profile.id,
					accessToken,
					type: 'google',
				};
				const credential: ISocialRequest = {
					email: profile.email,
					token,
				};

				this._signUpSocial( credential );
			},
		});
	}

	/**
	 * @param {ISocialRequest} credential
	 * @return {void}
	 */
	private _signUpSocial( credential: ISocialRequest ) {
		this._authService
		.authWithSocial( credential )
		.pipe(
			finalize( () => {
				this._cdRef.markForCheck();
			} ),
			untilCmpDestroyed( this )
		)
		.subscribe({
			next: ( accountAccess: ISocialCredential | string) => {
				if( _.isString( accountAccess )) {
					this.token
						= accountAccess as string;
					this.account.name
						= this.socialProfile.name;
					this.account.email
						= this.socialProfile.email;

					this.verifyComplete( this.token );
				} else {
					super.stateNavigate(
						[ CONSTANT.PATH.SIGN_IN ],
						{ isSocial: true }
					);
				}
			},
		});
	}
}
