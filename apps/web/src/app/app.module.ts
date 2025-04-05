import {
	APP_ID,
	APP_INITIALIZER,
	ModuleWithProviders,
	NgModule,
	PLATFORM_ID,
} from '@angular/core';
import {
	BrowserModule,
	provideClientHydration,
	TransferState,
	makeStateKey,
} from '@angular/platform-browser';
import { ServiceWorkerModule as SWModule } from '@angular/service-worker';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';
import { HTTP_INTERCEPTORS, HttpClient } from '@angular/common/http';
import {
	TranslateLoader,
	TranslateModule,
	TranslateService,
} from '@ngx-translate/core';

import { CONSTANT, CoreModule, ServiceWorkerService } from '@core';

import {
	CUB_FILE_SERVICE,
	CUB_LOCAL_FILE_SIZE_LIMIT,
} from '@cub/material/file-picker';
import {
	CUBImageModule,
	CUBLoadingModule,
	CUBScrollBarModule,
} from '@cub/material';

import { ErrorModule } from '@error/error.module';
import { FileService } from '@main/common/shared/services';
import { AuthModule } from '@main/auth/auth.module';
import { AuthInterceptor } from '@main/auth/interceptors';
import { HomeComponent } from '@main/home/components';
import { CareerComponent } from '@main/career/components';
import { CourseComponent } from '@main/course/components';

import { AppRoutingModules } from './app-routing.module';
import { AppComponent } from './app.component';
import { TranslateLoaderService } from './translate-loader.factory';
import { isPlatformBrowser, isPlatformServer } from '@angular/common';

// Service Worker Registration with environment check
const ServiceWorkerModule: ModuleWithProviders<SWModule> = SWModule.register(
	'ngsw-worker.js',
	{
		enabled: process.env['ENV_NAME'] === 'prod', // Use bracket notation for env vars
		registrationStrategy: 'registerWhenStable:30000', // Delay registration for stability
	}
);

// Factory to initialize TranslateService with proper SSR/CSR handling
export function initializeTranslateService(
	translate: TranslateService,
	transferState: TransferState,
	platformId: Object
) {
	return () => {
		const lang = 'vi';
		const LANG_KEY = makeStateKey<string>('lang');

		if (isPlatformServer(platformId)) {
			// On server, set the language and store it in TransferState
			return translate.use(lang).subscribe(() => {
				transferState.set(LANG_KEY, lang);
			});
		} else if (isPlatformBrowser(platformId)) {
			// On client, use TransferState if available, otherwise default to 'vi'
			const savedLang = transferState.get(LANG_KEY, lang);
			return translate.use(savedLang).toPromise(); // Fallback to Promise for compatibility
		}
	};
}

// Factory to initialize ServiceWorkerService
export function initializeServiceWorker(
	serviceWorkerService: ServiceWorkerService
) {
	return () => {
		serviceWorkerService.updateAvailableVersion();
	};
}

@NgModule({
	imports: [
		CoreModule,
		BrowserModule.withServerTransition({ appId: 'serverApp' }), // Enable SSR with appId
		TranslateModule.forRoot({
			loader: {
				provide: TranslateLoader,
				useClass: TranslateLoaderService,
				deps: [HttpClient, TransferState, PLATFORM_ID],
			},
		}),
		CUBImageModule,
		CUBLoadingModule,
		CUBScrollBarModule,
		ErrorModule,
		AuthModule,
		AppRoutingModules,
		ServiceWorkerModule,
	],
	declarations: [
		AppComponent,
		HomeComponent,
		CourseComponent,
		CareerComponent,
	],
	providers: [
		{
			provide: APP_ID,
			useValue: 'serverApp',
		},
		{
			provide: APP_INITIALIZER,
			useFactory: initializeTranslateService,
			deps: [TranslateService, TransferState, PLATFORM_ID],
			multi: true,
		},
		{
			provide: APP_INITIALIZER,
			useFactory: initializeServiceWorker,
			deps: [ServiceWorkerService],
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
	bootstrap: [AppComponent],
})
export class AppModule {}
