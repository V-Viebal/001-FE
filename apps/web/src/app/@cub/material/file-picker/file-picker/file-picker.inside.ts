import {
	ChangeDetectorRef,
	Directive,
	EventEmitter,
	inject,
	Input,
	Output
} from '@angular/core';
import {
	ulid
} from 'ulidx';
import moment
	from 'moment-timezone';
import _ from 'lodash';

import {
	CoerceBoolean,
	DefaultValue
} from 'angular-core';

import {
	CUBFile
} from '../file/file.component';
import {
	CUBFileExtra
} from './local/local-file-picker.component';

@Directive()
export class CUBFilePickerInside {

	@Input() public fileAccept: string | string[];
	@Input() @CoerceBoolean()
	public imageOnly: boolean;
	@Input() @DefaultValue() @CoerceBoolean()
	public multiSelect: boolean = true;

	@Output() public picked: EventEmitter<CUBFile[]>
		= new EventEmitter<CUBFile[]>();
	@Output() public cancelled: EventEmitter<void>
		= new EventEmitter<void>();

	public pickedFiles: CUBFileExtra[];

	protected readonly cdRef: ChangeDetectorRef
		= inject( ChangeDetectorRef );

	/**
	 * @param {CUBFile} file
	 * @return {void}
	 */
	protected onFileRemoved(
		file: CUBFile
	) {
		_.pull(
			this.pickedFiles,
			file
		);
	}

	/**
	 * @param {CUBFile} file
	 * @return {CUBFile}
	 */
	protected addFile(
		file: CUBFileExtra
	): CUBFileExtra {
		if ( !file ) return;

		file.id
			||= ulid();
		file.createdAt
			||= moment().toDate();

		this.pickedFiles ||= [];

		( file as CUBFileExtra ).invalid
			? this.pickedFiles.unshift( file )
			: this.pickedFiles.push( file );

		return file;
	}

	/**
	 * @param {CUBFile[]=} files
	 * @return {void}
	 */
	protected done(
		files: CUBFile[] = this.pickedFiles
	) {
		this.pickedFiles = null;

		this.picked.emit( files );
	}

	/**
	 * @return {void}
	 */
	protected cancel() {
		this.cancelled.emit();
	}

}
