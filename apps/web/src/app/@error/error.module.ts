import {
	NgModule,
	PLATFORM_ID,
	TransferState
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

import {
	CoreModule,
} from '@core';

import {
	CUBButtonModule
} from '@cub/material';

import {
	ErrorComponent
} from './components';
import {
	routing
} from './error.routing';
import {
	ErrorService
} from './services';

@NgModule({
	imports: [
		CoreModule,

		TranslateModule.forChild({
			loader: {
				provide: TranslateLoader,
				useClass: TranslateLoaderService,
				deps: [ HttpClient, TransferState, PLATFORM_ID ],
			},
		}),

		CUBButtonModule,

		routing,
	],
	exports		: [ ErrorComponent ],
	declarations: [ ErrorComponent ],
	providers	: [
		ErrorService
	],
})
export class ErrorModule {}
