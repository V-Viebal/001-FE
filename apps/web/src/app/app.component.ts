import {
	Component,
	Inject,
	OnInit,
	ChangeDetectorRef,
	NgZone,
	OnDestroy,
} from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { isPlatformBrowser } from '@angular/common';
import { PLATFORM_ID } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { debounce } from 'lodash';

@Component({
	selector: 'app',
	templateUrl: './app.pug',
})
export class AppComponent implements OnInit, OnDestroy {
	protected translationsLoaded = false;
	private intersectionObserver: IntersectionObserver | null = null;
	private resizeObserver: ResizeObserver | null = null;
	private mutationObserver: MutationObserver | null = null;
	private refreshAOSDebounced: () => void;

	constructor(
		@Inject(PLATFORM_ID) private platformId: Object,
		private translate: TranslateService,
		private cdr: ChangeDetectorRef,
		private ngZone: NgZone
	) {
		if (!isPlatformBrowser(this.platformId)) {
			this.translationsLoaded = true;
		}

		this.refreshAOSDebounced = debounce(() => {
			window.AOS.refresh();
		}, 100);
	}

	async ngOnInit(): Promise<void> {
		try {
			const initialLang = 'vi';
			if (isPlatformBrowser(this.platformId)) {
				await firstValueFrom(this.translate.use(initialLang));
				this.initAOS();
			}
			this.translationsLoaded = true;
			this.cdr.detectChanges();
		} catch (error) {
			this.translationsLoaded = true;
			this.cdr.detectChanges();
		}
	}

	ngOnDestroy(): void {
		if (this.intersectionObserver) {
			this.intersectionObserver.disconnect();
		}
		if (this.resizeObserver) {
			this.resizeObserver.disconnect();
		}
		if (this.mutationObserver) {
			this.mutationObserver.disconnect();
		}
	}

	private initAOS(): void {
		if (!isPlatformBrowser(this.platformId)) return;

		this.ngZone.runOutsideAngular(() => {
			const AOS = (window as any).AOS;
			if (!AOS) {
				return;
			}

			AOS.init({
				duration: 300,
				once: true,
				mirror: false,
				offset: 0,
				disable: false,
				startEvent: 'DOMContentLoaded',
				anchorPlacement: 'top-bottom',
			});

			// Debug AOS refresh (only log when necessary)
			window.AOS.refresh = (function (originalRefresh) {
				return function () {
					originalRefresh.apply(this, arguments);
				};
			})(window.AOS.refresh);

			const refreshAOS = () => {
				console.log('Refreshing AOS');
				AOS.refreshHard();
			};

			// Initialize AOS after DOM is fully loaded
			const initializeAOS = () => {
				refreshAOS();
			};

			if (
				document.readyState === 'complete' ||
				document.readyState === 'interactive'
			) {
				initializeAOS();
			} else {
				document.addEventListener('DOMContentLoaded', initializeAOS);
			}

			// Use IntersectionObserver to trigger AOS animations
			const scrollContainer = document.querySelector('[cubScrollBar]');
			this.intersectionObserver = new IntersectionObserver(
				(entries) => {
					entries.forEach((entry) => {
						if (entry.isIntersecting) {
							// Add aos-animate class to trigger AOS animation
							entry.target.classList.add('aos-animate');
							// Update AOS's internal state
							if (window.AOS) {
								const aosElements = window.AOS.elements || [];
								const elementIndex = aosElements.findIndex(
									(el: any) => el.node === entry.target
								);
								if (elementIndex !== -1) {
									aosElements[elementIndex].animated = true;
									aosElements[elementIndex].position = {
										top: entry.boundingClientRect.top,
										bottom: entry.boundingClientRect.bottom,
									};
								} else {
									AOS.refreshHard();
								}
								// Debounced refresh
								this.refreshAOSDebounced();
							}
							// Unobserve the element if AOS is set to animate once
							if (window.AOS?.config?.once ?? true) {
								this.intersectionObserver?.unobserve(
									entry.target
								);
							}
						}
					});
				},
				{
					root: scrollContainer,
					rootMargin: '0px',
					threshold: 0.1,
				}
			);

			this.resizeObserver = new ResizeObserver(() => {
				AOS.refreshHard();
			});

			const observeAosElements = () => {
				const aosElements = document.querySelectorAll(
					'[data-aos]:not(.aos-animate)'
				);
				aosElements.forEach((el) => {
					this.intersectionObserver?.observe(el);
				});
			};

			this.mutationObserver = new MutationObserver(
				debounce(() => {
					observeAosElements();
				}, 100)
			);

			this.mutationObserver.observe(document.body, {
				childList: true,
				subtree: true,
			});

			observeAosElements();
			this.resizeObserver.observe(document.body);
		});
	}

}
