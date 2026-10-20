// ============================================================================
// Related Articles — entity-based ranking
// ============================================================================
// Akar masalah:
//   Related articles sebelumnya hanya match kata dari judul artikel,
//   sehingga artikel tentang "Brighton, Hurzeler, EPL" tidak punya skor
//   dengan artikel "Mourinho, Vini Jr, Arsenal" dan hasilnya jatuh ke
//   fallback "terbaru dulu" — tidak relevan secara topikal.
//
// Perbaikan:
//   1. Ekstraksi entitas (proper nouns: tim, pemain, liga, negara)
//      dari judul + isi artikel dengan bobot berbeda per jenis entitas.
//   2. Skor setiap artikel lain berdasarkan kemiripan entitas yang sama.
//   3. Kategori sekategori sebagai sinyal lemah (+poin kecil).
//   4. Fallback ke urutan terbaru hanya jika memang tak ada entitas sama.

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface RelatedArticleItem {
	id: string;
	title: string;
	slug: string;
	image?: string;
	created_diff?: string;
	category_slug?: string;
}

export interface EntityExtraction {
	/** Proper nouns & brand words with their computed weight */
	terms: Map<string, number>;
	/** Total distinct terms */
	count: number;
}

// ---------------------------------------------------------------------------
// Weight tables
// ---------------------------------------------------------------------------

const TEAM_WEIGHT = 8;
const PLAYER_WEIGHT = 8;
const LEAGUE_WEIGHT = 5;
const COUNTRY_WEIGHT = 3;
const DEFAULT_WEIGHT = 2;

/**
 * Known league names — detected by substring in lowercased text.
 * Each entry: [searchTerm, canonicalKey, weight]
 */
const LEAGUE_PATTERNS: [string, string, number][] = [
	["premier league", "premier-league", LEAGUE_WEIGHT],
	["epl", "premier-league", LEAGUE_WEIGHT],
	["liga epl", "premier-league", LEAGUE_WEIGHT],
	["la liga", "la-liga", LEAGUE_WEIGHT],
	["la liga", "la-liga", LEAGUE_WEIGHT],
	["serie a", "serie-a", LEAGUE_WEIGHT],
	["serie a", "serie-a", LEAGUE_WEIGHT],
	["bundesliga", "bundesliga", LEAGUE_WEIGHT],
	["ligue 1", "ligue-1", LEAGUE_WEIGHT],
	["champions league", "champions-league", LEAGUE_WEIGHT],
	["uefa", "champions-league", LEAGUE_WEIGHT - 1],
	["europa league", "europa-league", LEAGUE_WEIGHT - 1],
	["afc", "afc", LEAGUE_WEIGHT - 1],
	["aek", "aek", LEAGUE_WEIGHT - 1],
	["mlz", "mlz", LEAGUE_WEIGHT - 1],
	["mls", "mls", LEAGUE_WEIGHT - 1],
	["eropa", "eropa", LEAGUE_WEIGHT - 2],
	["liga eropa", "eropa", LEAGUE_WEIGHT - 2],
	["afc championship", "afc-championship", LEAGUE_WEIGHT - 1],
	["afc cup", "afc-cup", LEAGUE_WEIGHT - 1],
	["liga 1", "liga-1-indo", LEAGUE_WEIGHT - 1],
	["super league", "super-league", LEAGUE_WEIGHT],
	["bri super league", "super-league", LEAGUE_WEIGHT],
	["bri liga 1", "liga-1-indo", LEAGUE_WEIGHT],
	["bri liga 2", "liga-2-indo", LEAGUE_WEIGHT],
	["bri liga 3", "liga-3-indo", LEAGUE_WEIGHT],
	["perserikatan", "perserikatan", LEAGUE_WEIGHT],
	["isl", "isl", LEAGUE_WEIGHT - 1],
];

/**
 * Country / nation names — detected by word match in lowercased word-set.
 */
const COUNTRY_WORDS = new Set([
	"indonesia", "inggris", "jerman", "france", "frans", "spain", "spanyol",
	"italia", "portugal", "belgia", "holland", "belanda", "inggris",
	"skotlandia", "wales", "makedonia", "yugoslavia", "croasia",
	"denmark", "suede", "sweden", "norwegia", "polandia", "poland",
	"hungaria", "rumania", "serbia", "bosnia", "swiss", "switzerland",
	"austria", "turki", "turkey", "yordania", "jordan", "jerman",
	"amerika", "meksiko", "japan", "korea", "australia", "selandia",
]);

