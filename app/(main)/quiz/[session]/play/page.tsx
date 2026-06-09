"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import {
	useRouter,
	useParams,
	useSearchParams,
	usePathname,
} from "next/navigation";
import Link from "next/link";
import { useQueryClient } from "@tanstack/react-query";
import { CheckCircle2, AlertCircle, ArrowLeft } from "lucide-react";
import { apiClient } from "@/lib/api/client";
import type {
	QuizWorldCupPlay,
	QuizWorldCupQuestion,
	QuizWorldCupSessionLeaderboardEntry,
} from "@/types";
import {
	useQuizSessionLeaderboard,
	useQuizMySessionRank,
} from "@/hooks/queries/useQuiz";
import { useUIStore } from "@/stores/uiStore";

/* ------------------------------------------------------------------ */
/*  Helpers                                                            */
/* ------------------------------------------------------------------ */

function formatCountdown(totalSeconds: number): string {
	const m = Math.floor(totalSeconds / 60);
	const s = totalSeconds % 60;
	return `${m}:${String(s).padStart(2, "0")}`;
}

function formatDuration(raw: string): string {
	let totalSeconds = 0;
	const match = raw.match(/^(\d+)h\s*(\d+)m\s*(\d+)s$/);
	if (match) {
		const [, h, m, s] = match;
		totalSeconds =
			parseInt(h, 10) * 3600 + parseInt(m, 10) * 60 + parseInt(s, 10);
	} else {
		const matchM = raw.match(/^(\d+)m\s*(\d+)s$/);
		if (matchM) {
			const [, m, s] = matchM;
			totalSeconds = parseInt(m, 10) * 60 + parseInt(s, 10);
		} else {
			const matchM = raw.match(/^(\d+)m$/);
			if (matchM) {
				totalSeconds = parseInt(matchM[1], 10) * 60;
			} else {
				const parsed = parseInt(raw, 10);
				totalSeconds = isNaN(parsed) ? 0 : Math.abs(parsed);
			}
		}
	}
	const h = Math.floor(totalSeconds / 3600);
	const m = Math.floor((totalSeconds % 3600) / 60);
	const s = totalSeconds % 60;
	if (h > 0) return `${h} jam ${m} menit`;
	if (m > 0 && s > 0) return `${m} menit ${s} detik`;
	if (m > 0) return `${m} menit`;
	return `${s} detik`;
}

/* ------------------------------------------------------------------ */
/*  Sound effects helper                                              */
/* ------------------------------------------------------------------ */

const playSound = (url: string) => {
	try {
		const audio = new Audio(url);
		audio.volume = 1.0;
		audio.play().catch((e) => console.warn("Audio play error:", e));
	} catch (e) {
		console.warn("Audio error:", e);
	}
};

/* ------------------------------------------------------------------ */
/*  LocalStorage helpers                                              */
/* ------------------------------------------------------------------ */

const STORAGE_KEY = "ola_quiz_session";

function saveSessionState(
	sessionId: string,
	state: {
		questionIndex: number;
		totalPoints: number;
		totalCorrect: number;
		timer: number;
		totalQuestions?: number;
		attemptId?: string;
		duration?: number;
		currentQuestion?: QuizWorldCupQuestion | null;
	},
) {
	try {
		sessionStorage.setItem(
			STORAGE_KEY,
			JSON.stringify({ session_id: sessionId, ...state, savedAt: Date.now() }),
		);
	} catch {
		/* ignore */
	}
}

function loadSessionState(sessionId: string) {
	try {
		const raw = sessionStorage.getItem(STORAGE_KEY);
		if (!raw) return null;
		const parsed = JSON.parse(raw);
		if (parsed.session_id !== sessionId) return null;
		return parsed as {
			session_id: string;
			questionIndex: number;
			totalPoints: number;
			totalCorrect: number;
			timer: number;
			currentQuestion?: QuizWorldCupQuestion | null;
			totalQuestions?: number;
			attemptId: string;
			duration: number;
		};
	} catch {
		return null;
	}
}

function clearSessionState() {
	try {
		sessionStorage.removeItem(STORAGE_KEY);
	} catch {
		/* ignore */
	}
}

/* ------------------------------------------------------------------ */
/*  Types                                                              */
/* ------------------------------------------------------------------ */

interface AnswerResponse {
	finished: boolean;
	next_question: QuizWorldCupQuestion | null;
	current_index: number;
	remaining_time_seconds: number;
	total_points_so_far: number;
}

interface ForceCloseResponse {
	attempt_id: string;
	session_id: string;
	session_name: string;
	status: string;
	finished: boolean;
	total_points: number;
	total_duration_seconds: number;
	correct_answers: number;
	wrong_answers: number;
	total_questions: number;
}

/* ------------------------------------------------------------------ */
/*  Component                                                          */
/* ------------------------------------------------------------------ */

