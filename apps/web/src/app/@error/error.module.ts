import {
	NgModule,
} from '@angular/core';

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
