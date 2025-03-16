import {
	AfterViewInit,
	ChangeDetectionStrategy,
	ChangeDetectorRef,
	Component,
	ComponentRef,
	DoCheck,
	ElementRef,
	EventEmitter,
	HostBinding,
	inject,
	Inject,
	Injector,
	Input,
	IterableChanges,
	IterableDiffer,
	IterableDiffers,
	NgZone,
	OnDestroy,
	OnInit,
	Output,
	TrackByFunction,
	ViewChild,
	ViewContainerRef,
	ViewEncapsulation
} from '@angular/core';
import { ULID } from 'ulidx';
import _ from 'lodash';

import {
	Unsubscriber,
	untilCmpDestroyed
} from '@core';

import {
	LeaderLineNew
} from './leader-line';
import {
	StraightLine
} from './straight-line';
import {
	BranchLine,
	BranchLineType
} from './branch-line';

import {
	CUBFlowchartComponent
} from './flowchart.component';

export type CUBFlowchartNodeOuterBox = {
	label: string;
	collapsable?: boolean;
};

export type CUBFlowchartNode = {
	id: ULID;
	type?: any;
	nextNode?: CUBFlowchartNode;
	childNodes?: CUBFlowchartNode[];
	childNodeLineCaptions?: string[];
	addOuterBox?: boolean | CUBFlowchartNodeOuterBox;
	disableInsertNextNode?: boolean;
	metadata?: any;

	// Private properties.
	_cmp?: CUBFlowchartNodeComponent;

	// Private callbacks.
	_onRendered?( cmp: CUBFlowchartNodeComponent ): void;
	_onUpdated?( cmp: CUBFlowchartNodeComponent ): void;
	_onDestroyed?( cmp: CUBFlowchartNodeComponent ): void;
};

export type CUBFlowchartNodeAddonEvent = {
	flowchart: CUBFlowchartComponent;
	sourceNode: CUBFlowchartNode;
	event: MouseEvent;
	position?: number;
};

export type CUBFlowchartNodeClickedEvent = {
	flowchart: CUBFlowchartComponent;
	node: CUBFlowchartNode;
	event: MouseEvent;
};

export type CUBFlowchartNodePromiseResolve
	= [ CUBFlowchartNode, CUBFlowchartNodeComponent ];

enum LineName {
	FromPreviousNode = 1,
	FromInsertPreviousNodeButton,
	FromSplitingPoint,
	ToInsertNextNodeButton,
	ToSpitingPoint,
	ToMergingPoint,
};

type ChildNodesDiffer = IterableDiffer<CUBFlowchartNode>;
type ChildNodesChanges = IterableChanges<CUBFlowchartNode>;

const NODE_TRACK_BY_FN: TrackByFunction<CUBFlowchartNode>
	= ( idx: number, node: CUBFlowchartNode ) => node?.id || idx;
const DEFAULT_LINE_OPTIONS: LeaderLineNew.Options
	= {
		color: 'var(--flowchart-line-color)',
		labelOptions: {
			color: 'var(--flowchart-line-label-color)',
			backgroundColor: 'var(--flowchart-line-label-bg-color)',
		},
	};

