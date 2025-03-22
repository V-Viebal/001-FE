import { Component, Inject, OnInit, ChangeDetectorRef } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { isPlatformBrowser } from '@angular/common';
import { PLATFORM_ID } from '@angular/core';
import { firstValueFrom } from 'rxjs';

@Component({
	selector: 'app',
	templateUrl: './app.pug',
})
export class AppComponent implements OnInit {
	translationsLoaded = false;

	constructor(
		@Inject(PLATFORM_ID) private platformId: Object,
		private translate: TranslateService,
		private cdr: ChangeDetectorRef
	) {
		if ( !isPlatformBrowser( this.platformId )) {
			this.translationsLoaded = true;
		}
	}

	async ngOnInit(): Promise<void> {
		try {
			const initialLang = 'vi';

			if ( isPlatformBrowser( this.platformId ) ) {
				await firstValueFrom( this.translate.use( initialLang ) );
			}
			this.translationsLoaded = true;
			this.cdr.detectChanges();
		} catch ( error ) {
			this.translationsLoaded = true;
			this.cdr.detectChanges();
		}
	}
}
