import { ULID } from "ulidx"

export type Career = {
	id: ULID;
	name: string;
	thumbnail?: string;
	description?: string;
	createdAt?: Date;
	updatedAt?: Date;
	metadata?: CareerMetadata;
}

export type CareerMetadata = {
}

export type CareerCreate
	= Partial<Pick<Career, 'name' | 'thumbnail' | 'description'>>;

export type CareerUpdate
	= Partial<Pick<Career, 'name' | 'thumbnail' | 'description'>>;
