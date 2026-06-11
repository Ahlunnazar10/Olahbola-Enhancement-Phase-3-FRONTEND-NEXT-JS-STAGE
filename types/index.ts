// User types
export interface User {
	id: string;
	name: string;
	email: string | null;
	phone: string | null;
	city: string | null;
	role: "user" | "admin" | "superadmin";
	profilePicture: string | null;
	points: number;
	quiz_points: QuizPoints[];
	isEmailVerified: boolean;
	isPhoneVerified: boolean;
	isOauth: boolean;
	created_at: string;
	updated_at: string;
	last_login_at: string | null;
	login_count: number;
}

export interface QuizPoints {
	event_id: string;
	points: number;
	level: number;
	last_points_event_id: string | null;
}

// API Response types
export interface ApiResponse<T = unknown> {
	status: "success" | "error";
	message: string;
	timestamp?: string;
	metadata?: unknown;
	data: T;
	errors: string[];
	debug?: unknown;
}

export interface PaginatedResponse<T> extends ApiResponse<T> {
	metadata: {
		current_page: number;
		last_page: number;
		per_page: number;
		total: number;
	};
}

// Article types
export interface Article {
	id: string;
	title: string;
	slug: string;
	content: string;
	excerpt: string;
	image: string;
	featured_image: string;
	category: Category;
	author: Author;
	views: number;
	status: "draft" | "pending" | "published" | "archived";
	published_at: string | null;
	created_at: string;
	updated_at: string;
}

export interface Category {
	id: string;
	name: string;
	slug: string;
	description: string | null;
	article_count?: number;
}

export interface Author {
	id: string;
	name: string;
	slug: string;
	avatar: string | null;
	bio: string | null;
	user_id: string;
}

// Interview types
export interface Interview {
	id: string;
	title: string;
	slug: string;
	content: string;
	image: string;
	featured_image: string;
	post_url?: string;
	author: Author;
	published_at: string;
	created_at: string;
}

// Kolaborasi types
export interface Kolaborasi {
	id: string;
	title: string;
	slug: string;
	content: string;
	thumbnail: string;
	link: string | null;
	status: "active" | "inactive";
	published_at: string;
	created_at: string;
}

// Quiz types
export interface QuizQuestion {
	id: string;
	question: string;
	options: string[];
	correct_answer: number;
	explanation: string | null;
	image_url: string | null;
	order: number;
}

export interface Quiz {
	id: string;
	user_id: string;
	level: number;
	type: "interactive" | "image" | "event" | "special";
	event_id?: string;
	questions: QuizQuestion[];
	current_question_index: number;
	answers: number[];
	score: number;
	is_completed: boolean;
	started_at: string;
	completed_at: string | null;
}

export interface QuizSummary {
	id: string;
	user_id: string;
	total_quizzes: number;
	total_correct: number;
	total_wrong: number;
	average_score: number;
	levels_completed: number;
	total_points_earned: number;
}

export interface QuizWorldCupSession {
	id: string;
	session_number: number;
	name: string;
	subtitle: string;
	description: string;
	status: "active" | "coming_soon" | "nonactive";
	countdown: string | null;
	points_per_correct: number;
	duration_seconds: number;
	total_questions: number;
	release_date: string;
	is_played: boolean;
	total_players: number;
}

export interface QuizWorldCupQuestion {
	id: string;
	question: string;
	options: string[];
	order: number;
	image_url: string | null;
}

export interface QuizWorldCupPlay {
	session_id: string;
	attempt_id: string;
	duration_seconds: number;
	questions: QuizWorldCupQuestion[];
}

export interface QuizWorldCupState {
	session_id: string;
	attempt_id: string;
	status: "in_progress" | "completed" | "expired";
	current_index: number;
	score: number;
	correct_count: number;
	total_questions: number;
	remaining_seconds: number;
	finished: boolean;
}

export interface QuizWorldCupAnswerResult {
	correct: boolean;
	correct_answer: number;
	selected_answer: number;
	explanation: string | null;
	points_earned: number;
	total_points_so_far: number;
}

export interface QuizWorldCupFinishResult {
	score: number;
	correct_count: number;
	points_earned: number;
}

export interface QuizWorldCupLeaderboardEntry {
	rank: number;
	user_id: string;
	name: string;
	email: string;
	total_points: number;
	total_duration_formatted: string;
}

export interface QuizWorldCupMyRank {
	rank: number;
	total_points: number;
	total_duration: number;
	total_duration_formatted: string;
}

export interface QuizWorldCupSessionLeaderboardEntry {
	rank: number;
	user_id: string;
	name: string;
	email: string;
	points: number;
	duration_formatted: string;
	correct_count: number;
}

export interface QuizWorldCupSessionMyRank {
	rank: number;
	user_id: string;
	points: number;
	duration: number;
	duration_formatted: string;
	correct_count: number;
}

// Event types
export interface Event {
	id: string;
	name: string;
	description: string;
	type: "regular" | "season" | "special";
	start_date: string;
	end_date: string;
	is_active: boolean;
	levels: EventLevel[];
	prizes: Prize[];
}

export interface EventLevel {
	id: string;
	event_id: string;
	level: number;
	name: string;
	description: string;
	is_locked: boolean;
	unlock_date: string | null;
	questions_count: number;
	points_per_question: number;
}

export interface SpecialEvent extends Event {
	type: "special";
	banner_image: string;
	rules: string;
	terms: string;
}

// Prize & Rewards
export interface Prize {
	id: string;
	name: string;
	description: string;
	image: string;
	points_required: number;
	stock: number;
	claimed: number;
}

export interface Claim {
	id: string;
	user_id: string;
	prize_id: string;
	event_quiz_id: string;
	status: "pending" | "approved" | "rejected";
	notes: string | null;
	created_at: string;
	updated_at: string;
}

// Leaderboard
export interface LeaderboardEntry {
	rank: number;
	user_id: string;
	user_name: string;
	profile_picture: string | null;
	points: number;
	city: string | null;
}

export interface LeaderboardStats {
	total_participants: number;
	total_quizzes_taken: number;
	average_score: number;
}

// Sapa
export interface Sapa {
	id: string;
	name: string;
	message: string;
	is_featured: boolean;
	created_at: string;
}

// Auth types
export interface LoginCredentials {
	email?: string;
	phone?: string;
	email_or_phone?: string;
	password: string;
	register_via: "email" | "phone";
}

export interface RegisterCredentials {
	name: string;
	email?: string;
	phone?: string;
	password: string;
	password_confirmation: string;
	city?: string;
	register_via: "email" | "phone";
}

export interface GoogleAuthResponse {
	url: string;
	token?: string;
}

// Profile update types
export interface ProfileUpdateData {
	name?: string;
	email?: string;
	phone?: string;
	city?: string;
	profilePicture?: string;
}

export interface PasswordUpdateData {
	current_password: string;
	password: string;
	password_confirmation: string;
}

// Extended Window types for embed libraries
declare global {
	interface Window {
		twttr?: {
			widgets?: {
				load: () => void;
			};
		};
		instgrm?: {
			Embeds?: {
				process: () => void;
			};
		};
		FB?: {
			init?: (options: { xfbml?: boolean; version?: string }) => void;
			XFBML?: {
				parse: (element?: HTMLElement) => void;
			};
		};
	}
}
