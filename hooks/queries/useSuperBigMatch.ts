"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "@/lib/api/client";
import { useAuthStore } from "@/stores/authStore";

export interface Phase {
	id: string;
	name: string;
	slug: string;
	order: number;
	is_active: boolean;
}

export interface Team {
	id: string;
	name: string;
	code: string;
	group: string;
	flag: string;
}

export interface TeamInfo {
	id: string;
	name: string;
	code: string;
	group: string;
	flag_url: string | null;
	logo_url: string | null;
	flag_emoji: string | null;
}

export interface Match {
	id: string;
	match_number: number;
	phase: { id: string; name: string; slug: string };
	home_team: TeamInfo;
	away_team: TeamInfo;
	match_date: string;
	kickoff_time: string;
	timezone: string;
	stadium: string;
	city: string;
	country: string;
	group: string;
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
		home_team: { name: string; flag?: string };
		away_team: { name: string; flag?: string };
		match_date: string;
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
	city?: string | null;
}

export interface PredictionSubmit {
	match_id: string;
	home_score_predicted: number;
	away_score_predicted: number;
}

const SBM_API_BASE = "/api/v1/super-big-match";

// ============= PUBLIC APIs =============

export function usePhases() {
	return useQuery({
		queryKey: ["super-big-match", "phases"],
		queryFn: async () => {
			const response = await apiClient.get(`${SBM_API_BASE}/phases`);
			return response.data;
		},
		staleTime: 60 * 60 * 1000,
	});
}

export function useTeams(grouped: boolean = true) {
	return useQuery({
		queryKey: ["super-big-match", "teams", { grouped }],
		queryFn: async () => {
			const response = await apiClient.get(`${SBM_API_BASE}/teams`, {
				params: { grouped },
			});
			return response.data;
		},
		staleTime: 60 * 60 * 1000,
	});
}

export function useMatches(filters: {
	phase?: string;
	group?: string;
	matchday?: number;
}) {
	return useQuery({
		queryKey: ["super-big-match", "matches", filters],
		queryFn: async () => {
			const response = await apiClient.get(`${SBM_API_BASE}/matches`, {
				params: filters,
			});
			return response.data;
		},
		staleTime: 30 * 1000,
	});
}

export function useLeaderboard() {
	return useQuery({
		queryKey: ["super-big-match", "leaderboard"],
		queryFn: async () => {
			const response = await apiClient.get(`${SBM_API_BASE}/leaderboard`);
			return response.data;
		},
		staleTime: 60 * 1000,
	});
}

// ============= PROTECTED APIs =============

export function useMyPredictions(phaseId?: string, upcomingOnly?: boolean) {
	const { accessToken } = useAuthStore();

	return useQuery({
		queryKey: ["super-big-match", "my-predictions", { phaseId, upcomingOnly }],
		queryFn: async () => {
			const response = await apiClient.get(`${SBM_API_BASE}/predictions`, {
				params: {
					...(phaseId && { phase_id: phaseId }),
					...(upcomingOnly && { upcoming_only: true }),
				},
				headers: { Authorization: `Bearer ${accessToken}` },
			});
			return Array.isArray(response.data) ? { data: response.data } : response.data;
		},
		enabled: !!accessToken,
		staleTime: 0,
	});
}

export function useMatchesWithPrediction(filters: {
	phase?: string;
	group?: string;
}) {
	const { accessToken } = useAuthStore();

	return useQuery({
		queryKey: ["super-big-match", "matches-with-prediction", filters],
		queryFn: async () => {
			const response = await apiClient.get(
				`${SBM_API_BASE}/matches-with-prediction`,
				{
					params: filters,
					headers: { Authorization: `Bearer ${accessToken}` },
				},
			);
			return response.data;
		},
		enabled: !!accessToken,
		staleTime: 10 * 1000,
	});
}

export function useMyRank() {
	const { accessToken } = useAuthStore();

	return useQuery({
		queryKey: ["super-big-match", "my-rank"],
		queryFn: async () => {
			const response = await apiClient.get(`${SBM_API_BASE}/me/rank`, {
				headers: { Authorization: `Bearer ${accessToken}` },
			});
			return response.data;
		},
		enabled: !!accessToken,
		staleTime: 30 * 1000,
	});
}

export function useMySummary() {
	const { accessToken } = useAuthStore();

	return useQuery({
		queryKey: ["super-big-match", "my-summary"],
		queryFn: async () => {
			const response = await apiClient.get(`${SBM_API_BASE}/me/summary`, {
				headers: { Authorization: `Bearer ${accessToken}` },
			});
			return response.data;
		},
		enabled: !!accessToken,
		staleTime: 30 * 1000,
	});
}

// ============= MUTATIONS =============

export function useSubmitPrediction() {
	const queryClient = useQueryClient();
	const { accessToken } = useAuthStore();

	return useMutation({
		mutationFn: async (data: PredictionSubmit) => {
			const response = await apiClient.post(`${SBM_API_BASE}/predict`, data, {
				headers: { Authorization: `Bearer ${accessToken}` },
			});
			return response.data;
		},
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["super-big-match", "my-predictions"] });
			queryClient.invalidateQueries({ queryKey: ["super-big-match", "my-summary"] });
			queryClient.invalidateQueries({ queryKey: ["super-big-match", "my-rank"] });
			queryClient.invalidateQueries({ queryKey: ["super-big-match", "matches-with-prediction"] });
		},
	});
}

// ============= UTILITIES =============

export function formatMatchDate(
	matchDate: string,
	kickoffTime: string | null | undefined,
	timezone: string = "WIB",
): string {
	const date = new Date(matchDate);
	const dayNames = ["Min", "Sen", "Sel", "Rab", "Kam", "Jum", "Sab"];
	const monthNames = ["Jan", "Feb", "Mar", "Apr", "Mei", "Jun", "Jul", "Agu", "Sep", "Okt", "Nov", "Des"];

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
