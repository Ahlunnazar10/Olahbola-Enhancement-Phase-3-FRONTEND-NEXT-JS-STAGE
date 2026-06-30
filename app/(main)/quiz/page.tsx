"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Trophy, Star, Clock } from "lucide-react";
import { useAuthStore } from "@/stores/authStore";
import {
	useQuizSummary,
	useQuizWorldCupSessions,
	useQuizGlobalLeaderboard,
	useQuizMyGlobalRank,
} from "@/hooks/queries/useQuiz";
import { useUIStore } from "@/stores/uiStore";

const WORLD_CUP_EVENT_SLUG = "world-cup-2026";
const MAX_NAME_WORDS = 2;

function truncateName(name: string): string {
	const parts = name.trim().split(/\s+/);
	return parts.length <= MAX_NAME_WORDS
		? name
		: parts.slice(0, MAX_NAME_WORDS).join(" ");
}

function formatCountdown(target: Date): string {
	const now = new Date();
	const diffMs = target.getTime() - now.getTime();
	if (diffMs <= 0) return "0 hari, 0 jam";

	const totalMinutes = Math.floor(diffMs / (1000 * 60));
	const days = Math.floor(totalMinutes / (60 * 24));
	const hours = Math.floor((totalMinutes % (60 * 24)) / 60);

	const dayLabel = days === 1 ? "hari" : "hari";
	return `${days} ${dayLabel}, ${hours} jam`;
}

// Parse API duration string like "-45s" or "-2m 15s" into clean display text
function formatDisplayDuration(raw: string): string {
	if (!raw) return "-";
	const abs = raw.replace("-", "");
	return abs;
}

// Parse API duration string into readable format: "45 detik" or "2 menit"
function formatDurationFromApi(raw: string | undefined): string {
	if (!raw) return "-";
	const abs = raw.replace("-", "");

	// Handle "Xs" format
	const secMatch = abs.match(/^(\d+)s$/);
	if (secMatch) {
		const s = parseInt(secMatch[1], 10);
		if (s === 1) return "1 detik";
		if (s < 60) return `${s} detik`;
	}

	// Handle "Xm" format
	const minMatch = abs.match(/^(\d+)m$/);
	if (minMatch) {
		const m = parseInt(minMatch[1], 10);
		if (m === 1) return "1 menit";
		return `${m} menit`;
	}

	// Handle "Xm Ys" format
	const bothMatch = abs.match(/^(\d+)m\s+(\d+)s$/);
	if (bothMatch) {
		const m = parseInt(bothMatch[1], 10);
		const s = parseInt(bothMatch[2], 10);
		const mText = m === 1 ? "1 menit" : `${m} menit`;
		const sText = s === 1 ? "1 detik" : `${s} detik`;
		return `${mText} ${sText}`;
	}

	return abs;
}

function LoadingOverlay() {
	const [progress, setProgress] = useState(0);

	useEffect(() => {
		setProgress(0);
		const start = Date.now();
		const VIRTUAL_TOTAL_MS = 4000;
		const id = setInterval(() => {
			const elapsed = Date.now() - start;
			const ratio = Math.min(elapsed / VIRTUAL_TOTAL_MS, 1);
			const eased = 1 - Math.pow(1 - ratio, 3);
			setProgress(Math.floor(eased * 100));
			if (ratio >= 1) clearInterval(id);
		}, 80);
		return () => clearInterval(id);
	}, []);

	return (
		<div
			className="fixed inset-0 z-9999 flex items-center justify-center bg-black/70 backdrop-blur-md transition-opacity duration-300"
			role="status"
			aria-live="polite"
		>
			<div className="glass-card neon-border rounded-2xl p-10 flex flex-col items-center gap-6 max-w-sm w-full mx-4">
				<div className="relative w-32 h-32 flex items-center justify-center">
					<svg
						className="absolute inset-0 -rotate-90"
						viewBox="0 0 120 120"
						aria-hidden="true"
					>
						<circle
							cx="60"
							cy="60"
							r="52"
							fill="none"
							stroke="currentColor"
							strokeWidth="8"
							className="text-primary/20"
						/>
						<circle
							cx="60"
							cy="60"
							r="52"
							fill="none"
							stroke="currentColor"
							strokeWidth="8"
							strokeLinecap="round"
							strokeDasharray={2 * Math.PI * 52}
							strokeDashoffset={2 * Math.PI * 52 * (1 - progress / 100)}
							className="text-primary transition-[stroke-dashoffset] duration-100 ease-out"
							style={{
								filter: "drop-shadow(0 0 6px rgba(0,194,177,0.6))",
							}}
						/>
					</svg>
					<span className="relative font-display-md text-display-md italic-bold text-primary neon-text tabular-nums">
						{progress}%
					</span>
				</div>
				<div className="text-center space-y-1">
					<p className="font-headline-sm text-headline-sm italic-bold text-white neon-text">
						Memuat Kuis...
					</p>
					<p className="text-on-surface-variant text-sm">
						Mengambil data sesi quiz dan klasemen terbaru. Tunggu bentar ya!
					</p>
				</div>
			</div>
		</div>
	);
}

