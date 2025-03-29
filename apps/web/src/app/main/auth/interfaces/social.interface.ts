import { Account } from '@main/account/interfaces';
import { IAccountToken } from './auth.interface';

export interface ISocialCredential extends IAccountToken {
	account: Account;
}

export interface ISocialProfile {
	id: string;
	email: string;
	name: string;
	picture?: string;
	userPrincipalName?: string;
	displayName?: string;
}

export interface ISocialRequest {
	token: IToken;
}

export interface IToken {
	socialID: string;
	accessToken: string;
	socialType: string;
}
