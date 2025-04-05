import { importProvidersFrom, NgModule } from '@angular/core';
import { ServerModule } from '@angular/platform-server';
import { provideHttpClient, withFetch } from '@angular/common/http';
import { HTTP_INTERCEPTORS } from '@angular/common/http';

import { AppModule } from './app.module';
import { AppComponent } from './app.component';
import { AuthInterceptor } from '@main/auth/interceptors';
import { provideClientHydration } from '@angular/platform-browser';
import { APP_BASE_HREF, NgOptimizedImage } from '@angular/common';

@NgModule({
	imports: [
		AppModule,
		ServerModule,
	],
	providers: [
		importProvidersFrom( NgOptimizedImage ),
		provideClientHydration(),
		{ provide: APP_BASE_HREF, useValue: '/' },
		provideHttpClient( withFetch() ),
		{
			provide: HTTP_INTERCEPTORS,
			useClass: AuthInterceptor,
			multi: true,
		},
	],
	bootstrap: [AppComponent],
})
export class AppServerModule {}
