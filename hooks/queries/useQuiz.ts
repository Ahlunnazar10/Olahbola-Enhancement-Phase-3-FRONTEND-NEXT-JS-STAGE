'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/lib/api/client';
import { endpoints } from '@/lib/api/endpoints';
import type { ApiResponse, Quiz, QuizQuestion, QuizSummary, QuizWorldCupSession, QuizWorldCupPlay, QuizWorldCupAnswerResult, QuizWorldCupFinishResult, QuizWorldCupState, QuizWorldCupLeaderboardEntry, QuizWorldCupMyRank, QuizWorldCupSessionLeaderboardEntry, QuizWorldCupSessionMyRank } from '@/types';

// Get quiz summary
export function useQuizSummary() {
  return useQuery({
    queryKey: ['quiz-summary'],
    queryFn: async () => {
      const response = await apiClient.get('/api/v1/quiz/user-summary');
      return response.data.data as QuizSummary;
    },
    staleTime: 5 * 60 * 1000,
  });
}

// Get quiz world cup sessions by event slug
export function useQuizWorldCupSessions(eventSlug: string) {
  return useQuery({
    queryKey: ['quiz-world-cup-sessions', eventSlug],
    queryFn: async () => {
      const response = await apiClient.get<ApiResponse<QuizWorldCupSession[]>>(
        endpoints.quizWorldCupSessions(eventSlug)
      );
      return response.data.data;
    },
    enabled: !!eventSlug,
    staleTime: 60 * 1000,
  });
}

// Get available levels
export function useQuizLevels() {
  return useQuery({
    queryKey: ['quiz-levels'],
    queryFn: async () => {
      const response = await apiClient.get('/api/v1/quiz/levels');
      return response.data.data;
    },
    staleTime: 5 * 60 * 1000,
  });
}

// Start quiz
export function useStartQuiz() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (level: number) => {
      const response = await apiClient.post<ApiResponse<Quiz>>(endpoints.quizStart(level));
      return response.data.data;
    },
    onSuccess: (data) => {
      queryClient.setQueryData(['current-quiz'], data);
    },
  });
}

// Get quiz questions
export function useQuizQuestions(level: number) {
  return useQuery({
    queryKey: ['quiz-questions', level],
    queryFn: async () => {
      const response = await apiClient.get<ApiResponse<QuizQuestion[]>>(endpoints.quizQuestions(level));
      return response.data.data;
    },
    staleTime: 60 * 1000,
  });
}

// Submit answer
export function useSubmitQuizAnswer() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: { quiz_id: string; question_id: string; answer: number }) => {
      const response = await apiClient.post<ApiResponse<{ correct: boolean; explanation?: string }>>(
        endpoints.quizSubmitAnswer,
        data
      );
      return response.data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['current-quiz'] });
    },
  });
}

// Complete quiz
export function useCompleteQuiz() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (quizId: string) => {
      const response = await apiClient.post<ApiResponse<{ score: number; points_earned: number }>>(
        endpoints.quizComplete,
        { quiz_id: quizId }
      );
      return response.data.data;
    },
    onSettled: () => {
      queryClient.removeQueries({ queryKey: ['current-quiz'] });
      queryClient.invalidateQueries({ queryKey: ['quiz-summary'] });
      queryClient.invalidateQueries({ queryKey: ['leaderboard'] });
    },
  });
}

// Image Quiz Start
export function useStartImageQuiz() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (level: number) => {
      const response = await apiClient.post<ApiResponse<Quiz>>(endpoints.imageQuizStart(level));
      return response.data.data;
    },
    onSuccess: (data) => {
      queryClient.setQueryData(['current-image-quiz'], data);
    },
  });
}

// Get image quiz questions
export function useImageQuizQuestions(level: number) {
  return useQuery({
    queryKey: ['image-quiz-questions', level],
    queryFn: async () => {
      const response = await apiClient.get<ApiResponse<QuizQuestion[]>>(endpoints.imageQuizQuestions(level));
      return response.data.data;
    },
  });
}

// Submit image quiz answer
export function useSubmitImageQuizAnswer() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: { quiz_id: string; question_id: string; answer: number }) => {
      const response = await apiClient.post<ApiResponse<{ correct: boolean; explanation?: string }>>(
        endpoints.imageQuizSubmitAnswer,
        data
      );
      return response.data.data;
    },
  });
}

// Complete image quiz
export function useCompleteImageQuiz() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (quizId: string) => {
      const response = await apiClient.post<ApiResponse<{ score: number; points_earned: number }>>(
        endpoints.imageQuizComplete,
        { quiz_id: quizId }
      );
      return response.data.data;
    },
    onSettled: () => {
      queryClient.removeQueries({ queryKey: ['current-image-quiz'] });
      queryClient.invalidateQueries({ queryKey: ['quiz-summary'] });
      queryClient.invalidateQueries({ queryKey: ['leaderboard'] });
    },
  });
}

