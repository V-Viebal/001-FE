import {
	ChangeDetectorRef,
	Directive,
	EventEmitter,
	inject,
	Input,
	OnInit,
	Output
} from '@angular/core';
import {
	AbstractControl,
	NgControl
} from '@angular/forms';

import {
	Unsubscriber,
	untilCmpDestroyed
} from '../decorators';

export type ValueControlOptions = {
	emitEvent?: boolean;
	emitViewToModelChange?: boolean;
};

@Unsubscriber()
@Directive({
	selector: '[valueControl]',
	exportAs: 'valueControl',
})
export class ValueControlDirective implements OnInit {

	@Input() public valueControlOptions:
		ValueControlOptions;

	@Output() public valueControlChange: EventEmitter<any>
		= new EventEmitter<any>();

	private readonly _cdRef: ChangeDetectorRef
		= inject( ChangeDetectorRef );
	private readonly _ngControl: NgControl
		= inject( NgControl );

	get control(): AbstractControl {
		return this
		._ngControl
		.control;
	}

	@Input()
	set valueControl( value: any ) {
		setTimeout(() => {
			if ( value === this.control.value ) {
				return;
			}

			this
			.control
			.setValue(
				value,
				{
					emitEvent: false,
					emitViewToModelChange: false,

					...this.valueControlOptions,
				}
			);

			// Emit statusChanges event only
			this
			.control
			.setErrors(
				this
				.control
				.errors
			);

			this._cdRef.markForCheck();
		});
	}

	ngOnInit() {
		this
		.control
		.valueChanges
		.pipe(
			untilCmpDestroyed( this )
		)
		.subscribe(
			( value: any ) => {
				this
				.valueControlChange
				.emit( value );
			}
		);
	}

}
