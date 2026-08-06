export type Tier = "perfect" | "partial" | "typo" | "wrong";
export type TierBreakdown = Record<Tier, number>;

export const TIER_COLORS: Record<
	Tier,
	{ bg: string; text: string; border: string }
> = {
	perfect: {
		bg: "rgba(34, 197, 94, 0.15)",
		text: "#22c55e",
		border: "rgba(34, 197, 94, 0.4)",
	},
	partial: {
		bg: "rgba(251, 191, 36, 0.15)",
		text: "#fbbf24",
		border: "rgba(251, 191, 36, 0.4)",
	},
	typo: {
		bg: "rgba(249, 115, 22, 0.15)",
		text: "#f97316",
		border: "rgba(249, 115, 22, 0.4)",
	},
	wrong: {
		bg: "rgba(239, 68, 68, 0.15)",
		text: "#ef4444",
		border: "rgba(239, 68, 68, 0.4)",
	},
};

export const TIER_LABEL: Record<Tier, string> = {
	perfect: "PERFECT",
	partial: "PARTIAL",
	typo: "TYPO",
	wrong: "WRONG",
};

export const EMPTY_BREAKDOWN: TierBreakdown = {
	perfect: 0,
	partial: 0,
	typo: 0,
	wrong: 0,
};

export function formatTime(totalSeconds: number): string {
	const t = Math.max(0, Math.floor(totalSeconds));
	const m = Math.floor(t / 60);
	const s = t % 60;
	return `${m}:${String(s).padStart(2, "0")}`;
}

export function levenshtein(a: string, b: string): number {
	const m = a.length;
	const n = b.length;
	if (m === 0) return n;
	if (n === 0) return m;
	const dp: number[][] = Array.from({ length: m + 1 }, () =>
		new Array(n + 1).fill(0),
	);
	for (let i = 0; i <= m; i++) dp[i][0] = i;
	for (let j = 0; j <= n; j++) dp[0][j] = j;
	for (let i = 1; i <= m; i++) {
		for (let j = 1; j <= n; j++) {
			const cost = a[i - 1] === b[j - 1] ? 0 : 1;
			dp[i][j] = Math.min(
				dp[i - 1][j] + 1,
				dp[i][j - 1] + 1,
				dp[i - 1][j - 1] + cost,
			);
		}
	}
	return dp[m][n];
}

export function scoreDemoAnswer(
	userAnswer: string,
	correctAnswer: string,
): { tier: Tier; points: number } {
	const norm = (s: string) =>
		s
			.toLowerCase()
			.trim()
			.replace(/[^a-z0-9\s]/g, "")
			.replace(/\s+/g, " ");
	const u = norm(userAnswer);
	const c = norm(correctAnswer);
	if (!u) return { tier: "wrong", points: 0 };
	if (u === c) return { tier: "perfect", points: 50 };
	const uWords = u.split(" ");
	const cWords = c.split(" ");

	// Typo threshold: max Levenshtein allowed for a word pair, scaled by the
	// shorter word's length. 1 char off for 3-letter word is fine (e.g. "mse"
	// vs "messi" — but lengths differ too, so still rejected). 1 char off for
	// 7-letter word is far too generous (random typing like "asdnsja" vs
	// "ronaldo" should not count as a typo). Policy: typo only if the word
	// has at least 70% character overlap with the expected word and the
	// absolute distance is small.
	const isWordTypo = (uw: string, cw: string): boolean => {
		if (uw.length < 3 || cw.length < 3) {
			// For short tokens, require exact match (no per-char typo).
			return uw === cw;
		}
		const longest = Math.max(uw.length, cw.length);
		const dist = levenshtein(uw, cw);
		if (dist > 2) return false;
		if (dist === 0) return true;
		// Require at least 70% overlap and ≤ 2 edits.
		const overlap = Math.min(uw.length, cw.length) / longest;
		return overlap >= 0.7;
	};
	const allTypo =
		cWords.length > 0 &&
		uWords.length === cWords.length &&
		cWords.every((cw) => uWords.some((uw) => isWordTypo(uw, cw)));
	if (allTypo) return { tier: "typo", points: 20 };

	// Partial: at least one expected word appears verbatim in the answer.
	const partialMatch = cWords.some((cw) => uWords.includes(cw));
	if (partialMatch) return { tier: "partial", points: 45 };

	return { tier: "wrong", points: 0 };
}

export function scoreDemoInitials(
	userAnswer: string,
	expectedInitials: string,
): { tier: Tier; points: number } {
	return scoreGameplayAnswer(userAnswer, expectedInitials);
}

export function scoreGameplayAnswer(
	userAnswer: string,
	expectedInitials: string,
): { tier: Tier; points: number } {
	const norm = (s: string) =>
		s
			.toLowerCase()
			.trim()
			.replace(/[^a-z0-9\s]/g, "")
			.replace(/\s+/g, " ");
	const u = norm(userAnswer);
	const e = norm(expectedInitials);
	if (!u) return { tier: "wrong", points: 0 };
	const words = u.split(" ").filter(Boolean);
	const expected = e.replace(/\s/g, "").toUpperCase();
	const expectedLetters = expected.split("");
	// If user typed a single short token (e.g. "FC", "xh"), treat each
	// character as a separate initial — that's how initials are typically
	// written without spaces. Otherwise, take the first letter of each word
	// (user typed the full name like "Fabio Cannavaro").
	const initials =
		words.length === 1 && words[0].length <= expectedLetters.length + 1
			? [...words[0]].map((ch) => ch.toUpperCase()).join("")
			: words.map((w) => w[0]?.toUpperCase() ?? "").join("");
	const initialsLetters = initials.split("");

	if (initialsLetters.length === 0 || expectedLetters.length === 0) {
		return { tier: "wrong", points: 0 };
	}
	if (initials === expected) return { tier: "perfect", points: 50 };
	if (
		initialsLetters.length === expectedLetters.length &&
		[...initialsLetters].sort().join("") ===
			[...expectedLetters].sort().join("")
	) {
		return { tier: "perfect", points: 50 };
	}
	if (
		initialsLetters.length > expectedLetters.length + 1 ||
		initialsLetters.length < expectedLetters.length - 1
	) {
		return { tier: "wrong", points: 0 };
	}
	const exactMatches = initialsLetters.filter((ch) =>
		expectedLetters.includes(ch),
	).length;
	// Partial: the user matched enough expected letters to be plausible.
	// For single-word inputs (e.g. "rivaldo"), a single-letter match is
	// reasonable. For multi-word inputs (e.g. "random input here"), require
	// every expected letter to be present.
	const isSingleWord = words.length === 1;
	const partialThreshold = isSingleWord
		? Math.max(1, Math.ceil(expectedLetters.length / 2))
		: expectedLetters.length;
	if (exactMatches >= partialThreshold) {
		return { tier: "partial", points: 45 };
	}
	const typoCount = initialsLetters.reduce(
		(acc, ch) =>
			acc +
			(expectedLetters.some((ew) => {
				if (ch.length === 1 && ew.length === 1) {
					return ch === ew;
				}
				return levenshtein(ch, ew) <= 1;
			})
				? 1
				: 0),
		0,
	);
	if (
		initialsLetters.length > expectedLetters.length + 1 ||
		typoCount < expectedLetters.length
	) {
		return { tier: "wrong", points: 0 };
	}
	if (typoCount === initialsLetters.length) {
		return { tier: "typo", points: 20 };
	}
	return { tier: "wrong", points: 0 };
}
