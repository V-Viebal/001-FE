import {
	ChangeDetectorRef,
	Directive,
	inject,
	Input
} from '@angular/core';
import {
	AbstractControl,
	NgControl
} from '@angular/forms';

export type DisableControlOptions = {
	onlySelf?: boolean;
	emitEvent?: boolean;
};

@Directive({
	selector: '[disableControl]',
	exportAs: 'disableControl',
})
export class DisableControlDirective {

	@Input() public disableControlOptions:
		DisableControlOptions;

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
	set disableControl(
		isDisabled: boolean
	) {
		setTimeout(() => {
			const fnName: string
				= isDisabled
					? 'disable'
					: 'enable';

			this
			.control[ fnName ]({
				emitEvent: false,

				...this.disableControlOptions,
			});

			// Emit statusChanges event only
			this
			.control
			.setErrors(
				this
				.control
				.errors
			);

			this._cdRef.detectChanges();
		});
	}

}
