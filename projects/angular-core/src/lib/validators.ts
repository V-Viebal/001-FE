import {
	Directive,
	forwardRef
} from '@angular/core';
import {
	AbstractControl,
	FormControl,
	NG_VALIDATORS,
	ValidationErrors,
	Validator,
	Validators
} from '@angular/forms';
import _ from 'lodash';

import {
	REGEXP
} from './resources';

export function validateEmail( value: string ): boolean {
	return _.isStrictEmpty( value )
		|| !!value.match( REGEXP.EMAIL );
}

export function validatePhone( value: string ): boolean {
	return _.isStrictEmpty( value )
		|| !!value.match( REGEXP.PHONE );
}

export function validateUrl( value: string ): boolean {
	return _.isStrictEmpty( value )
		|| !!value.match( REGEXP.URL );
}

export function phoneValidator(
	control: AbstractControl
): ValidationErrors | null {
	return validatePhone( control.value )
		? null
		: { phone: true };
}

export function urlValidator(
	control: AbstractControl
): ValidationErrors | null {
	return validateUrl( control.value )
		? null
		: { url: true };
}

@Directive({
	selector: 'input[type=email][formControlName],input[type=email][formControl],input[type=email][ngModel]',
	providers: [{
		provide: NG_VALIDATORS,
		useExisting: forwardRef( () => EmailValidator ),
		multi: true,
	}],
})
export class EmailValidator implements Validator {

	/**
	 * @param {FormControl} c
	 * @return {ValidationErrors | null}
	 */
	// eslint-disable-next-line @typescript-eslint/explicit-member-accessibility
	validate( c: FormControl ): ValidationErrors | null {
		return Validators.email( c );
	}

}

@Directive({
	selector: 'input[type=tel][formControlName],input[type=tel][formControl],input[type=tel][ngModel]',
	providers: [{
		provide: NG_VALIDATORS,
		useExisting: forwardRef( () => PhoneValidator ),
		multi: true,
	}],
})
export class PhoneValidator implements Validator {

	/**
	 * @param {FormControl} c
	 * @return {ValidationErrors | null}
	 */
	// eslint-disable-next-line @typescript-eslint/explicit-member-accessibility
	validate( c: FormControl ): ValidationErrors | null {
		return phoneValidator( c );
	}

}

@Directive({
	selector: 'input[type=url][formControlName],input[type=url][formControl],input[type=url][ngModel]',
	providers: [{
		provide: NG_VALIDATORS,
		useExisting: forwardRef( () => UrlValidator ),
		multi: true,
	}],
})
export class UrlValidator implements Validator {

	/**
	 * @param {FormControl} c
	 * @return {ValidationErrors | null}
	 */
	// eslint-disable-next-line @typescript-eslint/explicit-member-accessibility
	validate( c: FormControl ): ValidationErrors | null {
		return urlValidator( c );
	}

}
