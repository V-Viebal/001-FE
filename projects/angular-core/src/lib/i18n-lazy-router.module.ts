import {
	ModuleWithProviders,
	NgModule
} from '@angular/core';
import {
	ExtraOptions,
	RouterModule,
	Routes
} from '@angular/router';

import {
	LazyTranslateGuard
} from './i18n-lazy-translate.module';

@NgModule({
	imports: [
		RouterModule,
	],
	exports: [
		RouterModule,
	],
	declarations: [],
	providers: [],
})
export class I18nLazyRouterModule {

	/**
	 * @param {Routes} routes
	 * @param {string=} masterPath
	 * @return {ModuleWithProviders<RouterModule>}
	 */
	public static forRoot(
		routes: Routes,
		masterPath: string = '',
		config?: ExtraOptions
	): ModuleWithProviders<RouterModule> {
		const newRoutes: Routes = [
			{
				path: masterPath,
				canActivateChild: [ LazyTranslateGuard ],
				children: [ ...routes ],
			},
		];

		return RouterModule.forRoot(
			newRoutes,
			config
		);
	}

	/**
	 * @param {Routes} routes
	 * @param {string=} masterPath
	 * @return {ModuleWithProviders<RouterModule>}
	 */
	public static forChild(
		routes: Routes,
		masterPath: string = ''
	): ModuleWithProviders<RouterModule> {
		const newRoutes: Routes = [
			{
				path: masterPath,
				canActivateChild: [ LazyTranslateGuard ],
				children: [ ...routes ],
			},
		];

		return RouterModule.forChild( newRoutes );
	}

}
