import {
	Directive,
	EmbeddedViewRef,
	inject,
	Input,
	OnChanges,
	OnDestroy,
	SimpleChanges,
	TemplateRef,
	ViewContainerRef
} from '@angular/core';

@Directive({
	selector: '[ngCacheIf]',
	exportAs: 'ngCacheIf',
})
export class NgCacheIfDirective implements OnChanges, OnDestroy {

	@Input() public ngCacheIf: any;
	@Input() public ngCacheIfElse: TemplateRef<any>;

	private readonly _templateRef: TemplateRef<any>
		= inject( TemplateRef );
	private readonly _vcRef: ViewContainerRef
		= inject( ViewContainerRef );

	private _loaded: ObjectType<EmbeddedViewRef<any>> = {};

	ngOnChanges( changes: SimpleChanges ) {
		if ( !changes.ngCacheIf ) return;

		this._vcRef.detach();

		const isIfTrue: boolean
			= !!changes.ngCacheIf.currentValue;
		const templateRef: TemplateRef<any>
			= isIfTrue
				? this._templateRef
				: this.ngCacheIfElse;

		if ( !templateRef ) return;

		const key: string = String( isIfTrue );

		if ( !this._loaded[ key ] ) {
			this._vcRef.clear();

			this._loaded[ key ]
				= this._vcRef
				.createEmbeddedView( templateRef );
			return;
		}

		this._vcRef.insert(
			this._loaded[ key ]
		);
	}

	ngOnDestroy() {
		delete this._loaded;

		this._vcRef.detach();
		this._vcRef.clear();
	}

}
