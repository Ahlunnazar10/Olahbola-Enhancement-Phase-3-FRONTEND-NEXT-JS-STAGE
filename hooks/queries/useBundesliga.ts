"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "@/lib/api/client";
import { useAuthStore } from "@/stores/authStore";

export interface Team {
	id: string;
	name: string;
	code: string;
	logo_url: string | null;
}

export interface TeamInfo {
	id: string;
	name: string;
	code: string;
	logo_url: string | null;
}

export interface Match {
	id: string;
	match_number: number;
	home_team: TeamInfo;
	away_team: TeamInfo;
	match_date: string;
	kickoff_time: string;
	timezone: string;
	matchday: number;
	home_score: number | null;
	away_score: number | null;
	formatted_score: string;
	result: "pending" | "home_win" | "away_win" | "draw";
	status: "scheduled" | "live" | "completed";
	is_locked: boolean;
	is_prediction_open: boolean;
	prediction_deadline: string;
}

export interface Prediction {
	id: string;
	match_id: string;
	match: {
		home_team: { name: string; code: string; logo_url?: string | null };
		away_team: { name: string; code: string; logo_url?: string | null };
		match_date: string;
		matchday?: number;
	};
	home_score_predicted: number;
	away_score_predicted: number;
	predicted_team: string;
	predicted_result_label: string;
	result_correct: boolean | null;
	score_exact: boolean | null;
	points_earned: number;
	status: "pending" | "calculated";
	is_editable: boolean;
	home_score_actual?: number;
	away_score_actual?: number;
	// matchday dipasang oleh client (dilihat dari cache matches)
	// karena API belum mengembalikan field ini
	matchday?: number;
}

export interface UserSummary {
	total_points: number;
	total_predictions: number;
	exact_scores: number;
	winner_correct: number;
	pending_predictions: number;
	accuracy: number;
	live_rank: number;
	total_participants: number;
}

export interface UserRank {
	rank: number;
	total_points: number;
	total_participants: number;
	user_name?: string;
}

export interface LeaderboardEntry {
	rank: number;
	user_id: string;
	user_name: string;
	profile_picture?: string | null;
	points: number;
	total_points: number;
	total_predictions: number;
	exact_scores: number;
}

export interface PredictionSubmit {
	match_id: string;
	home_score_predicted: number;
	away_score_predicted: number;
}

const BL_API_BASE = "/api/v1/bundesliga";

export function useMatchdays() {
	return useQuery({
		queryKey: ["bundesliga", "matchdays"],
		queryFn: async () => {
			const response = await apiClient.get(`${BL_API_BASE}/matches`);
			const matches: Match[] = Array.isArray(response.data)
				? response.data
				: response.data?.data ?? [];
			const days = [...new Set(matches.map((m) => m.matchday))].sort(
				(a, b) => a - b,
			);
			return days;
		},
		staleTime: 60 * 1000,
	});
}

export function useMatches(matchday: number) {
	return useQuery({
		queryKey: ["bundesliga", "matches", { matchday }],
		queryFn: async () => {
			const response = await apiClient.get(`${BL_API_BASE}/matches`, {
				params: { matchday },
			});
			const raw = Array.isArray(response.data)
				? response.data
				: response.data?.data ?? [];
			// Pasang matchday di tiap match supaya riwayat prediksi bisa
			// dikelompokkan per matchday tanpa lookup tambahan
			return raw.map((m: Match) => ({ ...m, matchday: m.matchday ?? matchday }));
		},
		enabled: matchday > 0,
		staleTime: 30 * 1000,
	});
}

export function useTeams() {
	return useQuery({
		queryKey: ["bundesliga", "teams"],
		queryFn: async () => {
			const response = await apiClient.get(`${BL_API_BASE}/teams`);
			const raw = Array.isArray(response.data)
				? response.data
				: response.data?.data ?? [];
			return raw;
		},
		staleTime: 60 * 60 * 1000,
	});
}

export function useLeaderboard() {
	return useQuery({
		queryKey: ["bundesliga", "leaderboard"],
		queryFn: async () => {
			const response = await apiClient.get(`${BL_API_BASE}/leaderboard`);
			const raw = Array.isArray(response.data)
				? response.data
				: response.data?.data ?? [];
			return raw;
		},
		staleTime: 60 * 1000,
	});
}