/**
 * Common football team names — detected by word or multi-word match.
 * Multi-word teams checked as substring, single-word as word-set.
 */
const TEAMS_MULTI: string[] = [
	"real madrid", "atletico madrid", "barcelona", "manchester united",
	"manchester city", "liverpool", "tottenham", "arsenal", "chelsea",
	"newcastle", "brighton", "crystal palace", "west ham", "everton",
	"austin", "brayton", "inter milan", "inter", "ac milan", "juventus",
	"napoli", "roma", "lazio", "borussia dortmund", "borussia monchengladbach",
	"bayern munich", "bayern", "psg", "paris saint-germain", "psg",
	"atletico", "sevilla", "valencia", "villarreal", "celta vigo",
	"lyon", "marquee", "psg", "olympique marseille", "marseille",
	"olympique lyonnais", "lyon", "rb leipzig", "leipzig",
	"ajax", "psv", "feyenoord", "benfica", "porto", "sporting lisbon",
	"sporting", "celtic", "rangers", "stuttgart", "leverkusen",
	"frankfurt", "wolfsburg", "schalke", "dortmund", "leipzig",
	"galatasaray", "fenarbahce", "beşiktaş",
	"persija", "persib", "persis", "psis", "bali united", "bali",
	"persikabo", "persik", "persela", "pss", "madura united", "madura",
	"deposo", "persebaya", "arema", "psis", "persis",
];

const TEAMS_SINGLE = new Set([
	"madrid", "real", "barca", "manchester", "liverpool", "tottenham",
	"arsenal", "chelsea", "newcastle", "brighton", "palace", "crystal",
	"west", "ham", "everton", "united", "city", "inter", "ac",
	"juventus", "napoli", "roma", "lazio", "dortmund", "leipzig",
	"bayern", "psg", "paris", "olympique", "lyon", "marseille",
	"ajax", "psv", "feyenoord", "benfica", "porto", "sporting",
	"celtic", "rangers", "stuttgart", "leverkusen", "frankfurt",
	"schalke", "wolfsburg", "gladbach", "brayton", "galatasaray",
	"fenarbahce", "persija", "persib", "persis", "psis",
	"bali", "persikabo", "persik", "persela", "pss", "madura",
	"persebaya", "arema",
]);

// ---------------------------------------------------------------------------
// Stopword sets
// ---------------------------------------------------------------------------

const STOP_WORDS = new Set([
	"yang", "dan", "ini", "itu", "adalah", "dari", "untuk", "dengan",
	"pada", "atau", "tapi", "namun", "karena", "jika", "akan", "sudah",
	"telah", "bisa", "punya", "ada", "para", "semua", "kalian", "kami",
	"mereka", "the", "and", "for", "with", "from", "this", "that", "they",
	"their", "has", "have", "had", "was", "were", "who", "whom", "whose",
	"what", "which", "when", "where", "how", "will", "would", "could",
	"should", "just", "very", "not", "nor", "yet", "but", "all", "are",
	"was", "in", "on", "at", "by", "to", "of", "a", "an", "the", "be",
	"as", "if", "do", "does", "did", "can", "may", "might", "must",
	// Indonesian stopwords
	"dengan", "tersebut", "tersebut", "tersebut", "yang", "yang",
	"yang", "adalah", "dalam", "menurut", "berikut", "ini",
]);

/**
 * Words that look like proper nouns but are common — filter these out.
 */
