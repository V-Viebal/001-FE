import { Injectable, Inject } from '@angular/core';
import { TranslateLoader } from '@ngx-translate/core';
import { TransferState, makeStateKey } from '@angular/platform-browser';
import { HttpClient } from '@angular/common/http';
import { PLATFORM_ID } from '@angular/core';
import { isPlatformServer, isPlatformBrowser } from '@angular/common';
import { readFileSync } from 'fs';
import { join } from 'path';
import { of } from 'rxjs';
import { tap } from 'rxjs/operators';

@Injectable({
	providedIn: 'root',
})
export class TranslateLoaderService implements TranslateLoader {
	constructor(
		private http: HttpClient,
		private transferState: TransferState,
		@Inject(PLATFORM_ID) private platformId: Object
	) {}

	getTranslation(lang: string) {
		const key = makeStateKey<any>(`translation-${lang}`);

		// Check TransferState first
		if (this.transferState.hasKey(key)) {
			return of(this.transferState.get(key, {})); // Fallback to empty object if null
		}

		if (isPlatformServer(this.platformId)) {
			const distFolder = join(
				process.cwd(),
				process.env.ENV_NAME === 'prod'
					? '/app/dist/production/browser'
					: '../../dist/web/browser'
			);
			const filePath = join(distFolder, 'assets/i18n', `${lang}.json`);
			try {
				const translations = JSON.parse(readFileSync(filePath, 'utf8'));
				this.transferState.set(key, translations);
				return of(translations);
			} catch (error) {
				return of({}); // Fallback to empty object if file not found
			}
		} else if (isPlatformBrowser(this.platformId)) {
			// Only make HTTP request on the browser
			return this.http
				.get(`/assets/i18n/${lang}.json`) // Absolute path
				.pipe(
					tap((translations) =>
						this.transferState.set(key, translations)
					)
				);
		}

		return of({}); // Fallback for unknown platforms
	}
}