export default function PlaySessionPage() {
	const { theme } = useUIStore();
	const isDark = theme === "dark";
	const router = useRouter();
	const queryClient = useQueryClient();
	const params = useParams();
	const searchParams = useSearchParams();
	const sessionId = params?.session as string;

	const sessionName =
		searchParams?.get("name") ?? `Session ${sessionId.slice(-4)}`;
	const durationFromUrl =
		parseInt(searchParams?.get("duration") ?? "0", 10) || 120;
	let sessionNumber = searchParams?.get("sessionNumber")
		? parseInt(searchParams.get("sessionNumber")!, 10)
		: null;
	if (!sessionNumber) {
		const match = sessionName.match(/SESSION\s+(\d+)/i);
		if (match) sessionNumber = parseInt(match[1], 10);
	}

	const [loading, setLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);
	const [awaitingResume, setAwaitingResume] = useState(false);
	const [resumeSnapshot, setResumeSnapshot] = useState<{
		questionIndex: number;
		totalQuestions: number;
		totalPoints: number;
	} | null>(null);

	const [attemptId, setAttemptId] = useState<string | null>(null);
	const [totalQuestions, setTotalQuestions] = useState(0);
	const [duration, setDuration] = useState(0);

	const [currentQuestion, setCurrentQuestion] =
		useState<QuizWorldCupQuestion | null>(null);
	const [questionIndex, setQuestionIndex] = useState(0);

	const [answerSubmitted, setAnswerSubmitted] = useState(false);
	const [answerResult, setAnswerResult] = useState<{
		correct: boolean;
		correctAnswer: number;
		selectedAnswer: number;
		explanation: string | null;
		pointsEarned: number;
	} | null>(null);

	const [totalCorrect, setTotalCorrect] = useState(0);
	const [timer, setTimer] = useState(0);

	const [finished, setFinished] = useState(false);
	const [finalData, setFinalData] = useState<{
		score: number;
		correctCount: number;
		totalPoints: number;
		totalQuestions: number;
	} | null>(null);

	// Audio & streak
	const correctStreakRef = useRef(0);
	const wrongStreakRef = useRef(0);
	const backsoundRef = useRef<HTMLAudioElement | null>(null);
	const hasPlayedTimerWarning = useRef(false);
	const lastSelectedAnswerRef = useRef<number | null>(null);

	// Refs
	const totalCorrectRef = useRef(0);
	const totalQuestionsRef = useRef(0);
	const totalPointsSoFarRef = useRef(0);
	const attemptIdRef = useRef<string | null>(null);
	const questionIndexRef = useRef(0);
	const currentQuestionRef = useRef<QuizWorldCupQuestion | null>(null);
	const durationRef = useRef(0);
	const timerRef = useRef(0);

	// Sync state to refs
	useEffect(() => {
		questionIndexRef.current = questionIndex;
	}, [questionIndex]);
	useEffect(() => {
		currentQuestionRef.current = currentQuestion;
	}, [currentQuestion]);
	useEffect(() => {
		attemptIdRef.current = attemptId;
	}, [attemptId]);
	useEffect(() => {
		durationRef.current = duration;
	}, [duration]);
	useEffect(() => {
		timerRef.current = timer;
	}, [timer]);
	useEffect(() => {
		totalCorrectRef.current = totalCorrect;
	}, [totalCorrect]);
	useEffect(() => {
		totalQuestionsRef.current = totalQuestions;
	}, [totalQuestions]);

	/* ---- Timer warning sound ---- */
	useEffect(() => {
		if (finished || timer > 10 || timer <= 0) {
			if (timer > 10) hasPlayedTimerWarning.current = false;
			return;
		}
		if (
			!hasPlayedTimerWarning.current &&
			timer <= 10 &&
			timer > 0 &&
			!finished
		) {
			hasPlayedTimerWarning.current = true;
			playSound("/sounds/effect/buruan-udah-mau-abis.mp3");
		}
	}, [timer, finished]);

	/* ---- Start backsound automatically when page loaded ---- */
	const startBacksound = useCallback(() => {
		if (backsoundRef.current) return;
		if (sessionNumber === null) {
			console.warn("sessionNumber tidak diketahui, backsound tidak diputar");
			return;
		}
		const url =
			sessionNumber % 2 === 1
				? "/sounds/backsound-1.mpeg"
				: "/sounds/backsound-2.mpeg";
		try {
			const audio = new Audio(url);
			audio.loop = true;
			audio.volume = 0.1;
			audio.play().catch((e) => console.warn("Backsound error:", e));
			backsoundRef.current = audio;
		} catch (e) {
			console.warn("Backsound init error:", e);
		}
	}, [sessionNumber]);

	useEffect(() => {
		const isPlaying =
			!loading &&
			!awaitingResume &&
			!error &&
			!finished &&
			!!currentQuestion &&
			sessionNumber !== null;
		if (isPlaying) {
			startBacksound();
		} else if (backsoundRef.current) {
			backsoundRef.current.pause();
			backsoundRef.current.currentTime = 0;
			backsoundRef.current = null;
		}
	}, [
		loading,
		awaitingResume,
		error,
		finished,
		currentQuestion,
		sessionNumber,
		startBacksound,
	]);

	/* ---- Hapus sessionStorage saat navigasi keluar dari quiz play ---- */
	const pathname = usePathname();
	const lastSeenPathnameRef = useRef(pathname);
	useEffect(() => {
		const prev = lastSeenPathnameRef.current;
		lastSeenPathnameRef.current = pathname;
		// Hapus hanya jika pathname berubah (bukan render pertama)
		// dan route bukan lagi /quiz/[...]/play
		if (prev !== pathname && !pathname?.startsWith("/quiz/")) {
			clearSessionState();
			if (backsoundRef.current) {
				backsoundRef.current.pause();
				backsoundRef.current = null;
			}
		}
	}, [pathname]);

	/* ---- Play sound effect based on answer and streak ---- */
	const playAnswerSound = useCallback((isCorrect: boolean) => {
		let soundUrl = "";
		const currentCorrect = correctStreakRef.current;
		const currentWrong = wrongStreakRef.current;

		if (isCorrect) {
			if (currentWrong === 2) {
				soundUrl = "/sounds/effect/tumben-bener.mp3";
			} else if (currentCorrect + 1 === 3) {
				soundUrl = "/sounds/effect/ambil-sendiri-pialanya.mp3";
			} else {
				soundUrl = "/sounds/effect/benar.mp3";
			}
		} else {
			if (currentCorrect === 2) {
				soundUrl = "/sounds/effect/yah-kocak-oke-lanjut.mp3";
			} else if (currentWrong + 1 === 3) {
				soundUrl = "/sounds/effect/bisa-main-gak-sih.mp3";
			} else {
				soundUrl = "/sounds/effect/salah.mp3";
			}
		}

		if (isCorrect) {
			correctStreakRef.current += 1;
			wrongStreakRef.current = 0;
		} else {
			wrongStreakRef.current += 1;
			correctStreakRef.current = 0;
		}

		playSound(soundUrl);
	}, []);

	/* ---- Force close attempt saat timeout ---- */
	const forceCloseAttempt = useCallback(async () => {
		const currentAttemptId = attemptIdRef.current;
		if (!currentAttemptId) return;

		try {
			const response = await apiClient.post<{ data: ForceCloseResponse }>(
				`/api/quiz-world-cup/attempts/${currentAttemptId}/force-close`,
			);
			const result = response.data.data;
			setFinalData({
				score: result.total_points,
				correctCount: result.correct_answers,
				totalPoints: result.total_points,
				totalQuestions: result.total_questions,
			});
			setFinished(true);
			clearSessionState();
		} catch (err) {
			console.error("Force close failed:", err);
			setFinalData({
				score: totalPointsSoFarRef.current,
				correctCount: totalCorrectRef.current,
				totalPoints: totalPointsSoFarRef.current,
				totalQuestions: totalQuestionsRef.current,
			});
			setFinished(true);
			clearSessionState();
		}
	}, []);

	/* ---- Answer result handler ---- */
	const handleAnswerResult = useCallback(
		(result: AnswerResponse) => {
			questionIndexRef.current += 1;
			setQuestionIndex(questionIndexRef.current);

			const previousPoints = totalPointsSoFarRef.current;
			const currentPoints =
				typeof result.total_points_so_far === "number"
					? result.total_points_so_far
					: previousPoints;

			const isCorrect = currentPoints > previousPoints;
			if (isCorrect) {
				setTotalCorrect((c) => c + 1);
				totalCorrectRef.current += 1;
			}

			totalPointsSoFarRef.current = currentPoints;

			playAnswerSound(isCorrect);

			const selectedAnswer = lastSelectedAnswerRef.current ?? 0;
			const correctAnswer = isCorrect ? selectedAnswer : -1;
			const pointsEarned = currentPoints - previousPoints;
			setAnswerResult({
				correct: isCorrect,
				correctAnswer,
				selectedAnswer,
				explanation: null,
				pointsEarned,
			});

			if (result.finished) {
				setFinalData({
					score: currentPoints,
					correctCount: totalCorrectRef.current,
					totalPoints: currentPoints,
					totalQuestions: totalQuestionsRef.current,
				});
				setFinished(true);
				clearSessionState();
				return;
			}

			if (result.next_question) {
				setCurrentQuestion(result.next_question);
				setAnswerSubmitted(false);
				setAnswerResult(null);
				saveSessionState(sessionId, {
					questionIndex: questionIndexRef.current,
					totalPoints: totalPointsSoFarRef.current,
					totalCorrect: totalCorrectRef.current,
					timer: timerRef.current,
					totalQuestions: totalQuestionsRef.current,
					attemptId: attemptIdRef.current ?? undefined,
					duration: durationRef.current,
					currentQuestion: result.next_question,
				});
				return;
			}

			setAnswerSubmitted(false);
			setAnswerResult(null);
		},
		[sessionId, playAnswerSound],
	);

	const handleResume = useCallback(() => {
		const saved = loadSessionState(sessionId);
		if (!saved) {
			setAwaitingResume(false);
			return;
		}
		setAttemptId(saved.attemptId);
		const qCount = saved.totalQuestions ?? saved.questionIndex + 1;
		const dur = saved.duration ?? durationFromUrl;
		setTotalQuestions(qCount);
		totalQuestionsRef.current = qCount;
		setDuration(dur);
		setTimer(saved.timer);
		setTotalCorrect(saved.totalCorrect);
		totalCorrectRef.current = saved.totalCorrect;
		totalPointsSoFarRef.current = saved.totalPoints;
		setQuestionIndex(saved.questionIndex);
		if (saved.currentQuestion) {
			setCurrentQuestion(saved.currentQuestion);
		}
		setAwaitingResume(false);
		setResumeSnapshot(null);
	}, [sessionId, durationFromUrl]);

	const handleAnswerResultRef = useRef(handleAnswerResult);
	useEffect(() => {
		handleAnswerResultRef.current = handleAnswerResult;
	}, [handleAnswerResult]);

	/* ---- Start session ---- */
	useEffect(() => {
		let cancelled = false;
		async function startSession() {
			const saved = loadSessionState(sessionId);
			if (
				saved &&
				saved.timer > 0 &&
				saved.questionIndex < saved.totalQuestions!
			) {
				if (cancelled) return;
				const qCount = saved.totalQuestions ?? saved.questionIndex + 1;
				setResumeSnapshot({
					questionIndex: saved.questionIndex,
					totalQuestions: qCount,
					totalPoints: saved.totalPoints,
				});
				setAwaitingResume(true);
				setLoading(false);
				return;
			}

			try {
				setLoading(true);
				const response = await apiClient.get<{ data: QuizWorldCupPlay }>(
					`/api/quiz-world-cup/sessions/${sessionId}/play`,
				);
				const data = response.data.data;
				if (cancelled) return;
				setAttemptId(data.attempt_id);
				const qCount = data.questions?.length ?? 0;
				const dur = data.duration_seconds ?? durationFromUrl;
				setTotalQuestions(qCount);
				totalQuestionsRef.current = qCount;
				setDuration(dur);
				setTimer(dur);
				correctStreakRef.current = 0;
				wrongStreakRef.current = 0;
				setAnswerSubmitted(false);
				setAnswerResult(null);
				if (data.questions && data.questions.length > 0) {
					setCurrentQuestion(data.questions[0]);
				} else {
					setError("Tidak ada pertanyaan untuk sesi ini");
				}
				saveSessionState(sessionId, {
					questionIndex: 0,
					totalPoints: 0,
					totalCorrect: 0,
					timer: dur,
					totalQuestions: qCount,
					attemptId: data.attempt_id,
					duration: dur,
					currentQuestion: data.questions?.[0] ?? null,
				});
			} catch (err: unknown) {
				if (cancelled) return;
				const axiosErr = err as {
					response?: { data?: unknown };
					message?: string;
				};
				const apiMessage =
					axiosErr?.response?.data &&
					typeof axiosErr.response.data === "object" &&
					"message" in (axiosErr.response.data as Record<string, unknown>)
						? (axiosErr.response.data as { message?: string }).message
						: undefined;
				setError(
					apiMessage ??
						axiosErr?.message ??
						"Pertanyaan tidak ditemukan atau data tidak valid",
				);
			} finally {
				if (!cancelled) setLoading(false);
			}
		}
		startSession();
		return () => {
			cancelled = true;
		};
	}, [sessionId, durationFromUrl]);

	/* ---- Countdown ---- */
	useEffect(() => {
		if (!duration || finished || timer <= 0) return;
		const interval = setInterval(() => {
			setTimer((prev) => {
				const next = prev <= 1 ? 0 : prev - 1;
				if (next > 0 && !finished) {
					saveSessionState(sessionId, {
						questionIndex: questionIndexRef.current,
						totalPoints: totalPointsSoFarRef.current,
						totalCorrect: totalCorrectRef.current,
						timer: next,
						totalQuestions: totalQuestionsRef.current,
						attemptId: attemptIdRef.current ?? undefined,
						duration: durationRef.current,
						currentQuestion: currentQuestionRef.current,
					});
				}
				return next;
			});
		}, 1000);
		return () => clearInterval(interval);
	}, [duration, finished, timer === 0, sessionId]);

	/* ---- Auto-submit on timeout ---- */
	const submittedRef = useRef(false);
	const completingRef = useRef(false);
	useEffect(() => {
		if (
			timer !== 0 ||
			!attemptId ||
			answerSubmitted ||
			finished ||
			!currentQuestion ||
			submittedRef.current ||
			completingRef.current
		)
			return;

		submittedRef.current = true;
		setAnswerSubmitted(true);
		completingRef.current = true;

		forceCloseAttempt().finally(() => {
			completingRef.current = false;
		});
	}, [
		timer,
		attemptId,
		answerSubmitted,
		finished,
		currentQuestion,
		forceCloseAttempt,
	]);

	/* ---- Submit answer ---- */
	const handleSubmitAnswer = useCallback(
		async (selectedAnswer: number) => {
			if (answerSubmitted || !attemptId || !currentQuestion) return;
			setAnswerSubmitted(true);
			lastSelectedAnswerRef.current = selectedAnswer;

			const selectedOption = String.fromCharCode(65 + selectedAnswer);

			try {
				const response = await apiClient.post<{ data: AnswerResponse }>(
					`/api/quiz-world-cup/attempts/${attemptId}/answer`,
					{
						question_id: currentQuestion.id,
						selected_option: selectedOption,
					},
				);
				const result = response.data.data;
				handleAnswerResultRef.current(result);
			} catch {
				setAnswerSubmitted(false);
			}
		},
		[answerSubmitted, attemptId, currentQuestion],
	);

	/* ---- Cleanup result feedback ---- */
	useEffect(() => {
		if (!answerSubmitted || finished) return;
		const timeout = setTimeout(() => setAnswerResult(null), 1200);
		return () => clearTimeout(timeout);
	}, [answerSubmitted, finished, answerResult]);

	/* ---- Timer SVG helpers ---- */
	const circumference = 2 * Math.PI * 54;
	const timePercent = duration > 0 ? timer / duration : 0;
	const timerOffset = circumference * (1 - timePercent);
	const timerColor =
		timePercent > 0.5 ? "#00c2b1" : timePercent > 0.25 ? "#fbbf24" : "#ff4444";
	const isUrgent = timePercent <= 0.25;

	/* ------------------------------------------------------------------ */
	/*  Render                                                            */
	/* ------------------------------------------------------------------ */
	if (awaitingResume && resumeSnapshot) {
		const nextQ = resumeSnapshot.questionIndex + 1;
		return (
			<div className="play-session-page">
				<div
					data-theme={theme}
					className={`min-h-screen ${isDark ? "bg-[#050505]" : "bg-[#f5f5f5]"} velocity-mesh relative flex items-center justify-center px-6 py-12 transition-colors duration-300`}
				>
					<div className="absolute inset-0 bg-quiz-hero opacity-30 pointer-events-none"></div>
					<div className="relative z-10 max-w-md w-full text-center">
						<div className="glass-panel rounded-3xl p-8 md:p-10">
							<div className="mx-auto w-20 h-20 rounded-full bg-primary/10 border border-primary/30 flex items-center justify-center mb-6 shadow-[0_0_30px_rgba(67,222,204,0.25)]">
								<span className="text-3xl">⏱</span>
							</div>
							<div className="flex items-center justify-center gap-2 mb-3">
								<span
									className={`inline-block w-2 h-2 ${isDark ? "bg-primary" : "bg-[#298B7F]"} rounded-full animate-pulse shadow-[0_0_10px_#43decc]`}
								></span>
								<p
									className={`font-label-bold ${isDark ? "text-primary" : "text-[#298B7F]"} tracking-[0.3em] uppercase text-xs`}
								>
									Sesi Tersimpan
								</p>
							</div>
							<h2
								className={`font-headline-md uppercase leading-tight mb-5 ${isDark ? "text-white" : "text-black/85"}`}
							>
								Lanjutkan Kuis?
							</h2>
							<p
								className={`text-sm mb-8 leading-relaxed ${isDark ? "text-white/70" : "text-black/70"}`}
							>
								Kamu sebelumnya sedang di pertanyaan{" "}
								<span
									className={`${isDark ? "text-primary" : "text-[#298B7F]"} font-bold`}
								>
									{String(nextQ).padStart(2, "0")} /{" "}
									{String(resumeSnapshot.totalQuestions).padStart(2, "0")}
								</span>{" "}
								dengan skor{" "}
								<span
									className={`${isDark ? "text-primary" : "text-[#298B7F]"} font-bold`}
								>
									{resumeSnapshot.totalPoints} poin
								</span>
								.
							</p>
							<div className="flex flex-col gap-3">
								<button
									onClick={handleResume}
									className="w-full bg-primary text-slate-950 font-label-bold uppercase tracking-widest text-sm py-3 px-6 rounded-xl hover:shadow-[0_0_20px_rgba(0,194,177,0.5)] active:scale-95 transition-all"
								>
									Lanjut Kuis
								</button>
							</div>
						</div>
					</div>
				</div>
			</div>
		);
	}

	if (loading) {
		return (
			<div
				data-theme={theme}
				className={`min-h-screen flex items-center justify-center transition-colors duration-300 ${isDark ? "bg-[#050505]" : "bg-[#f5f5f5]"}`}
			>
				<div
					className={`${isDark ? "text-primary" : "text-[#107F71]"} animate-pulse text-lg font-label-bold`}
				>
					Loading...
				</div>
			</div>
		);
	}

	if (error && !attemptId) {
		return (
			<div
				data-theme={theme}
				className={`min-h-screen ${isDark ? "bg-[#050505]" : "bg-[#f5f5f5]"} velocity-mesh relative flex items-center justify-center px-6 py-12 transition-colors duration-300`}
			>
				<div className="absolute inset-0 bg-quiz-hero opacity-30 pointer-events-none"></div>
				<div className="relative z-10 max-w-md w-full text-center">
					<div className="glass-panel rounded-3xl p-8 md:p-10">
						<div className="mx-auto w-20 h-20 rounded-full bg-red-500/10 border border-red-500/30 flex items-center justify-center mb-6 shadow-[0_0_30px_rgba(255,180,171,0.2)]">
							<AlertCircle className="size-10 text-red-400" />
						</div>
						<div className="flex items-center justify-center gap-2 mb-3">
							<span className="inline-block w-2 h-2 bg-red-400 rounded-full animate-pulse shadow-[0_0_10px_#ffb4ab]"></span>
							<p className="font-label-bold text-red-400 tracking-[0.3em] uppercase text-xs">
								Session Error
							</p>
						</div>
						<h2
							className={`font-headline-md uppercase leading-tight mb-5 ${isDark ? "text-white" : "text-black/85"}`}
						>
							{error}
						</h2>
						<Link
							href="/quiz"
							className="inline-flex items-center justify-center gap-2 w-full bg-primary text-slate-950 font-label-bold uppercase tracking-widest text-sm py-3 px-6 rounded-xl hover:shadow-[0_0_20px_rgba(0,194,177,0.5)] active:scale-95 transition-all"
						>
							<ArrowLeft className="size-4" />
							Kembali ke Kuis
						</Link>
					</div>
				</div>
			</div>
		);
	}

	if (finished && finalData) {
		const pct =
			finalData.totalQuestions > 0
				? Math.round((finalData.correctCount / finalData.totalQuestions) * 100)
				: 0;

		return (
			<div
				data-theme={theme}
				className={`min-h-screen relative flex items-center justify-center px-4 py-20 transition-colors duration-300 ${isDark ? "bg-[#081010]" : "bg-[#f5f5f5]"}`}
			>
				<div className="fixed inset-0 pointer-events-none overflow-hidden">
					<div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-125 h-125 rounded-full bg-primary/5 blur-[120px]" />
				</div>
				<div className="relative z-10 w-full max-w-lg">
					<div className="text-center mb-8">
						<div className="inline-flex items-center gap-2 mb-4">
							<span
								className={`inline-block w-2.5 h-2.5 ${isDark ? "bg-primary" : "bg-[#298B7F]"} rounded-full animate-pulse shadow-[0_0_10px_#43decc]`}
							/>
							<p
								className={`font-label-bold ${isDark ? "text-primary" : "text-[#298B7F]"} tracking-[0.3em] uppercase text-sm`}
							>
								Sesi Selesai
							</p>
						</div>
						<h1
							className={`font-headline-lg leading-tight ${isDark ? "text-white" : "text-black/85"}`}
						>
							{sessionName}
						</h1>
					</div>
					<div className="glass-card rounded-3xl p-10 md:p-12 flex flex-col items-center gap-6 mb-6">
						<div className="relative">
							<svg width="140" height="140" className="-rotate-90">
								<circle
									cx="70"
									cy="70"
									r="60"
									fill="transparent"
									stroke="rgba(255,255,255,0.06)"
									strokeWidth="6"
								/>
								<circle
									cx="70"
									cy="70"
									r="60"
									fill="transparent"
									stroke="#00c2b1"
									strokeWidth="6"
									strokeLinecap="round"
									strokeDasharray={2 * Math.PI * 60}
									strokeDashoffset={2 * Math.PI * 60 * (1 - pct / 100)}
									className="transition-all duration-1000"
									style={{
										filter: "drop-shadow(0 0 10px rgba(0,194,177,0.5))",
									}}
								/>
							</svg>
							<div className="absolute inset-0 flex flex-col items-center justify-center">
								<span
									className={`font-display-md font-bold text-4xl ${isDark ? "text-white" : "text-black/85"}`}
								>
									+{finalData.score}
								</span>
								<span
									className={`text-xs font-label-bold tracking-widest uppercase ${isDark ? "text-white/50" : "text-black/50"}`}
								>
									Poin
								</span>
							</div>
						</div>
						<div className="flex items-center gap-8 w-full justify-center">
							<div className="text-center">
								<div
									className={`text-3xl font-bold ${isDark ? "text-white" : "text-black/85"}`}
								>
									{finalData.correctCount}
								</div>
								<div
									className={`text-xs font-label-bold tracking-widest uppercase mt-1 ${isDark ? "text-white/50" : "text-black/50"}`}
								>
									Benar
								</div>
							</div>
							<div
								className={`w-px h-10 ${isDark ? "bg-white/10" : "bg-black/10"}`}
							/>
							<div className="text-center">
								<div
									className={`text-3xl font-bold ${isDark ? "text-white" : "text-black/85"}`}
								>
									{finalData.totalQuestions}
								</div>
								<div
									className={`text-xs font-label-bold tracking-widest uppercase mt-1 ${isDark ? "text-white/50" : "text-black/50"}`}
								>
									Total
								</div>
							</div>
							<div
								className={`w-px h-10 ${isDark ? "bg-white/10" : "bg-black/10"}`}
							/>
							<div className="text-center">
								<div
									className={`text-3xl font-bold ${isDark ? "text-white" : "text-black/85"}`}
								>
									{pct}%
								</div>
								<div
									className={`text-xs font-label-bold tracking-widest uppercase mt-1 ${isDark ? "text-white/50" : "text-black/50"}`}
								>
									Akurasi
								</div>
							</div>
						</div>
					</div>
					<button
						onClick={() => {
							if (backsoundRef.current) {
								backsoundRef.current.pause();
								backsoundRef.current.currentTime = 0;
								backsoundRef.current = null;
							}
							clearSessionState();
							queryClient.invalidateQueries({ queryKey: ["wc-global-leaderboard"] });
							queryClient.invalidateQueries({ queryKey: ["wc-my-global-rank"] });
							queryClient.invalidateQueries({ queryKey: ["wc-sessions"] });
							queryClient.invalidateQueries({ queryKey: ["wc-session-leaderboard"] });
							queryClient.invalidateQueries({ queryKey: ["wc-my-session-rank"] });
							queryClient.invalidateQueries({ queryKey: ["quiz-summary"] });
							router.push("/quiz");
						}}
						className="w-full bg-primary text-black font-label-bold py-4 rounded-2xl hover:shadow-[0_0_25px_rgba(0,194,177,0.4)] active:scale-[0.98] transition-all text-base tracking-wide uppercase"
					>
						Kembali ke kuis
					</button>
				</div>
			</div>
		);
	}

	if (!currentQuestion) return null;

	const currentQ = questionIndex + 1;
	const questionDotList = Array.from({ length: totalQuestions }, (_, i) => i);

	return (
		<div
			data-theme={theme}
			className={`min-h-screen ${isDark ? "bg-[#081010]" : "bg-[#f5f5f5]"}  relative px-4 py-6 md:py-8 transition-colors duration-300`}
		>
			<div className="fixed inset-0 pointer-events-none overflow-hidden">
				<div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-150 h-150 rounded-full bg-primary/5 blur-[120px]" />
			</div>
			<div className="relative z-10 max-w-300 mx-auto">
				<div className="flex flex-row justify-between items-start md:items-end gap-4 mb-8">
					<div className="space-y-1">
						<div className="flex items-center gap-2">
							<span className="inline-block w-3 h-3 bg-primary rounded-full animate-pulse shadow-[0_0_10px_#43decc]" />
							<p className="font-body-lg text-primary tracking-[0.3em] uppercase text-sm">
								Sesi Aktif
							</p>
						</div>
						<p
							className={`font-bold uppercase text-2xl md:text-4xl tracking-wide ${isDark ? "text-white" : "text-black/85"}`}
						>
							{sessionName}
						</p>
					</div>
					<div className="relative w-32 h-32 flex items-center justify-center shrink-0">
						<svg className="w-full h-full -rotate-90" aria-hidden="true">
							<circle
								cx="64"
								cy="64"
								r="54"
								fill="transparent"
								stroke={isDark ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.08)"}
								strokeWidth="6"
							/>
							<circle
								cx="64"
								cy="64"
								r="54"
								fill="transparent"
								stroke={timerColor}
								strokeWidth="6"
								strokeLinecap="round"
								strokeDasharray={circumference}
								strokeDashoffset={timerOffset}
								className="transition-all duration-1000"
								style={{
									filter: isUrgent
										? "none"
										: "drop-shadow(0 0 8px rgba(0,194,177,0.4))",
								}}
							/>
						</svg>
						<div className="absolute flex flex-col items-center">
							<span
								className={`font-headline-md ${isUrgent ? "text-red-400" : isDark ? "text-white" : "text-black/85"}`}
							>
								{formatCountdown(timer)}
							</span>
							<span
								className={`text-[9px] font-bold tracking-widest uppercase ${isDark ? "text-white/40" : "text-black/40"}`}
							>
								Waktu
							</span>
						</div>
					</div>
				</div>
				<div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
					<div className="lg:col-span-8 glass-panel rounded-3xl border-t border-primary/30 shadow-[0_0_40px_rgba(0,194,177,0.08)] p-6 md:p-10 flex flex-col justify-between min-h-90">
						<div className="flex flex-col md:flex-row gap-2 justify-between items-center">
							<span className="font-body-lg text-primary-container px-3 py-1 bg-primary-container/10 border border-primary-container/20 rounded-full text-xs">
								PERTANYAAN {String(currentQ).padStart(2, "0")} /{" "}
								{String(totalQuestions).padStart(2, "0")}
							</span>
							<div className="flex gap-1">
								{questionDotList.map((i) => (
									<span
										key={i}
										className={`w-2 h-2 rounded-full transition-colors ${
											i < currentQ - 1
												? "bg-primary"
												: i === currentQ - 1
													? "bg-primary"
													: isDark
														? "bg-white/20"
														: "bg-black/20"
										}`}
									/>
								))}
							</div>
						</div>
						{currentQuestion.image_url && (
							<div className="mb-6 rounded-2xl overflow-hidden">
								<img
									src={currentQuestion.image_url}
									alt="Question"
									className="w-full rounded-xl object-cover max-h-56"
								/>
							</div>
						)}
						<h2
							className={`text-lg md:text-xl font-headline-md leading-relaxed my-6 md:my-0 ${isDark ? "text-white" : "text-black/85"}`}
						>
							{currentQuestion.question}
						</h2>
						<div className="grid grid-cols-1 md:grid-cols-2 gap-3">
							{currentQuestion.options.map((option, index) => {
								const isSelected =
									answerSubmitted && answerResult?.selectedAnswer === index;
								const isCorrect =
									answerSubmitted && answerResult?.correctAnswer === index;
								const isWrong = answerSubmitted && isSelected && !isCorrect;
								const baseBorder = isDark ? "border-white/6" : "border-black/8";
								const dimBorder = isDark ? "border-white/4" : "border-black/6";
								let btnClass = `group flex items-center justify-between p-4 rounded-2xl glass-panel ${baseBorder} text-left transition-all duration-300 `;
								if (answerSubmitted) {
									if (isCorrect) {
										btnClass +=
											"active-glass bg-primary-container/10 border-[#00c2b1]";
									} else if (isWrong) {
										btnClass += "border-red-500/50 bg-red-500/10";
									} else {
										btnClass += `opacity-40 ${dimBorder}`;
									}
								} else {
									btnClass +=
										"hover:bg-primary/10 hover:border-[#00c2b1] hover:translate-x-2";
								}
								const optionTextClass = isDark
									? "text-white/80 group-hover:text-white"
									: "text-black/80 group-hover:text-black";
								return (
									<button
										key={index}
										onClick={() => handleSubmitAnswer(index)}
										disabled={answerSubmitted}
										className={btnClass}
									>
										<span
											className={`text-sm md:text-base font-body-lg ${optionTextClass}`}
										>
											{option}
										</span>
										{answerSubmitted && isCorrect && (
											<CheckCircle2 className="size-5 text-primary shrink-0" />
										)}
										{answerSubmitted && isWrong && (
											<span className="size-5 shrink-0 rounded-full border-2 border-red-400 flex items-center justify-center">
												<span className="block w-2 h-2 bg-red-400 rounded-full" />
											</span>
										)}
									</button>
								);
							})}
						</div>
						{answerSubmitted && answerResult?.explanation && (
							<div className="mt-6 p-4 rounded-xl bg-primary/10 border border-primary/25">
								<p
									className={`text-sm ${isDark ? "text-white/80" : "text-black/80"}`}
								>
									<span className="text-primary font-label-bold">
										Penjelasan:{" "}
									</span>
									{answerResult.explanation}
								</p>
							</div>
						)}
					</div>
					<div className="lg:col-span-4 flex flex-col gap-5">
						<div
							className={`glass-panel p-5 rounded-3xl ${isDark ? "border-white/6" : "border-black/8"}`}
						>
							<p
								className={`font-label-bold mb-3 uppercase tracking-widest text-xs ${isDark ? "text-white/40" : "text-black/40"}`}
							>
								Jawaban Benar
							</p>
							<div className="space-y-2">
								<div
									className={`flex justify-between text-xs font-bold ${isDark ? "text-white/60" : "text-black/60"}`}
								>
									<span>
										{totalCorrect}/{totalQuestions}
									</span>
									<span>
										{totalQuestions > 0
											? Math.round((totalCorrect / totalQuestions) * 100)
											: 0}
										%
									</span>
								</div>
								<div
									className={`h-2.5 w-full rounded-full overflow-hidden ${isDark ? "bg-white/5" : "bg-black/5"}`}
								>
									<div
										className="h-full bg-linear-to-r from-primary to-primary-container shadow-[0_0_10px_rgba(0,194,177,0.5)] transition-all duration-500 rounded-full"
										style={{
											width: `${totalQuestions > 0 ? (totalCorrect / totalQuestions) * 100 : 0}%`,
										}}
									/>
								</div>
							</div>
						</div>
						<SessionLeaderboardCard sessionId={sessionId} isDark={isDark} />
					</div>
				</div>
			</div>
			<style jsx global>{`
				[data-theme="light"] .text-primary,
				[data-theme="light"] .text-primary-fixed-dim {
					color: #0a7c6e !important;
				}
				[data-theme="light"] .bg-primary {
					background-color: #0a7c6e !important;
				}
				[data-theme="light"] .border-primary {
					border-color: rgba(10, 124, 110, 0.5) !important;
				}
				[data-theme="light"] .border-primary\/20 {
					border-color: rgba(10, 124, 110, 0.2) !important;
				}
				[data-theme="light"] .border-primary\/30 {
					border-color: rgba(10, 124, 110, 0.35) !important;
				}
				[data-theme="light"] .border-primary\/40 {
					border-color: rgba(10, 124, 110, 0.45) !important;
				}
				[data-theme="light"] .border-primary\/60 {
					border-color: rgba(10, 124, 110, 0.7) !important;
				}
				[data-theme="light"] .bg-primary\/10 {
					background-color: rgba(10, 124, 110, 0.1) !important;
				}
				[data-theme="light"] .bg-primary\/20 {
					background-color: rgba(10, 124, 110, 0.2) !important;
				}
				[data-theme="light"] .bg-primary\/30 {
					background-color: rgba(10, 124, 110, 0.3) !important;
				}
				[data-theme="light"] .from-primary,
				[data-theme="light"] .to-primary {
					--tw-gradient-from: #0a7c6e !important;
					--tw-gradient-to: rgba(10, 124, 110, 0) !important;
				}
				[data-theme="light"] .fill-primary {
					fill: #0a7c6e !important;
				}
				[data-theme="light"] .ring-primary {
					--tw-ring-color: #0a7c6e !important;
				}
				[data-theme="light"] .shadow-\[0_0_8px_\#00C2B1\] {
					box-shadow: 0 0 8px rgba(10, 124, 110, 0.55) !important;
				}
				[data-theme="light"] .shadow-\[0_0_10px_\#43decc\] {
					box-shadow: 0 0 10px rgba(10, 124, 110, 0.55) !important;
				}
				[data-theme="light"] .shadow-\[0_0_15px_rgba\(0\,194\,177\,0\.3\)\] {
					box-shadow: 0 0 15px rgba(10, 124, 110, 0.3) !important;
				}
				[data-theme="light"] .shadow-\[0_0_20px_rgba\(0\,194\,177\,0\.3\)\] {
					box-shadow: 0 0 20px rgba(10, 124, 110, 0.3) !important;
				}
				[data-theme="light"] .shadow-\[0_0_20px_rgba\(0\,194\,177\,0\.4\)\] {
					box-shadow: 0 0 20px rgba(10, 124, 110, 0.35) !important;
				}
				[data-theme="light"] .shadow-\[0_0_25px_rgba\(0\,194\,177\,0\.4\)\] {
					box-shadow: 0 0 25px rgba(10, 124, 110, 0.35) !important;
				}
				[data-theme="light"] .shadow-\[0_0_30px_rgba\(0\,194\,177\,0\.15\)\] {
					box-shadow: 0 0 30px rgba(10, 124, 110, 0.15) !important;
				}
				[data-theme="light"] .shadow-\[0_0_40px_rgba\(0\,194\,177\,0\.08\)\] {
					box-shadow: 0 0 40px rgba(10, 124, 110, 0.08) !important;
				}
				[data-theme="light"] .hover\:bg-primary:hover {
					background-color: #0a7c6e !important;
					color: #ffffff !important;
				}
				[data-theme="light"] .hover\:text-primary:hover {
					color: #0a7c6e !important;
				}
				[data-theme="light"] .hover\:brightness-110:hover {
					filter: brightness(1) saturate(1.1) !important;
				}

				/* Light mode glass panel */
				[data-theme="light"] .glass-panel {
					background: rgba(255, 255, 255, 0.8) !important;
					border: 1px solid rgba(10, 124, 110, 0.15) !important;
					box-shadow: 0 8px 32px 0 rgba(10, 124, 110, 0.08) !important;
				}
				[data-theme="light"] .glass-card {
					background: rgba(255, 255, 255, 0.8) !important;
					border: 1px solid rgba(10, 124, 110, 0.2) !important;
					box-shadow:
						0 8px 32px 0 rgba(0, 0, 0, 0.06),
						inset 0 0 32px rgba(10, 124, 110, 0.03) !important;
				}

				/* Light mode quiz page background */
				[data-theme="light"] .bg-quiz-page {
					background-color: #f5f5f5 !important;
					background-image:
						linear-gradient(
							rgba(245, 245, 245, 0.85),
							rgba(245, 245, 245, 0.85)
						),
						radial-gradient(
							circle at 50% 50%,
							rgba(10, 124, 110, 0.06) 0%,
							transparent 70%
						),
						linear-gradient(rgba(10, 124, 110, 0.04) 1px, transparent 1px),
						linear-gradient(
							90deg,
							rgba(10, 124, 110, 0.04) 1px,
							transparent 1px
						) !important;
				}

				/* Light mode velocity mesh background */
				[data-theme="light"] .velocity-mesh {
					background-color: #f5f5f5 !important;
					background-image: radial-gradient(
						circle at 2px 2px,
						rgba(10, 124, 110, 0.06) 1px,
						transparent 0
					) !important;
				}

				/* Light mode timer ring track */
				[data-theme="light"] .scrollbar-thumb-white\/10 {
					--tw-scrollbar-thumb: rgba(10, 124, 110, 0.2) !important;
				}
			`}</style>
		</div>
	);
}