const NON_PROPER = new Set([
	"artikel", "juga", "tak", "tetap", "turut", "kini", "namun",
	"bahwa", "agar", "agar", "karen", "karena", "lalu", "saat",
	"untuk", "dengan", "dalam", "oleh", "akan", "sudah", "bisa",
	"terus", "maka", "dan", "atau", "tidak", "jika", "kalo",
	"karena", "walau", "selain", "tambah", "turut", "punya",
	"bukan", "bukan", "sama", "lebih", "belum", "baru", "lama",
	"hari", "tahun", "bulan", "minggu", "kemarin", "besok",
	"pukul", "pagi", "siang", "sore", "malam",
	"ke", "dari", "pada", "dengan", "dalam", "untuk",
	"menurut", "berdasarkan", "didasarkan",
	"antara", "tengah", "dekat", "jauh", "dekat",
	"banyak", "sedikit", "semua", "beberapa", "sebagian",
	"satu", "dua", "tiga", "empat", "lima",
	"pertama", "kedua", "ketiga", "keempat", "kelima",
	"sekarang", "sebelum", "sesudah", "selama",
	"pemain", "pelatih", "klub", "tim", "lig", "liga",
	"sepak", "bola", "piala", "liga", "eropa", "piala dunia",
	"piala asia", "piala", "mundial", "kualifikasi",
	"kejuaraan", "kompetisi", "kasta", "turun",
	"menang", "kalah", "seri", "skor", "gol", "tambahan",
	"menit", "menit", "akhir", "sepakat", "kesepakatan",
	"transfer", "bebas", "kontrak", "perpanjangan", "perpanjang",
	"penampilan", "debut", "panggilan", "panggilan",
	"timnas", "nasional", "internasional", "piala",
	"pemain", "manajer", "pelatih", "pemain", "kepala",
	"presiden", "direktur", "direktur", "manajer",
	"kepemimpinan", "perubahan", "pergantian",
	"keputusan", "pilihan", "pengumuman", "resmi",
	"konferensi", "pers", "konferensi", "media",
	"media", "jurnalis", "wartawan", "laporan",
	"berita", "info", "informasi", "berita",
	"kejuaraan", "final", "semifinal", "babak", "playoff",
	"play-off", "kualifikasi", "grup", "pools",
	"jadwal", "kalendar", "seri", "putaran", "musim",
	"musim", "preseason", "premusim", "pra", "musim",
	"rebutan", "peringkat", "papan", "klasemen",
	"poin", "poin", "kalah", "menang", "seri",
	"menit", "menit", "bukan", "kecuali",
]);

// ---------------------------------------------------------------------------
// Extraction
// ---------------------------------------------------------------------------

/**
 * Extract a Set of lowercased words from a string.
 * Preserves multi-word names as separate entries;
 * caller can also look for multi-word substrings separately.
 */
function wordSet(text: string): Set<string> {
	return new Set(
		text
			.toLowerCase()
			.replace(/[^a-z0-9\s\-/]/g, " ")
			.replace(/\s+/g, " ")
			.trim()
			.split(" ")
			.filter(Boolean)
	);
}

/**
 * Build the entity/term weights for an article.
 *
 * Input:
 *   title  – the article's title (high signal)
 *   content – plain text extracted from HTML body (optional, used to find
 *             additional proper nouns / team names mentioned in body)
 *
 * Output:
 *   Map<lowercaseTerm, weight> — each term's relevance score contribution.
 *   Multi-word team names are stored as the full phrase;
 *   single words are stored individually.
 */
