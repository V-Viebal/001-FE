import {
	CUBAvatar
} from '@cub/material';

export type Account = {
	name: string;
	email: string;
	password?: string;
	avatar?: CUBAvatar;
};

export type ResetPassword = {
	account: Account;
	resetPasswordToken: string;
}
