import {
	AfterContentInit,
	AfterViewInit,
	ChangeDetectionStrategy,
	ChangeDetectorRef,
	Component,
	ContentChildren,
	ElementRef,
	EventEmitter,
	HostListener,
	inject,
	Input,
	OnDestroy,
	OnInit,
	Output,
	QueryList,
	Renderer2,
	TemplateRef,
	ViewChild,
	ViewEncapsulation
} from '@angular/core';
import {
	coerceArray
} from '@angular/cdk/coercion';
import {
	animationFrames,
	debounce,
	Observable,
	Subject
} from 'rxjs';
import {
	startWith
} from 'rxjs/operators';
import _ from 'lodash';

import {
	CoerceBoolean,
	Unsubscriber,
	untilCmpDestroyed
} from '@core';

import {
	CUBFlowchartNodeTemplateDirective
} from './flowchart-node-template.directive';
import type {
	CUBFlowchartNode,
	CUBFlowchartNodeAddonEvent,
	CUBFlowchartNodeClickedEvent,
	CUBFlowchartNodeComponent,
	CUBFlowchartNodePromiseResolve
} from './flowchart-node.component';

export type CUBFlowchartOptions = {
	scalable?: boolean;
	scaleRatio?: number;
};

type Size = {
	width: number;
	height: number;
};

const DEFAULT_OPTIONS: CUBFlowchartOptions = {
	scalable: true,
	scaleRatio: 1,
};