// ============================================
// Quiz World Cup - Sessions
// ============================================

// Get all sessions for a World Cup event
export function useQuizSessions(eventSlug: string = "world-cup-2026") {
  return useQuery({
    queryKey: ['wc-sessions', eventSlug],
    queryFn: async () => {
      const response = await apiClient.get<ApiResponse<QuizWorldCupSession[]>>(
        endpoints.quizWorldCupSessions(eventSlug)
      );
      return response.data.data;
    },
    staleTime: 60 * 1000,
  });
}

// Get current session state (resume or null)
export function useSessionState(sessionId: string) {
  return useQuery({
    queryKey: ['wc-session-state', sessionId],
    queryFn: async () => {
      try {
        const response = await apiClient.get<ApiResponse<QuizWorldCupState>>(
          endpoints.quizWorldCupState(sessionId)
        );
        return response.data.data;
      } catch (err: unknown) {
        const status = (err as { response?: { status?: number } })?.response?.status;
        if (status === 404 || status === 401) {
          return null;
        }
        throw err;
      }
    },
    enabled: !!sessionId,
    staleTime: 30 * 1000,
  });
}

// Start a session
export function useStartSession() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (sessionId: string) => {
      const response = await apiClient.post<ApiResponse<QuizWorldCupPlay>>(
        endpoints.quizWorldCupPlay(sessionId)
      );
      return response.data.data;
    },
    onSuccess: (data, sessionId) => {
      queryClient.setQueryData(['wc-session-state', sessionId], {
        session_id: data.session_id,
        attempt_id: data.attempt_id,
        status: 'in_progress',
        current_index: 0,
        score: 0,
        correct_count: 0,
        total_questions: data.questions.length,
        remaining_seconds: data.duration_seconds,
        finished: false,
      });
    },
  });
}

// Submit an answer
export function useSubmitAnswer() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (payload: {
      sessionId: string;
      attemptId: string;
      questionId: string;
      answer: number;
    }) => {
      const response = await apiClient.post<ApiResponse<QuizWorldCupAnswerResult>>(
        endpoints.quizWorldCupAnswer(payload.attemptId),
        {
          question_id: payload.questionId,
          selected_option: payload.answer,
        }
      );
      return response.data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['wc-session-state'] });
    },
  });
}

// ============================================
// Quiz World Cup - Global Leaderboard
// ============================================

export function useQuizGlobalLeaderboard(eventSlug: string = "world-cup-2026") {
  return useQuery({
    queryKey: ['wc-global-leaderboard', eventSlug],
    queryFn: async () => {
      const response = await apiClient.get<ApiResponse<QuizWorldCupLeaderboardEntry[]>>(
        endpoints.quizWorldCupGlobalLeaderboard(eventSlug)
      );
      return response.data.data;
    },
    enabled: !!eventSlug,
    staleTime: 60 * 1000,
  });
}

export function useQuizMyGlobalRank(eventSlug: string = "world-cup-2026") {
  return useQuery({
    queryKey: ['wc-my-global-rank', eventSlug],
    queryFn: async () => {
      const response = await apiClient.get<ApiResponse<QuizWorldCupMyRank>>(
        endpoints.quizWorldCupMyRank(eventSlug)
      );
      return response.data.data;
    },
    enabled: !!eventSlug,
    staleTime: 30 * 1000,
  });
}

// ============================================
// Quiz World Cup - Session Leaderboard
// ============================================

export function useQuizSessionLeaderboard(sessionId: string, eventSlug: string = "world-cup-2026") {
  return useQuery({
    queryKey: ['wc-session-leaderboard', sessionId],
    queryFn: async () => {
      const response = await apiClient.get<ApiResponse<QuizWorldCupSessionLeaderboardEntry[]>>(
        endpoints.quizWorldCupSessionLeaderboard(sessionId, eventSlug)
      );
      return response.data.data;
    },
    enabled: !!sessionId,
    staleTime: 15 * 1000,
  });
}

export function useQuizMySessionRank(sessionId: string, eventSlug: string = "world-cup-2026") {
  return useQuery({
    queryKey: ['wc-my-session-rank', sessionId],
    queryFn: async () => {
      const response = await apiClient.get<ApiResponse<QuizWorldCupSessionMyRank>>(
        endpoints.quizWorldCupMySessionRank(sessionId, eventSlug)
      );
      return response.data.data;
    },
    enabled: !!sessionId,
    staleTime: 15 * 1000,
  });
}
