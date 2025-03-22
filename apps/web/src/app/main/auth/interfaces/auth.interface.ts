import { Account } from '@main/account/interfaces';

import { CONSTANT } from '../resources';

export type IScreenType = MapObjectValue<typeof CONSTANT.SCREEN_TYPE>;

export interface IAuth extends IAccountToken {
	accountEmail: string;
}

export interface IVerifyData {
	email: string;
	otp: string;
}

export interface IAccountToken {
	accessToken: string;
	refreshToken?: string;
	expiresAt?: number;
	expiresIn?: number;
	tokenType?: string;
}

export interface IVerifySignUp {
	signupToken: string;
}

export interface IAccountAccessSignUp {
	accountToken: string;
	createdAccount: Account;
}
