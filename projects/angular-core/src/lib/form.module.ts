import {
	ModuleWithProviders,
	NgModule
} from '@angular/core';
import {
	FormsModule,
	ReactiveFormsModule
} from '@angular/forms';

const reactiveFormsModule: ModuleWithProviders<ReactiveFormsModule>
	= ReactiveFormsModule.withConfig({
		warnOnNgModelWithFormControl: 'never',
	});

@NgModule({
	imports: [
		FormsModule,

		reactiveFormsModule,
	],
	exports: [
		FormsModule,

		ReactiveFormsModule,
	],
	declarations: [],
	providers: [],
})
export class FormModule {}
