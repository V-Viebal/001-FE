import {
	Directive,
	ElementRef,
	inject,
	ViewChild,
	TemplateRef
} from '@angular/core';
import {
	Params,
	QueryParamsHandling,
	Router
} from '@angular/router';
import _ from 'lodash';

import {
	PageService
} from '@core';

import {
	CUBTooltipRef,
	CUBTooltipService
} from '@cub/material/tooltip';

import {
	AccountService
} from '@main/account/services';
import {
	Account
} from '@main/account/interfaces';

import {
	AuthService
} from '../services';
import {
	COLOR
} from '../resources';

type PasswordRule = {
	minlength: boolean;
	numberOrSymbol: boolean;
	uppercase: boolean;
	lowercase: boolean;
	percent: number;
};

// eslint-disable-next-line no-useless-escape
const NUMBER_OR_SYMBOL_REGEX: RegExp = /[0-9$-/:-?{-~!@#"^_`\[\]\\]/g;
const LOWERCASE_REGEX: RegExp = /[a-z]+/g;
const UPPERCASE_REGEX: RegExp = /[A-Z]+/g;

@Directive()
export class AuthBase {

	@ViewChild( 'checkWeekPassword')
	protected checkWeekPassword: TemplateRef<any>;

	protected isSubmitting: boolean;
	protected hiddenPassword: boolean;
	protected hiddenConfirm: boolean;
	protected token: string;
	protected passwordRule: PasswordRule;
	protected account: Partial<Account>
		= {};
	protected passwordHighlight: ObjectType<{ color: string; message: string }>;

	protected tooltipRef: CUBTooltipRef;

	protected readonly tooltipService: CUBTooltipService
		= inject( CUBTooltipService );
	protected readonly authService: AuthService
		= inject( AuthService );
	protected readonly accountService: AccountService
		= inject( AccountService );
	protected readonly pageService: PageService
		= inject( PageService );
	protected readonly router: Router
		= inject( Router );

	constructor() {
		this.passwordRule
			= {
				minlength: false,
				numberOrSymbol: false,
				uppercase: false,
				lowercase: false,
				percent: 0,
			};

		this.passwordHighlight
			= {
				25: {
					color: COLOR.DANGER,
					message: 'AUTH.MESSAGE.PASSWORD_WEEK',
				},
				50: {
					color: COLOR.WARNING,
					message: 'AUTH.MESSAGE.PASSWORD_MEDIUM_WEEK',
				},
				75: {
					color: COLOR.INFO,
					message: 'AUTH.MESSAGE.PASSWORD_MEDIUM',
				},
				100: {
					color: COLOR.SUCCESS,
					message: 'AUTH.MESSAGE.PASSWORD_STRONG',
				},
			};
	}

	public stateNavigate(
		commands: string[] = [],
		params?: Params,
		queryParamsHandling?: QueryParamsHandling
	) {
		this.router.navigate(
			commands,
			{
				queryParams: {
					...params,
				},
				queryParamsHandling,
			}
		);
	}

	/**
	 * @param {ElementRef} origin
	 * @return {void}
	 */
	protected openTooltip(
		origin: ElementRef
	) {
		if (
			this.tooltipRef?.isOpened
			|| !this.account.password?.length
		) {
			return;
		}

		this.tooltipRef
			= this.tooltipService
			.open(
				origin,
				this.checkWeekPassword,
				undefined,
				{
					position: 'start-below',
					width: 410,
					panelClass: 'tooltip-custom',
				}
			);
	}

	/**
	 * @param {string} password
	 * @param {ElementRef} origin
	 * @return {void}
	 */
	protected changePassword(
		password: string,
		origin: ElementRef
	) {
		if ( !password ) {
			this.passwordRule = {
				minlength: false,
				numberOrSymbol: false,
				uppercase: false,
				lowercase: false,
				percent: 0,
			};

			this.closeTooltip();
			return;
		}

		if ( password ) {
			this.openTooltip( origin );

			const minlength: boolean = password?.length >= 8;
			const numberOrSymbol: boolean =
				!!password.match( NUMBER_OR_SYMBOL_REGEX );
			const uppercase: boolean =
				!!password.match( UPPERCASE_REGEX );
			const lowercase: boolean =
				!!password.match( LOWERCASE_REGEX );
			const percent: number =
				_.chain([
					minlength,
					numberOrSymbol,
					uppercase,
					lowercase,
				])
				.groupBy()
				.get( 'true' )
				.value()?.length * 25;

			this.passwordRule = {
				minlength,
				numberOrSymbol,
				uppercase,
				lowercase,
				percent,
			};
		}
	}

	/**
	 * @return {void}
	 */
	protected closeTooltip(){
		this.tooltipRef?.close();
	}

}
