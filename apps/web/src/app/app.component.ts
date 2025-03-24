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
import Swiper from 'swiper';
import { Navigation } from 'swiper/modules';

@Component({
	selector: 'app',
	templateUrl: './app.pug',
})
export class AppComponent implements OnInit, OnDestroy {
	protected translationsLoaded = false;
	private intersectionObserver: IntersectionObserver | null = null;
	private resizeObserver: ResizeObserver | null = null;
	private mutationObserver: MutationObserver | null = null;

	constructor(
		@Inject(PLATFORM_ID) private platformId: Object,
		private translate: TranslateService,
		private cdr: ChangeDetectorRef,
		private ngZone: NgZone
	) {
		if (!isPlatformBrowser(this.platformId)) {
			this.translationsLoaded = true;
		}
	}

	async ngOnInit(): Promise<void> {
		try {
			const initialLang = 'vi';
			if (isPlatformBrowser(this.platformId)) {
				await firstValueFrom(this.translate.use(initialLang));
				this.initFrontendLogic();
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
				duration: 1000,
				once: false,
				mirror: true,
				offset: 300,
				disable: false,
			});

			const refreshAOS = () => {
				AOS.refreshHard();
			};

			setTimeout(() => {
				refreshAOS();
			}, 4000);

			this.intersectionObserver = new IntersectionObserver(
				(entries) => {
					entries.forEach((entry) => {
						if (entry.isIntersecting) {
							AOS.refresh();
						}
					});
				},
				{
					root: null,
					rootMargin: '200px 0px 100px 0px', // Adjusted to 0px since threshold handles visibility
					threshold: 0, // Trigger when 1/3 of the element is visible
				}
			);

			this.resizeObserver = new ResizeObserver(() => {
				AOS.refreshHard();
			});

			const observeAosElements = () => {
				const aosElements = document.querySelectorAll('[data-aos]');
				aosElements.forEach((el) => {console.log(el);

					this.intersectionObserver?.observe(el);
				});
			};

			this.mutationObserver = new MutationObserver((mutations) => {
				mutations.forEach(() => {
					observeAosElements();
				});
			});

			this.mutationObserver.observe(document.body, {
				childList: true,
				subtree: true,
			});

			observeAosElements();

			this.resizeObserver.observe(document.body);

			let attempts = 5;
			const interval = setInterval(() => {
				if (attempts <= 0) {
					clearInterval(interval);
					return;
				}
				refreshAOS();
				attempts--;
			}, 2000);
		});
	}

	private initFrontendLogic(): void {
		if (!isPlatformBrowser(this.platformId)) return;

		this.ngZone.runOutsideAngular(() => {
			$(document).ready(() => {
				this.setupFooter();
				this.setupMobileMenu();
				this.setupNavbar();
			});
		});
	}

	private setupFooter(): void {
		if ($(window).width() <= 800) {
			const footerBoxes = document.querySelectorAll(
				'.footer-container__content-box'
			);
			document.querySelectorAll('.description').forEach((desc) => {
				(desc as HTMLElement).style.height =
					getComputedStyle(desc).height;
			});
			footerBoxes.forEach((box) =>
				(box as HTMLElement).classList.add('footer-hide')
			);
			footerBoxes.forEach((box) =>
				box.addEventListener('click', () => {
					const htmlBox = box as HTMLElement;
					if (htmlBox.classList.contains('footer-hide')) {
						htmlBox.classList.add('footer-active');
						htmlBox.classList.remove('footer-hide');
						footerBoxes.forEach((other) => {
							if (other !== box) {
								(other as HTMLElement).classList.add(
									'footer-hide'
								);
								(other as HTMLElement).classList.remove(
									'footer-active'
								);
							}
						});
					} else {
						htmlBox.classList.remove('footer-active');
						htmlBox.classList.add('footer-hide');
					}
				})
			);
		}
	}

	private setupMobileMenu(): void {
		const menuItems = document.querySelectorAll('.mobile-menu li');
		const whiteBg = document.querySelector(
			'.mobile-menu--white-bg'
		) as HTMLElement | null;

		menuItems.forEach((item) => {
			const submenu = item.querySelector(
				'.submenu-container-mobile'
			) as HTMLElement | null;
			if (submenu) {
				submenu.style.height = getComputedStyle(submenu).height;
				submenu.classList.add('submenu-container-mobile--hide');
				const submenuMain = item.querySelector(
					'.submenu-main'
				) as HTMLElement | null;
				if (submenuMain) {
					submenuMain.style.height =
						getComputedStyle(submenuMain).height;
					submenuMain.classList.add('submenu-main--hide');
				}
			}
		});

		menuItems.forEach((item) => {
			const submenu = item.querySelector(
				'.submenu-container-mobile'
			) as HTMLElement | null;
			if (submenu) {
				const linkAndDropdown = item.querySelector(
					'.link-and-dropdown'
				) as HTMLElement | null;
				linkAndDropdown?.addEventListener('click', () => {
					if (
						submenu.classList.contains(
							'submenu-container-mobile--hide'
						)
					) {
						submenu.classList.remove(
							'submenu-container-mobile--hide'
						);
						linkAndDropdown?.classList.add(
							'link-and-dropdown--active'
						);
						submenu.scrollIntoView({ behavior: 'smooth' });
						const dropdownRevealNav = item.querySelector(
							'.dropdown-reveal-nav'
						) as HTMLElement | null;
						dropdownRevealNav?.classList.add(
							'dropdown-reveal-nav--selected'
						);
						const submenuMain = item.querySelector(
							'.submenu-main'
						) as HTMLElement | null;
						if (submenuMain) {
							submenuMain.classList.remove('submenu-main--hide');
							submenuMain.style.display = '';
						}
						menuItems.forEach((other) => {
							if (
								other !== item &&
								other.classList.contains('dropdown-container')
							) {
								const otherSubmenu = other.querySelector(
									'.submenu-container-mobile'
								) as HTMLElement | null;
								otherSubmenu?.scrollIntoView({
									behavior: 'smooth',
								});
								otherSubmenu?.classList.add(
									'submenu-container-mobile--hide'
								);
								(
									other.querySelector(
										'.link-and-dropdown'
									) as HTMLElement | null
								)?.classList.remove(
									'link-and-dropdown--active'
								);
								(
									other.querySelector(
										'.dropdown-reveal-nav'
									) as HTMLElement | null
								)?.classList.remove(
									'dropdown-reveal-nav--selected'
								);
								const otherSubmenuMain = other.querySelector(
									'.submenu-main'
								) as HTMLElement | null;
								if (otherSubmenuMain) {
									otherSubmenuMain.classList.add(
										'submenu-main--hide'
									);
									otherSubmenuMain.style.display = 'none';
								}
								whiteBg?.scrollTo({
									top: 0,
									behavior: 'smooth',
								});
							}
						});
					} else {
						submenu.scrollIntoView({ behavior: 'smooth' });
						submenu.classList.add('submenu-container-mobile--hide');
						linkAndDropdown?.classList.remove(
							'link-and-dropdown--active'
						);
						(
							item.querySelector(
								'.dropdown-reveal-nav'
							) as HTMLElement | null
						)?.classList.remove('dropdown-reveal-nav--selected');
						const submenuMain = item.querySelector(
							'.submenu-main'
						) as HTMLElement | null;
						if (submenuMain) {
							submenuMain.classList.add('submenu-main--hide');
							submenuMain.style.display = 'none';
						}
						whiteBg?.scrollTo({ top: 0, behavior: 'smooth' });
					}
				});
			}
		});

		new Swiper('.NavOpinion', {
			modules: [Navigation],
			navigation: {
				nextEl: '.swiper-button-next',
				prevEl: '.swiper-button-prev',
			},
		});
	}

	private setupNavbar(): void {
		const navItems = document.querySelectorAll(
			'.nav-bar__content .right .nvc__left li'
		);
		const dropdownItems: HTMLElement[] = [];
		const submenus = document.querySelectorAll(
			'.submenus-container .submenu'
		);
		const submenuContainer = document.querySelector(
			'.submenus-container'
		) as HTMLElement | null;
		const nav = document.querySelector('nav') as HTMLElement | null;

		navItems.forEach((item) => {
			if (item.querySelector('.dropdown-reveal'))
				dropdownItems.push(item as HTMLElement);
		});

		dropdownItems.forEach((item, index) => {
			const reveal = item.querySelector(
				'.dropdown-reveal'
			) as HTMLElement | null;
			reveal?.addEventListener('mouseenter', () => {
				nav?.classList.add('nav-bar-active-bg');
				dropdownItems.forEach((d) => {
					const dReveal = d.querySelector(
						'.dropdown-reveal'
					) as HTMLElement | null;
					if (dReveal) {
						dReveal.style.transform = '';
						dReveal.style.animation = '';
					}
				});
				nav?.classList.add('nav-bar-white');
				submenus.forEach((s) => {
					(s as HTMLElement).style.display = 'none';
					s.classList.remove('active');
				});
				navItems.forEach((n) => n.classList.remove('active'));
				item.classList.add('active');
				if (submenuContainer) {
					submenuContainer.style.display = 'flex';
					submenuContainer.style.pointerEvents = 'auto';
					submenuContainer.style.opacity = '1';
				}
				const submenu = submenus[index] as HTMLElement | null;
				if (submenu) {
					submenu.style.display = 'flex';
					submenu.style.opacity = '1';
				}
				if (reveal) {
					reveal.style.animation = 'arrowAnimation .4s';
					reveal.style.transform = 'rotateX(180deg) rotateY(180deg)';
				}
			});
		});

		navItems.forEach((item, index) => {
			if (item.classList.contains('no-dropdown')) {
				item.addEventListener('mouseenter', () => {
					nav?.classList.remove('nav-bar-active-bg');
					dropdownItems.forEach((d) => {
						const dReveal = d.querySelector(
							'.dropdown-reveal'
						) as HTMLElement | null;
						if (dReveal) {
							dReveal.style.transform = '';
							dReveal.style.animation = '';
						}
					});
					submenus.forEach((s) => {
						(s as HTMLElement).style.display = 'none';
						s.classList.remove('active');
					});
					navItems.forEach((n) => n.classList.remove('active'));
					item.classList.add('active');
					if (submenuContainer) {
						submenuContainer.style.opacity = '0';
						submenuContainer.style.pointerEvents = 'none';
						submenuContainer.style.display = 'none';
					}
					const submenu = submenus[index] as HTMLElement | null;
					if (submenu) submenu.style.opacity = '0';
				});
			}
		});

		nav?.addEventListener('mouseleave', (e) => {
			if ((e.target as Element).closest('nav')) {
				nav.classList.remove('nav-bar-active-bg');
				dropdownItems.forEach((d) => {
					const dReveal = d.querySelector(
						'.dropdown-reveal'
					) as HTMLElement | null;
					if (dReveal) {
						dReveal.style.transform = '';
						dReveal.style.animation = '';
					}
				});
				submenus.forEach((s) => {
					(s as HTMLElement).style.display = 'none';
					s.classList.remove('active');
				});
				navItems.forEach((n) => n.classList.remove('active'));
				if (submenuContainer) {
					submenuContainer.style.opacity = '0';
					submenuContainer.style.pointerEvents = 'none';
					submenuContainer.style.display = 'none';
				}
				submenus.forEach(
					(s) => ((s as HTMLElement).style.opacity = '0')
				);
			}
		});
	}
}
