import {
	Injector
} from '@angular/core';
import {
	LOCATION_INITIALIZED
} from '@angular/common';
import moment from 'moment-timezone';

import {
	DATE_TIME_CONFIG,
	DateTimeConfig
} from '../injection-token';
import {
	LocaleService
} from '../services';

export function appInitializerFactory( injector: Injector ) {
	return () => new Promise<any>(
		( resolve: ( value?: {} | PromiseLike<{}> | undefined ) => void ) => {
			const locationInitialized: Promise<any>
				= injector.get(
					LOCATION_INITIALIZED,
					Promise.resolve()
				);

			locationInitialized.then(() => {
				const dateTimeConfig: DateTimeConfig
					= injector.get( DATE_TIME_CONFIG );
				const localeService: LocaleService
					= injector.get( LocaleService );

				// Set moment timezone
				moment.tz.setDefault(
					dateTimeConfig.timezone
				);

				// Initialize locale
				localeService
				.useLocale()
				.subscribe({
					next: ( locale: string ) => {
						console.info(
							`Successfully initialized '${locale}' language.'`
						);
					},
					error: ( locale: string ) => {
						console.error(
							`Problem with '${locale}' language initialization.'`
						);
					},
					complete: resolve,
				});
			});
		}
	);
}
