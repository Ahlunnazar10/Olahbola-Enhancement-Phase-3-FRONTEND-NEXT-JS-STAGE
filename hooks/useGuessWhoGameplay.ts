"use client";

import { useEffect, useRef, useState } from "react";
import toast from "react-hot-toast";
import {
	useGuessWhoAnswer,
	useGuessWhoClue,
} from "@/hooks/queries/useGuessWho";
import type {
	GuessWhoAnswerResult,
	GuessWhoClueResponse,
	GuessWhoQuestion,
	GuessWhoSession,
} from "@/types";
import {
	EMPTY_BREAKDOWN,
	scoreGameplayAnswer,
	type Tier,
	type TierBreakdown,
} from "@/lib/guessWho/scoring";
import { saveSessionState } from "@/lib/guessWho/storage";

export interface ResumedSnapshot {
	questionIndex: number;
	currentScore: number;
	tierBreakdown: TierBreakdown;
	timer: number;
	cluesRemaining: number;
	currentQuestion: GuessWhoQuestion | null;
}

export function useGuessWhoGameplay(
	initialSession: GuessWhoSession,
	resumedSnapshot: ResumedSnapshot | null,
	onFinish: (score: number, breakdown: TierBreakdown, level: number) => void,
) {
	const [session, setSession] = useState<GuessWhoSession>(initialSession);
	const [questionIndex, setQuestionIndex] = useState(
		resumedSnapshot?.questionIndex ?? initialSession.current_question_index,
	);
	const [score, setScore] = useState(
		resumedSnapshot?.currentScore ?? initialSession.current_score,
	);
	const [breakdown, setBreakdown] = useState<TierBreakdown>(
		resumedSnapshot?.tierBreakdown ?? EMPTY_BREAKDOWN,
	);
	const [timer, setTimer] = useState(
		resumedSnapshot?.timer ?? initialSession.remaining_time_seconds,
	);
	const [cluesRemaining, setCluesRemaining] = useState(
		resumedSnapshot?.cluesRemaining ?? initialSession.clues_remaining,
	);
	const [revealedClue, setRevealedClue] = useState<string | null>(null);
	const [submitting, setSubmitting] = useState(false);
	const [answered, setAnswered] = useState(false);
	const [lastResult, setLastResult] = useState<GuessWhoAnswerResult | null>(
		null,
	);
	const questionHistory = useRef<Array<{ tier: string; correct: boolean }>>([]);

	const clueMutation = useGuessWhoClue();
	const submitMutation = useGuessWhoAnswer();
	const answeredRef = useRef(false);

	const currentQuestion =
		resumedSnapshot?.currentQuestion ?? session.questions[questionIndex];

	useEffect(() => {
		if (!currentQuestion) return;
		saveSessionState({
			session_id: session.session_id,
			level: session.level,
			level_name: session.level_name,
			questionIndex,
			currentScore: score,
			tierBreakdown: breakdown,
			timer,
			cluesRemaining,
			currentQuestion,
			durationSeconds: session.duration_seconds,
			savedAt: Date.now(),
		});
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [
		session.session_id,
		questionIndex,
		score,
		breakdown,
		timer,
		cluesRemaining,
		currentQuestion,
	]);

	useEffect(() => {
		answeredRef.current = false;
		setAnswered(false);
		setRevealedClue(null);
	}, [questionIndex]);

	useEffect(() => {
		if (timer <= 0) return;
		const id = setInterval(() => {
			setTimer((t) => {
				if (t <= 1) {
					clearInterval(id);
					if (!answeredRef.current) {
						finishWith(score, breakdown);
					}
					return 0;
				}
				return t - 1;
			});
		}, 1000);
		return () => clearInterval(id);
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [timer]);

	const finishWith = (finalScore: number, finalBreakdown: TierBreakdown) => {
		if (answeredRef.current) return;
		answeredRef.current = true;
		onFinish(finalScore, finalBreakdown, session.level);
	};

	const handleRequestClue = async () => {
		if (cluesRemaining <= 0 || revealedClue || submitting || answered) return;
		try {
			const res: GuessWhoClueResponse = await clueMutation.mutateAsync({
				sessionId: session.session_id,
				questionId: currentQuestion!.question_id,
			});
			setRevealedClue(res.initials || res.player_name_hint);
			setCluesRemaining(res.clues_remaining);
		} catch (err: unknown) {
			const msg =
				err && typeof err === "object" && "message" in err
					? (err as { message: string }).message
					: undefined;
			console.error("[handleRequestClue] error:", err);
			toast.error(msg || "Gagal ambil petunjuk");
		}
	};

	const handleSubmit = async (answer: string) => {
		if (!answer.trim() || submitting || answered) return;
		setSubmitting(true);
		try {
			const res = await submitMutation.mutateAsync({
				sessionId: session.session_id,
				answer: answer.trim(),
			});
			// Client-side scoring override
			const expectedInitials =
				currentQuestion?.clue_initials ||
				res.next_question?.clue_initials ||
				"";
			const clientScore = expectedInitials
				? scoreGameplayAnswer(answer, expectedInitials)
				: { tier: res.result.tier, points: res.result.points_earned };
			const overriddenResult: GuessWhoAnswerResult = {
				...res.result,
				tier: clientScore.tier as GuessWhoAnswerResult["tier"],
				points_earned: clientScore.points,
				total_score:
					res.session.current_score - res.result.points_earned + clientScore.points,
			};
			setLastResult(overriddenResult);
			setScore(overriddenResult.total_score);
			setBreakdown((b) => ({
				...b,
				[overriddenResult.tier]: b[overriddenResult.tier] + 1,
			}));
			questionHistory.current.push({ tier: overriddenResult.tier, correct: overriddenResult.correct ?? false });
			setAnswered(true);
			answeredRef.current = true;

			setTimeout(() => {
				if (res.next_question) {
					const nextQuestion: GuessWhoQuestion = {
						question_id: res.next_question.question_id,
						image_url: res.next_question.image_url,
						description: res.next_question.description,
						jersey_number: res.next_question.jersey_number,
						clues_used: res.next_question.clues_used,
						clue_initials: res.next_question.clue_initials,
					};
					setSession((prev) => ({
						...prev,
						questions: prev.questions.map((q, i) =>
							i === questionIndex + 1 ? nextQuestion : q,
						),
						remaining_time_seconds: Math.round(res.session.remaining_time_seconds),
					}));
					setQuestionIndex((i) => i + 1);
					setCluesRemaining(res.session.clues_remaining);
					setSubmitting(false);
				} else {
					const finalBreakdown: TierBreakdown = {
						...breakdown,
						[overriddenResult.tier]: (breakdown as TierBreakdown)[overriddenResult.tier] + 1,
					};
					setBreakdown(finalBreakdown);
					finishWith(overriddenResult.total_score, finalBreakdown);
				}
			}, 1500);
		} catch (err: unknown) {
			const msg =
				err && typeof err === "object" && "message" in err
					? (err as { message: string }).message
					: undefined;
			console.error("[handleSubmit] error:", err);
			toast.error(msg || "Gagal submit jawaban");
			setSubmitting(false);
		}
	};

	return {
		session,
		questionIndex,
		currentQuestion,
		score,
		breakdown,
		timer,
		cluesRemaining,
		revealedClue,
		submitting,
		answered,
		lastResult,
		handleRequestClue,
		handleSubmit,
		questionHistory,
	} as const;
}

export type { Tier };
