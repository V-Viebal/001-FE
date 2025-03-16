import { NgModule } from '@angular/core';

import { CoreModule } from '@core';
import { NumbersOnlyDirective } from './directives';

import { PublicAccessService } from './services';

@NgModule({
	imports		: [ CoreModule ],
	exports		: [],
	declarations: [
		NumbersOnlyDirective,
	],
	providers	: [
		PublicAccessService,
	],
})
export class SharedModule {}
