"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import type { AxiosError } from "axios";
import { useQuery } from "@tanstack/react-query";
import { ArrowLeft, Clock, Lightbulb, Lock, Send } from "lucide-react";
import { apiGuessWhoClient } from "@/lib/api/guessWhoClient";
import { endpoints } from "@/lib/api/endpoints";
import { LoadingOverlay } from "@/components/guess-who/shared/LoadingOverlay";
import {
	formatTime,
	EMPTY_BREAKDOWN,
	type TierBreakdown,
} from "@/lib/guessWho/scoring";
import { saveSessionState } from "@/lib/guessWho/storage";
import type {
	GuessWhoAnswerResult,
	GuessWhoClueResponse,
	GuessWhoQuestion,
} from "@/types";
import { JerseyDisplay } from "@/components/guess-who/shared/JerseyDisplay";
import { CircularTimer } from "@/components/guess-who/shared/CircularTimer";
import { TierBadge } from "@/components/guess-who/shared/TierBadge";
import { useGuessWhoSound } from "@/hooks/useGuessWhoSound";

type SessionData = {
	session_id: string;
	level: number;
	level_name: string;
	duration_seconds: number;
	total_questions: number;
	current_question_index: number;
	current_score: number;
	clues_remaining: number;
	remaining_time_seconds: number;
	is_finished: boolean;
	questions: GuessWhoQuestion[];
};

function mapSession(res: any): SessionData {
	const raw = res.data ?? res;
	const s = raw.session ?? raw;
	const questions: GuessWhoQuestion[] = (raw.questions ?? []).map((q: any) => ({
		question_id: q.id || q.question_id || q.questionId || "",
		image_url: q.jersey_image_url || q.image_url || "",
		description: q.question || q.description || "",
		jersey_number: q.jersey_number ?? null,
		clues_used: 0,
	}));
	return {
		session_id: s.id || s.session_id || "",
		level: s.level || 1,
		level_name: s.level_name || `Level ${s.level || 1}`,
		duration_seconds: s.countdown_seconds || s.duration_seconds || 60,
		total_questions: s.total_questions || 5,
		current_question_index: s.current_question_index || 0,
		current_score: s.score !== undefined ? s.score : s.current_score || 0,
		clues_remaining: s.clues_remaining || 2,
		remaining_time_seconds:
			s.countdown_seconds || s.remaining_time_seconds || 60,
		is_finished: s.is_finished || false,
		questions,
	};
}

export default function GuessWhoPlayPage({
	params,
}: {
	params: { sessionId: string } | Promise<{ sessionId: string }>;
}) {
	const [sessionId, setSessionId] = useState<string | null>(null);

	useEffect(() => {
		if (sessionId !== null) return;
		Promise.resolve(params).then((p) => setSessionId(p.sessionId));
	}, [params, sessionId]);

	const router = useRouter();
	const handleExit = () => router.push("/guess-who");

	const handleFinish = (
		score: number,
		breakdown: TierBreakdown,
		level: number,
	) => {
		const qs = new URLSearchParams({
			level: String(level),
			score: String(score),
			breakdown: JSON.stringify(breakdown),
		});
		router.push(`/guess-who/play/${sessionId}/result?${qs}`);
	};

	if (sessionId === null) {
		return <LoadingOverlay message="Memuat sesi permainan..." />;
	}

	return (
		<PlayGame
			sessionId={sessionId}
			onExit={handleExit}
			onFinish={handleFinish}
		/>
	);
}

