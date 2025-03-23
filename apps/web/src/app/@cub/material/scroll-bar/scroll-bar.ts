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
import LocomotiveScroll from 'locomotive-scroll';

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

    @Output() public init: EventEmitter<CUBScrollBar> =
        new EventEmitter<CUBScrollBar>();

    public readonly elementRef: ElementRef = inject(ElementRef);
    protected readonly cdRef: ChangeDetectorRef = inject(ChangeDetectorRef);
    protected readonly ngZone: NgZone = inject(NgZone);
    protected readonly platformId: Object = inject(PLATFORM_ID);

    @HostBinding('attr.scrollBar')
    protected readonly attrScrollBar: boolean = true;

    private _loadItemsThrottle: ReturnType<typeof _.throttle> = _.throttle(
        () => {
            this.ngZone.runOutsideAngular(() => {
                const items: CUBScrollBarViewPortItemDirective[] =
                    this.items.toArray();
                for (const i of items ?? []) {
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
            if (this.scroll) {
                this.scroll.update();
            }
        }
    );

    private scroll: LocomotiveScroll | undefined;

    @HostBinding('attr.deepScroll')
    get attrDeepScroll(): boolean {
        return this.deepScroll || undefined;
    }

    @HostBinding('attr.suppressX')
    get attrSuppressX(): boolean {
        return this.suppress === true || this.suppressX === true;
    }

    @HostBinding('attr.suppressY')
    get attrSuppressY(): boolean {
        return this.suppress === true || this.suppressY === true;
    }

    @HostBinding('attr.scrollableX')
    get attrScrollableX(): boolean {
        return !this.suppress && !this.suppressX && this.scrollableX;
    }

    @HostBinding('attr.scrollableY')
    get attrScrollableY(): boolean {
        return !this.suppress && !this.suppressY && this.scrollableY;
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
        return (
            this.scroll?.scroll?.instance?.scroll?.x ||
            this.nativeElement.scrollWidth
        );
    }
    get scrollHeight(): number {
        return (
            this.scroll?.scroll?.instance?.scroll?.y ||
            this.nativeElement.scrollHeight
        );
    }
    get scrollLeft(): number {
        return (
            this.scroll?.scroll?.instance?.scroll?.x ||
            this.nativeElement.scrollLeft
        );
    }
    get scrollTop(): number {
        return (
            this.scroll?.scroll?.instance?.scroll?.y ||
            this.nativeElement.scrollTop
        );
    }

    @HostListener('scroll')
    public triggerScroll() {
        // Skip native scroll event since Locomotive Scroll handles scrolling
        if (!this.scroll) {
            this._loadItemsThrottle.cancel();
            this._loadItemsThrottle();
        }
    }

    ngOnInit() {
        this.init.emit(this);
        if (isPlatformBrowser(this.platformId)) {
            this._initLocomotiveScroll();
        }
    }

    ngAfterViewInit() {
        this._resizeObserver.observe(this.nativeElement);

        // Load items
        this.items.changes
            .pipe(startWith(this.items), untilCmpDestroyed(this))
            .subscribe(() => {
                this._loadItemsThrottle.cancel();
                this._loadItemsThrottle();
                if (this.scroll) {
                    this.scroll.update();
                }
            });
    }

    ngOnDestroy() {
        this._resizeObserver.disconnect();
        this._loadItemsThrottle.cancel();
        if (this.scroll) {
            this.scroll.destroy();
            this.scroll = undefined;
        }
    }

    public reset() {
        if (this.scroll) {
            this.scroll.scrollTo(0, { duration: 0 });
        } else {
            this.nativeElement.scrollTo(0, 0);
        }
    }

    public scrollBy(options: ScrollToOptions) {
        if (this.scroll) {
            const currentX = this.scroll.scroll.instance.scroll.x;
            const currentY = this.scroll.scroll.instance.scroll.y;
            this.scroll.scrollTo(
                (options.left || 0) + currentX,
                (options.top || 0) + currentY,
                { duration: 0 }
            );
        } else {
            this.nativeElement.scrollBy(options);
        }
    }

    public scrollTo(options: ScrollToOptions, duration?: number) {
        if (this.scroll) {
            this.scroll.scrollTo(options.left || 0, options.top || 0, {
                duration: duration || 0,
            });
        } else if (_.isFinite(duration)) {
            this._animateScrollTo(
                options.left,
                options.top,
                duration,
                this.nativeElement
            );
        } else {
            this.nativeElement.scrollTo(options);
        }
    }

    public scrollToLeft(duration?: number) {
        this.scrollTo({ left: 0 }, duration);
    }

    public scrollToRight(duration?: number) {
        this.scrollTo(
            {
                left: this.scrollWidth + this.viewportWidth,
            },
            duration
        );
    }

    public scrollToTop(duration?: number) {
        this.scrollTo({ top: 0 }, duration);
    }

    public scrollToBottom(duration?: number) {
        this.scrollTo(
            {
                top: this.scrollHeight + this.viewportHeight,
            },
            duration
        );
    }

    public scrollElementIntoView(
        targetElement: HTMLElement,
        options: ScrollIntoViewOptions = { behavior: 'smooth' },
        duration: number = 450
    ) {
        if (!this.nativeElement.contains(targetElement)) return;

        const targetRect: DOMRect = targetElement.getBoundingClientRect();
        const containerRect: DOMRect =
            this.nativeElement.getBoundingClientRect();

        // Center the element
        const scrollLeft: number =
            this.scrollLeft +
            (targetRect.left - containerRect.left) -
            (this.viewportWidth / 2 - targetRect.width / 2);
        const scrollTop: number =
            this.scrollTop +
            (targetRect.top - containerRect.top) -
            (this.viewportHeight / 2 - targetRect.height / 2);

        if (this.scroll) {
            this.scroll.scrollTo(scrollLeft, scrollTop, {
                duration: _.isFinite(duration) ? duration : 0,
            });
        } else if (_.isFinite(duration)) {
            this._animateScrollTo(
                scrollLeft,
                scrollTop,
                duration,
                this.nativeElement
            );
        } else {
            this.nativeElement.scrollTo({
                left: scrollLeft,
                top: scrollTop,
                ...options,
            });
        }
    }

    private _initLocomotiveScroll(): void {
        if (!isPlatformBrowser(this.platformId) || this.scroll) return;

        this.ngZone.runOutsideAngular(() => {
            this.scroll = new LocomotiveScroll({
                el: this.nativeElement,
                smooth: true,
                multiplier: 1,
                lerp: 0.08, // Very smooth scrolling
                direction: 'vertical',
                smartphone: { smooth: true, lerp: 0.1 },
                tablet: { smooth: true, lerp: 0.1 },
                reloadOnContextChange: true,
                scrollFromAnywhere: true,
            });

            // Sync with viewport items and AOS
            this.scroll.on('scroll', () => {
                this._loadItemsThrottle.cancel();
                this._loadItemsThrottle();
                if (window.AOS) {
                    window.AOS.refresh();
                }
                this.ngZone.run(() => this.cdRef.markForCheck());
            });

            // Initial update after a short delay
            setTimeout(() => {
                if (this.scroll) {
                    this.scroll.update();
                }
            }, 1000);
        });
    }

    private _animateScrollTo(
        scrollLeft: number,
        scrollTop: number,
        duration: number = 0,
        element: Element = document.scrollingElement as HTMLElement
    ) {
        // Easing function (ease-in-out cubic)
        function easeInOutCubic(t: number) {
            return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
        }

        const startTime: number = performance.now();
        const startLeft: number = element.scrollLeft;
        const startTop: number = element.scrollTop;
        const deltaX: number = scrollLeft - startLeft;
        const deltaY: number = scrollTop - startTop;

        function step(timestamp: number) {
            const elapsedTime: number = timestamp - startTime;
            const progress: number = Math.min(elapsedTime / duration, 1);
            const easedProgress: number = easeInOutCubic(progress);

            element.scrollLeft = startLeft + deltaX * easedProgress;
            element.scrollTop = startTop + deltaY * easedProgress;

            if (progress < 1) {
                window.requestAnimationFrame(step);
            }
        }

        window.requestAnimationFrame(step);
    }
}
