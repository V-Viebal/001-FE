import {
	NgModule
} from '@angular/core';
import {
	RouterModule,
	Routes,
	withInMemoryScrolling
} from '@angular/router';

import {
	ErrorComponent
} from '@error/components';

import {
	HomeComponent
} from '@main/home/components';

import {
	CustomPreloadingStrategy
} from './custom-preloading-strategy';

const routes: Routes = [
	{
		path		: '',
		component	: HomeComponent,
	},
	{
		path		: '**',
		component	: ErrorComponent,
	},
];

@NgModule({
	imports: [
		RouterModule.forRoot(
			routes,
			{
				preloadingStrategy: CustomPreloadingStrategy,
				scrollPositionRestoration: 'enabled',
				enableViewTransitions: true,
				initialNavigation: 'enabledBlocking',
				useHash: false,
				...withInMemoryScrolling({
					scrollPositionRestoration: 'enabled',
					anchorScrolling: 'enabled',
				}),
			}
		),
	],
	exports		: [ RouterModule ],
	providers	: [ CustomPreloadingStrategy ],
})
export class AppRoutingModules {}