function PlayGame({
	sessionId,
	onExit,
	onFinish,
}: {
	sessionId: string;
	onExit: () => void;
	onFinish: (score: number, breakdown: TierBreakdown, level: number) => void;
}) {
	const [questionIndex, setQuestionIndex] = useState(0);
	const [score, setScore] = useState(0);
	const [breakdown, setBreakdown] = useState<TierBreakdown>(EMPTY_BREAKDOWN);
	const [timer, setTimer] = useState(0);
	const [cluesRemaining, setCluesRemaining] = useState(2);
	const [revealedClue, setRevealedClue] = useState<string | null>(null);
	const [submitting, setSubmitting] = useState(false);
	const [answered, setAnswered] = useState(false);
	const [lastResult, setLastResult] = useState<GuessWhoAnswerResult | null>(
		null,
	);
	const [currentQuestion, setCurrentQuestion] =
		useState<GuessWhoQuestion | null>(null);
	const [level, setLevel] = useState(1);
	const [totalQuestions, setTotalQuestions] = useState(5);
	const [allQuestions, setAllQuestions] = useState<GuessWhoQuestion[]>([]);

	// Anchor-based absolute timer
	const timerAnchorMsRef = useRef(0);
	const totalDurationSRef = useRef(0);
	const finishedRef = useRef(false);
	const scoreRef = useRef(0);
	const breakdownRef = useRef<TierBreakdown>(EMPTY_BREAKDOWN);
	const levelRef = useRef(1);
	const anchorInitializedRef = useRef(false);

	const answeredRef = useRef(false);
	const submittingRef = useRef(false);
	const pendingAnswerRef = useRef(false);
	const answerHistoryRef = useRef<
		Array<{ tier: string; correct: boolean }>
	>([]);
	const countdownSfxPlayedRef = useRef(false);

	const { playBacksound, stopBacksound, playSFX } = useGuessWhoSound();

	useEffect(() => { scoreRef.current = score; }, [score]);
	useEffect(() => { breakdownRef.current = breakdown; }, [breakdown]);
	useEffect(() => { levelRef.current = level; }, [level]);

	// Play backsound ONCE when currentQuestion becomes available.
	// Triggered on session load AND on subsequent question loads.
	useEffect(() => {
		if (!currentQuestion || !session) return;
		const key = level % 2 === 0 ? "backsound-2" : "backsound-1";
		playBacksound(key);
		countdownSfxPlayedRef.current = false;
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [currentQuestion?.question_id]);

	// Stop backsound on unmount
	useEffect(() => {
		return () => stopBacksound();
	}, []);

	const {
		data: session,
		isLoading: sessionLoading,
		error: sessionError,
	} = useQuery({
		queryKey: ["guess-who", "session", sessionId],
		queryFn: async () => {
			const res = await apiGuessWhoClient.get(
				endpoints.guessWhoResume(sessionId),
			);
			if (!res.data?.success)
				throw new Error(res.data?.message ?? "Session tidak ditemukan");
			return mapSession(res);
		},
		enabled: !!sessionId,
		staleTime: 0,
		refetchOnMount: "always",
		refetchOnWindowFocus: false,
		retry: 1,
	});

	// Populate state when session data arrives (only when session_id actually changes)
	useEffect(() => {
		if (!session) return;
		const remaining = session.remaining_time_seconds;
		const duration = session.duration_seconds;
		if (!anchorInitializedRef.current) {
			timerAnchorMsRef.current = Date.now();
			totalDurationSRef.current = remaining;
			anchorInitializedRef.current = true;
		}
		setScore(session.current_score);
		setCluesRemaining(session.clues_remaining);
		setLevel(session.level);
		setTotalQuestions(session.total_questions);
		setAllQuestions(session.questions);
		const idx = Math.min(
			session.current_question_index,
			session.questions.length - 1,
		);
		setCurrentQuestion(session.questions[idx] ?? null);
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [session?.session_id]);

	// Timer
	useEffect(() => {
		const id = setInterval(() => {
			if (finishedRef.current) return;
			const elapsed = Math.floor(
				(Date.now() - timerAnchorMsRef.current) / 1000,
			);
			const remaining = Math.max(0, totalDurationSRef.current - elapsed);
			setTimer(remaining);
			if (remaining <= 0) {
				finishedRef.current = true;
				onFinish(scoreRef.current, breakdownRef.current, levelRef.current);
			}
			// Countdown SFX (play once when timer hits 10)
			if (
				!countdownSfxPlayedRef.current &&
				remaining <= 10 &&
				remaining > 0 &&
				currentQuestion
			) {
				countdownSfxPlayedRef.current = true;
				playSFX("buruan-udah-mau-abis");
			}
		}, 250);
		return () => clearInterval(id);
	}, [currentQuestion, playSFX]);

	// Reset per-question
	useEffect(() => {
		answeredRef.current = false;
		submittingRef.current = false;
		pendingAnswerRef.current = false;
		setAnswered(false);
		setSubmitting(false);
		setRevealedClue(null);
		setLastResult(null);
	}, [questionIndex]);

	// Persist
	useEffect(() => {
		if (!currentQuestion || !session) return;
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
		session?.session_id,
		currentQuestion,
		questionIndex,
		score,
		breakdown,
		timer,
		cluesRemaining,
	]);

	const handleSubmit = async (answer: string) => {
		if (
			!answer.trim() ||
			submittingRef.current ||
			answeredRef.current ||
			finishedRef.current
		)
			return;
		submittingRef.current = true;
		pendingAnswerRef.current = true;
		setSubmitting(true);
		try {
			const res = await apiGuessWhoClient.post(
				endpoints.guessWhoAnswer(sessionId),
				{ answer },
			);
			if (!res.data?.success)
				throw new Error(res.data?.message ?? "Submit gagal");
			const data = res.data as {
				result: GuessWhoAnswerResult;
				session: any;
				next_question: {
					id: string;
					jersey_image_url: string;
					question: string;
					jersey_number: number | null;
					clue_initials?: string;
				} | null;
			};
			const mappedNextQuestion: GuessWhoQuestion | null = data.next_question
				? {
						question_id: data.next_question.id,
						image_url: data.next_question.jersey_image_url,
						description: data.next_question.question,
						jersey_number: data.next_question.jersey_number,
						clues_used: 0,
					}
				: null;
			setLastResult(data.result);
			setAnswered(true);
			answeredRef.current = true;
			submittingRef.current = false;

			// Record answer for streak SFX.
			// Tier-based correctness: perfect/partial/typo all count as a correct guess.
			const tier = data.result.tier;
			const correct = tier === "perfect" || tier === "partial" || tier === "typo";
			answerHistoryRef.current.push({ tier, correct });

			// Play SFX based on tier + streak.
			// Rules:
			//   perfect → "benar", streak of 2 correct → "ambil-sendiri-pialanya"
			//   typo    → "yah-kocak-oke-lanjut"
			//   partial → "benar"
			//   wrong   → "salah", streak of 2 wrong → "bisa-main-gak-sih"
			const recent = answerHistoryRef.current.slice(-2);
			const isStreak = (
				arr: typeof recent,
				pred: (h: typeof arr[0]) => boolean,
			) => arr.length === 2 && arr.every(pred);

			if (correct) {
				if (tier === "perfect") {
					if (isStreak(recent, (h) => h.correct)) {
						playSFX("ambil-sendiri-pialanya");
					} else {
						playSFX("benar");
					}
				} else if (tier === "typo") {
					playSFX("yah-kocak-oke-lanjut");
				} else {
					// partial
					playSFX("benar");
				}
			} else {
				// wrong
				if (isStreak(recent, (h) => !h.correct)) {
					playSFX("bisa-main-gak-sih");
				} else {
					playSFX("salah");
				}
			}

			setBreakdown((b) => ({
				...b,
				[data.result.tier]: b[data.result.tier] + 1,
			}));

			if (mappedNextQuestion) {
				const newRemaining = Math.round(
					data.session.remaining_time_seconds ??
						data.session.countdown_seconds ??
						data.session.duration_seconds,
				);
				const recalibratedTotal =
					newRemaining > 0 ? newRemaining : (session?.duration_seconds ?? 90);
				setTimeout(() => {
					setScore(data.session.current_score ?? data.session.score ?? 0);
					timerAnchorMsRef.current = Date.now();
					totalDurationSRef.current = recalibratedTotal;
					setCluesRemaining(data.session.clues_remaining ?? cluesRemaining);
					setQuestionIndex((i) => i + 1);
					setCurrentQuestion(mappedNextQuestion);
					setSubmitting(false);
					pendingAnswerRef.current = false;
				}, 1500);
			} else {
				setTimeout(() => {
					if (!finishedRef.current) {
						finishedRef.current = true;
						onFinish(
							data.session.current_score,
							{
								...breakdownRef.current,
								[data.result.tier]: breakdownRef.current[data.result.tier] + 1,
							},
							levelRef.current,
						);
					}
					setSubmitting(false);
					pendingAnswerRef.current = false;
				}, 1500);
			}
		} catch (err: unknown) {
			const axiosErr = err as AxiosError<{ message?: string }>;
			const status = axiosErr?.response?.status;
			const msg =
				err && typeof err === "object" && "message" in err
					? (err as { message: string }).message
					: "Gagal submit jawaban";

			console.error("[handleSubmit] error:", err);

			if (status === 410) {
				submittingRef.current = false;
				pendingAnswerRef.current = false;
				setSubmitting(false);
				toast.error("Waktu bermain habis. Hasil disimpan.");
				if (!finishedRef.current) {
					finishedRef.current = true;
					onFinish(scoreRef.current, breakdownRef.current, levelRef.current);
				}
			} else {
				toast.error(msg);
				submittingRef.current = false;
				pendingAnswerRef.current = false;
				setSubmitting(false);
			}
		}
	};

	const handleRequestClue = async () => {
		if (
			cluesRemaining <= 0 ||
			revealedClue ||
			submittingRef.current ||
			answeredRef.current ||
			finishedRef.current ||
			!currentQuestion ||
			!currentQuestion.question_id
		) {
			if (!currentQuestion?.question_id) {
				console.warn(
					"[handleRequestClue] question_id is empty, currentQuestion:",
					currentQuestion,
				);
			}
			return;
		}
		try {
			const res = await apiGuessWhoClient.post(
				endpoints.guessWhoClue(sessionId, currentQuestion.question_id),
			);
			if (!res.data?.success)
				throw new Error(res.data?.message ?? "Ambil petunjuk gagal");
			const clue = res.data.clue as GuessWhoClueResponse;
			setRevealedClue(clue.initials || clue.player_name_hint);
			setCluesRemaining(clue.clues_remaining);
		} catch (err: unknown) {
			const msg =
				err && typeof err === "object" && "message" in err
					? (err as { message: string }).message
					: "Gagal ambil petunjuk";
			console.error("[handleRequestClue] error:", err);
			toast.error(msg);
		}
	};

	const [answer, setAnswer] = useState("");

	// Show loading overlay until BOTH session is loaded AND currentQuestion is set.
	// Using session?.session_id (not just sessionLoading) ensures we don't flash
	// stale data from a previous render cycle.
	if (sessionLoading || !session?.session_id || !currentQuestion) {
		return <LoadingOverlay message="Memuat sesi permainan..." />;
	}

	if (sessionError) {
		return (
			<div className="min-h-screen flex flex-col items-center justify-center gap-4 p-4">
				<div className="text-red-400 text-center">
					Sesi tidak ditemukan atau sudah berakhir.
				</div>
				<button
					onClick={onExit}
					className="px-6 py-2 rounded-xl bg-white/10 text-white text-sm"
				>
					Kembali ke menu
				</button>
			</div>
		);
	}

	return (
		<div className="relative min-h-screen w-full overflow-hidden">
			{/* Background layers */}
			<div className="absolute inset-0 pointer-events-none" aria-hidden>
				<div
					className="absolute inset-0 velocity-mesh"
					style={{
						maskImage: "radial-gradient(circle at center, black 30%, transparent 85%)",
						WebkitMaskImage: "radial-gradient(circle at center, black 30%, transparent 85%)",
						opacity: 0.7,
					}}
				/>
				<div className="batik-overlay absolute inset-0" />
				<div
					className="absolute top-[-12%] left-[-8%] w-[45%] h-[45%] rounded-full"
					style={{ background: "rgba(0, 194, 177, 0.12)", filter: "blur(150px)" }}
				/>
				<div
					className="absolute bottom-[-12%] right-[-8%] w-[40%] h-[40%] rounded-full"
					style={{ background: "rgba(0, 194, 177, 0.08)", filter: "blur(120px)" }}
				/>
			</div>

			{/* Foreground content */}
			<section className="relative z-10 max-w-3xl mx-auto pt-2 pb-16 animate-fade-up px-4 md:px-0">
				<div className="flex items-center justify-between mb-2">
					<button
						onClick={onExit}
						className="flex items-center gap-2 font-label-bold uppercase tracking-widest text-sm hover:opacity-80"
						style={{ color: "#00C2B1" }}
					>
						<ArrowLeft style={{ width: 16, height: 16 }} />
						Keluar
					</button>
					<div className="flex items-center gap-3">
						<span
							className="text-xs font-black tracking-widest uppercase px-3 py-1 rounded-full"
							style={{
								background: "rgba(0, 194, 177, 0.1)",
								color: "#00C2B1",
								border: "1px solid rgba(0, 194, 177, 0.3)",
							}}
						>
							Level {session.level} | Pts {score}
						</span>
						<span
							className="text-sm font-black italic tabular-nums"
							style={{ color: "#00C2B1" }}
						>
							{questionIndex + 1} / {totalQuestions}
						</span>
					</div>
					<div className="flex items-center gap-2">
						<CircularTimer
							seconds={timer}
							totalSeconds={session.duration_seconds}
						/>
					</div>
				</div>

				<div className="grid grid-cols-2 gap-3 md:gap-6 mb-6">
					<div className="glass-card-static rounded-3xl p-0 md:p-6 flex items-center justify-center">
						<JerseyDisplay
							imageUrl={currentQuestion.image_url}
							jerseyNumber={currentQuestion.jersey_number}
						/>
					</div>
					<div className="glass-card-static rounded-3xl p-4 md:p-6 flex flex-col justify-center gap-4">
						<div className="mb-4">
							<span
								className="text-[10px] font-black tracking-widest uppercase mb-2 block"
								style={{ color: "#00C2B1" }}
							>
								Deskripsi Pemain
							</span>
							<p
								className="font-medium md:font-semibold text-sm md:text-base leading-relaxed"
								style={{ color: "rgba(255, 255, 255, 0.85)" }}
							>
								{currentQuestion.description}
							</p>
						</div>

						<div
							className="p-4 rounded-xl"
							style={{
								background: "rgba(0, 194, 177, 0.05)",
								border: "1px solid rgba(0, 194, 177, 0.15)",
							}}
						>
							<div className="flex items-center justify-between mb-2">
								<span
									className="text-[10px] font-semibold"
									style={{ color: "#00C2B1" }}
								>
									Petunjuk
								</span>
								<span
									className="text-[10px] font-bold"
									style={{ color: "#bbcac6" }}
								>
									Sisa: {cluesRemaining} / 2
								</span>
							</div>

							{revealedClue ? (
								<div>
									<p
										className="text-[10px] font-black tracking-widest uppercase mb-1"
										style={{ color: "#00C2B1" }}
									>
										Inisial Pemain
									</p>
									<p
										className="text-xl font-black italic"
										style={{ color: "#FFD700", textShadow: "0 0 20px rgba(255, 215, 0, 0.5)" }}
									>
										{revealedClue}
									</p>
								</div>
							) : (
								<button
									onClick={handleRequestClue}
									disabled={
										cluesRemaining <= 0 ||
										submitting ||
										answered ||
										finishedRef.current
									}
									className="w-full px-4 py-3 rounded-xl font-label-bold tracking-widest text-xs uppercase flex items-center justify-center gap-2 disabled:opacity-40 transition-all hover:scale-105"
									style={{
										background:
											cluesRemaining > 0
												? "rgba(0, 194, 177, 0.15)"
												: "rgba(255, 255, 255, 0.05)",
										color: "#00C2B1",
										border: "1px solid rgba(0, 194, 177, 0.3)",
										boxShadow:
											cluesRemaining > 0
												? "0 0 16px rgba(0, 194, 177, 0.15)"
												: "none",
									}}
								>
									{cluesRemaining <= 0 ? (
										<>
											<Lock style={{ width: 16, height: 16 }} />
											<span className="text-[10px] font-black tracking-widest uppercase hidden md:block">
												Petunjuk Habis
											</span>
										</>
									) : (
										<>
											<Lightbulb style={{ width: 16, height: 16 }} />
											<span className="text-[10px] font-black tracking-widest uppercase hidden md:block">
												Buka Petunjuk
											</span>
										</>
									)}
								</button>
							)}
						</div>
					</div>
				</div>

				<div className="glass-card-static rounded-3xl p-6">
					{!answered ? (
						<form
							onSubmit={(e) => {
								e.preventDefault();
								handleSubmit(answer);
								setAnswer("");
							}}
							className="flex flex-col sm:flex-row gap-2"
						>
							<input
								type="text"
								value={answer}
								onChange={(e) => setAnswer(e.target.value)}
								disabled={submitting || answered || finishedRef.current}
								placeholder="Ketik nama pemain..."
								className="flex-1 px-4 py-3 rounded-xl bg-black/30 outline-none font-body-md text-base font-bold italic disabled:opacity-50"
								style={{
									border: "1px solid rgba(0, 194, 177, 0.3)",
									color: "#fff",
									boxShadow: "inset 0 0 10px rgba(0, 194, 177, 0.05)",
								}}
							/>
							<button
								type="submit"
								disabled={
									submitting || answered || finishedRef.current || !answer.trim()
								}
								className="px-6 py-3 rounded-xl font-label-bold tracking-widest text-xs uppercase disabled:opacity-30 transition-all hover:scale-105"
								style={{
									background: "linear-gradient(135deg, #43decc 0%, #0a7c6e 100%)",
									color: "#0a1412",
									boxShadow: "0 0 20px rgba(0, 194, 177, 0.3)",
								}}
							>
								<Send className="inline w-3 h-3 mr-1" />
								Kirim
							</button>
						</form>
					) : (
						<div className="flex items-center justify-between gap-4">
							{lastResult && (
								<TierBadge
									tier={lastResult.tier}
									points={lastResult.points_earned}
								/>
							)}
							{answered && (
								<span style={{ color: "#bbcac6" }} className="text-xs">
									Menuju soal berikutnya...
									<Clock
										className="inline ml-1"
										style={{ width: 12, height: 12 }}
									/>
									{formatTime(timer)}
								</span>
							)}
						</div>
					)}
				</div>
			</section>
		</div>
	);
}
