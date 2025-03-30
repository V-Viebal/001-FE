import {
	Component,
	ChangeDetectionStrategy,
	inject,
	OnDestroy,
	AfterViewInit,
} from '@angular/core';
import { PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { Unsubscriber } from '@core';
import Swiper from 'swiper';
import { Navigation } from 'swiper/modules';

@Unsubscriber()
@Component({
	selector: 'home',
	templateUrl: '../templates/home.pug',
	styleUrls: ['../styles/home.scss'],
	host: { class: 'home' },
	changeDetection: ChangeDetectionStrategy.OnPush,
})
export class HomeComponent implements AfterViewInit, OnDestroy {
	private readonly _platformId: Object = inject(PLATFORM_ID);

	private eventListeners: {
		element: HTMLElement;
		type: string;
		listener: EventListener;
	}[] = [];
	private intersectionObservers: IntersectionObserver[] = [];

	ngAfterViewInit() {
		if ( isPlatformBrowser( this._platformId ) ) {
			this._setupFooter();
			this._setupMobileMenu();
			this._setupNavbar();
			this._initLightEffect();
		}
	}

	ngOnDestroy(): void {
		this._cleanupEventListeners();
		this.intersectionObservers.forEach((observer) => observer.disconnect());
		this.intersectionObservers = [];
	}

	// Module 501: Footer Logic
	private _setupFooter(): void {
		if (window.innerWidth <= 800) {
			const footerBoxes = document.querySelectorAll(
				'.footer-container__content-box'
			);
			if (footerBoxes.length === 0) {
				console.warn('No footer boxes found for setup');
				return;
			}

			document
				.querySelectorAll('.description')
				.forEach((desc: HTMLElement) => {
					desc.style.height = getComputedStyle(desc).height;
				});

			footerBoxes.forEach((box: HTMLElement) =>
				box.classList.add('footer-hide')
			);

			footerBoxes.forEach((box: HTMLElement) => {
				const listener = () => {
					console.log('Footer box clicked:', box);
					if (box.classList.contains('footer-hide')) {
						box.classList.add('footer-active');
						box.classList.remove('footer-hide');
						footerBoxes.forEach((other: HTMLElement) => {
							if (other !== box) {
								other.classList.add('footer-hide');
								other.classList.remove('footer-active');
							}
						});
					} else {
						box.classList.remove('footer-active');
						box.classList.add('footer-hide');
					}
				};
				box.addEventListener('click', listener);
				this.eventListeners.push({
					element: box,
					type: 'click',
					listener,
				});
			});
		}
	}

	// Module 732: Mobile Menu Logic
	private _setupMobileMenu(): void {
		const menuItems = document.querySelectorAll('.mobile-menu li');
		const whiteBg = document.querySelector(
			'.mobile-menu--white-bg'
		) as HTMLElement;

		if (menuItems.length === 0) {
			console.warn('No mobile menu items found for setup');
			return;
		}

		menuItems.forEach((item: HTMLElement) => {
			const submenu = item.querySelector(
				'.submenu-container-mobile'
			) as HTMLElement;
			if (submenu) {
				submenu.style.height = getComputedStyle(submenu).height;
				submenu.classList.add('submenu-container-mobile--hide');
				const submenuMain = item.querySelector(
					'.submenu-main'
				) as HTMLElement;
				if (submenuMain) {
					submenuMain.style.height =
						getComputedStyle(submenuMain).height;
					submenuMain.classList.add('submenu-main--hide');
				}
			}
		});

		menuItems.forEach((item: HTMLElement) => {
			const submenu = item.querySelector(
				'.submenu-container-mobile'
			) as HTMLElement;
			if (submenu) {
				const linkAndDropdown = item.querySelector(
					'.link-and-dropdown'
				) as HTMLElement;
				const listener = () => {
					console.log('Mobile menu item clicked:', item);
					if (
						submenu.classList.contains(
							'submenu-container-mobile--hide'
						)
					) {
						submenu.classList.remove(
							'submenu-container-mobile--hide'
						);
						linkAndDropdown.classList.add(
							'link-and-dropdown--active'
						);
						submenu.scrollIntoView({ behavior: 'smooth' });
						item.querySelector(
							'.dropdown-reveal-nav'
						)?.classList.add('dropdown-reveal-nav--selected');
						const submenuMain = item.querySelector(
							'.submenu-main'
						) as HTMLElement;
						if (submenuMain) {
							submenuMain.classList.remove('submenu-main--hide');
							submenuMain.style.display = '';
						}
						menuItems.forEach((other: HTMLElement) => {
							if (
								other !== item &&
								other.classList.contains('dropdown-container')
							) {
								const otherSubmenu = other.querySelector(
									'.submenu-container-mobile'
								) as HTMLElement;
								otherSubmenu?.scrollIntoView({
									behavior: 'smooth',
								});
								otherSubmenu?.classList.add(
									'submenu-container-mobile--hide'
								);
								other
									.querySelector('.link-and-dropdown')
									?.classList.remove(
										'link-and-dropdown--active'
									);
								other
									.querySelector('.dropdown-reveal-nav')
									?.classList.remove(
										'dropdown-reveal-nav--selected'
									);
								const otherSubmenuMain = other.querySelector(
									'.submenu-main'
								) as HTMLElement;
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
						linkAndDropdown.classList.remove(
							'link-and-dropdown--active'
						);
						item.querySelector(
							'.dropdown-reveal-nav'
						)?.classList.remove('dropdown-reveal-nav--selected');
						const submenuMain = item.querySelector(
							'.submenu-main'
						) as HTMLElement;
						if (submenuMain) {
							submenuMain.classList.add('submenu-main--hide');
							submenuMain.style.display = 'none';
						}
						whiteBg?.scrollTo({ top: 0, behavior: 'smooth' });
					}
				};
				linkAndDropdown.addEventListener('click', listener);
				this.eventListeners.push({
					element: linkAndDropdown,
					type: 'click',
					listener,
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

	// Module 951: Navbar Logic
	private _setupNavbar(): void {
		const navItems = document.querySelectorAll(
			'.nav-bar__content .right .nvc__left li'
		);
		const dropdownItems: HTMLElement[] = [];
		const submenus = document.querySelectorAll(
			'.submenus-container .submenu'
		);
		const submenuContainer = document.querySelector(
			'.submenus-container'
		) as HTMLElement;
		const nav = document.querySelector('nav') as HTMLElement;
		const langSwitchers = document.querySelectorAll('.lang-switcher');
		const toggleRoadbar = document.querySelector(
			'.toggle-roadbar'
		) as HTMLElement;
		const navbar = document.querySelector('.nav-bar') as HTMLElement;
		const banners = document.querySelectorAll('.banner');

		if (
			!nav ||
			!submenuContainer ||
			navItems.length === 0 ||
			submenus.length === 0
		) {
			console.error(
				'Navbar setup failed: Missing required DOM elements',
				{
					nav,
					submenuContainer,
					navItems: navItems.length,
					submenus: submenus.length,
				}
			);
			return;
		}

		// Dropdown items setup
		navItems.forEach((item) => {
			const reveal = item.querySelector('.dropdown-reveal');
			if (reveal) dropdownItems.push(item as HTMLElement);
		});

		dropdownItems.forEach((item, index) => {
			const reveal = item.querySelector(
				'.dropdown-reveal'
			) as HTMLElement;
			const listener = () => {
				console.log('Dropdown mouseenter triggered for item:', item);
				nav.classList.add('nav-bar-active-bg');
				dropdownItems.forEach((d) => {
					const dReveal = d.querySelector(
						'.dropdown-reveal'
					) as HTMLElement;
					dReveal.style.transform = '';
					dReveal.style.animation = '';
				});
				nav.classList.add('nav-bar-white');
				submenus.forEach((s: HTMLElement) => {
					s.style.display = 'none';
					s.classList.remove('active');
				});
				navItems.forEach((n) => n.classList.remove('active'));
				item.classList.add('active');
				submenuContainer.style.display = 'flex';
				submenuContainer.style.pointerEvents = 'auto';
				submenuContainer.style.opacity = '1';
				const submenu = submenus[index] as HTMLElement;
				if (submenu) {
					submenu.style.display = 'flex';
					submenu.style.opacity = '1';
				} else {
					console.warn('No submenu found for index:', index);
				}
				reveal.style.animation = 'arrowAnimation .4s';
				reveal.style.transform = 'rotateX(180deg) rotateY(180deg)';
			};
			reveal.addEventListener('mouseenter', listener);
			this.eventListeners.push({
				element: reveal,
				type: 'mouseenter',
				listener,
			});
		});

		navItems.forEach((item, index) => {
			if (item.classList.contains('no-dropdown')) {
				const listener = () => {
					console.log(
						'No-dropdown mouseenter triggered for item:',
						item
					);
					nav.classList.remove('nav-bar-active-bg');
					dropdownItems.forEach((d) => {
						const dReveal = d.querySelector(
							'.dropdown-reveal'
						) as HTMLElement;
						dReveal.style.transform = '';
						dReveal.style.animation = '';
					});
					submenus.forEach((s: HTMLElement) => {
						s.style.display = 'none';
						s.classList.remove('active');
					});
					navItems.forEach((n) => n.classList.remove('active'));
					item.classList.add('active');
					submenuContainer.style.opacity = '0';
					submenuContainer.style.pointerEvents = 'none';
					submenuContainer.style.display = 'none';
					const submenu = submenus[index] as HTMLElement;
					if (submenu) submenu.style.opacity = '0';
				};
				item.addEventListener('mouseenter', listener);
				this.eventListeners.push({
					element: item as HTMLElement,
					type: 'mouseenter',
					listener,
				});
			}
		});

		const navLeaveListener = (e: Event) => {
			if ((e.target as Element).closest('nav')) {
				console.log('Nav mouseleave triggered');
				nav.classList.remove('nav-bar-active-bg');
				dropdownItems.forEach((d) => {
					const dReveal = d.querySelector(
						'.dropdown-reveal'
					) as HTMLElement;
					dReveal.style.transform = '';
					dReveal.style.animation = '';
				});
				submenus.forEach((s: HTMLElement) => {
					s.style.display = 'none';
					s.classList.remove('active');
				});
				navItems.forEach((n) => n.classList.remove('active'));
				submenuContainer.style.opacity = '0';
				submenuContainer.style.pointerEvents = 'none';
				submenuContainer.style.display = 'none';
				submenus.forEach((s: HTMLElement) => (s.style.opacity = '0'));
			}
		};
		nav.addEventListener('mouseleave', navLeaveListener);
		this.eventListeners.push({
			element: nav,
			type: 'mouseleave',
			listener: navLeaveListener,
		});

		// Language switcher
		langSwitchers.forEach((switcher: HTMLElement) => {
			const listener = () => switcher.classList.toggle('active');
			switcher.addEventListener('click', listener);
			this.eventListeners.push({
				element: switcher,
				type: 'click',
				listener,
			});
		});

		// Navbar transparency and padding behavior using IntersectionObserver
		const transparent = navbar.dataset['transparent'] === '1';

		// Create a sentinel element at the top of the page to detect when we're near the top
		const mainHeader = document.querySelector('section.main-header') as HTMLElement;

		if ( mainHeader ) {
			const observer = new IntersectionObserver(
				(entries) => {
					entries.forEach((entry) => {
						if (entry.isIntersecting) {
							navbar.classList.add('nav-bar-white--padding-top');
						} else {
							navbar.classList.remove('nav-bar-white--padding-top');
						}
					}
				);
			},
			{
				root: null,
				rootMargin: '0px 0px 0px 0px',
				threshold: 1,
			});

			observer.observe(mainHeader);
			this.intersectionObservers.push(observer);
		}

		if (!transparent) {
			navbar.classList.add('nav-bar-white', 'nav-bar-white--padding-top');
			document
				.querySelector('.hamburger-title')
				?.classList.add('hamburger-title--dark');
			document
				.querySelector('.toggle-roadbar__hamburger')
				?.classList.add('toggle-roadbar__hamburger--dark');
		}

		// Banner close
		document
			.querySelectorAll('.close-banner')
			.forEach((closeBtn: HTMLElement) => {
				const listener = () => {
					document
						.querySelector('.banner')
						?.classList.add('off-banner');
					const stickyBar = document.querySelector(
						'#sticky-bar'
					) as HTMLElement;
					if (stickyBar) stickyBar.style.top = '86px';
				};
				closeBtn.addEventListener('click', listener);
				this.eventListeners.push({
					element: closeBtn,
					type: 'click',
					listener,
				});
			});

		// Hamburger menu toggle
		const toggleListener = () => {
			const hamburgerContainer = document.querySelector(
				'.toggle-roadbar__hamburger__container'
			) as HTMLElement;
			hamburgerContainer.classList.toggle('open');
			if (hamburgerContainer.classList.contains('open')) {
				document
					.querySelector('.mobile-menu')
					?.classList.add('mm-active');
				navbar.classList.add('nav-bar--active');
				document
					.querySelector('.background--empty')
					?.classList.toggle('background--black');
				navbar.style.top = '0 !important';
			} else {
				document
					.querySelector('.mobile-menu')
					?.classList.remove('mm-active');
				navbar.classList.remove('nav-bar--active');
				document
					.querySelector('.lang-switcher--mobile')
					?.classList.remove('active');
				document
					.querySelector('.background--empty')
					?.classList.toggle('background--black');
				document
					.querySelectorAll('.mobile-menu li .dropdown-container')
					.forEach((dropdown: HTMLElement) => {
						dropdown.classList.remove('expand-dropdown');
					});
			}
		};
		toggleRoadbar.addEventListener('click', toggleListener);
		this.eventListeners.push({
			element: toggleRoadbar,
			type: 'click',
			listener: toggleListener,
		});

		// Mobile submenu link click
		const navClickListener = (e: Event) => {
			if ((e.target as Element).closest('.link-mobile-submenu')) {
				document
					.querySelector('.mobile-menu')
					?.classList.remove('mm-active');
				navbar.classList.remove('nav-bar--active');
				document
					.querySelector('.background--empty')
					?.classList.toggle('background--black');
				document
					.querySelector('.toggle-roadbar__hamburger__container')
					?.classList.remove('open');
				document
					.querySelectorAll('.submenu-container-mobile')
					.forEach((submenu: HTMLElement) => {
						submenu.classList.add('submenu-container-mobile--hide');
					});
				document
					.querySelectorAll('.dropdown-reveal-nav')
					.forEach((reveal: HTMLElement) => {
						reveal.classList.remove(
							'dropdown-reveal-nav--selected'
						);
					});
				document
					.querySelectorAll('.link-and-dropdown')
					.forEach((link: HTMLElement) => {
						link.classList.remove('link-and-dropdown--active');
					});
			}
		};
		nav.addEventListener('click', navClickListener);
		this.eventListeners.push({
			element: nav,
			type: 'click',
			listener: navClickListener,
		});

		// Mobile menu dropdowns
		const dropdownReveals = document.querySelectorAll(
			'.mobile-menu li .dropdown-reveal'
		);
		const dropdownImages = document.querySelectorAll(
			'.mobile-menu li .dropdown-reveal img'
		);
		const dropdownContainers = document.querySelectorAll(
			'.mobile-menu li .dropdown-container'
		);

		dropdownReveals.forEach((reveal: HTMLElement, index) => {
			const listener = () => {
				dropdownContainers.forEach((container: HTMLElement, i) => {
					if (
						index !== i &&
						container.classList.contains('expand-dropdown')
					) {
						container.classList.remove('expand-dropdown');
						const img = dropdownImages[i] as HTMLElement;
						img.style.animation = 'showHide .8s';
						img.style.transform = 'rotate(0)';
					}
				});
				const container = dropdownContainers[index] as HTMLElement;
				container.classList.toggle('expand-dropdown');
				const img = dropdownImages[index] as HTMLElement;
				if (container.classList.contains('expand-dropdown')) {
					img.style.animation = 'hideShow .8s';
					img.style.transform = 'rotate(180deg)';
				} else {
					img.style.animation = 'showHide .8s';
					img.style.transform = 'rotate(0)';
				}
			};
			reveal.addEventListener('click', listener);
			this.eventListeners.push({
				element: reveal,
				type: 'click',
				listener,
			});
		});

		const resetDropdownsListener = () => {
			if (
				!document
					.querySelector('.mobile-menu')
					?.classList.contains('mm-active')
			) {
				dropdownImages.forEach((img: HTMLElement) => {
					img.style.transform = 'rotate(0)';
				});
			}
		};
		toggleRoadbar.addEventListener('click', resetDropdownsListener);
		this.eventListeners.push({
			element: toggleRoadbar,
			type: 'click',
			listener: resetDropdownsListener,
		});

		// Banner copy button
		banners.forEach((banner: HTMLElement) => {
			const button = banner.querySelector('.button-code') as HTMLElement;
			const listener = () => {
				const link = banner.querySelector('a')?.textContent || '';
				navigator.clipboard.writeText(link);
			};
			button.addEventListener('click', listener);
			this.eventListeners.push({
				element: button,
				type: 'click',
				listener,
			});
		});
	}

	// Light Effect Logic
	private _initLightEffect(): void {
		const lightEffect = document.querySelector(
			'.light-effect'
		) as HTMLElement | null;
		if (lightEffect) {
			const observer = new IntersectionObserver(
				(entries) => {
					entries.forEach((entry) => {
						if (entry.isIntersecting) {
							lightEffect.classList.add('light-effect--active');
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
			observer.observe(lightEffect);
			this.intersectionObservers.push(observer);
		}
	}

	private _cleanupEventListeners(): void {
		this.eventListeners.forEach(({ element, type, listener }) => {
			element.removeEventListener(type, listener);
		});
		this.eventListeners = [];
	}
}