@Unsubscriber()
@Component({
	selector: 'cub-flowchart',
	templateUrl: './flowchart.pug',
	styleUrls: [ './flowchart.scss' ],
	host: { class: 'cub-flowchart' },
	encapsulation: ViewEncapsulation.None,
	changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CUBFlowchartComponent
implements AfterContentInit, AfterViewInit, OnInit, OnDestroy {

	public readonly templateMap: Map<string, TemplateRef<any>>
		= new Map();

	@Input() public rootNode: CUBFlowchartNode;
	@Input() @CoerceBoolean() public viewOnly: boolean;
	@Input() public options: CUBFlowchartOptions;

	@Output() public scrolling: EventEmitter<Event>
		= new EventEmitter<Event>();
	@Output() public scaling: EventEmitter<number>
		= new EventEmitter<number>();
	@Output() public backdropClicked: EventEmitter<MouseEvent>
		= new EventEmitter<MouseEvent>();
	@Output() public nodeAddon: EventEmitter<CUBFlowchartNodeAddonEvent>
		= new EventEmitter<CUBFlowchartNodeAddonEvent>();
	@Output() public nodeClicked: EventEmitter<CUBFlowchartNodeClickedEvent>
		= new EventEmitter<CUBFlowchartNodeClickedEvent>();

	public isGrabbing: boolean;
	public scaleRatio: number = DEFAULT_OPTIONS.scaleRatio;

	@ViewChild( 'wrapper', { static: true } )
	protected readonly wrapperEleRef: ElementRef<HTMLElement>;
	@ViewChild( 'content', { static: true } )
	protected readonly contentEleRef: ElementRef<HTMLElement>;
	@ViewChild( 'lineStack', { static: true } )
	protected readonly lineStackEleRef: ElementRef<HTMLElement>;

	@ContentChildren( CUBFlowchartNodeTemplateDirective )
	protected readonly templates: QueryList<CUBFlowchartNodeTemplateDirective>;

	protected isReady: boolean;

	private readonly _cdRef: ChangeDetectorRef
		= inject( ChangeDetectorRef );
	private readonly _elementRef: ElementRef
		= inject( ElementRef );
	private readonly _renderer: Renderer2
		= inject( Renderer2 );
	private readonly _reposition$: Subject<void>
		= new Subject<void>();
	private readonly _scaling$: Subject<number>
		= new Subject<number>();
	private readonly _resizeObserver: ResizeObserver
		= new ResizeObserver(
			_.throttle(( entries: ResizeObserverEntry[] ) => {
				if ( !this.isReady ) return;

				for ( const entry of entries ) {
					if ( entry.target === this.element ) {
						const {
							clientWidth,
							clientHeight,
						}: HTMLElement = this.element;
						const {
							width,
							height,
						}: Size = this._initialSize;

						this.scrollBy({
							left: ( clientWidth - width ) / 2,
							top: ( clientHeight - height ) / 2,
						});

						this._updateInitialSize();
					} else if ( entry.target === this.wrapper ) {
						this._updateLineStackPosition();
					}
				}
			}, 17)
		);

	private _initialSize: Size;

	get reposition$(): Observable<void> {
		return this._reposition$.pipe(
			debounce( () => animationFrames() ),
			untilCmpDestroyed( this )
		);
	}

	get scaling$(): Observable<number> {
		return this._scaling$.pipe(
			debounce( () => animationFrames() ),
			untilCmpDestroyed( this )
		);
	}

	get element(): HTMLElement {
		return this._elementRef.nativeElement;
	}

	get wrapper(): HTMLElement {
		return this.wrapperEleRef.nativeElement;
	}

	get content(): HTMLElement {
		return this.contentEleRef.nativeElement;
	}

	get lineStack(): HTMLElement {
		return this.lineStackEleRef.nativeElement;
	}

	ngOnInit() {
		this.options = {
			...DEFAULT_OPTIONS,
			...this.options,
		};

		this.scale(
			this.scaleRatio
				= this.options.scaleRatio
		);
	}

	ngAfterViewInit() {
		this._resizeObserver.observe( this.element );
		this._resizeObserver.observe( this.wrapper );

		Promise.resolve().then(() => {
			this.isReady = true;

			this._cdRef.detectChanges();

			this._updateInitialSize();
		});
	}

	ngAfterContentInit() {
		this
		.templates
		.changes
		.pipe(
			startWith( this.templates ),
			untilCmpDestroyed( this )
		)
		.subscribe((
			templates:
				QueryList<CUBFlowchartNodeTemplateDirective>
		) => {
			this.templateMap.clear();

			templates.forEach((
				template: CUBFlowchartNodeTemplateDirective
			) => {
				this.templateMap.set(
					template.type,
					template.templateRef
				);
			});
		});
	}

	ngOnDestroy() {
		this._resizeObserver.disconnect();
	}

	/**
	 * Updates this flowchart.
	 * @param node The specific node to be updated. Defaults to the root node.
	 */
	public update(
		node: CUBFlowchartNode = this.rootNode
	) {
		node._cmp?.update();

		if ( node.childNodes ) {
			for ( const childNode of node.childNodes ) {
				if ( childNode ) {
					this.update( childNode );
				}
			}
		}

		if ( node.nextNode ) {
			this.update( node.nextNode );
		}
	}

	/**
	 * Repositions all connected lines.
	 */
	public reposition() {
		this._updateLineStackPosition();

		this._reposition$.next();
	}

	/**
	 * Scales this flowchart.
	 * @param ratio The ratio which to be scaled.
	 */
	public scale( ratio: number ) {
		if ( ratio === this.scaleRatio ) {
			return;
		}

		this.scaleRatio = ratio;

		this.content.style.scale
			= String( ratio );

		this._updateLineStackPosition();

		this._scaling$.next( ratio );
	}

	/**
	 * Re-centers this flowchart.
	 * @param options A `ScrollIntoViewOptions`.
	 */
	public recenter(
		options?: ScrollIntoViewOptions
	) {
		this.rootNode._cmp.scrollTo( options );
	}

	/**
	 * Scrolls the element to a specified set of coordinates or to an element.
	 * @param options An object containing the coordinates to scroll to
	 * or options for smooth scrolling.
	 */
	public scrollTo( options: ScrollToOptions ) {
		this.element.scrollTo( options );
	}

	/**
	 * Scrolls the element by a specified amount along the X and Y axes.
	 * @param options An object containing the distance to scroll by
	 * or options for smooth scrolling.
	 */
	public scrollBy( options: ScrollToOptions ) {
		this.element.scrollBy( options );
	}

	/**
	 * Scrolls to a node.
	 * @param node A node need to be scroll.
	 * @param options An object containing the coordinates to scroll to
	 * or options for smooth scrolling.
	 */
	public scrollToNode(
		node: CUBFlowchartNode,
		options?: ScrollIntoViewOptions
	) {
		node._cmp.scrollTo( options );
	}

	/**
	 * Inserts a node to this flowchart.
	 * @param sourceNode The source node to which a next node or a child node needs to be inserted.
	 * @param newNode The new node to be inserted.
	 * @param position The position at which the child node should be inserted.
	 * @param scrollToThisNode Indicates if the flowchart should scroll to the inserted node.
	 * @returns A `Promise<CUBFlowchartNodePromiseResolve[]>` that resolves after the child node is ready.
	 */
	public insertNode(
		sourceNode: CUBFlowchartNode,
		newNode: CUBFlowchartNode,
		position?: number,
		scrollToThisNode?: boolean
	): Promise<CUBFlowchartNodePromiseResolve> {
		const cmp: CUBFlowchartNodeComponent
			= sourceNode._cmp;

		return position === undefined
			? cmp.insertNextNode( newNode, scrollToThisNode )
			: cmp.addChildNode( newNode, position, scrollToThisNode );
	}

	/**
	 * Destroys a node or multiple nodes to this flowchart.
	 * @param nodes The node or the node array to be destroyed.
	 * @returns A `Promise<CUBFlowchartNodePromiseResolve>` that resolves after the child node is destroyed.
	 */
	public destroyNode(
		nodes: CUBFlowchartNode | CUBFlowchartNode[]
	): Promise<CUBFlowchartNodePromiseResolve[]> {
		const promises:
			Promise<CUBFlowchartNodePromiseResolve>[]
			= [];

		nodes = coerceArray( nodes );

		for ( const node of nodes ) {
			promises.push(
				node._cmp.destroy()
			);
		}

		return Promise.all( promises );
	}

	protected onRootNodeRendered() {
		this.recenter();
	}

	@HostListener( 'pointerdown', [ '$event' ] )
	protected onPointerdown( e: PointerEvent ) {
		if ( e.button === 2 ) { // Right click
			return;
		}

		const el: HTMLElement = this.element;

		el.style.cursor = 'grabbing';

		const unlisten1: () => void
			= this._renderer.listen(
				document,
				'pointermove',
				(
					{
						movementX,
						movementY,
					}: PointerEvent
				) => {
					this.isGrabbing = true;

					el.scrollTo({
						left: el.scrollLeft - movementX,
						top: el.scrollTop - movementY,
					});
				}
			);

		const unlisten2: () => void
			= this._renderer.listen(
				document,
				'pointerup',
				() => {
					setTimeout(() => {
						this.isGrabbing = false;
					});

					el.style.cursor = 'default';

					unlisten1();
					unlisten2();
				}
			);
	}

	@HostListener( 'click', [ '$event' ] )
	protected onClick( e: MouseEvent ) {
		if ( this.isGrabbing ) {
			return;
		}

		this.backdropClicked.emit( e );
	}

	@HostListener( 'scroll', [ '$event' ] )
	protected onScroll( e: Event ) {
		this.scrolling.emit( e );
	}

	@HostListener( 'wheel', [ '$event' ] )
	protected onWheel( e: WheelEvent ) {
		if ( !this.options.scalable
			|| ( !e.metaKey && !e.ctrlKey ) ) {
			return;
		}

		e.preventDefault();

		const step: number
			= e.deltaY > 0 ? -.1 : .1;
		let ratio: number
			= this.scaleRatio + step;

		if ( ratio < .5 ) {
			ratio = .5;
		} else if ( ratio > 2 ) {
			ratio = 2;
		}

		this.scale( ratio );
		this.scaling.emit( ratio );
	}

	/**
	 * Updates the position of the line stack.
	 */
	private _updateLineStackPosition() {
		const { style }: HTMLElement
			= this.lineStack;

		style.translate = 'none';

		let { left, top }: DOMRect
			= this.lineStack.getBoundingClientRect();

		left += window.scrollX;
		top += window.scrollY;

		style.translate = `${-left}px ${-top}px`;
	}

	/**
	 * Updates the initial size of the flowchart.
	 */
	private _updateInitialSize() {
		const {
			clientWidth,
			clientHeight,
		}: HTMLElement = this.element;

		this._initialSize = {
			width: clientWidth,
			height: clientHeight,
		};
	}

}
