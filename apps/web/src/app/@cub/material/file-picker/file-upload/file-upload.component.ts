import {
	ChangeDetectionStrategy,
	ChangeDetectorRef,
	Component,
	EventEmitter,
	inject,
	Input,
	Output,
	ViewEncapsulation
} from '@angular/core';
import _ from 'lodash';

import {
	CUBPopupRef
} from '@cub/material/popup';

import {
	CUBFile
} from '../file/file.component';
import {
	CUBFilePickerService
} from '../file-picker/file-picker.service';
import {
	CUBFilePreviewerService
} from '../file-previewer/file-previewer.service';
import {
	CUBFilePickerPickedEvent
} from '../file-picker/file-picker.component';

@Component({
	selector: 'cub-file-upload',
	templateUrl: './file-upload.pug',
	styleUrls: [ './file-upload.scss' ],
	host: { class: 'cub-file-upload' },
	encapsulation: ViewEncapsulation.None,
	changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CUBFileUploadComponent {

	@Input() public files: CUBFile[];

	@Output() public filesChange: EventEmitter<CUBFile[]>
		= new EventEmitter<CUBFile[]>();

	protected canScrollingLeft: boolean;
	protected canScrollingRight: boolean;

	private readonly _cdRef: ChangeDetectorRef
		= inject( ChangeDetectorRef );
	private readonly _filePickerService: CUBFilePickerService
		= inject( CUBFilePickerService );
	private readonly _filePreviewerService: CUBFilePreviewerService
		= inject( CUBFilePreviewerService );

	private _filePickerPopupRef: CUBPopupRef;
	private _filePreviewerPopupRef: CUBPopupRef;

	/**
	 * @return {void}
	 */
	protected pickFile() {
		if (
			this._filePickerPopupRef?.isOpened
			|| this._filePreviewerPopupRef?.isOpened
		) {
			return;
		}

		this._filePickerPopupRef
			= this
			._filePickerService
			.pick(
				{
					onPicked:
						this
						._onFilePicked
						.bind( this ),
				}
			);
	}

	/**
	 * @param {number=} idx
	 * @return {void}
	 */
	protected previewFile(
		idx: number
	) {
		if (
			this._filePickerPopupRef?.isOpened
			|| this._filePreviewerPopupRef?.isOpened
		) {
			return;
		}

		this._filePreviewerPopupRef
			= this
			._filePreviewerService
			.preview(
				{
					files:
						_.cloneDeep( this.files ),
					removable:
						true,
					previewingIndex:
						idx,
					onDone:
						this
						._saveFilesChange
						.bind( this ),
				}
			);
	}

	/**
	 * @return {void}
	 */
	protected previousScrolling() {
		const scrollingElement: Element
			= document.querySelector(
				'.cub-file-upload__attachment__file-list'
			);

		scrollingElement
		.scrollBy({
			left: -100,
			behavior: 'smooth',
		});

		this._checkScrollingAttachment(
			10
		);
	}

	/**
	 * @return {void}
	 */
	protected nextScrolling() {
		const scrollingElement: Element
			= document.querySelector(
				'.cub-file-upload__attachment__file-list'
			);

		scrollingElement
		.scrollBy({
			left: 100,
			behavior: 'smooth',
		});

		this._checkScrollingAttachment(
			0,
			10
		);
	}

	/**
	 * @param {CUBFile} file
	 * @return {void}
	 */
	protected removeFile(
		file: CUBFile
	) {
		_.pull(
			this.files,
			file
		);
		this.filesChange.emit( this.files );

		this._checkScrollingAttachment();
	}

	/**
	 * @param {CUBFilePickerPickedEvent} e
	 * @return {void}
	 */
	private _onFilePicked(
		e: CUBFilePickerPickedEvent
	) {
		this.files ||= [];

		this.files.push( ...e.files );
		this.filesChange.emit( this.files );

		this._cdRef.markForCheck();

		if ( !this.files?.length ) {
			this.canScrollingLeft
				= this.canScrollingRight
				= false;
			return;
		}

		this._checkScrollingAttachment();
	}

	/**
	 * @param {CUBFile=} files
	 * @return {void}
	 */
	private _saveFilesChange(
		files: CUBFile[]
	) {
		this.files = files;

		this.filesChange.emit( files );
		this._cdRef.markForCheck();

		if ( !this.files?.length ) {
			this.canScrollingLeft
				= this.canScrollingRight
				= false;
			return;
		}

		this._checkScrollingAttachment();
	}

	/**
	 * @param {number=} offsetLeft
	 * @param {number=} offsetRight
	 * @return {void}
	 */
	private _checkScrollingAttachment(
		offsetLeft: number = 0,
		offsetRight: number = 0
	) {
		setTimeout(
			() => {
				const parentElement: Element
					= document.querySelector(
						'.cub-file-upload__attachment__file-list'
					);

				if ( !parentElement ) return;

				const children: NodeListOf<Element>
					= parentElement.querySelectorAll(
						'.cub-file-upload__attachment__file-list__wrapper'
					);
				const lastChild: Element
					= children[ children.length - 1 ];
				const firstChild: Element
					= children[ 0 ];
				const parentRect: DOMRect
					= parentElement.getBoundingClientRect();
				const lastChildRect: DOMRect
					= lastChild.getBoundingClientRect();
				const firstChildRect: DOMRect
					= firstChild.getBoundingClientRect();

				this.canScrollingRight
					= lastChildRect.right - offsetRight > parentRect.right;
				this.canScrollingLeft
					= firstChildRect.left + offsetLeft < parentRect.left;

				this._cdRef.markForCheck();
			},
			100
		);
	}
}
