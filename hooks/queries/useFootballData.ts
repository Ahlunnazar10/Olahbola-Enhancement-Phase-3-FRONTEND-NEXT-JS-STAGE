"use client";

import { useQuery } from "@tanstack/react-query";

// ---------------------------------------------------------------
// Tipe — berasal dari dokumentasi football-data.org v4
// ---------------------------------------------------------------

export interface FdTeam {
	id: number;
	name: string;
	shortName: string;
	tla?: string;
	crest: string;
}

export interface FdMatch {
	id: number;
	utcDate: string;
	status: string;
	group: string | null;
	stage: string | null;
	matchday: number | null;
	homeTeam: FdTeam;
	awayTeam: FdTeam;
	score: {
		winner?: "HOME_TEAM" | "AWAY_TEAM" | null;
		duration?: string;
		fullTime: { home: number | null; away: number | null };
		halfTime?: { home: number | null; away: number | null };
		penalty?: { home: number | null; away: number | null };
	};
}

export interface FdCompetition {
	id: number;
	name: string;
	code: string;
	type: string;
	emblem: string;
	currentSeason: { id: number; startDate: string; endDate: string; currentMatchday?: number };
}

export interface FdStandingsTable {
	position: number;
	team: FdTeam;
	playedGames: number;
	form: string;
	won: number;
	draw: number;
	lost: number;
	points: number;
	goalsFor: number;
	goalsAgainst: number;
	goalDifference: number;
}

export interface FdStandingsGroup {
	stage: string;
	type: string; // TOTAL | HOME | AWAY
	group: string | null;
	table: FdStandingsTable[];
}

export interface FdStandingsResponse {
	area: { id: number; name: string; code: string; flag: string };
	competition: FdCompetition;
	season: { id: number; startDate: string; endDate: string; currentMatchday?: number };
	standings: FdStandingsGroup[];
}

export interface FdMatchesResponse {
	competition: FdCompetition;
	resultSet?: { count: number; first?: string; last?: string; played?: number };
	matches: FdMatch[];
}

export const FD_COMPETITIONS = [
	{ code: "PL", label: "Premier League", slug: "primer-league", emblem: "/icons/competitions/epl.svg" },
	{ code: "PD", label: "La Liga", slug: "la-liga", emblem: "/icons/competitions/laliga.svg" },
	{ code: "BL1", label: "Bundesliga", slug: "bundesliga", emblem: "/icons/competitions/bundesliga.svg" },
	{ code: "SA", label: "Serie A", slug: "serie-a", emblem: "/icons/competitions/seriea.svg" },
	{ code: "FL1", label: "Ligue 1", slug: "ligue-1", emblem: "/icons/competitions/ligue1.svg" },
	{ code: "CL", label: "UEFA Champions League", slug: "uefa-champions-league", emblem: "/icons/competitions/ucl.svg" },
] as const;

export type FdCompetitionCode = (typeof FD_COMPETITIONS)[number]["code"];
export type FdCompetitionSlug = (typeof FD_COMPETITIONS)[number]["slug"];

/** Ambil competition code dari URL slug; null jika tidak dikenal. */
export function fdCodeFromSlug(slug: string): FdCompetitionCode | null {
	const found = FD_COMPETITIONS.find((c) => c.slug === slug);
	return found ? found.code : null;
}

/** Slug pertama (default) untuk redirect. */
export const FD_DEFAULT_SLUG: FdCompetitionSlug = FD_COMPETITIONS[0].slug;

// ---------------------------------------------------------------
// Fetch helper — lewat proxy Next.js (baseURL relatif), tidak pakai apiClient
// ---------------------------------------------------------------

const FD_BASE = "/api/football-data";

// retry dengan backoff untuk 429/5xx — server proxy sudah handle retry,
// tapi di sisi client tetap retry untuk robustness
async function fdFetch<T>(path: string, params?: Record<string, string | number>): Promise<T> {
	const qs = params
		? "?" + new URLSearchParams(Object.entries(params).map(([k, v]) => [k, String(v)])).toString()
		: "";

	const fetchOnce = async (): Promise<Response> => {
		const res = await fetch(`${FD_BASE}${path}${qs}`, {
			// proxy sudah punya server-side cache — browser revalidate via ETag
			cache: "no-store",
		});
		return res;
	};

	const MAX_RETRIES = 2;
	for (let attempt = 0; attempt <= MAX_RETRIES; attempt++) {
		const res = await fetchOnce();

		if (res.status === 429) {
			const retryAfter = Number(res.headers.get("Retry-After") ?? 45);
			const waitMs = Math.min(retryAfter, 120) * 1000;
			if (attempt < MAX_RETRIES) {
				await new Promise((r) => setTimeout(r, waitMs));
				continue;
			}
			// habis retries — angkat 429 agar React Query tahu
			const err = await res.json().catch(() => ({}));
			throw new Error(err.message ?? `Rate limit (429). Coba lagi dalam ${retryAfter}s`);
		}

		if (!res.ok && res.status >= 500 && attempt < MAX_RETRIES) {
			// 5xx — tunggu 5s lalu retry
			await new Promise((r) => setTimeout(r, 5000));
			continue;
		}

		if (!res.ok) {
			const err = await res.json().catch(() => ({}));
			throw new Error(err.message ?? `football-data ${res.status}`);
		}

		return (await res.json()) as T;
	}

	// unreachable
	throw new Error("fdFetch: max retries exhausted");
}

// ---------------------------------------------------------------
// Hooks
// ---------------------------------------------------------------

export function useFdStandings(competition: FdCompetitionCode, season?: number) {
	return useQuery({
		queryKey: ["football-data", "standings", competition, season ?? "current"],
		queryFn: () =>
			fdFetch<FdStandingsResponse>(
				`/competitions/${competition}/standings`,
				season ? { season } : undefined,
			),
		// standings tidak berubah tiap menit — 5 menit staleTime aman
		staleTime: 5 * 60 * 1000,
		// retry 3x saat rate limit / 5xx
		retry: 3,
		enabled: !!competition,
	});
}

export function useFdMatches(
	competition: FdCompetitionCode,
	params?: { season?: number; matchday?: number; dateFrom?: string; dateTo?: string },
) {
	return useQuery({
		queryKey: [
			"football-data",
			"matches",
			competition,
			{
				season: params?.season ?? "current",
				matchday: params?.matchday ?? null,
				dateFrom: params?.dateFrom ?? null,
				dateTo: params?.dateTo ?? null,
			},
		],
		queryFn: () =>
			fdFetch<FdMatchesResponse>(`/competitions/${competition}/matches`, {
				...(params?.season ? { season: params.season } : {}),
				...(params?.matchday != null ? { matchday: params.matchday } : {}),
				...(params?.dateFrom ? { dateFrom: params.dateFrom } : {}),
				...(params?.dateTo ? { dateTo: params.dateTo } : {}),
			}),
		// jadwal & skor delayed 10 menit di Free — 5 menit staleTime hemat request
		staleTime: 5 * 60 * 1000,
		// retry 3x saat rate limit / 5xx
		retry: 3,
		enabled: !!competition,
	});
}
