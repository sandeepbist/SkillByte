export type UserRole = 'learner' | 'creator' | 'admin';
export type SkillLevel = 'beginner' | 'intermediate' | 'advanced';
export type UserRole = 'learner' | 'creator' | 'admin';
export type SkillLevel = 'beginner' | 'intermediate' | 'advanced';

export interface Profile {
	id: string;
	email: string;
	full_name: string | null;
	avatar_url: string | null;
	role: UserRole;
	bio: string | null;
	created_at: string;
}

export interface Course {
	id: string;
	title: string;
	description: string;
}

export interface Video {
	id: string;
	creator_id: string;
	title: string;
	description: string | null;
	video_url: string;
	thumbnail_url: string | null;
	duration_seconds: number | null;
	difficulty: SkillLevel;
	tags: string[];
	views_count: number;
	created_at: string;

	// Relations
	profiles?: Profile;
	course_id?: string;
	course_order?: number;
	course?: Course;

	// Virtual UI States
	is_following?: boolean;
	is_saved?: boolean;
}

export interface Comment {
	id: string;
	text: string;
	created_at: string;
	profiles: Profile;
}

export interface Poll {
	id: string;
	question: string;
	options: string[];
	my_vote?: number;
	votes_summary?: number[];
}

export interface Playlist {
	id: string;
	title: string;
	is_public: boolean;
	video_count?: number; // Virtual
}
export interface Profile {
	id: string;
	email: string;
	full_name: string | null;
	avatar_url: string | null;
	role: UserRole;
	bio: string | null;
	created_at: string;
}

export interface Course {
	id: string;
	title: string;
	description: string;
}

export interface Video {
	id: string;
	creator_id: string;
	title: string;
	description: string | null;
	video_url: string;
	thumbnail_url: string | null;
	duration_seconds: number | null;
	difficulty: SkillLevel;
	tags: string[];
	views_count: number;
	created_at: string;

	// Relations
	profiles?: Profile;
	course_id?: string;
	course_order?: number;
	course?: Course; // Joined data
}

export interface Comment {
	id: string;
	text: string;
	created_at: string;
	profiles: Profile; // Joined data
}

export interface Poll {
	id: string;
	question: string;
	options: string[];
	my_vote?: number; // Virtual field for UI
	votes_summary?: number[]; // Virtual field for UI
}
