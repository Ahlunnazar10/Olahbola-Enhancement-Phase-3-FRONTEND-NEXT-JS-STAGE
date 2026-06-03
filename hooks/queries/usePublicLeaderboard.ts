"use client";

import { useQuery } from "@tanstack/react-query";

export interface PublicLeaderboardEntry {
	rank: number;
	user_id: string;
	user_name: string;
	profile_picture: string | null;
	total_points: number;
	total_predictions: number;
	exact_scores: number;
}

const WC_PUBLIC_API = "http://127.0.0.1:8000/api/v1/world-cup";

async function fetchPublicLeaderboard(
	limit: number,
): Promise<PublicLeaderboardEntry[]> {
	const res = await fetch(`${WC_PUBLIC_API}/leaderboard`, {
		method: "GET",
		headers: {
			"Content-Type": "application/json",
			Accept: "application/json",
		},
	});

	if (!res.ok) {
		throw new Error(`HTTP ${res.status} - ${res.statusText}`);
	}

	const json = await res.json();

	// API shape: { success: true, data: [...] }
	const data = Array.isArray(json?.data) ? json.data : json;

	if (!Array.isArray(data)) {
		console.warn(
			"[usePublicLeaderboard] Unexpected response shape, expected array:",
			json,
		);
		return [];
	}

	return data.slice(0, limit);
}

export function usePublicLeaderboard(limit = 10) {
	return useQuery({
		queryKey: ["public-leaderboard", limit],
		queryFn: () => fetchPublicLeaderboard(limit),
		staleTime: 60 * 1000,
		gcTime: 5 * 60 * 1000,
		retry: 1,
		refetchOnWindowFocus: false,
	});
}