export function useMyPredictions() {
	const { accessToken } = useAuthStore();
	const queryClient = useQueryClient();

	return useQuery({
		queryKey: ["bundesliga", "my-predictions"],
		queryFn: async () => {
			const response = await apiClient.get(`${BL_API_BASE}/predictions`, {
				headers: { Authorization: `Bearer ${accessToken}` },
			});
			const raw = Array.isArray(response.data)
				? response.data
				: response.data?.data ?? [];
			// Pasang matchday di tiap prediksi: cari dari cache matches
			// yang sudah difetch (per matchday) supaya riwayat
			// per matchday bisa dibuat tanpa tambahan field dari API
			const matchesCache = queryClient.getQueriesData<Match[]>({
				queryKey: ["bundesliga", "matches"],
			});
			const allMatches: Match[] = [];
			for (const [, data] of matchesCache) {
				allMatches.push(...(data as Match[] | undefined ?? []));
			}
			const matchById = new Map(allMatches.map((m) => [m.id, m]));
			const data = (raw as Prediction[]).map((p) => {
				const m = matchById.get(p.match_id);
				const matchday =
					(p as unknown as { matchday?: number }).matchday ??
					m?.matchday;
				return matchday !== undefined ? { ...p, matchday } : p;
			});
			return { data };
		},
		enabled: !!accessToken,
		staleTime: 0,
	});
}

export function useMyRank() {
	const { accessToken } = useAuthStore();

	return useQuery({
		queryKey: ["bundesliga", "my-rank"],
		queryFn: async () => {
			const response = await apiClient.get(`${BL_API_BASE}/me/rank`, {
				headers: { Authorization: `Bearer ${accessToken}` },
			});
			const raw = response.data?.data ?? {};
			return typeof raw === "object" && !Array.isArray(raw) ? raw : {};
		},
		enabled: !!accessToken,
		staleTime: 30 * 1000,
	});
}

export function useMySummary() {
	const { accessToken } = useAuthStore();

	return useQuery({
		queryKey: ["bundesliga", "my-summary"],
		queryFn: async () => {
			const response = await apiClient.get(`${BL_API_BASE}/me/summary`, {
				headers: { Authorization: `Bearer ${accessToken}` },
			});
			const raw = response.data?.data ?? {};
			return typeof raw === "object" && !Array.isArray(raw) ? raw : {};
		},
		enabled: !!accessToken,
		staleTime: 30 * 1000,
	});
}

export function useSubmitPrediction() {
	const queryClient = useQueryClient();
	const { accessToken } = useAuthStore();

	return useMutation({
		mutationFn: async (data: PredictionSubmit) => {
			const response = await apiClient.post(`${BL_API_BASE}/predict`, data, {
				headers: { Authorization: `Bearer ${accessToken}` },
			});
			return response.data;
		},
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["bundesliga", "my-predictions"] });
			queryClient.invalidateQueries({ queryKey: ["bundesliga", "my-summary"] });
			queryClient.invalidateQueries({ queryKey: ["bundesliga", "my-rank"] });
		},
	});
}

export function formatMatchDate(
	matchDate: string,
	kickoffTime: string | null | undefined,
	timezone: string = "WIB",
): string {
	const date = new Date(matchDate);
	const dayNames = ["Min", "Sen", "Sel", "Rab", "Kam", "Jum", "Sab"];
	const monthNames = [
		"Jan", "Feb", "Mar", "Apr", "Mei", "Jun",
		"Jul", "Agu", "Sep", "Okt", "Nov", "Des",
	];

	const dayName = dayNames[date.getDay()];
	const day = date.getDate();
	const monthName = monthNames[date.getMonth()];
	const year = date.getFullYear();

	let timeFormatted: string;
	if (kickoffTime && typeof kickoffTime === "string" && kickoffTime.trim().length > 0) {
		timeFormatted = kickoffTime.trim();
	} else if (!isNaN(date.getTime())) {
		const wibHour = (date.getUTCHours() + 7) % 24;
		const wibMinute = date.getUTCMinutes();
		timeFormatted = `${String(wibHour).padStart(2, "0")}:${String(wibMinute).padStart(2, "0")}`;
	} else {
		timeFormatted = "--:--";
	}

	return `${dayName}, ${day} ${monthName} ${year} • ${timeFormatted} ${timezone}`;
}

function getTeamInitials(name: string): string {
	const words = name.trim().split(/\s+/);
	if (words.length === 1) return words[0].slice(0, 2).toUpperCase();
	return words.map((w) => w[0]).join("").slice(0, 2).toUpperCase();
}

export { getTeamInitials };
