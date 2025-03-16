import './polyfills.server';

import { AppServerModule } from './app/app.server.module';
import { enableProdMode } from '@angular/core';

if (process.env.ENV_NAME === 'prod') {
	enableProdMode();
}

import 'zone.js/node';
import { APP_BASE_HREF } from '@angular/common';
import { CommonEngine } from '@angular/ssr';
import { existsSync } from 'node:fs';
import express, { RequestHandler } from 'express';
import { join } from 'node:path';
import compression from 'compression';

export function app(): express.Express {
	const server = express();
	const isProduction = process.env.ENV_NAME === 'prod';
	const distFolder = join(
		process.cwd(),
		isProduction ? '/app/dist/production/browser' : '../../dist/web/browser'
	);

	const indexHtml = existsSync(join(distFolder, 'index.original.html'))
		? join(distFolder, 'index.original.html')
		: join(distFolder, 'index.html');
	const commonEngine = new CommonEngine();

	server.set('view engine', 'html');
	server.set('views', distFolder);

	server.use(compression() as RequestHandler);

	// Serve static files (e.g., /assets/i18n/*.json) with a long cache
	server.get('*.*', express.static(distFolder, { maxAge: '1y' }));

	const prerenderedRoutes = [''];
	prerenderedRoutes.forEach((route) => {
		server.get(route, (_req, res) => {
			res.sendFile(join(distFolder, 'index.html'));
		});
	});

	// SSR route with language detection
	server.get('*', (req, res, next) => {
		const { protocol, headers, originalUrl } = req;
		const host = headers.host;
		const fullUrl = `${protocol}://${host}${originalUrl}`;

		const language = req.headers['accept-language']?.includes('en')
			? 'en'
			: 'vi';

		commonEngine
			.render({
				bootstrap: AppServerModule,
				documentFilePath: indexHtml,
				url: fullUrl,
				publicPath: '/',
				providers: [
					{ provide: APP_BASE_HREF, useValue: '/' },
					// Provide the initial language to the app
					{ provide: 'initialLanguage', useValue: language },
				],
			})
			.then((html) => res.send(html))
			.catch((err) => next(err));
	});

	return server;
}

export function run(): void {
	const port = process.env.PORT || 4000;
	const server = app();
	server.listen(port, () => {
		console.log(
			`Node Express server listening on http://localhost:${port}`
		);
	});
}

declare const __non_webpack_require__: NodeRequire;
const mainModule = __non_webpack_require__.main;
const moduleFilename = (mainModule && mainModule.filename) || '';
if (moduleFilename === __filename || moduleFilename.includes('iisnode')) {
	run();
}

export * from './app/app.server.module';
