import {
	AfterViewInit,
	Directive,
	ElementRef,
	EventEmitter,
	HostListener,
	inject,
	Input,
	Output
} from '@angular/core';
import { Subject } from 'rxjs';
import _ from 'lodash';

import {
	CoerceNumber,
	DefaultValue
} from '../decorators';

export interface ScrollEvent {
	scrollingX: boolean;
	scrollingY: boolean;
	scrollingUp: boolean;
	scrollingDown: boolean;
	scrollingLeft: boolean;
	scrollingRight: boolean;
	scrollReachTop: boolean;
	scrollReachBottom: boolean;
	scrollReachLeft: boolean;
	scrollReachRight: boolean;
	scrollTop: number;
	scrollLeft: number;
	scrollWidth: number;
	scrollHeight: number;
	clientWidth: number;
	clientHeight: number;
}

@Directive({
	selector: '[detectScroll]',
	exportAs: 'detectScroll',
})
export class DetectScrollDirective implements AfterViewInit {

	@Input() @DefaultValue() @CoerceNumber()
	public delay: number = 0;
	@Input() @DefaultValue() @CoerceNumber()
	public offset: number = 1;
	@Input() @DefaultValue() @CoerceNumber()
	public reachTopBuffer: number = 0;
	@Input() @DefaultValue() @CoerceNumber()
	public reachBottomBuffer: number = 0;
	@Input() @DefaultValue() @CoerceNumber()
	public reachLeftBuffer: number = 0;
	@Input() @DefaultValue() @CoerceNumber()
	public reachRightBuffer: number = 0;

	@Output() public scrolling: EventEmitter<ScrollEvent>
		= new EventEmitter<ScrollEvent>();
	@Output() public scrollingX: EventEmitter<WheelEvent>
		= new EventEmitter<WheelEvent>();
	@Output() public scrollingY: EventEmitter<WheelEvent>
		= new EventEmitter<WheelEvent>();
	@Output() public scrollingUp: EventEmitter<WheelEvent>
		= new EventEmitter<WheelEvent>();
	@Output() public scrollingDown: EventEmitter<WheelEvent>
		= new EventEmitter<WheelEvent>();
	@Output() public scrollingLeft: EventEmitter<WheelEvent>
		= new EventEmitter<WheelEvent>();
	@Output() public scrollingRight: EventEmitter<WheelEvent>
		= new EventEmitter<WheelEvent>();
	@Output() public scrollReachTop: EventEmitter<WheelEvent>
		= new EventEmitter<WheelEvent>();
	@Output() public scrollReachBottom: EventEmitter<WheelEvent>
		= new EventEmitter<WheelEvent>();
	@Output() public scrollReachLeft: EventEmitter<WheelEvent>
		= new EventEmitter<WheelEvent>();
	@Output() public scrollReachRight: EventEmitter<WheelEvent>
		= new EventEmitter<WheelEvent>();

	public readonly scrolling$: Subject<any>
		= new Subject<any>();

	private readonly _elementRef: ElementRef
		= inject( ElementRef );

	private _lastScrollTop: number = 0;
	private _lastScrollLeft: number = 0;

	get scrollable(): boolean {
		return this.scrollableX || this.scrollableY;
	}

	get scrollableX(): boolean {
		const {
			clientHeight,
			clientWidth,
			scrollWidth,
		}: HTMLElement = this._elementRef.nativeElement;

		return !!clientWidth
			&& !!clientHeight
			&& scrollWidth > clientWidth;
	}

	get scrollableY(): boolean {
		const {
			clientHeight,
			clientWidth,
			scrollHeight,
		}: HTMLElement = this._elementRef.nativeElement;

		return !!clientWidth
			&& !!clientHeight
			&& scrollHeight > clientHeight;
	}

	@HostListener( 'scroll', [ '$event' ] )
	protected onScroll( e?: WheelEvent ) {
		_.isNil( this.delay )
			? this._detectScroll(
				this._elementRef.nativeElement,
				e
			)
			: setTimeout( () => {
				this._detectScroll(
					this._elementRef.nativeElement,
					e
				);
			}, this.delay );
	}

	/**
	 * @constructor
	 */
	ngAfterViewInit() {
		setTimeout(() => {
			this._detectScroll(
				this._elementRef.nativeElement
			);
		});
	}

	/**
	 * @param {WheelEvent=} e
	 * @return {void}
	 */
	public triggerScroll( e?: WheelEvent ) {
		this._elementRef.nativeElement.scroll( e );
	}

