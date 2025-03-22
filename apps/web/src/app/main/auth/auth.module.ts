import {
	NgModule,
} from '@angular/core';
import {
	PlatformModule
} from '@angular/cdk/platform';

import {
	CoreModule,
	FormModule,
} from '@core';

import {
	CUBFormFieldModule
} from '@cub/material/form-field';
import {
	CUBButtonModule
} from '@cub/material/button';
import {
	CUBIconModule
} from '@cub/material/icon';
import {
	CUBLoadingModule
} from '@cub/material/loading';
import {
	CUBToastModule
} from '@cub/material/toast';
import {
	CUBTooltipModule
} from '@cub/material/tooltip';
import {
	CUBPalettePipe
} from '@cub/pipes';

import {
	AuthRoutingModule
} from './auth-routing.module';
import {
	SignInComponent
} from './components';
import { ResetPasswordComponent } from './components/reset-password.component';

@NgModule({
	imports: [
		PlatformModule,

		CoreModule,
		FormModule,

		CUBButtonModule,
		CUBFormFieldModule,
		CUBLoadingModule,
		CUBIconModule,
		CUBToastModule,
		CUBTooltipModule,
		CUBPalettePipe,

		AuthRoutingModule,
	],
	exports: [
		SignInComponent,
		ResetPasswordComponent,
	],
	declarations: [
		SignInComponent,
		ResetPasswordComponent,
	],
	providers: [],
})
export class AuthModule {}
