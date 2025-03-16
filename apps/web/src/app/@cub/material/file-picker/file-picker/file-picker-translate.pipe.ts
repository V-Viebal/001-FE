/* eslint-disable max-len */
import {
	PipeTransform,
	Pipe
} from '@angular/core';
import {
	TranslateService
} from '@ngx-translate/core';
import _ from 'lodash';

import {
	CUBFileSource
} from '../file/file.component';

@Pipe({ name: 'filePickerTranslate' })
export class FilePickerTranslatePipe implements PipeTransform {

	public static FILE_SOURCE: { [ key in CUBFileSource ]: string }
		= {
			[ CUBFileSource.Local ]	: 'Local',
			[ CUBFileSource.GoogleDrive ]	: 'Google Drive',
			[ CUBFileSource.OneDrive ]	: 'One Drive',
			[ CUBFileSource.Dropbox ]: 'Dropbox',
		};

	/**
	 * @constructor
	 * @param {TranslateService} _translateService
	 */
	constructor( private _translateService: TranslateService ) {}

	/**
	 * @param {IAccessPermission} access
	 * @return {string}
	 */
	public transform( access: CUBFileSource = CUBFileSource.Local ): string {
		return FilePickerTranslatePipe.FILE_SOURCE[ access ];

		return this._translateService
		.instant(
			`BASE.WORKFLOW.SETUP.TRIGGER.LABEL.${FilePickerTranslatePipe.FILE_SOURCE[ access ]}`
		);
	}

}
