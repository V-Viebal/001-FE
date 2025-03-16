// Helper function to preload fonts
function preloadFont(
	fontName,
	fontUrl,
	weight = 'normal',
	style = 'normal'
) {
	const font
		= new FontFace(
			fontName,
			`url(${fontUrl})`,
			{
				weight: weight,
				style: style,
				display: 'swap',
			}
		);
	return font.load().then( loadedFont => {
		document.fonts.add( loadedFont );
	}).catch( error => {
		console.error(`Error Preload font ${fontName}:`, error );
	});
}

// Helper function to lazyload fonts
function lazyloadFont(
	fontName,
	fontUrl,
	weight = 'normal',
	style = 'normal'
) {
	const font
		= new FontFace(
			fontName,
			`url(${fontUrl})`,
			{
				weight: weight,
				style: style,
				display: 'swap',
			}
		);
	return font.load().then( loadedFont => {
		document.fonts.add( loadedFont );
	}).catch( error => {
		console.error(`Error Lazyload font ${fontName}:`, error );
	});
}

/**
 * Preload fonts
 */
document.addEventListener( 'DOMContentLoaded', () => {

	// Preload fonts in parallel
	const fontsToLoad = [
		preloadFont( 'Inter', '/assets/fonts/Inter/body/Inter-Regular-400.ttf?hs3yr2', '400' ),
		preloadFont( 'Inter', '/assets/fonts/Inter/body/Inter-Medium-500.ttf?hs3yr2', '500' ),
		preloadFont( 'InterHeading', '/assets/fonts/Inter/heading/InterTight-Medium-500.ttf?hs3yr2', '500' ),
	];

	// Preload fonts
	Promise.all( fontsToLoad )
	.then();

	// Preload font icons
	const linkElement = document.createElement( 'link' );
	linkElement.rel = 'stylesheet';
	linkElement.href = 'assets/fonts/Nucleo/Nucleo.css?hs3yr9';
	document.head.appendChild( linkElement );
});

/**
 * Lazyload fonts
 */
window.addEventListener( 'load', () => {

	// Lazyload fonts in parallel
	const fontsToLoadlazy = [
		lazyloadFont( 'Inter', '/assets/fonts/Inter/body/Inter-Thin-100.ttf?hs3yr2', '100' ),
		lazyloadFont( 'Inter', '/assets/fonts/Inter/body/Inter-ExtraLight-200.ttf?hs3yr2', '200' ),
		lazyloadFont( 'Inter', '/assets/fonts/Inter/body/Inter-Light-300.ttf?hs3yr2', '300' ),
		lazyloadFont( 'Inter', '/assets/fonts/Inter/body/Inter-SemiBold-600.ttf?hs3yr2', '600' ),
	];

	// Lazyload fonts
	Promise.all( fontsToLoadlazy )
	.then();
});