export function extractEntities(
	title: string,
	content?: string
): EntityExtraction {
	const titleWords = wordSet(title);
	const contentWords = content ? wordSet(content) : new Set<string>();

	// Merge: title words get double weight marker via set of "title-confirmed"
	const titleWordSet = titleWords;

	const terms = new Map<string, number>();

	const addTerm = (term: string, weight: number) => {
		const existing = terms.get(term) || 0;
		if (existing < weight) terms.set(term, weight);
	};

	// --- 1. League / competition patterns (substring match) ---
	const fullText = (title + " " + (content || "")).toLowerCase();
	for (const [pattern, key, weight] of LEAGUE_PATTERNS) {
		if (fullText.includes(pattern)) {
			addTerm(key, weight);
		}
	}

	// --- 2. Multi-word team names (substring in fullText) ---
	for (const team of TEAMS_MULTI) {
		const lower = team.toLowerCase();
		// Use word-boundary-ish check: look for "team" as a standalone phrase
		const re = new RegExp(`\\b${lower.replace(/\s+/g, "\\s+")}\\b`, "i");
		if (re.test(fullText)) {
			addTerm(lower, TEAM_WEIGHT);
		}
	}

	// --- 3. Single-word team names (word-set match on title words primarily) ---
	for (const w of titleWordSet) {
		if (TEAMS_SINGLE.has(w)) {
			addTerm(w, TEAM_WEIGHT);
		}
	}
	// Also check content words for team names, with lower weight
	for (const w of contentWords) {
		if (TEAMS_SINGLE.has(w)) {
			addTerm(w, TEAM_WEIGHT - 1);
		}
	}

	// --- 4. Country names (word-set match) ---
	for (const w of titleWordSet) {
		if (COUNTRY_WORDS.has(w)) {
			addTerm(w, COUNTRY_WEIGHT + 1);
		}
	}
	for (const w of contentWords) {
		if (COUNTRY_WORDS.has(w)) {
			addTerm(w, COUNTRY_WEIGHT);
		}
	}

	// --- 5. Proper-noun detection (capitalised words not in stop/non-proper list) ---
	// Extract capitalized words from title that are not common nouns
	const titleCapitalised: string[] = [];
	const titleOriginal = title;
	for (const raw of titleOriginal.split(/\s+/)) {
		const clean = raw.replace(/[^a-zA-Z0-9\-]/g, "");
		if (!clean) continue;
		// Must start uppercase to be considered a proper noun
		if (/^[A-Z]/.test(clean)) {
			const lower = clean.toLowerCase();
			if (!STOP_WORDS.has(lower) && !NON_PROPER.has(lower)) {
				titleCapitalised.push(lower);
			}
		}
	}
	for (const w of titleCapitalised) {
		// Give title proper nouns high weight; content-only proper nouns lower
		addTerm(w, PLAYER_WEIGHT);
	}

	// Content proper nouns (capitalised words in body, not in known lists)
	// Only add if not already in title (title already covers it at higher weight)
	if (content) {
		// Sample first ~3000 chars to keep perf reasonable
		const sample = content.substring(0, 3000);
		const contentWordsArr = sample
			.split(/\s+/)
			.map((w) => w.replace(/[^a-zA-Z0-9\-]/g, ""))
			.filter((w) => w.length > 2 && /^[A-Z]/.test(w));
		const seen = new Set<string>();
		for (const w of contentWordsArr) {
			const lower = w.toLowerCase();
			if (STOP_WORDS.has(lower) || NON_PROPER.has(lower)) continue;
			if (seen.has(lower)) continue;
			seen.add(lower);
			// Content-only: lower weight than title
			addTerm(lower, Math.min(PLAYER_WEIGHT - 1, 4));
		}
	}

	return { terms, count: terms.size };
}

// ---------------------------------------------------------------------------
// Scoring
// ---------------------------------------------------------------------------

/**
 * Rank a list of articles against the entity profile extracted from the
 * current article.
 *
 * @param articles  – candidate articles (title + optional category_slug)
 * @param profile   – entity profile from the current article
 * @param currentSlug – the slug of the article currently being viewed
 * @param limit     – max number of results to return
 */
export function scoreRelatedArticles(
	articles: RelatedArticleItem[],
	profile: EntityExtraction,
	currentSlug: string,
	currentCategorySlug?: string,
	limit: number = 4
): RelatedArticleItem[] {
	const { terms } = profile;
	if (terms.size === 0) {
		return articles
			.filter((a) => a.slug !== currentSlug)
			.slice(0, limit);
	}

	const scored = articles
		.filter((a) => a.slug !== currentSlug)
		.map((a) => {
			const aWords = wordSet(a.title);
			let score = 0;

			// Weighted term match: term weight × binary presence
			for (const [term, weight] of terms) {
				if (aWords.has(term)) {
					score += weight;
				}
				// Also check multi-word team names as substring in title
				if (term.includes(" ") && a.title.toLowerCase().includes(term)) {
					score += weight;
				}
			}

			// Category match bonus (weak signal)
			if (a.category_slug && currentCategorySlug && a.category_slug === currentCategorySlug) {
				score += 1;
			}

			return { ...a, score };
		})
		.sort((x, y) => y.score - x.score);

	// If top score is 0, no entity overlap → fallback to original order
	const topScore = scored[0]?.score ?? 0;
	if (topScore === 0) {
		return scored.slice(0, limit);
	}
	return scored.slice(0, limit);
}

/**
 * Convenience: run the full extraction + ranking pipeline.
 */
export function getRelatedArticles(
	articles: RelatedArticleItem[],
	currentTitle: string,
	currentContent: string,
	currentSlug: string,
	currentCategorySlug?: string,
	limit: number = 4
): RelatedArticleItem[] {
	// Strip HTML tags from content for text extraction
	const plainContent = currentContent.replace(/<[^>]*>/g, " ");
	const profile = extractEntities(currentTitle, plainContent);
	return scoreRelatedArticles(
		articles,
		profile,
		currentSlug,
		currentCategorySlug,
		limit
	);
}
