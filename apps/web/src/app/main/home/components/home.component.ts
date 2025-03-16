import {
	isPlatformBrowser
} from '@angular/common';
import {
	Component,
	ChangeDetectionStrategy,
	AfterViewInit,
	Inject,
	PLATFORM_ID,
} from '@angular/core';

import {
	Unsubscriber
} from '@core';

@Unsubscriber()
@Component({
	selector		: 'home',
	templateUrl		: '../templates/home.pug',
	styleUrls		: [ '../styles/home.scss' ],
	host			: { class: 'home' },
	changeDetection	: ChangeDetectionStrategy.OnPush,
})
export class HomeComponent implements AfterViewInit {

	constructor( @Inject( PLATFORM_ID ) private platformId: Object ) {}

	ngAfterViewInit(): void {
		if ( isPlatformBrowser( this.platformId )) {
			const toggleTopButton = () => {
				const backToTop = document.getElementById('backtop');
				backToTop.style.opacity = window.scrollY >= 800 ? '1' : '0';
				backToTop.style.visibility = window.scrollY >= 800 ? 'visible' : 'hidden';
			};
			const scrollToTop = () => {
				window.scrollTo({
					top: 0,
					behavior: 'smooth'
				});
			};

			// Set up event listeners
			const backToTop = document.getElementById('backtop');
			backToTop.addEventListener('click', scrollToTop);

			window.addEventListener('scroll', toggleTopButton);
			window.addEventListener('resize', toggleTopButton);
		}
	}

}
