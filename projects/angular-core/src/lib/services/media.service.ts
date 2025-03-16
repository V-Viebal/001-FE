import { Injectable } from '@angular/core';

enum Breakpoint {
	XS = 600,
	SM = 960,
	MD = 1280,
	LG = 1920,
};

@Injectable()
export class MediaService {

	private _media: number;

	/**
	 * @constructor
	 */
	constructor() {
		this._media = window.innerWidth;
	}

	/**
	 * @param {string} breakpoint
	 * @return {boolean}
	 */
	public is( breakpoint: string ): boolean {
		this._media = window.innerWidth;

		return ( breakpoint === 'xs'
				&& this._media < Breakpoint.XS )
			|| ( breakpoint === 'gt-xs'
				&& this._media >= Breakpoint.XS )
			|| ( breakpoint === 'sm'
				&& this._media >= Breakpoint.XS
				&& this._media < Breakpoint.SM )
			|| ( breakpoint === 'gt-sm'
				&& this._media >= Breakpoint.SM )
			|| ( breakpoint === 'md'
				&& this._media >= Breakpoint.SM
				&& this._media < Breakpoint.MD )
			|| ( breakpoint === 'gt-md'
				&& this._media >= Breakpoint.MD )
			|| ( breakpoint === 'lg'
				&& this._media >= Breakpoint.MD
				&& this._media < Breakpoint.LG )
			|| ( breakpoint === 'gt-lg'
				&& this._media >= Breakpoint.LG );
	}

	/**
	 * @param {number} width
	 * @return {boolean}
	 */
	public gt( width: number ): boolean {
		this._media = window.innerWidth;

		return this._media >= width;
	}

	/**
	 * @param {number} width
	 * @return {boolean}
	 */
	public lt( width: number ): boolean {
		this._media = window.innerWidth;

		return this._media < width;
	}

	/**
	 * @param {number} width
	 * @return {void}
	 */
	public setViewPort( width: number ) {
		// In case browser resizing
		if ( window.innerWidth < screen.width ) {
			document.body.classList.add( 'resizing' );
			return;
		}

		// In case real devices
		const meta: HTMLMetaElement
			= document.head.querySelector( 'meta[name=viewport]' );
		let viewPort: string
			= 'width=device-width, initial-scale=1.0, user-scalable=0';

		if ( width ) {
			const scale: number = window.innerWidth / width;

			viewPort = 'width='
				+ width
				+ ', minimum-scale='
				+ scale
				+ ', initial-scale='
				+ scale
				+ ', maximum-scale=1.0';
		}

		meta.setAttribute( 'content', viewPort );
	}

}
