'use client';

import { useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiGuessWhoClient } from '@/lib/api/guessWhoClient';
import { endpoints } from '@/lib/api/endpoints';
import { useAuthStore } from '@/stores/authStore';
import type {
	ApiResponse,
	GuessWhoSession,
	GuessWhoAnswerResult,
	GuessWhoSessionSnapshot,
	GuessWhoClueResponse,
	GuessWhoSessionStatus,
	GuessWhoMyRank,
	GuessWhoLevelProgress,
	GuessWhoQuestion,
} from '@/types';

/* ================================================================== */
/*  Public (no auth)                                                  */
/* ================================================================== */

export function useGuessWhoConfig() {
	return useQuery({
		queryKey: ['guess-who', 'config'],
		queryFn: async () => {
			const res = await apiGuessWhoClient.get<{
				success: boolean;
				data: {
					game_name: string;
					levels: Array<{
						level: number;
						num_questions: number;
						countdown_seconds: number;
						clues_allowed: number;
					}>;
					demo_questions_count: number;
					scoring: {
						perfect: number;
						partial: number;
						typo: number;
						wrong: number;
					};
				};
			}>(endpoints.guessWhoConfig);
			const data = res.data.data ?? { game_name: "Gues Who", levels: [], demo_questions_count: 0, scoring: { perfect: 0, partial: 0, typo: 0, wrong: 0 }, };
			return {
				game_name: data.game_name,
				demo_questions_count: data.demo_questions_count,
				levels: data.levels.map((lvl) => ({
					id: lvl.level,
					level: lvl.level,
					name: `Level ${lvl.level}`,
					description: '',
					duration_seconds: lvl.countdown_seconds,
					max_clues: lvl.clues_allowed,
					questions_count: lvl.num_questions,
					// FE expects is_unlocked/best_score per user state, but config
					// endpoint tidak kirim itu (selalu tidak terkunci). Best score
					// per-level seharusnya di-fetch terpisah saat authenticated.
					is_unlocked: true,
					best_score: 0,
				})),
				scoring_tiers: [
					{ tier: 'perfect' as const, points: data.scoring.perfect, label: 'PERFECT' },
					{ tier: 'partial' as const, points: data.scoring.partial, label: 'PARTIAL' },
					{ tier: 'typo' as const, points: data.scoring.typo, label: 'TYPO' },
					{ tier: 'wrong' as const, points: data.scoring.wrong, label: 'WRONG' },
				],
				max_clues_per_level: data.levels[0]?.clues_allowed ?? 2,
			};
		},
		staleTime: 5 * 60 * 1000,
	});
}

export function useGuessWhoDemo() {
	return useQuery({
		queryKey: ['guess-who', 'demo'],
		queryFn: async () => {
			const res = await apiGuessWhoClient.get<{
				success: boolean;
				is_demo: boolean;
				session: unknown;
				questions: Array<{
					id: string;
					level: number;
					jersey_image_url: string;
					jersey_number: number | null;
					question: string;
					clue_initials: string;
					correct_answer?: string;
				}>;
				total_questions: number;
				message: string;
			}>(endpoints.guessWhoDemo);
			// Map Laravel fields → FE shape (jersey_image_url → image_url,
			// question → description, correct_answer → correct_answer).
			return (res.data.questions ?? []).map((q) => ({
				question_id: q.id,
				image_url: q.jersey_image_url,
				description: q.question,
				clue_initials: q.clue_initials,
				correct_answer: q.correct_answer ?? "",
				jersey_number: q.jersey_number,
			}));
		},
		staleTime: 0,
	});
}

export function useGuessWhoLeaderboard() {
	return useQuery({
		queryKey: ['guess-who', 'leaderboard'],
		queryFn: async () => {
			const res = await apiGuessWhoClient.get<{
				success: boolean;
				data: Array<{
					rank: number;
					user_id: string;
					username: string;
					avatar_url: string | null;
					total_score: number;
					total_duration_seconds: number;
					level_reached: number;
					correct_answers: number;
					total_questions: number;
					total_attempts: number;
					completed_at: string;
					status: string;
				}>;
				total: number;
			}>(endpoints.guessWhoLeaderboard);
			// Map Laravel fields → FE shape (avatar_url → profile_picture,
			// total_score → total_points, level_reached → level,
			// total_duration_seconds → duration_seconds, username → name).
			return (res.data.data ?? []).map((entry) => ({
				rank: entry.rank,
				user_id: entry.user_id,
				name: entry.username,
				profile_picture: entry.avatar_url,
				level: entry.level_reached,
				total_points: entry.total_score,
				duration_seconds: entry.total_duration_seconds,
				total_attempts: entry.total_attempts ?? 0,
				correct_answers: entry.correct_answers ?? 0,
			}));
		},
		staleTime: 60 * 1000,
	});
}

