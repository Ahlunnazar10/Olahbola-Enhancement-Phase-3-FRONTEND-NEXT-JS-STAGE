'use client';

import { useQuery } from '@tanstack/react-query';
import { apiClient } from '@/lib/api/client';
import { endpoints } from '@/lib/api/endpoints';
import type { LeaderboardEntry, LeaderboardStats } from '@/types';

// Get combined leaderboard
export function useLeaderboard(page = 1, perPage = 20) {
  return useQuery({
    queryKey: ['leaderboard', page, perPage],
    queryFn: async () => {
      const response = await apiClient.get('/api/v1/leaderboard', {
        params: { page, per_page: perPage },
      });
      return response.data;
    },
    staleTime: 60 * 1000,
  });
}

// Get top leaderboard
export function useLeaderboardTop(limit = 10) {
  return useQuery({
    queryKey: ['leaderboard-top', limit],
    queryFn: async () => {
      const response = await apiClient.get('/api/v1/leaderboard/top', {
        params: { limit },
      });
      return response.data.data;
    },
    staleTime: 60 * 1000,
  });
}

// Get regular leaderboard
export function useLeaderboardRegular(page = 1, perPage = 20) {
  return useQuery({
    queryKey: ['leaderboard-regular', page, perPage],
    queryFn: async () => {
      const response = await apiClient.get('/api/v1/leaderboard/regular', {
        params: { page, per_page: perPage },
      });
      return response.data;
    },
    staleTime: 60 * 1000,
  });
}

// Get season leaderboard
export function useLeaderboardSeason(page = 1, perPage = 20) {
  return useQuery({
    queryKey: ['leaderboard-season', page, perPage],
    queryFn: async () => {
      const response = await apiClient.get('/api/v1/leaderboard/season', {
        params: { page, per_page: perPage },
      });
      return response.data;
    },
    staleTime: 60 * 1000,
  });
}

// Get leaderboard by level
export function useLeaderboardByLevel(level: number, page = 1, perPage = 20) {
  return useQuery({
    queryKey: ['leaderboard-level', level, page, perPage],
    queryFn: async () => {
      const response = await apiClient.get(endpoints.leaderboardByLevel(level), {
        params: { page, per_page: perPage },
      });
      return response.data;
    },
    staleTime: 60 * 1000,
  });
}

// Get my rank
export function useMyRank() {
  return useQuery({
    queryKey: ['leaderboard-me'],
    queryFn: async () => {
      const response = await apiClient.get(endpoints.leaderboardMe);
      return response.data.data;
    },
    staleTime: 30 * 1000,
  });
}

// Get leaderboard stats
export function useLeaderboardStats() {
  return useQuery({
    queryKey: ['leaderboard-stats'],
    queryFn: async () => {
      const response = await apiClient.get<{ data: LeaderboardStats }>(endpoints.leaderboardStats);
      return response.data.data;
    },
    staleTime: 60 * 1000,
  });
}

// Image Quiz Leaderboard
export function useImageQuizLeaderboard(page = 1, perPage = 20) {
  return useQuery({
    queryKey: ['leaderboard-image-quiz', page, perPage],
    queryFn: async () => {
      const response = await apiClient.get(endpoints.leaderboardImageQuiz, {
        params: { page, per_page: perPage },
      });
      return response.data;
    },
    staleTime: 60 * 1000,
  });
}

// Image Quiz Top Leaderboard
export function useImageQuizLeaderboardTop(limit = 10) {
  return useQuery({
    queryKey: ['leaderboard-image-quiz-top', limit],
    queryFn: async () => {
      const response = await apiClient.get(endpoints.leaderboardImageQuizTop, {
        params: { limit },
      });
      return response.data.data;
    },
    staleTime: 60 * 1000,
  });
}
