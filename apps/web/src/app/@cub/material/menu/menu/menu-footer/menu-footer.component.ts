import {
	AfterContentInit,
	AfterViewInit,
	ChangeDetectionStrategy,
	ChangeDetectorRef,
	Component,
	ContentChild,
	inject,
	Input,
	OnDestroy,
	TemplateRef,
	ViewChild,
	ViewEncapsulation
} from '@angular/core';

import {
	CUBMenuFooterDirective
} from './menu-footer.directive';

@Component({
	selector: 'cub-menu-footer',
	template: `
		<ng-template>
			<ng-content></ng-content>
		</ng-template>
	`,
	encapsulation: ViewEncapsulation.None,
	changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CUBMenuFooterComponent
implements AfterViewInit, AfterContentInit, OnDestroy {

	public templateRef: TemplateRef<any> = null;

	private readonly _cdRef: ChangeDetectorRef
		= inject( ChangeDetectorRef );

	@ViewChild( TemplateRef, { static: true } )
	private _templateRef: TemplateRef<any>;

	@ContentChild( CUBMenuFooterDirective )
	private _menuFooter: CUBMenuFooterDirective;

	private _classList: string = null;

	@Input( 'class' )
	get classList(): string {
		return this._classList;
	}
	set classList( classes: string ) {
		this._classList = classes;
	}

	ngAfterViewInit() {
		setTimeout(() => {
			this.templateRef
				||= this._templateRef;

			this._cdRef.markForCheck();
		});
	}

	ngAfterContentInit() {
		setTimeout(() => {
			this.templateRef
				||= this._menuFooter?.templateRef;

			this._cdRef.markForCheck();
		});
	}

	ngOnDestroy() {
		this.templateRef = null;
	}

}
