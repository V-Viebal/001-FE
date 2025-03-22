import {
	NgModule
} from '@angular/core';

import {
	CoreModule
} from 'angular-core';

import {
	CUBScrollBarComponent
} from './scroll-bar.component';
import {
	CUBScrollBarDirective
} from './scroll-bar.directive';
import {
	CUBScrollBarViewPortItemDirective
} from './scroll-bar-view-port-item.directive';

@NgModule({
	imports: [
		CoreModule,
	],
	exports: [
		CUBScrollBarComponent,
		CUBScrollBarDirective,
		CUBScrollBarViewPortItemDirective,
	],
	declarations: [
		CUBScrollBarComponent,
		CUBScrollBarDirective,
		CUBScrollBarViewPortItemDirective,
	],
	providers: [],
})
export class CUBScrollBarModule {}
