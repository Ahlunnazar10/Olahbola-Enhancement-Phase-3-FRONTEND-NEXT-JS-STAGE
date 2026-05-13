'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/lib/api/client';
import { endpoints } from '@/lib/api/endpoints';
import type { ApiResponse, Quiz, QuizQuestion, QuizSummary } from '@/types';

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
