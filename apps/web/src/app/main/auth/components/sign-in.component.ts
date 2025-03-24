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
	Router,
	ActivatedRoute
} from '@angular/router';
import {
	finalize} from 'rxjs/operators';

import {
	Unsubscriber,
	untilCmpDestroyed
} from '@core';

import {
	Account
} from '@main/account/interfaces';
import {
	AccountService
} from '@main/account/services/account.service';

import {
	REGEXP
} from '@resources';

import {
	CONSTANT
} from '../resources';
import {
	AuthService
} from '../services';

import {
	AuthBase
} from './auth-base';
import { ENVIRONMENT } from '@environments/environment';
import { ISocialCredential, ISocialProfile, ISocialRequest, IToken } from '../interfaces';
import _ from 'lodash';


declare const google: any;
declare const gapi: any;

@Unsubscriber()
@Component({
	selector		: 'sign-in',
	templateUrl		: '../templates/sign-in.pug',
	styleUrls		: [ '../styles/auth.scss', '../styles/sign-in.scss' ],
	host			: { class: 'sign-in' },
	changeDetection	: ChangeDetectionStrategy.OnPush,
})
export class SignInComponent extends AuthBase
	implements OnInit {

	protected readonly PATH: typeof CONSTANT.PATH
		= CONSTANT.PATH;

	protected loaded: boolean;
	protected isSubmitting: boolean;
	protected hiddenPassword: boolean;
	protected isEmailPasswordIncorrect: boolean;
	protected existAccount: string;
	protected wrongEmail: string;
	protected account: Partial<Account> = {};
	protected signInForm: FormGroup;
	protected socialProfile: ISocialProfile;

	private _auth2: any;

	get auth2(): any { return this._auth2; }
	set auth2( value: any ) {
		if ( value ) {
			this._auth2
				= value;
			this.auth2.requestAccessToken();
		}
	}

	constructor(
		private _fb: FormBuilder,
		private _cdRef: ChangeDetectorRef,
		private _activatedRoute: ActivatedRoute,
		private _authService: AuthService,
		private _router: Router,
		private _accountService: AccountService
	) {
		super();

		this.signInForm
			= this._fb.group({
				email: [
					undefined,
					[
						Validators.required,
						Validators.maxLength( 255 ),
						Validators.pattern( REGEXP.EMAIL ),
					],
				],
				password: [
					undefined,
					[
						Validators.required,
						Validators.maxLength( 255 ),
						Validators.minLength( 1 ),
					],
				],
			});
	}

	ngOnInit() {
		this._signInExistAccount();

		setTimeout(
			() => {
				if ( !this._authService.isAccountAccessed ) {
					this._cdRef.markForCheck();
					return;
				}

				this._authService
				.accountInfo()
				.pipe(
					finalize( () => this._cdRef.markForCheck() ),
					untilCmpDestroyed( this )
				)
				.subscribe({
					next: () => {
						this.account
							= this._accountService.storedAccount;
					},
					error: () => {
						this._authService
						.signout()
						.pipe( untilCmpDestroyed( this ) )
						.subscribe({
							next: () => {
								this.loaded
									= true;
							},
						});
					},
				});
			}
		);
	}

	/**
	 * @return {void}
	 */
	protected changeValue() {
		if ( !this.isEmailPasswordIncorrect ) return;

		this.isEmailPasswordIncorrect
			= false;

		this._cdRef.detectChanges();
	}

	/**
	 * @return {void}
	 */
	protected signin() {
		this.isSubmitting
			= true;

		this._authService
		.signin( this.account as Account )
		.pipe( untilCmpDestroyed( this ) )
		.subscribe({
			next: () => {
				// this
				// ._router
				// .navigate([ PANEL_CONSTANT.PATH.MAIN ]);
			},
			error: () => {
				this.isEmailPasswordIncorrect
					= true;
				this.isSubmitting
					= false;

				this._cdRef.markForCheck();
			},
		});
	}

	protected signInByGoogle() {
		gapi.load( 'client', () => {} );

		this.auth2
			= google.accounts.oauth2.initTokenClient({
				// eslint-disable-next-line @typescript-eslint/naming-convention
				client_id: ENVIRONMENT.GOOGLE_CLIENT_ID,
				scope: CONSTANT.GOOGLE_SCOPE,
				ux_mode: 'popup',
				callback: this._onGoogleResponse.bind( this ),
				// eslint-disable-next-line @typescript-eslint/naming-convention
				error_callback: ( response: { type: string } ) => {
					if ( response.type ) {
						this._cdRef.markForCheck();
					};
				},
			});
	}

	private _onGoogleResponse( response: any ) {
		if ( response.error !== undefined ) {
			throw response;
		}

		const accessToken: string
			= gapi.client.getToken()
			.access_token;

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

				const token: IToken
					= {
						socialID: profile.id,
						accessToken,
						type: 'google',
					};
				const credential: ISocialRequest
					= {
						token,
						email: profile.email,
					};

				this._signInSocial( credential );
			},
		});
	}

	private _signInSocial( credential: ISocialRequest ) {
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
				if( _.isString( accountAccess ) ) {
					this.stateNavigate([ CONSTANT.PATH.SIGN_IN ]);

					super.stateNavigate(
						[ CONSTANT.PATH.SIGN_UP ],
						{
							token: accountAccess as string,
							email: this.socialProfile.email,
							name: this.socialProfile.name,
						}
					);
				} else {
					this.account =
						( accountAccess as ISocialCredential )
						.account;
				}
			},
		});
	}

	/**
	 * @return {void}
	 */
	private _signInExistAccount() {
		this.existAccount
			= this._activatedRoute.snapshot.queryParams.email;

		if ( !this.existAccount ) return;

		this._router.navigate(
			[],
			{
				relativeTo: this._activatedRoute,
				queryParams: {},
				queryParamsHandling: '',
			}
		);

		this.signInForm.get( 'email' )
		.patchValue( this.existAccount );

		this.account = {
			...this.account,
			email: this.existAccount,
		};
	}
}
