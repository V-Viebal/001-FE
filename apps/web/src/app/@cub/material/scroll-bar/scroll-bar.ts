import {
	AfterViewInit,
	ChangeDetectorRef,
	ContentChildren,
	Directive,
	ElementRef,
	EventEmitter,
	HostBinding,
	HostListener,
	inject,
	Input,
	NgZone,
	OnDestroy,
	OnInit,
	Output,
	PLATFORM_ID,
	QueryList,
} from '@angular/core';
import ResizeObserver from 'resize-observer-polyfill';
import { startWith } from 'rxjs';
import _ from 'lodash';
import Lenis from 'lenis';

import {
	CoerceBoolean,
	DefaultValue,
	DetectScrollDirective,
	untilCmpDestroyed,
} from 'angular-core';
import { isPlatformBrowser } from '@angular/common';

import { CUBScrollBarViewPortItemDirective } from './scroll-bar-view-port-item.directive';

export enum CUBScrollBarMode {
	Auto = 'auto',
	Scroll = 'scroll',
	Visible = 'visible',
}

@Directive({
	selector: '[cubScrollBar]',
})
export class CUBScrollBar
	extends DetectScrollDirective
	implements AfterViewInit, OnInit, OnDestroy
{
	@ContentChildren(CUBScrollBarViewPortItemDirective, { descendants: true })
	public items: QueryList<CUBScrollBarViewPortItemDirective>;

	@Input() @CoerceBoolean() public deepScroll: boolean;
	@Input() @CoerceBoolean() public suppress: boolean;
	@Input() @CoerceBoolean() public suppressX: boolean;
	@Input() @CoerceBoolean() public suppressY: boolean;
	@HostBinding('style.--scroll-bar-mode')
	@Input()
	@DefaultValue()
	public mode: CUBScrollBarMode = CUBScrollBarMode.Auto;

	@Output() public init: EventEmitter<CUBScrollBar> = new EventEmitter<CUBScrollBar>();

	public readonly elementRef: ElementRef = inject(ElementRef);
	protected readonly cdRef: ChangeDetectorRef = inject(ChangeDetectorRef);
	protected readonly ngZone: NgZone = inject(NgZone);
	protected readonly platformId: Object = inject(PLATFORM_ID);

	@HostBinding('attr.scrollBar')
	protected readonly attrScrollBar: boolean = true;

	@HostBinding('style.overflow-x')
	get overflowX(): string {
		return (this.suppress || this.suppressX) ? 'hidden' : 'auto';
	}

	@HostBinding('style.overflow-y')
	get overflowY(): string {
		return (this.suppress || this.suppressY) ? 'hidden' : 'auto';
	}

	private _loadItemsThrottle: ReturnType<typeof _.throttle> = _.throttle(
		() => {
			this.ngZone.runOutsideAngular(() => {
				const items: CUBScrollBarViewPortItemDirective[] = this.items?.toArray() || [];
				for (const i of items) {
					i.checkInViewPort();
				}
				this.cdRef.detectChanges();
			});
		},
		17
	);

	private readonly _resizeObserver: ResizeObserver = new ResizeObserver(
		() => {
			this._loadItemsThrottle.cancel();
			this._loadItemsThrottle();
			this._scroll?.resize();
		}
	);

	private _scroll: Lenis | undefined;
	private _rafId?: number;

	@HostBinding('attr.deepScroll')
	get attrDeepScroll(): boolean {
		return this.deepScroll || undefined;
	}

	@HostBinding('attr.suppressX')
	get attrSuppressX(): boolean {
		return this.suppress || this.suppressX;
	}

	@HostBinding('attr.suppressY')
	get attrSuppressY(): boolean {
		return this.suppress || this.suppressY;
	}

	@HostBinding('attr.scrollableX')
	get attrScrollableX(): boolean {
		return !this.suppress && !this.suppressX && this.scrollWidth > this.viewportWidth;
	}

	@HostBinding('attr.scrollableY')
	get attrScrollableY(): boolean {
		return !this.suppress && !this.suppressY && this.scrollHeight > this.viewportHeight;
	}

	get nativeElement(): HTMLElement {
		return this.elementRef.nativeElement;
	}

	get viewportWidth(): number {
		return this.nativeElement.clientWidth;
	}

	get viewportHeight(): number {
		return this.nativeElement.clientHeight;
	}

	get scrollWidth(): number {
		return this._scroll?.dimensions.scrollWidth || this.nativeElement.scrollWidth;
	}

	get scrollHeight(): number {
		return this._scroll?.dimensions.scrollHeight || this.nativeElement.scrollHeight;
	}

	get scrollLeft(): number {
		return this._scroll?.scroll || this.nativeElement.scrollLeft;
	}

	get scrollTop(): number {
		return this._scroll?.scroll || this.nativeElement.scrollTop;
	}

	@HostListener('scroll')
	public triggerScroll(): void {
		if (!this._scroll) {
			this._loadItemsThrottle.cancel();
			this._loadItemsThrottle();
		}
	}

	ngOnInit(): void {
		this.init.emit(this);
		this._initLenis();
	}

	ngAfterViewInit(): void {
		this._resizeObserver.observe(this.nativeElement);

		this.items.changes
			.pipe(startWith(this.items), untilCmpDestroyed(this))
			.subscribe(() => {
				this._loadItemsThrottle.cancel();
				this._loadItemsThrottle();
				this._scroll?.resize();
			});
	}

	ngOnDestroy(): void {
		this._resizeObserver.disconnect();
		this._loadItemsThrottle.cancel();
		this._scroll?.destroy();
		this._scroll = undefined;
	}

	public reset(): void {
		if (this._scroll) {
			this._scroll.scrollTo(0, { immediate: true });
		} else {
			this.nativeElement.scrollTo(0, 0);
		}
	}

	public scrollBy(options: ScrollToOptions): void {
		if (this._scroll) {
			const currentScroll = this._scroll.scroll;
			const target = (options.top || options.left || 0) + currentScroll;
			this._scroll.scrollTo(target, { immediate: true });
		} else {
			this.nativeElement.scrollBy(options);
		}
	}

	public scrollTo(options: ScrollToOptions, duration?: number): void {
		const target = options.top !== undefined ? options.top : options.left || 0;
			if (this._scroll) {
			this._scroll.scrollTo(target, { duration: duration || 0 });
		} else if (_.isFinite(duration)) {
			this._animateScrollTo(options.left, options.top, duration);
		} else {
			this.nativeElement.scrollTo(options);
		}
	}

	public scrollToLeft(duration?: number): void {
		this.scrollTo({ left: 0 }, duration);
	}

	public scrollToRight(duration?: number): void {
		this.scrollTo({ left: this.scrollWidth - this.viewportWidth }, duration);
	}

	public scrollToTop(duration?: number): void {
		this.scrollTo({ top: 0 }, duration);
	}

	public scrollToBottom(duration?: number): void {
		this.scrollTo({ top: this.scrollHeight - this.viewportHeight }, duration);
	}

	public scrollElementIntoView(
		targetElement: HTMLElement,
		options: ScrollIntoViewOptions = { behavior: 'smooth' },
		duration: number = 450
	): void {
		if (!this.nativeElement.contains(targetElement)) return;

		const targetRect: DOMRect = targetElement.getBoundingClientRect();
		const containerRect: DOMRect = this.nativeElement.getBoundingClientRect();

		const scrollLeft: number =
			this.scrollLeft +
			(targetRect.left - containerRect.left) -
			(this.viewportWidth / 2 - targetRect.width / 2);
		const scrollTop: number =
			this.scrollTop +
			(targetRect.top - containerRect.top) -
			(this.viewportHeight / 2 - targetRect.height / 2);

		if (this._scroll) {
			const target = (!this.suppress && !this.suppressY) ? scrollTop : scrollLeft;
			this._scroll.scrollTo(target, {
				duration: _.isFinite(duration) ? duration : 0,
			});
		} else if (_.isFinite(duration)) {
			this._animateScrollTo(scrollLeft, scrollTop, duration);
		} else {
			this.nativeElement.scrollTo({
				left: scrollLeft,
				top: scrollTop,
				...options,
			});
		}
	}

	private _initLenis(): void {
		if (!isPlatformBrowser(this.platformId) || this._scroll) return;

		this.ngZone.runOutsideAngular(() => {
			const contentElement = this.nativeElement.querySelector(':scope > *') || this.nativeElement;

			this._scroll = new Lenis({
				wrapper: this.nativeElement,
				content: contentElement,
				lerp: 0.08,
				smoothWheel: true,
				duration: 1.2,
				easing: (t: number) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
			});

			const raf = (time: number) => {
				this._scroll?.raf(time);
				this._rafId = requestAnimationFrame(raf);
			};

			this._scroll.on('scroll', (_e: any) => {
				if (!this._rafId) {
					this._rafId = requestAnimationFrame(raf);
				}
				this._loadItemsThrottle.cancel();
				this._loadItemsThrottle();
				this.ngZone.run(() => this.cdRef.markForCheck());
			});

			const mutationObserver = new MutationObserver(() => {
				this._scroll?.resize();
			});

			mutationObserver.observe(this.nativeElement, {
				childList: true,
				subtree: true,
			});

			setTimeout(() => {
				this._scroll?.resize();
			}, 100);

			this.ngOnDestroy = () => {
				mutationObserver.disconnect();
				this._resizeObserver.disconnect();
				this._loadItemsThrottle.cancel();
				if (this._rafId) {
					cancelAnimationFrame(this._rafId);
				}
				this._scroll?.destroy();
				this._scroll = undefined;
			};
		});
	}

	private _animateScrollTo(
		scrollLeft?: number,
		scrollTop?: number,
		duration: number = 0,
		element: Element = this.nativeElement
	): void {
		const easeInOutCubic = (t: number) => t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;

		const startTime = performance.now();
		const startLeft = element.scrollLeft;
		const startTop = element.scrollTop;
		const deltaX = (scrollLeft ?? startLeft) - startLeft;
		const deltaY = (scrollTop ?? startTop) - startTop;

		const step = (timestamp: number) => {
			const elapsedTime = timestamp - startTime;
			const progress = Math.min(elapsedTime / duration, 1);
			const easedProgress = easeInOutCubic(progress);

			element.scrollLeft = startLeft + deltaX * easedProgress;
			element.scrollTop = startTop + deltaY * easedProgress;

			if (progress < 1) {
				window.requestAnimationFrame(step);
			}
		};

		window.requestAnimationFrame(step);
	}
}
