import {
	ChangeDetectionStrategy,
	Component,
	ContentChild,
	Input,
	OnChanges,
	OnDestroy,
	TemplateRef,
	ViewChild,
	ViewEncapsulation,
	ViewRef
} from '@angular/core';

import {
	AliasOf,
	CoerceBoolean,
	DefaultValue
} from 'angular-core';

import {
	CUBTabsComponent
} from '../tabs/tabs.component';

import {
	CUBTabContentDirective
} from './tab-content.directive';
import {
	CUBTabHeaderDirective
} from './tab-header.directive';

@Component({
	selector: 'cub-tab',
	template: '<ng-template><ng-content></ng-content></ng-template>',
	encapsulation: ViewEncapsulation.None,
	changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CUBTabComponent implements OnChanges, OnDestroy {

	@Input() public label: string;
	@Input() public leadingIcon: string;
	@Input() public trailingIcon: string;
	@Input() @AliasOf( 'leadingIcon' ) public icon: string;
	@Input() @CoerceBoolean() public disabled: boolean;
	@Input() @DefaultValue() @CoerceBoolean()
	public cacheContent: boolean = true;

	@ViewChild( TemplateRef, { static: true } )
	protected readonly templateRef: TemplateRef<any>;
	@ContentChild( CUBTabHeaderDirective )
	protected readonly tabHeader: CUBTabHeaderDirective;
	@ContentChild( CUBTabContentDirective )
	protected readonly tabContent: CUBTabContentDirective;

	private _container: CUBTabsComponent;

	private _contentViewRef: ViewRef;

	get contentViewRef(): ViewRef {
		return this._contentViewRef;
	}
	set contentViewRef( viewRef: ViewRef ) {
		if ( !this.cacheContent ) return;

		this._contentViewRef = viewRef;
	}

	get header(): TemplateRef<any> {
		return this.tabHeader?.templateRef;
	}

	get content(): TemplateRef<any> {
		return this.tabContent?.templateRef
			|| this.templateRef;
	}

	ngOnChanges() {
		this._container?.markItemInputsChanged();
	}

	ngOnDestroy() {
		this._contentViewRef?.destroy();
	}

	public setContainer(
		container: CUBTabsComponent
	) {
		this._container = container;
	}

}
