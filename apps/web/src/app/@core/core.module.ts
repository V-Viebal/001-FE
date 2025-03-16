import {
	Inject,
	NgModule,
	Optional
} from '@angular/core';
import {
	LazyLoadImageModule
} from 'ng-lazyload-image';
import {
	APP_CONFIG,
	AppConfig,
	CoreModule as AngularCoreModule,
	DATE_TIME_CONFIG,
	DateTimeConfig,
	LODASH_MIXIN,
	SERVER_CONFIG,
	STORAGE_CONFIG,
	ServerConfig,
	StorageConfig
} from 'angular-core';
import _ from 'lodash';
import {
	RoundProgressModule
} from 'angular-svg-round-progressbar';

// Apply lodash mixin
_.mixin( LODASH_MIXIN );

import {
	ENVIRONMENT
} from '@environments/environment';
import {
	HASH
} from '@environments/hash';

import {
	CONSTANT as APP_CONSTANT
} from '@resources';

import {
	CopyrightComponent,
	DragZoneComponent,
	MenuBarComponent,
	NotFoundComponent,
	SeenAllComponent
} from './components';
import {
	HighlightStateDirective
} from './directives';
import {
	AppearanceService
} from './services';
import {
	ColorPipe,
	ContrastPipe,
	ControlErrorsPipe,
	EnvironmentPipe,
	ExamplePhoneNumberPipe,
	FileIconPipe,
	FlagImagePipe,
	MetaEmbedPipe,
	PhonePipe
} from './pipes';

@NgModule({
	imports: [
		LazyLoadImageModule,
		AngularCoreModule,

		RoundProgressModule,
	],
	exports: [
		LazyLoadImageModule, AngularCoreModule,

		/* Component Inject (Do not remove) */
		CopyrightComponent, DragZoneComponent, MenuBarComponent,
		NotFoundComponent, SeenAllComponent,
		/* End Component Inject (Do not remove) */

		/* Directive Inject (Do not remove) */
		HighlightStateDirective,
		/* End Directive Inject (Do not remove) */

		/* Pipe Inject (Do not remove) */
		ColorPipe, ContrastPipe, ControlErrorsPipe,
		EnvironmentPipe, ExamplePhoneNumberPipe, FileIconPipe,
		FlagImagePipe, MetaEmbedPipe, PhonePipe,
		/* End Pipe Inject (Do not remove) */
	],
	declarations: [
		/* Component Inject (Do not remove) */
		CopyrightComponent, DragZoneComponent, MenuBarComponent,
		NotFoundComponent, SeenAllComponent,
		/* End Component Inject (Do not remove) */

		/* Directive Inject (Do not remove) */
		HighlightStateDirective,
		/* End Directive Inject (Do not remove) */

		/* Pipe Inject (Do not remove) */
		ColorPipe, ContrastPipe, ControlErrorsPipe,
		EnvironmentPipe, ExamplePhoneNumberPipe, FileIconPipe,
		FlagImagePipe, MetaEmbedPipe, PhonePipe,
		/* End Pipe Inject (Do not remove) */
	],
	providers: [
		/* Service Inject (Do not remove) */
		AppearanceService,
		/* End Service Inject (Do not remove) */

		{ provide: APP_CONFIG, useClass: AppConfig },
		{ provide: SERVER_CONFIG, useClass: ServerConfig },
		{ provide: DATE_TIME_CONFIG, useClass: DateTimeConfig },
		{ provide: STORAGE_CONFIG, useClass: StorageConfig },
	],
})
export class CoreModule {

	constructor(
		@Optional() @Inject( APP_CONFIG )
		private _appConfig: AppConfig,
		@Optional() @Inject( SERVER_CONFIG )
		private _serverConfig: ServerConfig,
		@Optional() @Inject( DATE_TIME_CONFIG )
		private _dateTimeConfig: DateTimeConfig,
		@Optional() @Inject( STORAGE_CONFIG )
		private _storageConfig: StorageConfig
	) {
		this._appConfig.name = ENVIRONMENT.APP_NAME;
		this._appConfig.logo = ENVIRONMENT.APP_LOGO;
		this._appConfig.url = ENVIRONMENT.APP_URL;
		this._appConfig.mainPath = APP_CONSTANT.MAIN_PATH;
		this._appConfig.locale = APP_CONSTANT.LOCALE;

		this._serverConfig.apiURL = ENVIRONMENT.SERVER_API_URL;
		this._serverConfig.wsURL = ENVIRONMENT.SERVER_WEBSOCKET_URL;

		this._dateTimeConfig.timezone = APP_CONSTANT.TIMEZONE;
		this._dateTimeConfig.timeFormat = APP_CONSTANT.TIME_FORMAT;
		this._dateTimeConfig.dateFormat = APP_CONSTANT.DATE_FORMAT;
		this._dateTimeConfig.weekStart = APP_CONSTANT.WEEK_START;

		this._storageConfig.authorizedKey = HASH.AUTHORIZED_KEY;
		this._storageConfig.hashKey = HASH.STORAGE_HASH_KEY;
		this._storageConfig.expireDays = HASH.STORAGE_EXPIRE_DAYS;
	}

}
