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

	// Quiz - World Cup Event
	quizWorldCupEvents: "/api/quiz-world-cup/events",
	quizWorldCupSessions: (eventSlug: string) =>
		"/api/quiz-world-cup/events/" + eventSlug + "/sessions",
	quizWorldCupPlay: (sessionId: string) =>
		"/api/quiz-world-cup/sessions/" + sessionId + "/play",
	quizWorldCupState: (sessionId: string) =>
		"/api/quiz-world-cup/sessions/" + sessionId + "/state",
	quizWorldCupAnswer: (attemptId: string) =>
		"/api/quiz-world-cup/attempts/" + attemptId + "/answer",
	quizWorldCupGlobalLeaderboard: (eventSlug: string) =>
		"/api/quiz-world-cup/leaderboard/global?event_slug=" + eventSlug,
	quizWorldCupMyRank: (eventSlug: string) =>
		"/api/quiz-world-cup/my-rank/global?event_slug=" + eventSlug,
	quizWorldCupSessionLeaderboard: (sessionId: string, eventSlug: string = "world-cup-2026") =>
		"/api/quiz-world-cup/leaderboard/session/" + sessionId + "?event_slug=" + eventSlug,
	quizWorldCupMySessionRank: (sessionId: string, eventSlug: string = "world-cup-2026") =>
		"/api/quiz-world-cup/my-rank/session/" + sessionId + "?event_slug=" + eventSlug,

	// Prediction - Teater Bola Asean 2026
	teaterBolaAseanPhases: "/api/v1/teater-bola/phases",
	teaterBolaAseanTeams: "/api/v1/teater-bola/teams",
	teaterBolaAseanMatches: "/api/v1/teater-bola/matches",
	teaterBolaAseanMatchDetail: (matchId: string) =>
		"/api/v1/teater-bola/matches/" + matchId,
	teaterBolaAseanLeaderboard: "/api/v1/teater-bola/leaderboard",
	teaterBolaAseanPredict: "/api/v1/teater-bola/predict",
	teaterBolaAseanPredictions: "/api/v1/teater-bola/predictions",
	teaterBolaAseanMatchesWithPrediction:
		"/api/v1/teater-bola/matches-with-prediction",
	teaterBolaAseanMyRank: "/api/v1/teater-bola/me/rank",
	teaterBolaAseanMySummary: "/api/v1/teater-bola/me/summary",

	// Super Big Match
	superBigMatchTeams: "/api/v1/super-big-match/teams",
	superBigMatchMatches: "/api/v1/super-big-match/matches",
	superBigMatchMatchDetail: (id: string) => `/api/v1/super-big-match/matches/${id}`,
	superBigMatchLeaderboard: "/api/v1/super-big-match/leaderboard",
	superBigMatchPredict: "/api/v1/super-big-match/predict",
	superBigMatchPredictions: "/api/v1/super-big-match/predictions",
	superBigMatchMatchesWithPrediction: "/api/v1/super-big-match/matches-with-prediction",
	superBigMatchMyRank: "/api/v1/super-big-match/me/rank",
	superBigMatchMySummary: "/api/v1/super-big-match/me/summary",

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

	// Guess Who (proxied via app/api/guess-who/[...path]/route.ts)
	guessWhoConfig: "/api/guess-who/config",
	guessWhoDemo: "/api/guess-who/demo",
	guessWhoLeaderboard: "/api/guess-who/leaderboard",
	guessWhoStart: (level: number) => `/api/guess-who/start/${level}`,
	guessWhoAnswer: (sessionId: string) =>
		`/api/guess-who/session/${sessionId}/answer`,
	guessWhoClue: (sessionId: string, questionId: string) =>
		`/api/guess-who/session/${sessionId}/clue/${questionId}`,
	guessWhoRematch: (level: number) => `/api/guess-who/rematch/${level}`,
	guessWhoResume: (sessionId: string) => `/api/guess-who/session/${sessionId}`,
	guessWhoStatus: (sessionId: string) =>
		`/api/guess-who/session/${sessionId}/status`,
	guessWhoMySessions: "/api/guess-who/my-sessions",
	guessWhoMyRank: "/api/guess-who/my-rank",
	guessWhoLevelProgress: "/api/guess-who/level-progress",

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

	// Sapa
	sapa: "/api/v1/sapa",
	sapaCreate: "/api/v1/sapa",

	// Payment - Midtrans
	paymentMidtransConfig: "/api/v1/payment/midtrans/config",
	paymentMidtransSnapToken: "/api/v1/payment/midtrans/snap-token",
	paymentMidtransStatus: (orderId: string) =>
		"/api/v1/payment/midtrans/status/" + orderId,
	paymentAccessCheck: "/api/v1/payment/access/check",

	// ─── Ngolah Bola Game ──────────────────────

	// Profile & HUD
	ngolahBolaProfile: "/api/v1/ngolah-bola/profile",
	ngolahBolaFullHUD: "/api/v1/profile",

	// Energy
	ngolahBolaEnergy: "/api/v1/ngolah-bola/duel/energy",
	ngolahBolaRefillEnergy: "/api/v1/ngolah-bola/duel/energy/refill",

	// Points
	ngolahBolaPointsBalance: "/api/v1/ngolah-bola/points/balance",
	ngolahBolaExchangePoints: "/api/v1/ngolah-bola/points/exchange",

	// Pack Catalog (publik)
	ngolahBolaPackCatalog: "/api/v1/ngolah-bola/pack/catalog",
	ngolahBolaOpenPack: (packId: string) =>
		"/api/v1/ngolah-bola/pack/open/" + packId,

	// Inventory
	ngolahBolaInventory: "/api/v1/ngolah-bola/inventory",

	// Reference Data (publik)
	ngolahBolaReferencePlayers: "/api/v1/ngolah-bola/reference/players",
	ngolahBolaReferenceLeagues: "/api/v1/ngolah-bola/reference/leagues",
	ngolahBolaReferenceClubs: "/api/v1/ngolah-bola/reference/clubs",
	ngolahBolaReferenceFormations: "/api/v1/ngolah-bola/reference/formations",

	// Squads
	ngolahBolaSquads: "/api/v1/ngolah-bola/squads",
	ngolahBolaSquadDetail: (id: string) =>
		"/api/v1/ngolah-bola/squads/" + id,
	ngolahBolaAddPlayerToSquad: (id: string) =>
		"/api/v1/ngolah-bola/squads/" + id + "/players",
	ngolahBolaRemovePlayerFromSquad: (squadId: string, slot: string) =>
		"/api/v1/ngolah-bola/squads/" + squadId + "/players/" + slot,
	ngolahBolaSquadChemistry: (id: string) =>
		"/api/v1/ngolah-bola/squads/" + id + "/chemistry",
	ngolahBolaValidateSquad: (id: string) =>
		"/api/v1/ngolah-bola/squads/" + id + "/validate-duel",

	// Duel
	ngolahBolaDuelChallenge: "/api/v1/ngolah-bola/duel/challenge",
	ngolahBolaDuelHistory: "/api/v1/ngolah-bola/duel/history",
	ngolahBolaDuelPlaySubmit: "/api/v1/ngolah-bola/duel/play/submit",

	// Daily Reward
	ngolahBolaDailyRewardStatus: "/api/v1/ngolah-bola/daily-reward/status",
	ngolahBolaDailyRewardClaim: "/api/v1/ngolah-bola/daily-reward/claim",

	// Share
	ngolahBolaShareData: (id: string) =>
		"/api/v1/ngolah-bola/squads/" + id + "/share-data",
	ngolahBolaShareLog: (id: string) =>
		"/api/v1/ngolah-bola/squads/" + id + "/share-log",
};

export type Endpoint = typeof endpoints;