/* ================================================================== */
/*  Authenticated                                                     */
/* ================================================================== */

export function useGuessWhoStart() {
	const qc = useQueryClient();
	return useMutation({
		mutationFn: async (level: number) => {
			const res = await apiGuessWhoClient.post(endpoints.guessWhoStart(level));
			// Try Laravel response format: { success, session, questions }
			if (
				res.data &&
				res.data.success === true &&
				res.data.session &&
				res.data.questions
			) {
				const lapRes = res.data;
				const session: Omit<GuessWhoSession, 'questions'> = {
					session_id: lapRes.session.id,
					level: lapRes.session.level,
					level_name: `Level ${lapRes.session.level}`,
					duration_seconds: lapRes.session.countdown_seconds,
					total_questions: lapRes.session.total_questions,
					started_at: lapRes.session.started_at,
					expires_at: '',
					current_question_index: lapRes.session.current_question_index,
					current_score: lapRes.session.score,
					clues_remaining: lapRes.session.clues_remaining,
					remaining_time_seconds: lapRes.session.countdown_seconds,
					is_finished: false,
				};
				const started = new Date(session.started_at);
				started.setSeconds(started.getSeconds() + session.duration_seconds);
				session.expires_at = started.toISOString();
				const questions: GuessWhoQuestion[] = lapRes.questions.map((q: any) => ({
					question_id: q.id,
					image_url: q.jersey_image_url,
					description: q.question,
					jersey_number: q.jersey_number,
					clues_used: 0,
					clue_initials: q.clue_initials,
					correct_answer: q.correct_answer,
				}));
				return { ...session, questions } as GuessWhoSession;
			}
			// Fallback to envelope or direct response
			const payload = (res.data as any)?.data ?? res.data;
			return payload as GuessWhoSession;
		},
		onSuccess: (data) => {
			if (data && data.session_id) {
				qc.setQueryData(['guess-who', 'session', data.session_id], data);
			}
		},
	});
}

export interface GuessWhoNextQuestion {
	question_id: string;
	image_url: string;
	description: string;
	jersey_number: number | null;
	clues_used: number;
	clue_initials?: string;
}

export function useGuessWhoAnswer() {
	const qc = useQueryClient();
	return useMutation({
		mutationFn: async ({
			sessionId,
			answer,
		}: {
			sessionId: string;
			answer: string;
		}) => {
			const { accessToken } = useAuthStore.getState();
			const url = endpoints.guessWhoAnswer(sessionId);
			const res = await apiGuessWhoClient.post(
				url,
				{ answer },
				{ headers: { Authorization: `Bearer ${accessToken}` } }
			);
			if (res.data.success !== true) {
				const errMsg = res.data?.message || "Submit jawaban gagal";
				throw new Error(errMsg);
			}
			const data = res.data as {
				result: GuessWhoAnswerResult;
				session: GuessWhoSessionSnapshot;
				next_question: {
					id: string;
					level: number;
					jersey_image_url: string;
					jersey_number: number | null;
					question: string;
					clue_initials: string;
				} | null;
			};
			const mappedNextQuestion: GuessWhoNextQuestion | null = data.next_question
				? {
						question_id: data.next_question.id,
						image_url: data.next_question.jersey_image_url,
						description: data.next_question.question,
						jersey_number: data.next_question.jersey_number,
						clues_used: 0,
						clue_initials: data.next_question.clue_initials,
					}
				: null;
			return {
				result: data.result,
				session: data.session,
				next_question: mappedNextQuestion,
			};
		},
		onSuccess: (_, variables) => {
			qc.invalidateQueries({
				queryKey: ['guess-who', 'session', variables.sessionId],
			});
			qc.invalidateQueries({
				queryKey: ['guess-who', 'status', variables.sessionId],
			});
		},
	});
}

