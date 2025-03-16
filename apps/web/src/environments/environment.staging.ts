import { appVersion } from './version';

// eslint-disable-next-line @typescript-eslint/typedef
export const ENVIRONMENT = {
	SERVER_API_URL					: process.env.API_URL,
	SERVER_WEBSOCKET_URL			: process.env.WEBSOCKET_URL,
	FILE_SYSTEM_API_URL				: process.env.FILE_API_URL,
	GOOGLE_CLIENT_ID				: process.env.GOOGLE_CLIENT_ID,
	APP_URL							: 'https://staging.viebal.top',
	APP_NAME						: 'Viebal',
	APP_LOGO						: 'assets/images/logos/logo.png',
	APP_LOGO_VERTICAL				: 'assets/images/logos/logo-vertical.png',
	APP_VERSION						: appVersion,
} as const;
