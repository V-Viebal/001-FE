import {
	isPlatformBrowser
} from '@angular/common';
import {
	Component,
	ChangeDetectionStrategy,
	AfterViewInit,
	Inject,
	PLATFORM_ID,
	OnInit,
} from '@angular/core';
import Swiper from 'swiper';

import {
	Navigation,
	Pagination
} from 'swiper/modules';
import {
	Unsubscriber
} from '@core';

Swiper.use([Navigation, Pagination]);

@Unsubscriber()
@Component({
	selector: 'home',
	templateUrl: '../templates/home.pug',
	styleUrls: ['../styles/home.scss'],
	host: { class: 'home' },
	changeDetection: ChangeDetectionStrategy.OnPush,
})
export class HomeComponent
implements OnInit, AfterViewInit {

	constructor(
		@Inject(PLATFORM_ID) private platformId: Object
	) {}

	ngOnInit(): void {
	}

	ngAfterViewInit(): void {
		if ( isPlatformBrowser( this.platformId ) ) {
		}
	}

}
