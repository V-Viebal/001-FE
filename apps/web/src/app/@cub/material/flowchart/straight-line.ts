import { LeaderLineNew } from './leader-line';

// eslint-disable-next-line @typescript-eslint/no-namespace
export declare namespace StraightLine {

	export type Options = LeaderLineNew.Options;

}

// eslint-disable-next-line no-redeclare
export class StraightLine extends LeaderLineNew {

	public static FIXED_OPTIONS: StraightLine.Options = {
		path: 'straight',
		startSocket: 'bottom',
		endSocket: 'top',
	};

	constructor( options: LeaderLineNew.Options ) {
		super({
			...options,
			...StraightLine.FIXED_OPTIONS,
		});
	}

}