function formatDuration(totalSeconds: number): string {
	const safe = Math.max(0, Math.floor(totalSeconds));
	const minutes = Math.floor(safe / 60);
	const seconds = safe % 60;
	return `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
}

export default function QuizPage() {
	const router = useRouter();
	const { theme } = useUIStore();
	const isDark = theme === "dark";
	const { user, isAuthenticated } = useAuthStore();
	const { data: summary } = useQuizSummary();
	const { data: rawLeaderboard, isLoading: leaderboardLoading } =
		useQuizGlobalLeaderboard(WORLD_CUP_EVENT_SLUG);
	const { data: myRank, isLoading: myRankLoading } =
		useQuizMyGlobalRank(WORLD_CUP_EVENT_SLUG);
	const {
		data: rawSessions,
		isLoading: sessionsLoading,
		error: sessionsError,
	} = useQuizWorldCupSessions(WORLD_CUP_EVENT_SLUG);
	const [now, setNow] = useState(() => new Date());
	const [isPlaying, setIsPlaying] = useState(false);
	const [navigatingTo, setNavigatingTo] = useState<string | null>(null);
	const [isLeaderboardOpen, setIsLeaderboardOpen] = useState(false);

	useEffect(() => {
		const tick = () => setNow(new Date());
		const interval = setInterval(tick, 60_000);
		const onVisibilityChange = () => {
			if (document.visibilityState === "visible") {
				tick();
			}
		};
		document.addEventListener("visibilitychange", onVisibilityChange);
		return () => {
			clearInterval(interval);
			document.removeEventListener("visibilitychange", onVisibilityChange);
		};
	}, []);

	useEffect(() => {
		if (!isLeaderboardOpen) return;
		const prevOverflow = document.body.style.overflow;
		document.body.style.overflow = "hidden";
		const onKey = (e: KeyboardEvent) => {
			if (e.key === "Escape") setIsLeaderboardOpen(false);
		};
		window.addEventListener("keydown", onKey);
		return () => {
			document.body.style.overflow = prevOverflow;
			window.removeEventListener("keydown", onKey);
		};
	}, [isLeaderboardOpen]);

	const sessions = useMemo(
		() =>
			rawSessions
				? [...rawSessions].sort((a, b) => a.session_number - b.session_number)
				: undefined,
		[rawSessions],
	);

	const hasLiveSession = useMemo(
		() => sessions?.some((s) => s.status === "active" && !s.is_played) ?? false,
		[sessions],
	);

	const firstActiveSession = useMemo(
		() => sessions?.find((s) => s.status === "active" && !s.is_played),
		[sessions],
	);

	// Compute countdown text per session
	const COUNT_TO_SHOW = 3;
	const COUNTDOWN_COMING_SOON = "Coming Soon";

	const getCountdownText = (session: { release_date: string | undefined }) => {
		if (!session.release_date) return "Coming Soon";
		const release = new Date(session.release_date);
		return formatCountdown(release);
	};

	const handlePlayQuiz = (sessionId: string) => {
		if (navigatingTo) return;
		if (!isAuthenticated) {
			router.push("/login");
			return;
		}
		const session = sessions?.find((s) => s.id === sessionId);
		if (session) {
			const target = `/quiz/${sessionId}/play?name=${encodeURIComponent(session.name)}&points=${session.points_per_correct}&total=${session.total_questions}&duration=${session.duration_seconds ?? 120}&sessionNumber=${session.session_number}`;
			setNavigatingTo(target);
			router.push(target);
		} else {
			const target = `/quiz/${sessionId}/play`;
			setNavigatingTo(target);
			router.push(target);
		}
	};

	const handlePlayNow = () => {
		if (firstActiveSession) {
			handlePlayQuiz(firstActiveSession.id);
		} else {
			router.push("/quiz");
		}
	};

	// Process global leaderboard data
	const leaderboardDisplay = useMemo(() => {
		if (!rawLeaderboard) return null;

		// Find user in leaderboard by matching user_id with authenticated user id
		const userId = user?.id ?? null;
		const userIndex = userId
			? rawLeaderboard.findIndex((e) => e.user_id === userId)
			: -1;
		const userInTop = userIndex >= 0;

		// Sort by rank ascending
		const sorted = [...rawLeaderboard].sort((a, b) => a.rank - b.rank);

		return {
			top: sorted.slice(0, Math.min(COUNT_TO_SHOW, sorted.length)),
			userInTop,
			userRankInTop: userInTop ? userIndex : -1,
		};
	}, [rawLeaderboard, user?.id]);

	const myRankDisplay = useMemo(() => {
		if (!myRank || !isAuthenticated) return null;
		return {
			rank: myRank.rank,
			points: myRank.total_points,
		};
	}, [myRank, isAuthenticated]);

	// Jika terjadi error saat mengambil data
	if (sessionsError) {
		return (
			<div className="min-h-screen velocity-mesh flex items-center justify-center px-4">
				<div className="glass-card rounded-xl p-8 text-center max-w-md">
					<h2 className="text-white text-xl font-headline-sm mb-4">
						Gagal memuat data kuis
					</h2>
					<p className="text-on-surface-variant text-sm mb-6">
						Terjadi kesalahan saat menghubungi server. Silakan coba lagi nanti.
					</p>
					<button
						onClick={() => window.location.reload()}
						className="bg-primary text-black px-6 py-2 rounded-lg font-label-bold"
					>
						Muat Ulang
					</button>
				</div>
			</div>
		);
	}

	return (
		<div
			data-theme={theme}
			className={`relative min-h-screen velocity-mesh overflow-x-hidden transition-colors duration-300 ${isDark ? "bg-[#050505]" : "bg-[#f5f5f5]"}`}
		>
			{/* Loader Overlay: tampil saat sedang memuat data event sessions */}
			{sessionsLoading && <LoadingOverlay />}

			{/* Background Blobs */}
			<div
				className={`vibrant-blob top-[10%] -left-40 ${isDark ? "bg-primary" : "bg-[#0a7c6e]"}`}
			/>
			<div
				className={`vibrant-blob top-[40%] -right-40 ${isDark ? "bg-tertiary-container" : "bg-[#b3461a]/30"}`}
			/>
			<div
				className={`vibrant-blob bottom-[10%] left-1/2 -translate-x-1/2 ${isDark ? "bg-primary-container" : "bg-[#0a7c6e]/30"}`}
			/>

			{/* Hero Section */}
			<section className="relative w-full min-h-100 lg:h-125 overflow-hidden mb-12 group shadow-[0_0_50px_rgba(0,0,0,0.5)]">
				<div className="absolute inset-0 z-0">
					<img
						alt="Football Stadium"
						src="/images/quiz/quiz-bg.webp"
						className="w-full h-full object-cover grayscale brightness-50 contrast-125 transition-transform duration-1000 group-hover:scale-105"
					/>
				</div>
				<div className="absolute inset-0 bg-linear-to-t from-surface via-transparent to-transparent z-10" />
				<div className="relative z-20 flex flex-col items-center justify-center min-h-100 lg:h-full text-center p-6 py-12 lg:py-0">
					<h1 className="quiz-hero-title italic-bold font-bold text-white mb-6 leading-none neon-text">
						KUIS
						<br />
						<span className="text-[#1FE6DA]">TEATER BOLA DUNIA</span>
					</h1>

					<button
						onClick={handlePlayNow}
						disabled={!hasLiveSession}
						className="bg-primary-container text-on-primary-container px-12 py-4 rounded-full font-headline-md italic-bold neon-glow-btn active:scale-95 transition-all hover:scale-105 hover:brightness-110 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 disabled:hover:brightness-100"
					>
						{hasLiveSession ? "MAIN SEKARANG!" : "SEGERA HADIR"}
					</button>
				</div>
			</section>

			<main className="relative pt-12 pb-12 px-4 md:px-8 max-w-7xl mx-auto z-10">
				<div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
					{/* Main Content Area (8 Columns) */}
					<div className="lg:col-span-8 space-y-8">
						{/* Featured Section: Bento Grid */}
						<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
							{sessionsLoading &&
								Array.from({ length: 2 }).map((_, i) => (
									<div
										key={i}
										className="glass-card rounded-xl p-8 min-h-80 animate-pulse border-primary/30"
									/>
								))}

							{!sessionsLoading &&
								sessions?.map((session) => {
									const isLive = session.status === "active";
									const isPlayed = session.is_played;
									const isComingSoon = session.status === "coming_soon";

									const statusLabel = isLive
										? "LIVE NOW"
										: isPlayed
											? "PLAYED"
											: "Coming Soon";
									const totalQuestions = session.total_questions ?? 0;
									const durationMin = Math.floor(
										(session.duration_seconds ?? 0) / 60,
									);
									const durationSec = (session.duration_seconds ?? 0) % 60;
									const durationText = `${durationMin}m ${durationSec}s`;
									const isDisabled = !isLive || isPlayed;

									return (
										<div
											key={session.id}
											className={`glass-card rounded-xl p-8 flex flex-col justify-between min-h-60 relative overflow-hidden group transition-all ${
												isDisabled
													? "border-outline-variant opacity-60"
													: "border-primary/30"
											}`}
										>
											<div className="absolute top-0 right-0 p-4">
												<span
													className={`flex items-center gap-2 font-label-bold px-3 py-1 rounded-full border shadow-[0_0_15px_rgba(0,194,177,0.3)] ${
														isLive
															? "text-primary bg-primary/20 border-primary/40 animate-pulse"
															: "text-on-surface-variant bg-outline-variant/20 border-outline-variant"
													}`}
												>
													<span
														className={`w-2 h-2 rounded-full ${
															isLive
																? "bg-primary shadow-[0_0_8px_#00C2B1]"
																: "bg-on-surface-variant"
														}`}
													/>
													{statusLabel}
												</span>
											</div>
											<div className="mt-5">
												<h3
													className={`font-extrabold text-3xl italic-bold ${isDark ? "text-white" : "text-[#329589]"} mt-2 neon-text`}
												>
													{session.name}
												</h3>
												<p
													className={`text-sm mt-2 ${isDark ? "text-on-surface-variant" : "text-black/80"}`}
												>
													{session.subtitle}
												</p>
											</div>
											<div className="mt-8">
												<div className="flex items-center gap-4 mb-4">
													<span
														className={`${
															isLive
																? "text-on-surface"
																: "text-on-surface-variant"
														}`}
													>
														{isLive
															? `${session.total_players ?? 0} Pemain Berpartisipasi`
															: `Rilis dalam: ${getCountdownText(session)}`}
													</span>
												</div>
												<button
													onClick={() => handlePlayQuiz(session.id)}
													disabled={
														isDisabled || isPlaying || navigatingTo !== null
													}
													className="w-full bg-transparent border-2 border-primary text-primary px-6 py-3 rounded-lg font-label-bold italic-bold hover:bg-primary hover:text-black transition-all hover:shadow-[0_0_20px_rgba(0,194,177,0.4)] disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-transparent disabled:hover:text-primary"
												>
													{navigatingTo !== null
														? "LOADING..."
														: isPlaying
															? "LOADING..."
															: isDisabled && !isLive
																? "TERKUNCI"
																: isPlayed
																	? "SUDAH MAIN"
																	: "MAIN KUIS"}
												</button>
											</div>
										</div>
									);
								})}

							{!sessionsLoading && sessions && sessions.length === 0 && (
								<div className="glass-card rounded-xl p-8 col-span-full text-center text-on-surface-variant">
									Belum ada kuis session yang aktif saat ini.
								</div>
							)}
						</div>
					</div>

					{/* Sidebar (4 Columns) – tidak diubah untuk menjaga panjang jawaban */}
					<aside className="lg:col-span-4 space-y-8">
						{/* Leaderboard - Global World Cup */}
						<div className="glass-card rounded-xl p-6 neon-border bg-black/60">
							<h2
								className={`font-headline-md text-headline-md italic-bold ${isDark ? "text-white" : "text-black/80"} mb-6 flex items-center gap-3 neon-text`}
							>
								Klasemen Sementara
							</h2>
							<div className="space-y-4">
								{/* Loading state */}
								{leaderboardLoading &&
									Array.from({ length: COUNT_TO_SHOW }).map((_, i) => (
										<div
											key={`lb-skel-${i}`}
											className="p-3 rounded-lg bg-white/5 animate-pulse"
										>
											<div className="flex items-center gap-4">
												<div className="w-8 h-6 bg-white/10 rounded" />
												<div className="flex-1 flex flex-col items-end gap-1">
													<div className="w-24 h-4 bg-white/10 rounded" />
													<div className="w-20 h-3 bg-white/5 rounded" />
												</div>
											</div>
										</div>
									))}

								{/* Dynamic leaderboard entries */}
								{!leaderboardLoading &&
									leaderboardDisplay &&
									leaderboardDisplay.top.length > 0 &&
									leaderboardDisplay.top.map((entry) => {
										const isUser = entry.user_id === user?.id;
										const isTop1 = entry.rank === 1;

										return (
											<div
												key={entry.user_id}
												className={`flex items-center gap-4 p-3 rounded-lg relative overflow-hidden group transition-all cursor-pointer text-end ${
													isUser
														? "bg-transparent border-2 border-primary shadow-[0_0_25px_rgba(0,194,177,0.4)]"
														: isTop1
															? "bg-primary/20 border-2 border-primary/60 shadow-[0_0_25px_rgba(0,194,177,0.3)]"
															: "hover:bg-white/5"
												}`}
											>
												{isUser && (
													<div className="absolute inset-0 bg-primary/10 -translate-x-full group-hover:translate-x-0 transition-transform duration-500" />
												)}
												<div
													className={`font-display-xl text-3xl italic-bold w-8 relative z-10 ${
														isUser
															? "text-gray opacity-80"
															: isTop1
																? "text-primary opacity-80"
																: "text-on-surface-variant opacity-30"
													}`}
												>
													{String(entry.rank).padStart(2, "0")}
												</div>
												<div className="flex-1 relative z-10 text-end">
													<div
														className={`font-label-bold ${isDark ? "text-white" : "text-black/80"} truncate`}
													>
														{truncateName(entry.name)}
														{isUser && (
															<span className="ml-2 text-xs text-primary font-label-bold bg-primary/30 px-1.5 py-0.5 rounded">
																KAMU
															</span>
														)}
													</div>
													<div
														className={`text-xs   ${
															isUser || isTop1
																? "text-primary"
																: "text-on-surface-variant"
														}`}
													>
														{entry.total_points.toLocaleString()} POINTS •{" "}
														{formatDurationFromApi(
															entry.total_duration_formatted,
														)}
													</div>
												</div>
												{isTop1 && (
													<Star className="size-5 text-primary fill-primary relative z-10" />
												)}
											</div>
										);
									})}

								{/* Empty state when no leaderboard data */}
								{!leaderboardLoading &&
									leaderboardDisplay &&
									leaderboardDisplay.top.length === 0 && (
										<div className="text-center py-8 text-on-surface-variant text-sm">
											<Trophy className="size-8 mx-auto mb-2 opacity-40" />
											<p>Belum ada data leaderboard</p>
										</div>
									)}

								{/* User NOT in top 3 — show realtime rank from my-rank API */}
								{leaderboardDisplay &&
									isAuthenticated &&
									user &&
									leaderboardDisplay.userRankInTop >= COUNT_TO_SHOW &&
									myRankDisplay && (
										<div className="mt-6 pt-4 border-t border-outline-variant">
											<div
												className={`flex items-center gap-4  p-3 rounded-lg border ${isDark ? "bg-tertiary-container/30" : "bg-[#9be1d2]"} border-tertiary/60 shadow-[0_0_20px_rgba(255,143,99,0.3)] text-end`}
											>
												<div className="font-display-xl text-3xl italic-bold text-white opacity-50 w-8">
													{String(myRankDisplay.rank).padStart(2, "0")}
												</div>
												<div className="flex-1">
													<div
														className={`font-label-bold ${isDark ? "text-white" : "text-black/80"} truncate`}
													>
														{truncateName(user.name)}
														<span
															className={`ml-2 text-xs text-tertiary-fixed-dim font-label-bold bg-tertiary-container/50 px-1.5 py-0.5 rounded ${isDark ? "text-white" : "text-black"}`}
														>
															KAMU
														</span>
													</div>
													<div
														className={`text-xs mt-1 ${isDark ? "text-white" : "text-black/80"}	`}
													>
														{myRankDisplay.points.toLocaleString()} POINTS •{" "}
														{formatDurationFromApi(
															myRank?.total_duration_formatted,
														)}
													</div>
												</div>
											</div>
										</div>
									)}

								{/* Not logged in */}
								{!isAuthenticated && (
									<div className="mt-6 pt-4 border-t border-outline-variant text-center">
										<p className="text-on-surface-variant text-sm mb-4">
											Login untuk melihat posisi kamu
										</p>
										<Link
											href="/login"
											className="inline-block w-full bg-primary-container text-on-primary-container py-3 rounded-lg font-label-bold neon-glow-btn transition-all hover:scale-105"
										>
											LOGIN SEKARANG
										</Link>
									</div>
								)}
							</div>
							<button
								type="button"
								onClick={() => setIsLeaderboardOpen(true)}
								className="block w-full mt-6 py-3 rounded-lg font-label-bold text-center border border-primary/40 text-primary hover:bg-primary/10 transition-all"
							>
								LIHAT LEADERBOARD LENGKAP
							</button>
						</div>

						{/* How to Play Section (tidak berubah) */}
						<div className="glass-card rounded-xl p-8">
							<h2
								className={`font-headline-md text-headline-md italic-bold ${isDark ? "text-white" : "text-black/80"} mb-6 flex items-center gap-3 neon-text`}
							>
								CARA BERMAIN
							</h2>
							<div className="grid grid-cols-1  gap-6">
								<div className="text-center">
									<div className="w-16 h-16 rounded-full bg-primary/20 border-2 border-primary flex items-center justify-center mx-auto mb-4 shadow-[0_0_20px_rgba(0,194,177,0.3)]">
										<span className="text-3xl font-extrabold text-primary neon-text">
											1
										</span>
									</div>
									<h3 className="font-label-bold text-white mb-2">
										PILIH KUIS
									</h3>
									<p
										className={`text-sm ${isDark ? "text-on-surface-variant" : "text-black/80"}`}
									>
										Pilih kuis sesuai sesi yang tersedia, pastikan kamu selesai
										sebelum waktu habis!
									</p>
								</div>
								<div className="text-center">
									<div className="w-16 h-16 rounded-full bg-primary/20 border-2 border-primary flex items-center justify-center mx-auto mb-4 shadow-[0_0_20px_rgba(0,194,177,0.3)]">
										<span className="text-3xl font-extrabold text-primary neon-text">
											2
										</span>
									</div>
									<h3 className="font-label-bold text-white mb-2">
										JAWAB SOAL
									</h3>
									<p
										className={`text-sm ${isDark ? "text-on-surface-variant" : "text-black/80"}`}
									>
										Jawab pertanyaan pilihan ganda dalam waktu yang ditentukan
									</p>
								</div>
								<div className="text-center">
									<div className="w-16 h-16 rounded-full bg-primary/20 border-2 border-primary flex items-center justify-center mx-auto mb-4 shadow-[0_0_20px_rgba(0,194,177,0.3)]">
										<span className="text-3xl font-extrabold text-primary neon-text">
											3
										</span>
									</div>
									<h3 className="font-label-bold text-white mb-2">
										KUMPUL POIN
									</h3>
									<p
										className={`text-sm ${isDark ? "text-on-surface-variant" : "text-black/80"}`}
									>
										Kumpulkan poin dan naik di leaderboard untuk menang hadiah!
									</p>
								</div>
							</div>
						</div>
					</aside>
				</div>
			</main>

			{/* Full Leaderboard Modal */}
			{isLeaderboardOpen && (
				<div className="fixed inset-0 z-9999 flex items-center justify-center p-4">
					{/* Backdrop */}
					<div
						className="absolute inset-0 bg-black/60 backdrop-blur-sm"
						onClick={() => setIsLeaderboardOpen(false)}
					/>

					{/* Modal content */}
					<div
						className={`relative z-10 w-full max-w-md rounded-3xl border p-6 shadow-2xl transition-colors duration-300 ${
							isDark
								? "bg-[#0a0f0d] border-[rgba(0,194,177,0.3)]"
								: "bg-white border-[rgba(10,124,110,0.25)]"
						}`}
					>
						{/* Header */}
						<div className="flex items-center justify-between mb-6">
							<div className="flex items-center gap-3">
								<h2
									className={`font-headline-md italic-bold ${isDark ? "text-white" : "text-black/85"}`}
								>
									Klasemen Lengkap
								</h2>
							</div>
							<button
								type="button"
								onClick={() => setIsLeaderboardOpen(false)}
								className={`size-9 flex items-center justify-center rounded-full transition-colors ${
									isDark
										? "hover:bg-white/10 text-white/60"
										: "hover:bg-black/5 text-black/40"
								}`}
								aria-label="Tutup"
							>
								<svg
									width="18"
									height="18"
									viewBox="0 0 24 24"
									fill="none"
									stroke="currentColor"
									strokeWidth="2"
									strokeLinecap="round"
									strokeLinejoin="round"
								>
									<line x1="18" y1="6" x2="6" y2="18" />
									<line x1="6" y1="6" x2="18" y2="18" />
								</svg>
							</button>
						</div>

						{/* Leaderboard list */}
						<div className="max-h-80 overflow-y-auto space-y-2 pr-1">
							{rawLeaderboard ? (
								rawLeaderboard.length === 0 ? (
									<div
										className={`text-center py-10 text-sm ${isDark ? "text-white/30" : "text-black/30"}`}
									>
										Belum ada data leaderboard.
									</div>
								) : (
									rawLeaderboard
										.slice()
										.sort((a, b) => a.rank - b.rank)
										.map((entry, idx) => {
											const isUser = entry.user_id === user?.id;
											const medalEmoji =
												idx === 0
													? "#1"
													: idx === 1
														? "#2"
														: idx === 2
															? "#3"
															: null;
											return (
												<div
													key={entry.user_id}
													className={`flex items-center gap-3 p-3 rounded-xl transition-all ${
														isUser
															? `border ${
																	isDark
																		? "border-primary/40 bg-primary/10"
																		: "border-[#0a7c6e]/40 bg-[#0a7c6e]/10"
																}`
															: isDark
																? "border border-transparent hover:bg-white/5"
																: "border border-transparent hover:bg-black/5"
													}`}
												>
													{/* Rank */}
													<span
														className={`w-8 text-center font-display-lg italic-bold text-xl ${
															idx < 3
																? ""
																: isDark
																	? "text-white/30"
																	: "text-black/30"
														}`}
													>
														{medalEmoji ?? `#${entry.rank}`}
													</span>

													{/* Name + email */}
													<div className="flex-1 min-w-0">
														<div
															className={`text-sm font-label-bold truncate ${
																isUser
																	? isDark
																		? "text-primary"
																		: "text-[#0a7c6e]"
																	: isDark
																		? "text-white"
																		: "text-black/85"
															}`}
														>
															{entry.name || "Anonim"}
															{isUser && (
																<span className="ml-2 text-[10px] text-primary font-label-bold bg-primary/30 px-1.5 py-0.5 rounded">
																	KAMU
																</span>
															)}
														</div>
														<div
															className={`text-xs truncate ${isDark ? "text-white/30" : "text-black/30"}`}
														>
															{entry.email || "—"}
														</div>
													</div>

													{/* Points */}
													<div className="text-right">
														<span
															className={`text-sm font-label-bold ${isDark ? "text-primary" : "text-[#0a7c6e]"}`}
														>
															{entry.total_points} Pts
														</span>
														<div
															className={`text-[10px] truncate max-w-20 ${isDark ? "text-white/30" : "text-black/30"}`}
														>
															{formatDurationFromApi(
																entry.total_duration_formatted,
															)}
														</div>
													</div>
												</div>
											);
										})
								)
							) : (
								<div
									className={`text-center py-10 text-sm ${isDark ? "text-white/30" : "text-black/30"}`}
								>
									Memuat...
								</div>
							)}
						</div>
					</div>
				</div>
			)}

			<style jsx global>{`
				/* ================================
				   LIGHT MODE OVERRIDES
				   Ganti semua teal primer (#1FE6DA / primary) ke #0A7C6E
				   hanya saat data-theme="light" di root quiz page
				   ================================ */
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
				[data-theme="light"] .shadow-\[0_0_15px_rgba\(0\,194\,177\,0\.3\)\] {
					box-shadow: 0 0 15px rgba(10, 124, 110, 0.3) !important;
				}
				[data-theme="light"] .shadow-\[0_0_20px_rgba\(0\,194\,177\,0\.3\)\] {
					box-shadow: 0 0 20px rgba(10, 124, 110, 0.3) !important;
				}
				[data-theme="light"] .shadow-\[0_0_25px_rgba\(0\,194\,177\,0\.4\)\] {
					box-shadow: 0 0 25px rgba(10, 124, 110, 0.35) !important;
				}
				[data-theme="light"] .shadow-\[0_0_30px_rgba\(0\,194\,177\,0\.15\)\] {
					box-shadow: 0 0 30px rgba(10, 124, 110, 0.15) !important;
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

				/* ================================
				   HERO TITLE RESPONSIVE
				   text-display-xl = 72px (terlalu besar di mobile)
				   Mobile: 36px, sm: 48px, md: 60px, lg: 72px
				   ================================ */
				.quiz-hero-title {
					font-size: 36px;
					line-height: 1.05;
					letter-spacing: -0.02em;
				}
				@media (min-width: 640px) {
					.quiz-hero-title {
						font-size: 48px;
						line-height: 1.05;
						letter-spacing: -0.03em;
					}
				}
				@media (min-width: 768px) {
					.quiz-hero-title {
						font-size: 60px;
						line-height: 1.1;
						letter-spacing: -0.04em;
					}
				}
				@media (min-width: 1024px) {
					.quiz-hero-title {
						font-size: 72px;
						line-height: 1.1;
						letter-spacing: -0.04em;
					}
				}

				/* style sama seperti sebelumnya – tidak diubah */
				.velocity-mesh {
					background-color: ${isDark ? "#050505" : "#f5f5f5"};
					background-image: radial-gradient(
						circle at 2px 2px,
						${isDark
							? "rgba(0, 194, 177, 0.05) 1px"
							: "rgba(10, 124, 110, 0.05) 1px"},
						transparent 0
					);
					background-size: 40px 40px;
				}
				.glass-card {
					background: ${isDark
						? "rgba(10, 15, 13, 0.7)"
						: "rgba(255, 255, 255, 0.8)"};
					backdrop-filter: blur(40px);
					border: 1px solid
						${isDark ? "rgba(0, 194, 177, 0.2)" : "rgba(10, 124, 110, 0.2)"};
					transition: all 0.3s ease;
				}
				.glass-card:hover {
					border-color: ${isDark
						? "rgba(0, 194, 177, 0.5)"
						: "rgba(10, 124, 110, 0.5)"};
					box-shadow: 0 0 30px
						${isDark ? "rgba(0, 194, 177, 0.15)" : "rgba(10, 124, 110, 0.15)"};
				}
				.neon-border {
					border: 2px solid ${isDark ? "#00c2b1" : "#0a7c6e"};
					box-shadow: 0 0 25px
						${isDark ? "rgba(0, 194, 177, 0.5)" : "rgba(10, 124, 110, 0.4)"};
				}
				.glass-card .neon-text,
				.neon-text {
					text-shadow:
						0 0 10px
							${isDark ? "rgba(64, 220, 202, 0.5)" : "rgba(10, 124, 110, 0.4)"},
						0 0 20px
							${isDark ? "rgba(64, 220, 202, 0.3)" : "rgba(10, 124, 110, 0.2)"};
				}
				.neon-glow-btn {
					box-shadow: 0 0 25px
						${isDark ? "rgba(0, 194, 177, 0.5)" : "rgba(10, 124, 110, 0.4)"};
				}
				.italic-bold {
					font-style: italic;
					text-transform: uppercase;
				}
				@keyframes float {
					0%,
					100% {
						transform: translateY(0);
					}
					50% {
						transform: translateY(-10px);
					}
				}
				.animate-float {
					animation: float 4s ease-in-out infinite;
				}
				.vibrant-blob {
					position: absolute;
					width: 400px;
					height: 400px;
					filter: blur(100px);
					opacity: 0.15;
					border-radius: 50%;
					z-index: 0;
					pointer-events: none;
				}
			`}</style>
		</div>
	);
}
