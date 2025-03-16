import {
	NgModule
} from '@angular/core';
import {
	RouterModule,
	Routes
} from '@angular/router';

import {
	SignOutComponent,
	SignInComponent
} from './components';
import {
	CONSTANT
} from './resources';

const routes: Routes = [
	{
		path: CONSTANT.PATH.SIGN_IN,
		component: SignInComponent,
	},
	{
		path: CONSTANT.PATH.SIGN_OUT,
		component: SignOutComponent,
	},
];

@NgModule({
	imports: [ RouterModule.forChild( routes ) ],
	exports: [ RouterModule ],
})
export class AuthRoutingModule {}