export function useGuessWhoClue() {
	return useMutation({
		mutationFn: async ({
			sessionId,
			questionId,
		}: {
			sessionId: string;
			questionId: string;
		}) => {
			const { accessToken } = useAuthStore.getState();
			const url = endpoints.guessWhoClue(sessionId, questionId);
			console.log("[useGuessWhoClue] request:", {
				url,
				tokenPreview: accessToken ? `${accessToken.slice(0, 20)}...` : null,
			});
			const res = await apiGuessWhoClient.post(
				url,
				{},
				{ headers: { Authorization: `Bearer ${accessToken}` } }
			);
			console.log("[useGuessWhoClue] response:", {
				status: res.status,
				success: res.data?.success,
				clue: res.data?.clue,
			});
			// Expect: { success: true, clue: { question_id, initials, player_name_hint, clues_remaining } }
			if (res.data.success !== true) {
				const errMsg = res.data?.message || "Ambil petunjuk gagal";
				console.error("[useGuessWhoClue] error from server:", errMsg);
				throw new Error(errMsg);
			}
			const clue = res.data.clue as GuessWhoClueResponse;
			return clue;
		},
	});
}

export function useGuessWhoRematch() {
	const qc = useQueryClient();
	return useMutation({
		mutationFn: async (level: number) => {
			const res = await apiGuessWhoClient.post<ApiResponse<GuessWhoSession>>(
				endpoints.guessWhoRematch(level)
			);
			return res.data.data;
		},
		onSuccess: (data) => {
			qc.removeQueries({
				queryKey: ['guess-who', 'session', data.session_id],
			});
			qc.setQueryData(['guess-who', 'session', data.session_id], data);
		},
	});
}

export function useGuessWhoSessionStatus(sessionId: string | null) {
	return useQuery({
		queryKey: ['guess-who', 'status', sessionId],
		queryFn: async () => {
			const { accessToken } = useAuthStore.getState();
			const res = await apiGuessWhoClient.get<ApiResponse<GuessWhoSessionStatus>>(
				endpoints.guessWhoStatus(sessionId!),
				{ headers: { Authorization: `Bearer ${accessToken}` } }
			);
			return res.data.data;
		},
		enabled: !!sessionId,
		staleTime: 30 * 1000,
	});
}

export function useGuessWhoMyRank() {
	const accessToken = useAuthStore((s) => s.accessToken);
	return useQuery({
		queryKey: ['guess-who', 'my-rank', accessToken],
		queryFn: async () => {
			const res = await apiGuessWhoClient.get<ApiResponse<GuessWhoMyRank>>(
				endpoints.guessWhoMyRank,
				{ headers: { Authorization: `Bearer ${accessToken}` } }
			);
			return res.data.data ?? { rank: null, total_points: 0, best_level: null, total_sessions: 0 };
		},
		enabled: !!accessToken,
		staleTime: 30 * 1000,
	});
}

export function useGuessWhoLevelProgress() {
	const accessToken = useAuthStore((s) => s.accessToken);
	return useQuery({
		queryKey: ['guess-who', 'level-progress', accessToken],
		queryFn: async () => {
			const res = await apiGuessWhoClient.get<ApiResponse<GuessWhoLevelProgress>>(
				endpoints.guessWhoLevelProgress,
				{ headers: { Authorization: `Bearer ${accessToken}` } }
			);
			return res.data.data ?? {
				highest_completed_level: 0,
				highest_unlocked_level: 1,
				max_level: 5,
				completed_levels: [],
				unlocked_levels: [1],
			};
		},
		enabled: !!accessToken,
		staleTime: 0,
		refetchOnMount: 'always',
		refetchOnWindowFocus: true,
	});
}

export function useGuessWhoAttemptCounts(): Record<number, number> {
	const accessToken = useAuthStore((s) => s.accessToken);
	const { data } = useQuery({
		queryKey: ['guess-who', 'my-sessions', accessToken],
		queryFn: async () => {
			const res = await apiGuessWhoClient.get<ApiResponse<GuessWhoSession[]>>(
				endpoints.guessWhoMySessions,
				{ headers: { Authorization: `Bearer ${accessToken}` } }
			);
			return res.data.data ?? [];
		},
		enabled: !!accessToken,
		staleTime: 30 * 1000,
	});
	return useMemo(() => {
		const counts: Record<number, number> = {};
		for (const s of data ?? []) {
			counts[s.level] = (counts[s.level] ?? 0) + 1;
		}
		return counts;
	}, [data]);
}