/* ------------------------------------------------------------------ */
/*  Session Leaderboard Card                                           */
/* ------------------------------------------------------------------ */

function SessionLeaderboardCard({
	sessionId,
	isDark,
}: {
	sessionId: string;
	isDark: boolean;
}) {
	const { data, isLoading } = useQuizSessionLeaderboard(
		sessionId,
		"world-cup-2026",
	);
	const { data: myRank } = useQuizMySessionRank(sessionId, "world-cup-2026");

	function rankEmoji(r: number) {
		if (r === 1) return "#1";
		if (r === 2) return "#2";
		if (r === 3) return "#3";
		return `#${r}`;
	}

	return (
		<div
			className={`glass-panel p-5 rounded-3xl flex flex-col h-full ${isDark ? "border-white/6" : "border-black/8"}`}
		>
			<p
				className={`font-label-bold mb-3 uppercase tracking-widest text-xs ${isDark ? "text-white/40" : "text-black/40"}`}
			>
				Klasemen Sesi 1
			</p>
			<div
				className={`flex-1 overflow-y-auto space-y-1 scrollbar-thin mb-3 ${isDark ? "scrollbar-thumb-white/10" : "scrollbar-thumb-black/10"} scrollbar-track-transparent`}
			>
				{isLoading && (
					<div
						className={`text-center text-xs py-8 ${isDark ? "text-white/30" : "text-black/30"}`}
					>
						Loading...
					</div>
				)}
				{data && !isLoading && data.length === 0 && (
					<div
						className={`text-center text-xs py-8 ${isDark ? "text-white/30" : "text-black/30"}`}
					>
						Belum ada data leaderboard
					</div>
				)}
				{data &&
					!isLoading &&
					data.slice(0, 3).map((entry: QuizWorldCupSessionLeaderboardEntry) => (
						<div
							key={entry.user_id}
							className={`flex items-center justify-between p-2.5 rounded-xl transition-colors ${
								entry.user_id === myRank?.user_id
									? "bg-primary/10 border border-primary/20"
									: isDark
										? "hover:bg-white/5"
										: "hover:bg-black/5"
							}`}
						>
							<div className="flex items-center gap-2">
								<span
									className={`text-xl w-10 text-center font-bold ${isDark ? "text-white" : "text-black/85"}`}
								>
									{entry.rank ? rankEmoji(entry.rank) : "—"}
								</span>
								<div>
									<div
										className={`text-sm font-body-sm truncate max-w-36 ${isDark ? "text-white" : "text-black/85"}`}
									>
										{entry.name || "Anonim"}
									</div>
									<div
										className={`text-xs ${isDark ? "text-white/30" : "text-black/30"}`}
									>
										{formatDuration(entry.duration_formatted)}
									</div>
								</div>
							</div>
							<span className="text-primary text-sm font-label-bold">
								{entry.points ?? 0} Pts
							</span>
						</div>
					))}
			</div>
		</div>
	);
}
