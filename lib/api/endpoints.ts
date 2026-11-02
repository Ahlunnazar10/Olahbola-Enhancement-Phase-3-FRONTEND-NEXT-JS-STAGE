// API Base URLs based on environment
const getBaseUrl = () => {
	if (process.env.NODE_ENV === "development") {
		return process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000";
	}
	return process.env.NEXT_PUBLIC_API_URL || "https://cms.olahbola.com";
};

export const API_BASE_URL = getBaseUrl();
export const API_VERSION = "v1";

// Helper functions for dynamic endpoints
export const endpoints = {
	// Auth
	csrf: "/sanctum/csrf-cookie",
	login: "/api/v1/auth/login",
	register: "/api/v1/auth/register",
	logout: "/api/v1/auth/logout",
	user: "/api/v1/auth/user",
	googleRedirect: "/api/v1/auth/google/redirect",
	googleCallback: "/api/v1/auth/google/callback",
	googleOneTap: "/api/v1/auth/google/one-tap",
	verifyEmail: "/api/v1/auth/verify-email",
	apiVerifyEmail: "/api/v1/auth/api-verify-email",
	resendVerification: "/api/v1/auth/resend-verification-email",

	// Articles
	articles: "/api/v1/article",
	articlesLatest: "/api/v1/article/latest",
	articlesCheckNew: "/api/v1/article/check-new",
	articlesSearch: "/api/v1/article/search",
	articlesPopular: "/api/v1/article/popular",
	articlesCategories: "/api/v1/article/categories",
	articleCategory: (slug: string) => "/api/v1/article/categories/" + slug,
	articleDetail: (slug: string) => "/api/v1/article/" + slug,

	// Categories
	categories: "/api/v1/category",

	// Authors
	authors: "/api/v1/author",

	// Interviews
	interviews: "/api/v1/interview",
	interviewDetail: (slug: string) => "/api/v1/interview/" + slug,

	// Kolaborasi
	kolaborasis: "/api/v1/kolaborasi",
	kolaborasiDetail: (slug: string) => "/api/v1/kolaborasi/" + slug,

	// Quiz - Interactive
	quizStart: (level: number) => "/api/v1/quiz/start/" + level,
	quizQuestions: (level: number) => "/api/v1/quiz/questions/" + level,
	quizSubmitAnswer: "/api/v1/quiz/submit-answer",
	quizStatus: (quizId: string) => "/api/v1/quiz/status/" + quizId,
	quizComplete: "/api/v1/quiz/complete",
	quizUserSummary: "/api/v1/quiz/user-summary",

	// Quiz - Image
	imageQuizStart: (level: number) => "/api/v1/image-quiz/start/" + level,
	imageQuizQuestions: (level: number) =>
		"/api/v1/image-quiz/questions/" + level,
	imageQuizSubmitAnswer: "/api/v1/image-quiz/submit-answer",
	imageQuizComplete: "/api/v1/image-quiz/complete",
	imageQuizUserSummary: "/api/v1/image-quiz/user-summary",

	// Quiz - Event
	eventActive: "/api/v1/events/active",
	eventLevels: (eventId: string) => "/api/v1/events/" + eventId,
	eventQuestions: (eventId: string, level: number) =>
		"/api/v1/events/" + eventId + "/questions/" + level,
	eventStart: (eventId: string, level: number) =>
		"/api/v1/events/" + eventId + "/start/" + level,
	eventSubmitAnswer: "/api/v1/events/submit-answer",
	eventComplete: "/api/v1/events/complete",
	eventProgress: (eventId: string) => "/api/v1/events/" + eventId + "/progress",
	eventLeaderboard: (eventId: string) =>
		"/api/v1/events/leaderboard/" + eventId,
	eventMyRank: (eventId: string) =>
		"/api/v1/events/leaderboard/" + eventId + "/me",

	// Special Events
	specialEvents: "/api/v1/special-events",
	specialEventDetail: (eventId: string) => "/api/v1/special-events/" + eventId,
	specialEventLevels: (eventId: string) =>
		"/api/v1/special-events/" + eventId + "/levels",
	specialEventQuestions: (eventId: string, level: number) =>
		"/api/v1/special-events/" + eventId + "/questions/level/" + level,
	specialEventStart: (eventId: string, level: number) =>
		"/api/v1/special-events/" + eventId + "/start/" + level,
	specialEventSubmitAnswer: "/api/v1/special-events/submit-answer",
	specialEventComplete: "/api/v1/special-events/complete",
	specialEventProgress: (eventId: string) =>
		"/api/v1/special-events/" + eventId + "/progress",
	specialEventLeaderboard: (eventId: string) =>
		"/api/v1/special-events/leaderboard/" + eventId,
	specialEventMyRank: (eventId: string) =>
		"/api/v1/special-events/leaderboard/" + eventId + "/me",
	specialEventLevelLeaderboard: (eventId: string, level: number) =>
		"/api/v1/special-events/leaderboard/level/" + eventId + "/" + level,
	specialEventActive: "/api/v1/special-events/active/public",

	// Leaderboard
	leaderboard: "/api/v1/leaderboard",
	leaderboardRegular: "/api/v1/leaderboard/regular",
	leaderboardSeason: "/api/v1/leaderboard/season",
	leaderboardTop: "/api/v1/leaderboard/top",
	leaderboardByLevel: (level: number) => "/api/v1/leaderboard/level/" + level,
	leaderboardStats: "/api/v1/leaderboard/stats",
	leaderboardImageQuiz: "/api/v1/leaderboard/image-quiz",
	leaderboardImageQuizTop: "/api/v1/leaderboard/image-quiz/top",
	leaderboardCombined: "/api/v1/leaderboard/combined",
	leaderboardMe: "/api/v1/leaderboard/me",

	// Jersey Reward
	jerseyReward: "/api/v1/jersey-reward",
	jerseyRewardInfo: "/api/v1/jersey-reward/quiz-winner-info",
	jerseyRewardLeaderboards: "/api/v1/jersey-reward/leaderboards",
	jerseyRewardEligibility: "/api/v1/jersey-reward/eligibility",
	jerseyRewardClaim: "/api/v1/jersey-reward/claim",
	jerseyRewardClaimHistory: "/api/v1/jersey-reward/claim-history",

	// Prizes
	prizes: "/api/v1/prizes",

	// Claims
	claims: "/api/v1/admin-claim",
	claimStatistics: "/api/v1/admin-claim/statistics",
	claimDetail: (id: string) => "/api/v1/admin-claim/" + id,
	claimApprove: (id: string) => "/api/v1/admin-claim/" + id + "/approve",
	claimReject: (id: string) => "/api/v1/admin-claim/" + id + "/reject",

	// Profile
	profile: "/api/v1/profile",
	profileUploadPicture: "/api/v1/profile/upload-profile-picture",
	profileUpdateName: "/api/v1/profile/update-name",
	profileUpdateEmail: "/api/v1/profile/update-email",
	profileUpdatePassword: "/api/v1/profile/update-password",
	profileUpdateCity: "/api/v1/profile/update-city",
	profileUpdatePhone: "/api/v1/profile/update-phone",

	// Videos
	videos: "/api/v1/video",
	videoFile: (file: string) => "/api/v1/video/file/" + file,

	// Sapa
	sapa: "/api/v1/sapa",
	sapaCreate: "/api/v1/sapa",

	// Guess Who
	guessWhoConfig: "/api/guess-who/config",
	guessWhoDemo: "/api/guess-who/demo",
	guessWhoLeaderboard: "/api/guess-who/leaderboard",
	guessWhoStart: (level: number) => "/api/guess-who/start/" + level,
	guessWhoAnswer: (sessionId: string) => "/api/guess-who/" + sessionId + "/answer",
	guessWhoClue: (sessionId: string, questionId: string) =>
		"/api/guess-who/" + sessionId + "/clue/" + questionId,
	guessWhoRematch: (level: number) => "/api/guess-who/rematch/" + level,
	guessWhoStatus: (sessionId: string) => "/api/guess-who/" + sessionId + "/status",
	guessWhoMyRank: "/api/guess-who/my-rank",
	guessWhoLevelProgress: "/api/guess-who/level-progress",
	guessWhoMySessions: "/api/guess-who/my-sessions",
	guessWhoResume: (sessionId: string) => "/api/guess-who/" + sessionId + "/resume",

	// Quiz World Cup
	quizWorldCupSessions: (eventSlug: string) => "/api/v1/quiz/world-cup/sessions/" + eventSlug,
	quizWorldCupState: (sessionId: string) => "/api/v1/quiz/world-cup/" + sessionId + "/state",
	quizWorldCupPlay: (sessionId: string) => "/api/v1/quiz/world-cup/" + sessionId + "/play",
	quizWorldCupAnswer: (attemptId: string) => "/api/v1/quiz/world-cup/answer/" + attemptId,
	quizWorldCupGlobalLeaderboard: (eventSlug: string) => "/api/v1/quiz/world-cup/leaderboard/" + eventSlug,
	quizWorldCupMyRank: (eventSlug: string) => "/api/v1/quiz/world-cup/rank/" + eventSlug,
	quizWorldCupSessionLeaderboard: (sessionId: string, eventSlug: string) =>
		"/api/v1/quiz/world-cup/sessions/" + sessionId + "/leaderboard/" + eventSlug,
	quizWorldCupMySessionRank: (sessionId: string, eventSlug: string) =>
		"/api/v1/quiz/world-cup/sessions/" + sessionId + "/my-rank/" + eventSlug,

	// Payment
	paymentMidtransConfig: "/api/v1/payment/midtrans/config",
	paymentMidtransSnapToken: "/api/v1/payment/midtrans/snap-token",
	paymentMidtransStatus: (orderId: string) => "/api/v1/payment/midtrans/status/" + orderId,
	paymentAccessCheck: "/api/v1/payment/access-check",
};

export type Endpoint = typeof endpoints;