	/**
	 * @param {HTMLElement} element
	 * @param {WheelEvent=} e
	 * @return {void}
	 */
	private _detectScroll(
		element: HTMLElement,
		e?: WheelEvent
	) {
		const scrollTop: number
			= Math.abs( element.scrollTop );
		const scrollLeft: number
			= Math.abs( element.scrollLeft );
		const scrollWidth: number
			= element.scrollWidth;
		const scrollHeight: number
			= element.scrollHeight;
		const clientWidth: number
			= element.clientWidth;
		const clientHeight: number
			= element.clientHeight;
		const maxScrollTop: number
			= scrollHeight - clientHeight;
		const maxScrollLeft: number
			= scrollWidth - clientWidth;
		const maxScrollTopWithOffset: number
			= maxScrollTop - this.offset;
		const maxScrollLeftWithOffset: number
			= maxScrollLeft - this.offset;
		const maxReachTop: number
			= maxScrollTopWithOffset
				* ( this.reachTopBuffer / scrollHeight );
		const maxReachBottom: number
			= maxScrollTopWithOffset
				* ( 1 - ( this.reachBottomBuffer / scrollHeight ) );
		const maxReachLeft: number
			= maxScrollLeftWithOffset
				* ( this.reachLeftBuffer / scrollWidth );
		const maxReachRight: number
			= maxScrollLeftWithOffset
				* ( 1 - ( this.reachRightBuffer / scrollWidth ) );
		let scrollingX: boolean = false;
		let scrollingY: boolean = false;
		let scrollingUp: boolean = false;
		let scrollingDown: boolean = false;
		let scrollingLeft: boolean = false;
		let scrollingRight: boolean = false;
		let scrollReachTop: boolean = false;
		let scrollReachBottom: boolean = false;
		let scrollReachLeft: boolean = false;
		let scrollReachRight: boolean = false;

		// In case scrolling X
		if ( scrollLeft !== this._lastScrollLeft ) {
			scrollingX = true;
			scrollingLeft = scrollLeft < this._lastScrollLeft;
			scrollingRight = scrollLeft > this._lastScrollLeft;

			this.scrollingX.emit( e );

			if ( scrollingLeft ) this.scrollingLeft.emit( e );

			if ( scrollingRight ) this.scrollingRight.emit( e );
		}

		// In case scrolling Y
		if ( scrollTop !== this._lastScrollTop ) {
			scrollingY = true;
			scrollingUp = scrollTop < this._lastScrollTop;
			scrollingDown = scrollTop > this._lastScrollTop;

			this.scrollingY.emit( e );

			if ( scrollingUp ) this.scrollingUp.emit( e );

			if ( scrollingDown ) this.scrollingDown.emit( e );
		}

		// In case scroll reach top
		if ( ( !this.scrollableY
				&& !scrollTop
				&& !scrollingX
				&& !scrollingDown )
			|| ( scrollingUp
				&& ( Math.ceil( scrollTop ) === 0
					|| ( Math.ceil( this._lastScrollTop ) > maxReachTop
						&& Math.ceil( scrollTop ) <= maxReachTop ) ) ) ) {
			scrollReachTop = true;

			this.scrollReachTop.emit( e );
		}

		// In case scroll reach bottom
		if ( ( !this.scrollableY
				&& !scrollTop
				&& !scrollingX
				&& !scrollingUp )
			|| ( scrollingDown
				&& ( Math.ceil( scrollTop ) === maxScrollTop
					|| ( Math.ceil( this._lastScrollTop ) < maxReachBottom
						&& Math.ceil( scrollTop ) >= maxReachBottom ) ) ) ) {
			scrollReachBottom = true;

			this.scrollReachBottom.emit( e );
		}

		// In case scroll reach left
		if ( ( !this.scrollableX
				&& !scrollLeft
				&& !scrollingY
				&& !scrollingRight )
			|| ( scrollingLeft
				&& ( Math.ceil( scrollLeft ) === 0
					|| ( Math.ceil( this._lastScrollLeft ) > maxReachLeft
						&& Math.ceil( scrollLeft ) <= maxReachLeft ) ) ) ) {
			scrollReachLeft = true;

			this.scrollReachLeft.emit( e );
		}

		// In case scroll reach right
		if ( ( !this.scrollableX
				&& !scrollLeft
				&& !scrollingY
				&& !scrollingLeft )
			|| ( scrollingRight
				&& ( Math.ceil( scrollLeft ) === maxScrollLeft
					|| ( Math.ceil( this._lastScrollLeft ) < maxReachRight
						&& Math.ceil( scrollLeft ) >= maxReachRight ) ) ) ) {
			scrollReachRight = true;

			this.scrollReachRight.emit( e );
		}

		this._lastScrollTop = scrollTop;
		this._lastScrollLeft = scrollLeft;

		const scrollEvent: ScrollEvent = {
			scrollingX,
			scrollingY,
			scrollingUp,
			scrollingDown,
			scrollingLeft,
			scrollingRight,
			scrollReachTop,
			scrollReachBottom,
			scrollReachLeft,
			scrollReachRight,
			scrollTop,
			scrollLeft,
			scrollWidth,
			scrollHeight,
			clientWidth,
			clientHeight,
		};

		this.scrolling.emit( scrollEvent );

		this.scrolling$.next( scrollEvent );
	}

}
