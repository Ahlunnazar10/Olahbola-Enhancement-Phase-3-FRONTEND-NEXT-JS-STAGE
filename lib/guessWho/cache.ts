import type { GuessWhoQuestion } from "@/types";

export const QUESTIONS_CACHE_KEY = "ola_guesswho_questions_cache";

export interface QuestionCacheEntry {
  question_id: string;
  image_url: string;
  description: string;
  jersey_number: number | null;
  clues_used: number;
  clue_initials: string;
  correct_answer: string;
}

export interface GuessWhoQuestionCache {
  session_id: string;
  level: number;
  questions: QuestionCacheEntry[];
  duration_seconds: number;
  total_questions: number;
  clues_allowed: number;
  stored_at: number;
}

export function normalizeAnswer(answer: string): string {
  return answer
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s]/g, "")
    .replace(/\s+/g, " ");
}

export function saveQuestionCache(data: GuessWhoQuestionCache): void {
  try {
    sessionStorage.setItem(QUESTIONS_CACHE_KEY, JSON.stringify(data));
  } catch {}
}

export function loadQuestionCache(
  sessionId?: string,
): GuessWhoQuestionCache | null {
  try {
    const raw = sessionStorage.getItem(QUESTIONS_CACHE_KEY);
    if (!raw) return null;
    const cache = JSON.parse(raw) as GuessWhoQuestionCache;
    if (sessionId && cache.session_id !== sessionId) return null;
    return cache;
  } catch {
    return null;
  }
}

export function clearQuestionCache(): void {
  try {
    sessionStorage.removeItem(QUESTIONS_CACHE_KEY);
  } catch {}
}

export function buildCacheFromQuestions(
  sessionId: string,
  level: number,
  durationSeconds: number,
  totalQuestions: number,
  cluesAllowed: number,
  questions: GuessWhoQuestion[],
): GuessWhoQuestionCache {
  return {
    session_id: sessionId,
    level,
    duration_seconds: durationSeconds,
    total_questions: totalQuestions,
    clues_allowed: cluesAllowed,
    stored_at: Date.now(),
    questions: questions.map((q) => ({
      question_id: q.question_id,
      image_url: q.image_url,
      description: q.description,
      jersey_number: q.jersey_number,
      clues_used: q.clues_used,
      clue_initials: q.clue_initials ?? "",
      correct_answer: q.correct_answer ?? "",
    })),
  };
}
