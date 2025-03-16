import {
	NgModule,
} from '@angular/core';

import {
	CoreModule,
} from '@core';

import {
	AccountRoutingModules
} from './account-routing.module';

@NgModule({
	imports: [
		CoreModule,

		AccountRoutingModules,
	],
	exports		: [],
	declarations: [],
})
export class AccountModule {}
