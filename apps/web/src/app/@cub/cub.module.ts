import {
	NgModule,
	PLATFORM_ID,
	TransferState,
} from '@angular/core';
import {
	TranslateLoader,
	TranslateModule
} from '@ngx-translate/core';
import {
	HttpClient
} from '@angular/common/http';
import {
	TranslateLoaderService
} from 'app/translate-loader.factory';

@NgModule({
	imports: [
		TranslateModule.forChild({
			loader: {
				provide: TranslateLoader,
				useClass: TranslateLoaderService,
				deps: [ HttpClient, TransferState, PLATFORM_ID ],
			},
		}),
	],
})
export class CUBModule {}
