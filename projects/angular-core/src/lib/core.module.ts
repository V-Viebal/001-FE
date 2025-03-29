/// <reference path="types.d.ts" />

import {
	NgModule
} from '@angular/core';
import {
	RouterModule
} from '@angular/router';
import {
	CommonModule
} from '@angular/common';
import {
	HttpClientModule
} from '@angular/common/http';
import {
	EventManager
} from '@angular/platform-browser';
import {
	CookieService
} from 'ngx-cookie-service';

import './lodash-mixin';
import {
	CustomEventManager
} from './loaders';
import {
	AutoFocusDirective,
	AutoResetDirective,
	CdkVirtualForTrackByIDDirective,
	CdkVirtualForTrackByIndexDirective,
	CdkVirtualForTrackByPropertyDirective,
	CdkVirtualForTrackByValueDirective,
	DetectScrollDirective,
	DisableControlDirective,
	FullscreenDirective,
	NgCacheIfDirective,
	NgForTrackByIDDirective,
	NgForTrackByIndexDirective,
	NgForTrackByPropertyDirective,
	NgForTrackByValueDirective,
	NgVarDirective,
	ValueControlDirective
} from './directives';
import {
	CapitalizeFirstPipe,
	ClonePipe,
	CommasSeparatorPipe,
	ConvertPercentPipe,
	EmojiPipe,
	EmptyPipe,
	FileSizeUnitPipe,
	FilterPipe,
	FixedPipe,
	ImagePipe,
	IncludesPipe,
	IsContrastPipe,
	LinkPipe,
	MarkTextPipe,
	MomentDatePipe,
	MomentFromNowPipe,
	OrderByPipe,
	SafeHtmlPipe,
	SafeUrlPipe,
	ThounsandUnitPipe,
	TimerPipe,
	TrackByFnPipe,
	UnitPipe
} from './pipes';
import {
	ApiService,
	CanDeactivateGuardService,
	MediaService,
	NetworkService,
	PageService,
	ServiceWorkerService,
	StorageService,
	WebNotificationService
} from './services';
import {
	EmailValidator,
	PhoneValidator,
	UrlValidator
} from './validators';

@NgModule({
	imports: [
		HttpClientModule,
		RouterModule,
		CommonModule,
	],
	exports: [
		CommonModule,

		EmailValidator,
		PhoneValidator,
		UrlValidator,

		/* Component Inject (Do not remove) */
		/* End Component Inject (Do not remove) */

		/* Directive Inject (Do not remove) */
		AutoFocusDirective,
		AutoResetDirective,
		CdkVirtualForTrackByIDDirective,
		CdkVirtualForTrackByIndexDirective,
		CdkVirtualForTrackByPropertyDirective,
		CdkVirtualForTrackByValueDirective,
		DetectScrollDirective,
		DisableControlDirective,
		FullscreenDirective,
		NgCacheIfDirective,
		NgForTrackByIDDirective,
		NgForTrackByIndexDirective,
		NgForTrackByPropertyDirective,
		NgForTrackByValueDirective,
		NgVarDirective,
		ValueControlDirective,
		/* End Directive Inject (Do not remove) */

		/* Pipe Inject (Do not remove) */
		CapitalizeFirstPipe,
		ClonePipe,
		CommasSeparatorPipe,
		ConvertPercentPipe,
		EmojiPipe,
		EmptyPipe,
		FileSizeUnitPipe,
		FilterPipe,
		FixedPipe,
		ImagePipe,
		IncludesPipe,
		IsContrastPipe,
		LinkPipe,
		MarkTextPipe,
		MomentDatePipe,
		MomentFromNowPipe,
		OrderByPipe,
		SafeHtmlPipe,
		SafeUrlPipe,
		ThounsandUnitPipe,
		TimerPipe,
		TrackByFnPipe,
		UnitPipe,
		/* End Pipe Inject (Do not remove) */
	],
	declarations: [
		EmailValidator,
		PhoneValidator,
		UrlValidator,

		/* Component Inject (Do not remove) */
		/* End Component Inject (Do not remove) */

		/* Directive Inject (Do not remove) */
		AutoFocusDirective,
		AutoResetDirective,
		CdkVirtualForTrackByIDDirective,
		CdkVirtualForTrackByIndexDirective,
		CdkVirtualForTrackByPropertyDirective,
		CdkVirtualForTrackByValueDirective,
		DetectScrollDirective,
		DisableControlDirective,
		FullscreenDirective,
		NgCacheIfDirective,
		NgForTrackByIDDirective,
		NgForTrackByIndexDirective,
		NgForTrackByPropertyDirective,
		NgForTrackByValueDirective,
		NgVarDirective,
		ValueControlDirective,
		/* End Directive Inject (Do not remove) */

		/* Pipe Inject (Do not remove) */
		CapitalizeFirstPipe,
		ClonePipe,
		CommasSeparatorPipe,
		ConvertPercentPipe,
		EmojiPipe,
		EmptyPipe,
		FileSizeUnitPipe,
		FilterPipe,
		FixedPipe,
		ImagePipe,
		IncludesPipe,
		IsContrastPipe,
		LinkPipe,
		MarkTextPipe,
		MomentDatePipe,
		MomentFromNowPipe,
		OrderByPipe,
		SafeHtmlPipe,
		SafeUrlPipe,
		ThounsandUnitPipe,
		TimerPipe,
		TrackByFnPipe,
		UnitPipe,
		/* End Pipe Inject (Do not remove) */
	],
	providers: [
		{
			provide: EventManager,
			useClass: CustomEventManager,
		},

		CookieService,

		/* Service Inject (Do not remove) */
		ApiService,
		CanDeactivateGuardService,
		MediaService,
		NetworkService,
		PageService,
		ServiceWorkerService,
		StorageService,
		WebNotificationService,
		/* End Service Inject (Do not remove) */
	],
})
export class CoreModule {}
