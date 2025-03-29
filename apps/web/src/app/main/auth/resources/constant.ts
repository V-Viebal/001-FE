// eslint-disable-next-line @typescript-eslint/typedef, @typescript-eslint/explicit-function-return-type, @typescript-eslint/explicit-module-boundary-types
export const CONSTANT = {
	PATH: {
		RESET_PASSWORD		: 'reset-password',
		SIGN_IN				: 'sign-in',
		SIGN_UP				: 'sign-up',
		SIGN_OUT			: 'sign-out',
	},
	SCREEN_TYPE: {
		SIGNIN			: 'signin',
		RESET_PASSWORD	: 'reset-password',
		SIGNUP			: 'signup',
	},
	SOCIAL_TYPE: {
		GOOGLE: 'Google',
	},
	GOOGLE_SCOPE: 'profile email',
} as const;
