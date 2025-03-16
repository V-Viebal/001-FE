import {
	AfterContentInit,
	AfterViewInit,
	ChangeDetectionStrategy,
	ChangeDetectorRef,
	Component,
	ContentChildren,
	ElementRef,
	EventEmitter,
	inject,
	Input,
	OnChanges,
	Output,
	QueryList,
	SimpleChanges,
	ViewChild,
	ViewChildren,
	ViewContainerRef,
	ViewEncapsulation
} from '@angular/core';
import {
	startWith
} from 'rxjs/operators';

import {
	CoerceBoolean,
	CoerceNumber,
	DefaultValue,
	Unsubscriber,
	untilCmpDestroyed
} from 'angular-core';

import {
	CUBTabComponent
} from '../tab/tab.component';

export type CUBTabAlignment = 'left' | 'right' | 'center';
@Unsubscriber()
@Component({
	selector: 'cub-tabs',
	templateUrl: './tabs.pug',
	styleUrls: [ './tabs.scss' ],
	host: { class: 'cub-tabs' },
	encapsulation: ViewEncapsulation.None,
	changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CUBTabsComponent implements
	OnChanges, AfterContentInit, AfterViewInit {

	@Input() @DefaultValue() @CoerceNumber()
	public selectedIndex: number = 0;
	@Input() @CoerceBoolean()
	public stretch: boolean;
	@Input() @DefaultValue()
	public alignment: CUBTabAlignment = 'left';

	@Output() public readonly selectedIndexChange: EventEmitter<number>
		= new EventEmitter<number>();

	@ViewChild( 'contentFactory', { static: true, read: ViewContainerRef } )
	protected readonly contentFactory: ViewContainerRef;
	@ViewChildren( 'headerItem' )
	protected readonly headerList: QueryList<ElementRef>;
	@ContentChildren( CUBTabComponent )
	protected readonly items: QueryList<CUBTabComponent>;

	private readonly _cdRef: ChangeDetectorRef
		= inject( ChangeDetectorRef );

	ngOnChanges( changes: SimpleChanges ) {
		if ( 'selectedIndex' in changes
			&& !changes.selectedIndex.firstChange ) {
			this._onTabSelected( this.selectedIndex );
		}
	}

	ngAfterContentInit() {
		this
		.items
		.changes
		.pipe(
			startWith( this.items ),
			untilCmpDestroyed( this )
		)
		.subscribe(( items: QueryList<CUBTabComponent> ) => {
			items.forEach(( item: CUBTabComponent ) => {
				item.setContainer( this );
			});
		});
	}

	ngAfterViewInit() {
		this._onTabSelected( this.selectedIndex );
	}

	public markItemInputsChanged() {
		this._cdRef.markForCheck();
	}

	public select( index: number ) {
		if ( this.selectedIndex === index ) {
			return false;
		}

		this.selectedIndex = index;

		this.selectedIndexChange.emit( index );

		this._onTabSelected( index );
	}

	public scrollTo( index: number ) {
		this
		.headerList
		.get( index )
		?.nativeElement
		.scrollIntoView({
			inline: 'nearest',
			behavior: 'smooth',
		});
	}

	private _onTabSelected( index: number ) {
		const item: CUBTabComponent
			= this.items?.get( index );

		if ( !item ) return;

		this.scrollTo( index );

		this.contentFactory.detach();

		if ( item.contentViewRef ) {
			this.contentFactory.insert(
				item.contentViewRef
			);
			return;
		}

		item.contentViewRef
			= this.contentFactory.createEmbeddedView(
				item.content
			);
	}

}
