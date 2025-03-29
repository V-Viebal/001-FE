import {
	Component,
	ChangeDetectionStrategy,
	OnInit,
} from '@angular/core';
import {
	Unsubscriber
} from '@core';

@Unsubscriber()
@Component({
	selector: 'home',
	templateUrl: '../templates/home.pug',
	styleUrls: ['../styles/home.scss'],
	host: { class: 'home' },
	changeDetection: ChangeDetectionStrategy.OnPush,
})
export class HomeComponent implements OnInit {

	ngOnInit() {
	}

}
