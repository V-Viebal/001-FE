import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

export interface CanComponentDeactivate {
	canDeactivate: () => Observable<boolean>
		| Promise<boolean>
		| boolean;
}

@Injectable()
export class CanDeactivateGuardService {

	/**
	 * @param {CanComponentDeactivate} component
	 * @return {Observable | Promise | boolean}
	 */
	public canDeactivate(
		component: CanComponentDeactivate
	): Observable<boolean> | Promise<boolean> | boolean {
		return component.canDeactivate
			? component.canDeactivate()
			: true;
	}

}
