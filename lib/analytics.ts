/**
 * Google Analytics 4 (GA4) Event Tracking Utility
 *
 * Usage:
 * import { trackEvent, trackArticleView } from '@/lib/analytics';
 *
 * // Track a custom event
 * trackEvent('click', 'button_click', { button_name: 'cta_button' });
 *
 * Page views are auto-tracked by GA4 (send_page_view: true in layout.tsx).
 */

declare global {
	interface Window {
		gtag: (...args: any[]) => void;
		dataLayer: any[];
	}
}

const GA_ID = process.env.NEXT_PUBLIC_GA_ID;

/**
 * Check if GA4 is available
 */
export function isGA4Available(): boolean {
	if (!GA_ID) {
		console.warn("GA4: GA_ID is not configured");
		return false;
	}
	if (typeof window === "undefined" || !window.gtag) {
		return false;
	}
	return true;
}

/**
 * Track a custom event
 * @param action - The action type (e.g., 'click', 'submit', 'search')
 * @param category - The category of the event (e.g., 'button', 'form', 'video')
 * @param params - Additional parameters for the event
 */
export function trackEvent(
	action: string,
	category?: string,
	params?: Record<string, string | number | boolean>,
): void {
	if (!isGA4Available()) return;

	const eventData: Record<string, string | number | boolean> = {
		event_category: category || "general",
	};

	if (params) {
		Object.assign(eventData, params);
	}

	window.gtag("event", action, eventData);

	console.log(`[GA4] Event tracked: ${action}`, { category, params });
}

/**
 * Map a URL path to a human-readable page name.
 * Used as the `page_name` parameter in the `page_visit` event.
 */
const PAGE_NAME_MAP: Record<string, string> = {
	"/": "Home",
	"/games": "Games",
	"/quiz": "Quiz",
	"/quiz/[session]/play": "Quiz Play",
	"/interview": "Interview",
	"/interview/[slug]": "Interview Detail",
	"/kolaborasi": "Kolaborasi",
	"/kolaborasi/[slug]": "Kolaborasi Detail",
	"/artikel": "Artikel",
	"/artikel/kategori/[slug]": "Artikel Kategori",
	"/artikel/[slug]": "Artikel Detail",
	"/media-spotlight": "Media Spotlight",
	"/prediksi-skor": "Prediksi Skor",
	"/guess-who": "Guess Who",
	"/guess-who/play/[sessionId]": "Guess Who Play",
	"/guess-who/play/[sessionId]/result": "Guess Who Result",
	"/klasemen": "Klasemen",
	"/ngolah-bola": "Ngolah Bola",
	"/ngolah-bola/duel": "Ngolah Bola Duel",
	"/ngolah-bola/duel/play": "Ngolah Bola Duel Play",
	"/ngolah-bola/inventory": "Ngolah Bola Inventory",
	"/ngolah-bola/packs": "Ngolah Bola Packs",
	"/ngolah-bola/rewards": "Ngolah Bola Rewards",
	"/ngolah-bola/squad": "Ngolah Bola Squad",
	"/ngolah-bola/squad/[id]": "Ngolah Bola Squad Detail",
	"/profile": "Profile",
	"/sapa": "Sapa",
	"/journey": "Journey",
	"/kontak": "Kontak",
	"/tentang-kami": "Tentang Kami",
	"/login": "Login",
	"/register": "Register",
	"/kebijakan-hak-cipta": "Kebijakan Hak Cipta",
	"/kebijakan-privasi": "Kebijakan Privasi",
	"/syarat-dan-ketentuan-football-city-battle": "Syarat FCB",
	"/syarat-dan-ketentuan-penggunaan": "Syarat Penggunaan",
	"/syarat-dan-ketentuan-periklanan-partnership": "Syarat Partnership",
	"/syarat-ketentuan-olahbola-games": "Syarat Olahbola Games",
	"/bundesliga-prediksi-skor-2026-2027": "Bundesliga Prediksi",
	"/fifa-asean-cup-prediksi-skor": "FIFA ASEAN Cup Prediksi",
	"/teater-bola-asean-2026": "Teater Bola ASEAN",
	"/payment": "Payment",
	"/payment/finish": "Payment Finish",
	"/payment/status/[orderId]": "Payment Status",
};

function getPageName(pathname: string): string {
	if (PAGE_NAME_MAP[pathname]) return PAGE_NAME_MAP[pathname];
	// Dynamic routes: match /artikel/{slug}, /interview/{slug}, /kolaborasi/{slug}, /ngolah-bola/squad/{id}
	const dynamicPatterns = [
		{ pattern: /^\/artikel\/[^/]+$/, name: "Artikel Detail" },
		{ pattern: /^\/interview\/[^/]+$/, name: "Interview Detail" },
		{ pattern: /^\/kolaborasi\/[^/]+$/, name: "Kolaborasi Detail" },
		{ pattern: /^\/ngolah-bola\/squad\/[^/]+$/, name: "Ngolah Bola Squad Detail" },
		{ pattern: /^\/guess-who\/play\/[^/]+$/, name: "Guess Who Play" },
		{ pattern: /^\/guess-who\/play\/[^/]+\/result$/, name: "Guess Who Result" },
		{ pattern: /^\/artikel\/kategori\/[^/]+$/, name: "Artikel Kategori" },
		{ pattern: /^\/payment\/status\/[^/]+$/, name: "Payment Status" },
	];
	const match = dynamicPatterns.find((p) => p.pattern.test(pathname));
	return match ? match.name : pathname;
}

