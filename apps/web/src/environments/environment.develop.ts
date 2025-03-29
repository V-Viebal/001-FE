import { appVersion } from './version';

// eslint-disable-next-line @typescript-eslint/typedef
export const ENVIRONMENT = {
	SERVER_API_URL					: process.env.API_URL__DEV,
	SERVER_WEBSOCKET_URL			: process.env.WEBSOCKET_URL__DEV,
	FILE_SYSTEM_API_URL				: process.env.FILE_API_URL__DEV,
	GOOGLE_CLIENT_ID				: process.env.GOOGLE_CLIENT_ID__DEV,
	APP_URL							: 'http://localhost:8080',
	APP_NAME						: 'Viebal',
	APP_LOGO						: 'assets/images/logos/logo-horizontal.png',
	APP_LOGO_VERTICAL				: 'assets/images/logos/logo-vertical.png',
	APP_VERSION						: appVersion,
} as const;
