import { ModuleWithProviders } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { ErrorComponent } from './components';

const routes: Routes = [
	{ path: '500', component: ErrorComponent },
	{ path: '404', component: ErrorComponent },
	{ path: '403', component: ErrorComponent },
	{ path: '400', component: ErrorComponent },
];

export const routing: ModuleWithProviders<RouterModule>
	= RouterModule.forChild( routes );
