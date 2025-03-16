import {
	NgModule
} from '@angular/core';
import {
	Routes
} from '@angular/router';

import {
	I18nLazyRouterModule,
} from '@core';

import {
	CONSTANT
} from './resources';

const routes: Routes = [
	{
		path		: CONSTANT.PATH.MAIN
	},
];

@NgModule({
	imports: [ I18nLazyRouterModule.forChild( routes ) ],
	exports: [ I18nLazyRouterModule ],
})
export class AccountRoutingModules {}