@Unsubscriber()
@Component({
	selector: 'cub-flowchart-node',
	templateUrl: './flowchart-node.pug',
	styleUrls: [ './flowchart-node.scss' ],
	host: { class: 'cub-flowchart-node' },
	encapsulation: ViewEncapsulation.None,
	changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CUBFlowchartNodeComponent
implements OnInit, AfterViewInit, DoCheck, OnDestroy {

	@Input() public previousNode: CUBFlowchartNode;
	@Input() public nextNode: CUBFlowchartNode;
	@Input() public parentNode: CUBFlowchartNode;
	@Input() public position: number;

	@Output() public rendered: EventEmitter<void> = new EventEmitter();

	@ViewChild( 'wrapperBlock', { static: true } )
	protected readonly wrapperBlockEleRef: ElementRef<HTMLElement>;
	@ViewChild( 'contentBlock', { static: true } )
	protected readonly contentBlockEleRef: ElementRef<HTMLElement>;
	@ViewChild( 'btnInsertPreviousNode', { read: ElementRef } )
	protected readonly btnInsertPreviousNodeEleRef: ElementRef<HTMLElement>;
	@ViewChild( 'btnInsertNextNode', { read: ElementRef } )
	protected readonly btnInsertNextNodeEleRef: ElementRef<HTMLElement>;
	@ViewChild( 'splitingPoint' )
	protected readonly splitingPointEleRef: ElementRef<HTMLElement>;
	@ViewChild( 'mergingPoint' )
	protected readonly mergingPointEleRef: ElementRef<HTMLElement>;
	@ViewChild( 'childNodesFactory', { static: true, read: ViewContainerRef } )
	protected readonly childNodesFactory: ViewContainerRef;
	@ViewChild( 'nextNodeFactory', { static: true, read: ViewContainerRef } )
	protected readonly nextNodeFactory: ViewContainerRef;

	protected isCollapsed: boolean;

	private readonly _cdRef: ChangeDetectorRef
		= inject( ChangeDetectorRef );
	private readonly _elementRef: ElementRef
		= inject( ElementRef );
	private readonly _injector: Injector
		= inject( Injector );
	private readonly _ngZone: NgZone
		= inject( NgZone );
	private readonly _iterableDiffers: IterableDiffers
		= inject( IterableDiffers );
	private readonly _resizeObserver: ResizeObserver
		= new ResizeObserver(
			_.debounce(() => {
				if ( !this._isRendered ) return;

				this.flowchart.reposition();
			}, 17) // 60fps
		);

	private _node: CUBFlowchartNode;
	private _childNodes: CUBFlowchartNode[];
	private _currNodeType: number;
	private _currPreviousNodeID: ULID;
	private _currNextNodeID: ULID;
	private _currParentNodeID: ULID;
	private _isRendered: boolean;
	private _needsUpdate: boolean;
	private _cmpRef: ComponentRef<CUBFlowchartNodeComponent>;
	private _lineMap: Map<LineName, LeaderLineNew>;
	private _childNodesDiffer: ChildNodesDiffer;

	@Input()
	get node(): CUBFlowchartNode {
		return this._node;
	}
	set node( node: CUBFlowchartNode ) {
		this._node = node;
		this._node._cmp = this;
	}

	@Input()
	get childNodes(): CUBFlowchartNode[] {
		return this._childNodes;
	}
	set childNodes( nodes: CUBFlowchartNode[] ) {
		this._childNodes = _.map(
			nodes,
			( node: CUBFlowchartNode ): CUBFlowchartNode => {
				return node ||= {
					id: null,
					disableInsertNextNode: true,
				};
			}
		);

		if ( !this._childNodesDiffer ) {
			this._childNodesDiffer
				= this
				._iterableDiffers
				.find( this._childNodes )
				.create( NODE_TRACK_BY_FN );
		}
	}

	@HostBinding( 'class.cub-flowchart-node--boxed' )
	get isBoxed(): boolean {
		return !!this.node.addOuterBox;
	}

	get isBlankChild(): boolean {
		return this.parentNode
			&& this.node.id === null;
	}

	get isFirstChild(): boolean {
		return this.position === 0;
	}

	get isLastChild(): boolean {
		return this.position
			=== this.parentNode.childNodes.length;
	}

	get isRootChild(): boolean {
		return this.parentNode
			&& !this.previousNode;
	}

	get isLeafChild(): boolean {
		return this.parentNode
			&& !this.node.nextNode;
	}

	get hasPreviousNode(): boolean {
		return !!this.previousNode;
	}

	get hasNextNode(): boolean {
		return !!this.node.nextNode;
	}

	get hasParentNode(): boolean {
		return !!this.parentNode;
	}

	get hasChildNodes(): boolean {
		return this.node.childNodes?.length > 0;
	}

	get hasBranches(): boolean {
		return !this.isBoxed && this.hasChildNodes;
	}

	get canInsertNode(): boolean {
		return !this.flowchart.viewOnly;
	}

	get canInsertPreviousNode(): boolean {
		return !this.isBlankChild
			&& this.isRootChild
			&& this.canInsertNode
			&& this.parentNode._cmp.hasBranches;
	}

	get canInsertNextNode(): boolean {
		return this.canInsertNode
			&& !this.node.disableInsertNextNode;
	}

	get element(): HTMLElement {
		return this._elementRef.nativeElement;
	}

	get content(): HTMLElement {
		return this.isBoxed
			? this.wrapperBlockEleRef.nativeElement
			: this.contentBlockEleRef.nativeElement;
	}

	get btnInsertPreviousNode(): HTMLElement {
		return this.btnInsertPreviousNodeEleRef?.nativeElement;
	}

	get btnInsertNextNode(): HTMLElement {
		return this.btnInsertNextNodeEleRef?.nativeElement;
	}

	get splitingPoint(): HTMLElement {
		return this.splitingPointEleRef?.nativeElement;
	}

	get mergingPoint(): HTMLElement {
		return this.mergingPointEleRef?.nativeElement;
	}

	constructor(
		@Inject( CUBFlowchartComponent )
		protected flowchart: CUBFlowchartComponent
	) {}

	ngOnInit() {
		this._currNodeType = this.node.type;
		this._currPreviousNodeID = this.previousNode?.id;
		this._currNextNodeID = this.nextNode?.id;

		if ( this.isRootChild ) {
			this._currParentNodeID = this.parentNode?.id;
		}
	}

	ngAfterViewInit() {
		this._resizeObserver.observe( this.element );
		this._resizeObserver.observe( this.content );

		this
		.flowchart
		.reposition$
		.pipe( untilCmpDestroyed( this ) )
		.subscribe(() => {
			if ( !this._isRendered ) return;

			this._ngZone.runOutsideAngular(() => {
				this._repositionAllLines();
			});
		});

		this
		.flowchart
		.scaling$
		.pipe( untilCmpDestroyed( this ) )
		.subscribe(( ratio: number ) => {
			if ( !this._isRendered ) return;

			this._ngZone.runOutsideAngular(() => {
				this._scaleAllLines( ratio );
			});
		});

		this._render();
	}

	ngDoCheck() {
		if ( this._isRendered && this._needsUpdate ) {
			// Re-renders the component when node type is changed
			if ( this._currNodeType !== this.node.type ) {
				this._currNodeType = this.node.type;

				this._ngZone.runOutsideAngular(() => {
					this._removeAllLines();
				});

				this.isCollapsed = false;

				this._childNodesDiffer.diff( null );
				this.childNodesFactory.clear();

				this._isRendered = false;
				this._render();

				return;
			}

			const previousNodeID: ULID = this.previousNode?.id;

			if ( this._currPreviousNodeID !== previousNodeID ) {
				this._currPreviousNodeID = previousNodeID;

				this._ngZone.runOutsideAngular(() => {
					Promise.resolve().then(() => {
						this._drawLineFromPreviousNode();
					});
				});
			}

			const nextNodeID: ULID = this.nextNode?.id;

			if ( this._currNextNodeID !== nextNodeID ) {
				this._currNextNodeID = nextNodeID;

				this._createNextNodeCmp();
			}

			if ( this.isRootChild ) {
				const parentNodeID: ULID = this.parentNode?.id;

				if ( this._currParentNodeID !== parentNodeID ) {
					this._currParentNodeID = parentNodeID;

					this._ngZone.runOutsideAngular(() => {
						Promise.resolve().then(() => {
							if ( this.canInsertPreviousNode ) {
								this._drawLineFromInsertPreviousNodeButton();
							}

							this._drawLinesFromParentNode();
						});
					});
				}
			}

			const childNodesChanges: ChildNodesChanges
				= this._childNodesDiffer?.diff(
					this.childNodes
				);

			if ( childNodesChanges ) {
				this._createChildNodeCmps(
					childNodesChanges
				);
			}

			this.node._onUpdated?.( this );
			delete this.node._onUpdated;
		}

		this._needsUpdate = false;
	}

	ngOnDestroy() {
		console.info( `The node "${this.node.id}" was destroyed` );

		this.node._cmp = null;

		this.node._onDestroyed?.( this );
		delete this.node._onDestroyed;

		this._resizeObserver.disconnect();

		this._ngZone.runOutsideAngular(() => {
			this._removeAllLines();
		});
	}

	public detectChanges() {
		this._cdRef.detectChanges();
	}

	public markForCheck() {
		this._cdRef.markForCheck();
	}

	public setComponentRef(
		cmpRef: ComponentRef<CUBFlowchartNodeComponent>
	) {
		this._cmpRef = cmpRef;
	}

	public getComponentRef(): ComponentRef<CUBFlowchartNodeComponent> {
		return this._cmpRef;
	}

	/**
	 * Gets the previous node of this node.
	 * @returns A `CUBFlowchartNode`.
	 */
	public getPreviousNode(): CUBFlowchartNode {
		return this.previousNode;
	}

	/**
	 * Gets the parent node of this node.
	 * @returns A `CUBFlowchartNode`.
	 */
	public getParentNode(): CUBFlowchartNode {
		return this.parentNode;
	}

	/**
	 * Inserts a next node to this node.
	 * @param node The node to be inserted as the next node.
	 * @param scrollToThisNode Indicates if the flowchart should scroll to the inserted node.
	 * @returns A `Promise<CUBFlowchartNodePromiseResolve>` that resolves after the child node is ready.
	 */
	public insertNextNode(
		nextNode: CUBFlowchartNode,
		scrollToThisNode?: boolean
	): Promise<CUBFlowchartNodePromiseResolve> {
		return new Promise(( resolve: any ) => {
			if ( nextNode ) {
				let _nextNode: CUBFlowchartNode = nextNode;

				do {
					if ( !_nextNode.nextNode ) {
						_nextNode.nextNode = this.node.nextNode;
						break;
					}

					_nextNode = _nextNode.nextNode;
				} while ( _nextNode );

				this.node.nextNode = nextNode;
			} else {
				delete this.node.nextNode;
			}

			this.flowchart.update( this.node );

			nextNode._onRendered = (
				cmp: CUBFlowchartNodeComponent
			) => {
				if ( scrollToThisNode ) {
					cmp.scrollTo();
				}

				resolve([ nextNode, cmp ]);
			};
		});
	}

	/**
	 * Adds a child node to this node.
	 * @param node The node to be added as the child node.
	 * @param position The position at which to add the child node.
	 * @param scrollToThisNode Indicates if the flowchart should scroll to the added node.
	 * @returns A `Promise<CUBFlowchartNodePromiseResolve>`
	 * that resolves after the child node is ready.
	 */
	public addChildNode(
		childNode: CUBFlowchartNode,
		position: number = -1,
		scrollToThisNode?: boolean
	): Promise<CUBFlowchartNodePromiseResolve> {
		return new Promise(( resolve: any ) => {
			const childNodes: CUBFlowchartNode[]
				= this.node.childNodes ||= [];

			if ( position === -1 ) {
				childNodes.push( childNode );
			} else {
				childNode.nextNode = childNodes[ position ];
				childNodes[ position ] = childNode;
			}

			this.flowchart.update( this.node );

			childNode._onRendered = (
				cmp: CUBFlowchartNodeComponent
			) => {
				if ( scrollToThisNode ) {
					cmp.scrollTo();
				}

				resolve([ childNode, cmp ]);
			};
		});
	}

	/**
	 * Updates this node.
	 * @returns A `Promise<CUBFlowchartNodePromiseResolve>`
	 * that resolves after the child node is updated.
	 */
	public update() {
		return new Promise(( resolve: any ) => {
			this.nextNode = this.node.nextNode;
			this.childNodes = this.node.childNodes;

			this.node._onUpdated = (
				cmp: CUBFlowchartNodeComponent
			) => {
				resolve([ this.node, cmp ]);
			};

			this._needsUpdate = true;

			this.markForCheck();
		});
	}

	/**
	 * Destroys this node.
	 * Cannot destroy the root node.
	 * @returns A `Promise<CUBFlowchartNodePromiseResolve>`
	 * that resolves after the child node is destroyed.
	 */
	public destroy(): Promise<CUBFlowchartNodePromiseResolve> {
		return new Promise(( resolve: any, reject: any ) => {
			if ( this.hasChildNodes ) {
				this.childNodesFactory.clear();
			}

			if ( this.hasPreviousNode ) {
				this.nextNodeFactory.detach();

				setTimeout(() => {
					this.previousNode.nextNode
						= this.node.nextNode;

					this.flowchart.update( this.previousNode );

					this._cmpRef.onDestroy(() => {
						setTimeout(() => {
							const nodeNeedScrollTo: CUBFlowchartNode
								= this.node.nextNode || this.previousNode;

							nodeNeedScrollTo._cmp?.scrollTo();
						});

						resolve([ this.node, this ]);
					});
					this._cmpRef.destroy();
				});
			} else if ( this.hasParentNode ) {
				this.nextNodeFactory.detach();

				setTimeout(() => {
					this.parentNode.childNodes[ this.position ]
						= this.node.nextNode;

					this.node._onDestroyed = (
						cmp: CUBFlowchartNodeComponent
					) => {
						resolve([ this.node, cmp ]);
					};

					this.flowchart.update( this.parentNode );
				});
			} else {
				reject( new Error( 'Cannot destroy the root node.' ) );
			}
		});
	}

	/**
	 * Reposition this node.
	 */
	public reposition() {
		this._repositionAllLines();
	}

	/**
	 * Expands the children block of node.
	 */
	public expand() {
		this.isCollapsed = false;

		setTimeout( () => this.scrollTo() );
	}

	/**
	 * Collapses the children block of node.
	 */
	public collapse() {
		this.isCollapsed = true;

		setTimeout( () => this.scrollTo() );
	}

	/**
	 * Scrolls to this node.
	 * @param options An object containing the coordinates to scroll to
	 * or options for smooth scrolling.
	 */
	public scrollTo(
		options?: ScrollIntoViewOptions
	) {
		this.content.scrollIntoView({
			block: 'center',
			inline: 'center',

			...options,
		});
	}

	protected onContentClicked( e: MouseEvent ) {
		e.stopPropagation();

		if ( this.flowchart.isGrabbing ) {
			return;
		}

		this
		.flowchart
		.nodeClicked
		.emit({
			flowchart: this.flowchart,
			node: this.node,
			event: e,
		});
	}

	protected onBtnInsertPreviousNodeClicked(
		event: MouseEvent
	) {
		event.stopPropagation();

		this
		.flowchart
		.nodeAddon
		.emit({
			flowchart: this.flowchart,
			sourceNode: this.parentNode,
			position: this.position,
			event,
		});
	}

	protected onBtnInsertNextNodeClicked(
		event: MouseEvent
	) {
		event.stopPropagation();

		this
		.flowchart
		.nodeAddon
		.emit({
			flowchart: this.flowchart,
			sourceNode: this.node,
			event,
		});
	}

	protected onBtnAddChildNodeClicked(
		event: MouseEvent
	) {
		event.stopPropagation();

		this
		.flowchart
		.nodeAddon
		.emit({
			flowchart: this.flowchart,
			sourceNode: this.parentNode,
			position: this.position,
			event,
		});
	}

	private _render() {
		if ( this._isRendered ) return;

		if ( this.hasNextNode ) {
			this._createNextNodeCmp();
		}

		if ( this.hasChildNodes ) {
			this._createChildNodeCmps(
				this._childNodesDiffer.diff(
					this._childNodes
				)
			);
		}

		Promise.resolve().then(() => {
			this._isRendered = true;

			this.node._onRendered?.( this );
			delete this.node._onRendered;

			this.rendered.emit();

			this._ngZone.runOutsideAngular(() => {
				// If this node can insert a previous node,
				// draw a line from the insert previous node button to this node.
				if ( this.canInsertPreviousNode ) {
					this._drawLineFromInsertPreviousNodeButton();
				}

				// If this node can insert a next node,
				// draw a line from this node to the insert next node button.
				if ( this.canInsertNextNode ) {
					this._drawLineToInsertNextNodeButton();
				}

				// If this node has branches,
				// draw a line from this node to the spliting point.
				if ( this.hasBranches ) {
					this._drawLineToSplitingPoint();
				}

				// If this node has the previous node,
				// draw a line from the previous node to this node.
				if ( this.hasPreviousNode ) {
					this._drawLineFromPreviousNode();
				}

				// If this node has the parent node,
				// draw lines from the parent node to this node.
				if ( this.hasParentNode ) {
					this._drawLinesFromParentNode();
				}
			});
		});
	}

	/**
	 * Creates a next node component within this node.
	 */
	private _createNextNodeCmp() {
		if ( !this.hasNextNode ) {
			this.nextNodeFactory.clear();

			if ( this.hasParentNode ) {
				this._ngZone.runOutsideAngular(() => {
					this._drawLinesFromParentNode();
				});
			}

			return;
		}

		// Removes the line drawn to merging point
		// before creates the next node component.
		this._ngZone.runOutsideAngular(() => {
			this._removeLine( LineName.ToMergingPoint );
		});

		this._createNodeCmp(
			this.nextNodeFactory,
			this.node.nextNode,
			this.node,
			this.parentNode
		);
	}

	/**
	 * Creates child node components within this node.
	 * @param changes The child node iterable changes.
	 */
	private _createChildNodeCmps(
		changes?: ChildNodesChanges
	) {
		if ( changes ) {
			changes.forEachOperation((
				record: any,
				adjustedPreviousIndex: number,
				currentIndex: number
			) => {
				if ( record.previousIndex === null ) {
					this._createNodeCmp(
						this.childNodesFactory,
						record.item,
						undefined,
						this.node,
						currentIndex
					);
				} else if ( currentIndex === null ) {
					this.childNodesFactory.remove(
						adjustedPreviousIndex
					);
				} else {
					this.childNodesFactory.move(
						this.childNodesFactory.get(
							adjustedPreviousIndex
						),
						currentIndex
					);
				}
			});

			_.forEach(
				this.childNodes,
				( node: CUBFlowchartNode ) =>
					node._cmp?.reposition()
			);
			return;
		}

		this.childNodesFactory.clear();

		_.forEach(
			this.childNodes,
			(
				childNode: CUBFlowchartNode,
				idx: number
			) => {
				this._createNodeCmp(
					this.childNodesFactory,
					childNode,
					undefined,
					this.node,
					idx
				);
			}
		);
	}

	/**
	 * Creates a node component within the flowchart.
	 * @param factory - The `ViewContainerRef` which acts as the anchor point for inserting the created node component.
	 * @param node - The node to be created.
	 * @param previousNode - (Optional) The previous node in the sequence.
	 * @param parentNode - (Optional) The parent node in the hierarchy.
	 * @param index - (Optional) The index at which the node should be inserted. Defaults to 0.
	 */
	private _createNodeCmp(
		factory: ViewContainerRef,
		node: CUBFlowchartNode,
		previousNode?: CUBFlowchartNode,
		parentNode?: CUBFlowchartNode,
		index: number = 0
	): ComponentRef<CUBFlowchartNodeComponent> {
		let cmpRef: ComponentRef<CUBFlowchartNodeComponent>
			= node._cmp?.getComponentRef();

		if ( cmpRef ) {
			factory.insert( cmpRef.hostView, index );
		} else {
			cmpRef = factory.createComponent(
				CUBFlowchartNodeComponent,
				{ index, injector: this._injector }
			);

			cmpRef.instance.setComponentRef( cmpRef );
		}

		cmpRef.setInput( 'node', node );
		cmpRef.setInput( 'previousNode', previousNode );
		cmpRef.setInput( 'nextNode', node.nextNode );
		cmpRef.setInput( 'parentNode', parentNode );
		cmpRef.setInput( 'childNodes', node.childNodes );
		cmpRef.setInput( 'position', index );

		cmpRef.changeDetectorRef.detectChanges();

		return cmpRef;
	}

	/**
	 * Draws a line from the insert previous node button to this node.
	 */
	private _drawLineFromInsertPreviousNodeButton() {
		this._addLine(
			{
				start: this.btnInsertPreviousNode,
				startPlug: 'behind',
				end: this.content,
			},
			LineName.FromInsertPreviousNodeButton
		);
	}

	/**
	 * Draws a line from this node to the insert next node button.
	 */
	private _drawLineToInsertNextNodeButton() {
		const options: StraightLine.Options = {
			end: this.btnInsertNextNode,
			endPlug: 'behind',
		};

		if ( this.hasBranches ) {
			options.start = this.mergingPoint;
			options.startPlug = 'behind';
		} else {
			options.start = this.content;
		}

		this._addLine(
			options,
			LineName.ToInsertNextNodeButton
		);
	}

	/**
	 * Draws a line from this node to the spliting point.
	 */
	private _drawLineToSplitingPoint() {
		this._addLine(
			{
				start: this.content,
				end: this.splitingPoint,
				endPlug: 'behind',
			},
			LineName.ToSpitingPoint
		);
	}

	/**
	 * Draws a line from the previous node to this node.
	 */
	private _drawLineFromPreviousNode() {
		// Removes the old line from the previous node.
		this._removeLine( LineName.FromPreviousNode );

		if ( !this.hasPreviousNode ) return;

		// Removes the line from the spliting point
		// before draws a line from the previous node.
		this._removeLine( LineName.FromSplitingPoint );

		// Removes the line from insert previous node button
		// before draws a line from the previous node.
		this._removeLine( LineName.FromInsertPreviousNodeButton );

		const previousNodeCmp: CUBFlowchartNodeComponent
			= this.previousNode._cmp;
		const options: StraightLine.Options = {
			start: previousNodeCmp.content,
			end: this.content,
		};

		if ( previousNodeCmp.canInsertNextNode ) {
			options.start = previousNodeCmp.btnInsertNextNode;
			options.startPlug = 'behind';
		} else if ( previousNodeCmp.hasBranches ) {
			options.start = previousNodeCmp.mergingPoint;
			options.startPlug = 'behind';
		}

		this._addLine(
			options,
			LineName.FromPreviousNode
		);
	}

	/**
	 * Draws a line from the spliting point of the parent node to this node,
	 * and a line from this node to the merging point of the parent node.
	 */
	private _drawLinesFromParentNode() {
		// Removes the old lines connected with the parent node.
		this._removeLine( LineName.FromSplitingPoint );
		this._removeLine( LineName.ToMergingPoint );

		if ( !this.hasParentNode ) return;

		const parentNodeCmp: CUBFlowchartNodeComponent
			= this.parentNode._cmp;

		if ( !parentNodeCmp.hasBranches ) {
			return;
		}

		if ( this.isRootChild ) {
			const options: BranchLine.Options = {
				start: parentNodeCmp.splitingPoint,
				startPlug: 'behind',
				end: this.content,
				branchType: BranchLineType.Spliting,
				label: this.parentNode.childNodeLineCaptions?.[ this.position ],
			};

			if ( this.canInsertPreviousNode ) {
				options.end = this.btnInsertPreviousNode;
				options.endPlug = 'behind';
			}

			if ( this.isBlankChild ) {
				options.endPlug = 'behind';
			}

			this._addLine(
				options,
				LineName.FromSplitingPoint,
				BranchLine
			);
		}

		if ( this.isLeafChild ) {
			const options: BranchLine.Options = {
				start: this.content,
				end: parentNodeCmp.mergingPoint,
				endPlug: 'behind',
				branchType: BranchLineType.Merging,
			};

			if ( this.isBlankChild ) {
				options.startPlug = 'behind';
			}

			if ( this.canInsertNextNode ) {
				options.start = this.btnInsertNextNode;
				options.startPlug = 'behind';
			} else if ( this.hasBranches ) {
				options.start = this.mergingPoint;
				options.startPlug = 'behind';
			}

			this._addLine(
				options,
				LineName.ToMergingPoint,
				BranchLine
			);
		}
	}

	/**
	 * Creates a new line with the specified options.
	 * @param options The specific options to create the line.
	 * @param name A unique name for the line.
	 * @param ctor A constructor function to create the line instance.
	 * @returns An instance of `LeaderLineNew`.
	 */
	private _addLine(
		options?: LeaderLineNew.Options,
		name?: LineName,
		ctor: typeof LeaderLineNew = StraightLine
	): LeaderLineNew {
		if ( name ) {
			this._lineMap ||= new Map();
		}

		let line: LeaderLineNew;

		if ( !this._lineMap?.has( name ) ) {
			line = new ctor({
				...DEFAULT_LINE_OPTIONS,
				...options,

				scaleRatio: this.flowchart.scaleRatio,
				container: this.flowchart.lineStack,
			});

			this._lineMap.set( name, line );
		} else if ( this._lineMap ) {
			line = this._lineMap.get( name );

			line.setOptions( options );
		}

		return line;
	}

	/**
	 * Removes a line by name
	 * @param name The name of the line which to be removed
	 */
	private _removeLine( name: LineName ) {
		if ( !this._lineMap?.has( name ) ) {
			return;
		}

		this._lineMap.get( name ).remove();
		this._lineMap.delete( name );
	}

	/**
	 * Removes all connected lines.
	 */
	private _removeAllLines() {
		if ( !this._lineMap ) {
			return;
		}

		for ( const key of this._lineMap.keys() ) {
			this._removeLine( key );
		}

		this._lineMap.clear();
	}

	/**
	 * Re-positions all connected lines.
	 */
	private _repositionAllLines() {
		if ( !this._lineMap ) {
			return;
		}

		for ( const line of this._lineMap.values() ) {
			line.position();
		}
	}

	/**
	 * Scales all connected lines.
	 * @param ratio The ratio which to be scaled.
	 */
	private _scaleAllLines( ratio: number ) {
		if ( !this._lineMap ) {
			return;
		}

		for ( const line of this._lineMap.values() ) {
			line.scaleRatio = ratio;
		}
	}

}
