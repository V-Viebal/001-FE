import { Account } from '@main/account/interfaces';

export interface ISocialCredential {
	account: Account;
	accountToken: string;
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
	email: string;
	token: IToken;
}

export interface IToken {
	socialID: string;
	accessToken: string;
	type: 'google';
}
