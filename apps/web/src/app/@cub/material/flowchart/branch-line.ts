import { LeaderLineNew } from './leader-line';
import { StraightLine } from './straight-line';

function getBranchLineOptions(
	start: HTMLElement,
	end: HTMLElement,
	type: BranchLineType
): LeaderLineNew.Options {
	const d1: DOMRect
		= start.getBoundingClientRect();
	const d2: DOMRect
		= end.getBoundingClientRect();
	const dL1: number
		= d1.left + ( d1.width / 2 );
	const dL2: number
		= d2.left + ( d2.width / 2 );
	const options: LeaderLineNew.Options
		= { ...StraightLine.FIXED_OPTIONS };

	if ( Math.abs( dL1 - dL2 ) > 1 ) {
		options.path = 'grid';

		const isRightSide: boolean = dL1 < dL2;

		switch ( type ) {
			case BranchLineType.Spliting:
				options.startSocket
					= isRightSide ? 'right' : 'left';
				break;
			case BranchLineType.Merging:
				options.endSocket
					= isRightSide ? 'left' : 'right';
				break;
		}
	}

	return options;
}

export enum BranchLineType {
	Spliting = 1,
	Merging,
}

// eslint-disable-next-line @typescript-eslint/no-namespace
export declare namespace BranchLine {

	export type Options = LeaderLineNew.Options & {
		branchType: BranchLineType;
	};

}

// eslint-disable-next-line no-redeclare
export class BranchLine extends LeaderLineNew {

	public static FIXED_OPTIONS: StraightLine.Options = {
		cornerRadius: 8,
	};

	private _branchType: BranchLineType;

	get branchType(): BranchLineType {
		return this._branchType;
	}

	constructor( options: BranchLine.Options ) {
		super({
			...options,
			...BranchLine.FIXED_OPTIONS,
			...getBranchLineOptions(
				options.start as HTMLElement,
				options.end as HTMLElement,
				options.branchType
			),
		});

		this._branchType = options.branchType;
	}

	public override position() {
		this.setOptions(
			getBranchLineOptions(
				this.start as HTMLElement,
				this.end as HTMLElement,
				this._branchType
			)
		);

		super.position();
	}

}
