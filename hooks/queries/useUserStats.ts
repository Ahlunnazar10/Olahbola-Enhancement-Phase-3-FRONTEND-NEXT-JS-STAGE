"use client";

import { useQuery } from "@tanstack/react-query";
import { apiClient } from "@/lib/api/client";
import { useAuthStore } from "@/stores/authStore";

export interface EventStats {
  total_points: number;
  total_predictions: number;
  exact_scores: number;
  winner_correct: number;
  pending_predictions: number;
  accuracy: number;
  live_rank: number;
  total_participants: number;
  event_name: string;
}

export interface UserStats {
  totalPoints: number;
  totalPredictions: number;
  totalParticipation: number;
  bundesligaRank: number | null;
}

// List event yang punya endpoint me/summary
// label dipakai di modal partisipasi untuk menampilkan nama event
const EVENTS = [
  { name: "bundesliga", base: "/api/v1/bundesliga", label: "Bundesliga 2026/2027" },
  { name: "fifa-asean-cup", base: "/api/v1/fifa-asean-cup", label: "FIFA Asean Cup" },
  { name: "world-cup", base: "/api/v1/world-cup", label: "World Cup 2026" },
  { name: "teater-bola", base: "/api/v1/teater-bola", label: "Teater Bola Asean 2026" },
  { name: "super-big-match", base: "/api/v1/super-big-match", label: "Super Big Match" },
];

export function useUserStats() {
  const { accessToken, isAuthenticated } = useAuthStore();

  const query = useQuery({
    queryKey: ["user-stats", "aggregated"],
    queryFn: async () => {
      if (!accessToken) return null;

      const headers = { Authorization: `Bearer ${accessToken}` };
      const results: EventStats[] = [];

      // Fetch semua event secara parallel
      const settled = await Promise.allSettled(
        EVENTS.map(async (event) => {
          const res = await apiClient.get(
            `${event.base}/me/summary`,
            { headers }
          );
          const data = res.data?.data ?? {};
          return typeof data === "object" && !Array.isArray(data) ? data : {};
        })
      );

      // Aggregate: hanya hitung yang sukses
      EVENTS.forEach((event, i) => {
        const s = settled[i];
        if (s && s.status === "fulfilled" && s.value && Object.keys(s.value).length > 0) {
          results.push({
            ...(s.value as object),
            event_name: event.label,
          } as EventStats);
        }
      });

      const totalPoints = results.reduce((sum, e) => sum + (e.total_points ?? 0), 0);
      const totalPredictions = results.reduce((sum, e) => sum + (e.total_predictions ?? 0), 0);
      const totalParticipation = results.length; // jumlah event yang ada data

      return {
        totalPoints,
        totalPredictions,
        totalParticipation,
        results,
      };
    },
    enabled: isAuthenticated && !!accessToken,
    staleTime: 60 * 1000,
    retry: 1,
  });

  // Bundesliga rank khusus
  const rankQuery = useQuery({
    queryKey: ["bundesliga", "my-rank"],
    queryFn: async () => {
      const res = await apiClient.get(
        "/api/v1/bundesliga/me/rank",
        { headers: { Authorization: `Bearer ${accessToken}` } }
      );
      return res.data?.data ?? null;
    },
    enabled: isAuthenticated && !!accessToken,
    staleTime: 30 * 1000,
    retry: 1,
  });

  return {
    isLoading: query.isLoading,
    isError: query.isError,
    data: query.data,
    bundesligaRank: rankQuery.data,
  };
}
