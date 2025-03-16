import {
	Directive,
	Input,
	OnDestroy,
	OnInit
} from '@angular/core';
import {
	UntypedFormControl
} from '@angular/forms';

import {
	DefaultValue,
	CoerceNumber
} from '../decorators';

@Directive({
	selector: '[autoReset]',
	exportAs: 'autoReset',
})
export class AutoResetDirective implements OnInit, OnDestroy {

	@Input() public formControl: UntypedFormControl;
	@Input() @DefaultValue() @CoerceNumber()
	public delay: number = 0;
	@Input() @DefaultValue()
	public autoReset: 'init' | 'destroy' = 'init';

	ngOnInit() {
		if ( this.autoReset !== 'init'
			|| !this.formControl ) {
			return;
		}

		setTimeout( () => {
			this.formControl.setErrors( null );
			this.formControl.markAsPristine();
			this.formControl.markAsUntouched();
		}, this.delay );
	}

	ngOnDestroy() {
		if ( this.autoReset !== 'destroy'
			|| !this.formControl ) {
			return;
		}

		setTimeout( () => {
			this.formControl.setErrors( null );
			this.formControl.markAsPristine();
			this.formControl.markAsUntouched();
		}, this.delay );
	}

}
