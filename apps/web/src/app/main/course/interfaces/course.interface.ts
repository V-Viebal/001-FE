import { ULID } from "ulidx"

export type Course = {
	id: ULID;
	name: string;
	thumbnail?: string;
	description?: string;
	createdAt?: Date;
	updatedAt?: Date;
	metadata?: CourseMetadata;
}

export type CourseMetadata = {
	careerIDs: ULID[];
	groupIDs: ULID[];
}

export type CourseCreate
	= Partial<Pick<Course, 'name' | 'thumbnail' | 'description'>>;

export type CourseUpdate
	= Partial<Pick<Course, 'name' | 'thumbnail' | 'description'>>;
