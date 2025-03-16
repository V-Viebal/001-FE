// eslint-disable-next-line @typescript-eslint/typedef, @typescript-eslint/explicit-function-return-type, @typescript-eslint/explicit-module-boundary-types
export const CONSTANT = {
	LOCALE: 'en',
	TIMEZONE: 'Asia/Ho_Chi_Minh',
	DATE_FORMAT: 'L',
	TIME_FORMAT: 'HH:mm',
	WEEK_START: 1,
	ALLOW_FILE_SIZE: 52428800, // 50 mb
	ALLOW_IMAGE_FILES: [ 'image/jpg', 'image/jpeg', 'image/png' ],
	ALLOW_VIDEO_FILES: [
		'video/mp4', 'video/mov', 'video/avi',
		'video/wmv', 'video/flv', 'video/webm',
	],
	ALLOW_DATE_FORMATS: [
		'DD/MM/YYYY', 'DD-MM-YYYY', 'DD/MM/YY', 'DD-MM-YY',
		'MM/DD/YYYY', 'MM-DD-YYYY', 'MM/DD/YY', 'MM-DD-YY',
		'YYYY/MM/DD', 'YYYY-MM-DD', 'YY/MM/DD', 'YY-MM-DD',
		'MMMM DD, YYYY', 'DD MMMM, YYYY', 'MMM DD, YYYY', 'DD MMM, YYYY',
	],
	ALLOW_DOCUMENT_FILES: [
		'application/vnd.openxmlformats-officedocument.wordprocessingml.document', // docs
		'application/vnd.ms-excel', // xls
		'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', // xlsx
		'application/vnd.ms-powerpoint', // ppt
		'application/vnd.openxmlformats-officedocument.presentationml.presentation', // pptx,
		'application/msword', // doc
		'application/csv', // csv
		'application/pdf', // pdf
		'text/csv', // csv
	],
} as const;