/**
 * Track a page visit with a human-readable page name.
 * Call this in each page's useEffect to fire a `page_visit` event
 * that can be used in GA4 Exploration reports to list ALL pages.
 */
export function trackPageVisit(pageName?: string): void {
	if (!isGA4Available()) return;

	const pathname = typeof window !== "undefined" ? window.location.pathname : "";
	const name = pageName || getPageName(pathname);

	window.gtag("event", "page_visit", {
		page_name: name,
		page_path: pathname,
		page_title: document.title || name,
	});
}

/**
 * Track an article view
 * @param articleId - The article ID
 * @param articleTitle - The article title
 * @param articleCategory - The article category (optional)
 */
export function trackArticleView(
	articleId: string,
	articleTitle: string,
	articleCategory?: string,
): void {
	if (!isGA4Available()) return;

	window.gtag("event", "view_item", {
		currency: "IDR",
		value: 1,
		items: [
			{
				item_id: articleId,
				item_name: articleTitle,
				item_category: articleCategory || "article",
				item_list_name: "article_list",
			},
		],
	});

	// Also fire a flat event for easier GA4 reporting
	// (view_item items array is hard to query in standard reports)
	window.gtag("event", "article_view", {
		article_id: articleId,
		article_title: articleTitle,
		article_category: articleCategory || "article",
	});

	console.log(`[GA4] Article view tracked: ${articleTitle}`);
}

/**
 * Track a quiz attempt
 * @param quizId - The quiz ID
 * @param quizName - The quiz name
 * @param score - The score achieved
 * @param totalQuestions - Total number of questions
 */
export function trackQuizAttempt(
	quizId: string,
	quizName: string,
	score: number,
	totalQuestions: number,
): void {
	if (!isGA4Available()) return;

	const percentage = Math.round((score / totalQuestions) * 100);

	window.gtag("event", "complete_registration", {
		registration_method: "quiz_attempt",
		quiz_id: quizId,
		quiz_name: quizName,
		score: score,
		total_questions: totalQuestions,
		percentage: percentage,
	});

	console.log(`[GA4] Quiz attempt tracked: ${quizName} - ${score}/${totalQuestions}`);
}

/**
 * Track a leaderboard view
 * @param gameName - The game name (e.g., 'Football City Battle')
 * @param entryCount - Number of entries displayed
 */
export function trackLeaderboardView(
	gameName: string,
	entryCount: number,
): void {
	if (!isGA4Available()) return;

	window.gtag("event", "view_item_list", {
		item_list_id: "leaderboard",
		item_list_name: gameName,
		items: Array.from({ length: Math.min(entryCount, 10) }, (_, i) => ({
			item_id: `rank_${i + 1}`,
			item_name: `Rank ${i + 1}`,
			item_category: "leaderboard",
		})),
	});

	console.log(`[GA4] Leaderboard view tracked: ${gameName}`);
}

/**
 * Track a game session start
 * @param gameId - The game ID
 * @param gameName - The game name
 */
export function trackGameStart(
	gameId: string,
	gameName: string,
): void {
	if (!isGA4Available()) return;

	window.gtag("event", "begin_checkout", {
		currency: "IDR",
		value: 0,
		items: [
			{
				item_id: gameId,
				item_name: gameName,
				item_category: "game",
			},
		],
	});

	console.log(`[GA4] Game start tracked: ${gameName}`);
}

/**
 * Track social share
 * @param contentType - Type of content (e.g., 'article', 'quiz')
 * @param contentId - ID of the shared content
 * @param method - Share method (e.g., 'copy_link', 'twitter', 'facebook')
 */
export function trackSocialShare(
	contentType: string,
	contentId: string,
	method: string,
): void {
	if (!isGA4Available()) return;

	window.gtag("event", "share", {
		method: method,
		content_type: contentType,
		item_id: contentId,
	});

	console.log(`[GA4] Social share tracked: ${contentType} via ${method}`);
}

/**
 * Track search
 * @param searchTerm - The search query
 * @param resultCount - Number of results found (optional)
 */
export function trackSearch(
	searchTerm: string,
	resultCount?: number,
): void {
	if (!isGA4Available()) return;

	window.gtag("event", "search", {
		search_term: searchTerm,
		number_of_results: resultCount,
	});

	console.log(`[GA4] Search tracked: "${searchTerm}"`);
}

/**
 * Track video play (if you have video content)
 * @param videoId - The video ID
 * @param videoTitle - The video title
 * @param currentTime - Current playback position in seconds
 */
export function trackVideoPlay(
	videoId: string,
	videoTitle: string,
	currentTime: number = 0,
): void {
	if (!isGA4Available()) return;

	window.gtag("event", "video_play", {
		video_id: videoId,
		video_title: videoTitle,
		video_current_time: currentTime,
	});

	console.log(`[GA4] Video play tracked: ${videoTitle}`);
}