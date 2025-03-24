import {
	Component,
	ChangeDetectorRef,
	ChangeDetectionStrategy,
	OnInit,
	inject,
	NgZone,
	OnDestroy,
} from '@angular/core';
import { PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import _ from 'lodash';
import { Unsubscriber } from '@core';
import Swiper from 'swiper';
import { Navigation, Scrollbar } from 'swiper/modules';
import ResizeObserver from 'resize-observer-polyfill';

@Unsubscriber()
@Component({
	selector: 'home',
	templateUrl: '../templates/home.pug',
	styleUrls: ['../styles/home.scss'],
	host: { class: 'home' },
	changeDetection: ChangeDetectionStrategy.OnPush,
})
export class HomeComponent implements OnInit, OnDestroy {
	private readonly _cdRef: ChangeDetectorRef = inject(ChangeDetectorRef);
	private readonly _platformId: Object = inject(PLATFORM_ID);
	private readonly _ngZone: NgZone = inject(NgZone);
	private intersectionObserver: IntersectionObserver | null = null;
	private resizeObserver: ResizeObserver | null = null;

	ngOnInit() {
		this._initData();
		if (isPlatformBrowser(this._platformId)) {
			this._initFrontendLogic();
		}
	}

	ngOnDestroy(): void {
		if (this.intersectionObserver) {
			this.intersectionObserver.disconnect();
		}
		if (this.resizeObserver) {
			this.resizeObserver.disconnect();
		}
	}

	private _initData() {
		this._cdRef.markForCheck();
	}

	private _initFrontendLogic(): void {
		if (!isPlatformBrowser(this._platformId)) return;

		this._ngZone.runOutsideAngular(() => {
			$(document).ready(() => {
				new Swiper('.Community', {
					modules: [Scrollbar],
					slidesPerView: 4,
					spaceBetween: 24,
					scrollbar: {
						el: '.swiper-scrollbar',
						hide: false,
					},
					breakpoints: {
						250: { slidesPerView: 1.18, spaceBetween: 16 },
						400: { slidesPerView: 1.75, spaceBetween: 16 },
						500: { slidesPerView: 1.9, spaceBetween: 16 },
						600: { slidesPerView: 2, spaceBetween: 16 },
						700: { slidesPerView: 2.5, spaceBetween: 16 },
						800: { slidesPerView: 2.85, spaceBetween: 16 },
						950: { slidesPerView: 2.9, spaceBetween: 16 },
						1000: { slidesPerView: 3.3, spaceBetween: 16 },
						1200: {
							slidesPerView: 4,
							spaceBetween: 16,
							slidesPerGroup: 0,
							allowTouchMove: false,
						},
					},
				});

				const lightEffect = document.querySelector(
					'.light-effect'
				) as HTMLElement | null;
				if (lightEffect) {
					this.intersectionObserver = new IntersectionObserver(
						(entries) => {
							entries.forEach((entry) => {
								if ( entry.isIntersecting ) {
									lightEffect.classList.add(
										'light-effect--active'
									);
								} else {
									lightEffect.classList.remove(
										'light-effect--active'
									);
								}
							});
						},
						{
							root: null,
							rootMargin: '200px 0px 0px 0px',
							threshold: 0.5,
						}
					);

					this.intersectionObserver.observe(lightEffect);
				}

				const buttonsCenter = document.querySelector(
					'.buttons-center'
				) as HTMLElement | null;
				const video = document.querySelector(
					'.video-section video'
				) as HTMLVideoElement | null;
				const fullscreenImg = document.querySelector(
					'.img-container--fullscreen'
				) as HTMLElement | null;
				const muteBtn = document.querySelector(
					'.mute'
				) as HTMLElement | null;
				const unmuteBtn = document.querySelector(
					'.unmute'
				) as HTMLElement | null;
				const toggleAudioImg = document.querySelector(
					'.img-container--toggle-audio'
				) as HTMLElement | null;

				if (video) {
					const initialWidth = parseInt(
						getComputedStyle(video).width
					);

					interface ExtendedVideoElement extends HTMLVideoElement {
						webkitEnterFullscreen?: () => void;
						msRequestFullscreen?: () => void;
						mozRequestFullScreen?: () => void;
					}

					const enterFullscreen = () => {
						const vid = video as ExtendedVideoElement;
						if (vid.requestFullscreen) vid.requestFullscreen();
						else if (vid.webkitEnterFullscreen)
							vid.webkitEnterFullscreen();
						else if (vid.msRequestFullscreen)
							vid.msRequestFullscreen();
						else if (vid.mozRequestFullScreen)
							vid.mozRequestFullScreen();
					};

					if (
						video.requestFullscreen ||
						(video as ExtendedVideoElement).webkitEnterFullscreen ||
						(video as ExtendedVideoElement).msRequestFullscreen
					) {
						video.removeAttribute('controls');
					}

					this.resizeObserver = new ResizeObserver((entries) => {
						for (const _entry of entries) {
							if (
								parseInt(getComputedStyle(video).width) ===
								initialWidth
							) {
								video.muted = true;
							}
						}
					});

					this.resizeObserver.observe(video);

					buttonsCenter?.addEventListener('click', () => {
						if (video) {
							video.muted = false;
							enterFullscreen();
							muteBtn?.classList.add('shown');
							unmuteBtn?.classList.remove('shown');
							video.currentTime = 0;
						}
					});

					fullscreenImg?.addEventListener('click', () => {
						enterFullscreen();
					});

					toggleAudioImg?.addEventListener('click', () => {
						if (video) {
							if (video.muted) {
								video.muted = false;
								muteBtn?.classList.add('shown');
								unmuteBtn?.classList.remove('shown');
							} else {
								video.muted = true;
								muteBtn?.classList.remove('shown');
								unmuteBtn?.classList.add('shown');
							}
						}
					});
				}

				new Swiper('.learningL', {
					modules: [Navigation],
					slidesPerView: 'auto',
					spaceBetween: 16,
					navigation: {
						nextEl: '.swiper-button-next',
						prevEl: '.swiper-button-prev',
					},
				});
			});
		});
	}
}
