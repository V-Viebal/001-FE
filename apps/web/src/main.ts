/***************************************************************************************************
 * Main Entry Point for Angular Client-Side Application
 * Bootstraps the AppModule for browser execution, handling client-side rendering in SSR setups.
 */

import { enableProdMode } from '@angular/core';
import { platformBrowserDynamic } from '@angular/platform-browser-dynamic';

import { AppModule } from './app/app.module';

// Add Google scripts
function addGoogleScripts() {
	const script1: HTMLScriptElement = document.createElement( 'script' );
	script1.src = 'https://apis.google.com/js/api.js';
	script1.setAttribute( 'defer', '' );
	script1.setAttribute( 'async', '' );
	document.head.appendChild( script1 );

	const script2: HTMLScriptElement = document.createElement( 'script' );
	script2.src = 'https://apis.google.com/js/platform.js';
	script2.setAttribute( 'defer', '' );
	script2.setAttribute( 'async', '' );
	document.head.appendChild( script2 );

	const script3: HTMLScriptElement = document.createElement( 'script' );
	script3.src = 'https://accounts.google.com/gsi/client';
	script3.setAttribute( 'defer', '' );
	script3.setAttribute( 'async', '' );
	document.head.appendChild( script3 );
}

const afterBootstrap = () => {
	if ( 'serviceWorker' in navigator &&  process.env.ENV_NAME === 'prod' ) {
		navigator.serviceWorker.register('./ngsw-worker.js');
	}

	addGoogleScripts();
};

if ( process.env.ENV_NAME === 'prod' ) {
	enableProdMode();
}

/**
 * Bootstrap the Angular application in the browser.
 * This runs on the client-side after SSR or prerendering has completed.
 */
import('@lottiefiles/dotlottie-wc')
.then(() => {
	platformBrowserDynamic()
	.bootstrapModule(AppModule)
	.then(() => {
		window.onload = afterBootstrap;
	})
	.catch((err: Error) =>
		console.error('Error bootstrapping Angular app:', err)
	);
}).catch(err => console.error('Failed to load DotLottieWC:', err));
