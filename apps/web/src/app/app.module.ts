import {
	APP_ID,
	APP_INITIALIZER,
	ModuleWithProviders,
	NgModule,
	PLATFORM_ID,
	inject,
} from '@angular/core';
import {
	BrowserModule,
	provideClientHydration,
	TransferState
} from '@angular/platform-browser';
import {
	ServiceWorkerModule as SWModule
} from '@angular/service-worker';
import {
	provideAnimationsAsync
} from '@angular/platform-browser/animations/async';
import {
	HTTP_INTERCEPTORS,
	HttpClient
} from '@angular/common/http';
import {
	TranslateLoader,
	TranslateModule,
	TranslateService
} from '@ngx-translate/core';

import {
	CONSTANT,
	CoreModule,
	ServiceWorkerService
} from '@core';

import {
	CUB_FILE_SERVICE,
	CUB_LOCAL_FILE_SIZE_LIMIT
} from '@cub/material/file-picker';
import {
	CUBImageModule,
	CUBLoadingModule
} from '@cub/material';

import {
	ErrorModule
} from '@error/error.module';

import {
	FileService
} from '@main/common/shared/services';
import {
	AuthModule
} from '@main/auth/auth.module';
import {
	AuthInterceptor
} from '@main/auth/interceptors';
import {
	HomeComponent
} from '@main/home/components';
import {
	CareerComponent
} from '@main/career/components';
import {
	CourseComponent
} from '@main/course/components';

import {
	AppRoutingModules
} from './app-routing.module';
import {
	AppComponent
} from './app.component';
import {
	TranslateLoaderService
} from './translate-loader.factory';

// eslint-disable-next-line @typescript-eslint/naming-convention
const ServiceWorkerModule: ModuleWithProviders<SWModule>
	= SWModule.register(
		'ngsw-worker.js',
		{ enabled:  process.env.ENV_NAME === 'prod'  }
	);

export function initializeTranslateService(translate: TranslateService) {
	return () => {
		const lang = 'vi';
		return translate.use(lang).toPromise();
	};
}

@NgModule({
	imports: [
		CoreModule,
		BrowserModule,

		TranslateModule.forRoot({
			loader: {
				provide: TranslateLoader,
				useClass: TranslateLoaderService,
				deps: [ HttpClient, TransferState, PLATFORM_ID ],
			},
		}),

		CUBImageModule,
		CUBLoadingModule,

		ErrorModule,
		AuthModule,

		AppRoutingModules,

		ServiceWorkerModule,
	],
	declarations: [
		AppComponent,
		HomeComponent,
		CourseComponent,
		CareerComponent
	],
	providers: [
		{
			provide: APP_ID,
			useValue: 'serverApp'
		},
		{	// Add APP_INITIALIZER for translation preloading
			provide: APP_INITIALIZER,
			useFactory: initializeTranslateService,
			deps: [TranslateService],
			multi: true,
		},
		provideClientHydration(),
		provideAnimationsAsync(),
		{
			provide: CUB_FILE_SERVICE,
			useClass: FileService,
		},
		{
			provide: CUB_LOCAL_FILE_SIZE_LIMIT,
			useValue: CONSTANT.ALLOW_FILE_SIZE,
		},
		{
			provide: HTTP_INTERCEPTORS,
			useClass: AuthInterceptor,
			multi: true,
		},
	],
	bootstrap: [ AppComponent ],
})
export class AppModule {

	private _serviceWorkerService: ServiceWorkerService
		= inject( ServiceWorkerService );

	constructor() {
		// Update available version
		this._serviceWorkerService.updateAvailableVersion();
	}

}
