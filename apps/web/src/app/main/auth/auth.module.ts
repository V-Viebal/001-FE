import {
	NgModule,
	PLATFORM_ID,
} from '@angular/core';
import {
	PlatformModule
} from '@angular/cdk/platform';
import { TranslateLoader, TranslateModule } from '@ngx-translate/core';
import { TranslateLoaderService } from 'app/translate-loader.factory';
import { TransferState } from '@angular/platform-browser';
import { HttpClient } from '@angular/common/http';

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
	CUBDividerModule,
	CUBSliderModule
} from '@cub/material';
import {
	CUBPalettePipe
} from '@cub/pipes';
import {
	AuthRoutingModule
} from './auth-routing.module';
import {
	SignInComponent,
	SignUpComponent,
	SignOutComponent,
	VerifyIdentityComponent,
	ResetPasswordComponent
} from './components';

@NgModule({
	imports: [
		PlatformModule,

		TranslateModule.forChild({
			loader: {
				provide: TranslateLoader,
				useClass: TranslateLoaderService,
				deps: [ HttpClient, TransferState, PLATFORM_ID ],
			},
		}),

		CoreModule,
		FormModule,

		CUBButtonModule,
		CUBFormFieldModule,
		CUBLoadingModule,
		CUBIconModule,
		CUBToastModule,
		CUBTooltipModule,
		CUBPalettePipe,
		CUBDividerModule,
		CUBSliderModule,

		AuthRoutingModule,
	],
	exports: [
		SignInComponent,
		SignOutComponent,
		SignUpComponent,
		ResetPasswordComponent,
		VerifyIdentityComponent
	],
	declarations: [
		SignInComponent,
		SignOutComponent,
		SignUpComponent,
		ResetPasswordComponent,
		VerifyIdentityComponent
	],
	providers: [],
})
export class AuthModule {}
