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
function formatDurationFromApi(raw: string): string {
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
			const target = `/quiz/${sessionId}/play?name=${encodeURIComponent(session.name)}&points=${session.points_per_correct}&total=${session.total_questions}&duration=${session.duration_seconds ?? 120}`;
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
						Gagal memuat data quiz
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
			className={`min-h-screen velocity-mesh transition-colors duration-300 ${isDark ? "bg-[#050505]" : "bg-[#f5f5f5]"}`}
		>
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
			<section className="relative w-full h-125 overflow-hidden mb-12 group shadow-[0_0_50px_rgba(0,0,0,0.5)]">
				<div className="absolute inset-0 z-0">
					<img
						alt="Football Stadium"
						src="https://i.pinimg.com/736x/f5/43/12/f543125fc77c68f3975cdc236c627695.jpg"
						className="w-full h-full object-cover grayscale brightness-50 contrast-125 transition-transform duration-1000 group-hover:scale-105"
					/>
				</div>
				<div className="absolute inset-0 bg-linear-to-t from-surface via-transparent to-transparent z-10" />
				<div className="relative z-20 flex flex-col items-center justify-center h-full text-center p-6">
					<h1 className="font-display-xl text-display-xl italic-bold text-white mb-4 leading-none tracking-tight neon-text">
						KUIS SPESIAL
						<br />
						<span className="text-primary-fixed-dim">WORLD CUP 2026</span>
					</h1>
					<p className="font-body-lg text-body-lg text-on-surface-variant max-w-2xl mb-8">
						Uji pengetahuan sepak bola kamu dan Buktikan Kamu adalah si-paling
						tau bola dan menangkan hadiah jersey original!
					</p>
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
											className={`glass-card rounded-xl p-8 flex flex-col justify-between min-h-80 relative overflow-hidden group transition-all ${
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
												<span className="font-label-bold text-primary/80 uppercase tracking-widest">
													WC SPECIAL EDITION
												</span>
												<h3 className="font-extrabold text-3xl italic-bold text-white mt-2 neon-text">
													{session.name}
												</h3>
												<p className="text-on-surface-variant mt-3 text-sm">
													{session.subtitle}
												</p>
											</div>
											<div className="mt-8">
												<div className="flex items-center gap-4 mb-4">
													<Clock
														className={`size-5 ${
															isLive
																? "text-primary neon-text"
																: "text-on-surface-variant"
														}`}
													/>
													<span
														className={
															isLive
																? "text-on-surface"
																: "text-on-surface-variant"
														}
													>
														{getCountdownText(session)}
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
																? "LOCKED"
																: isPlayed
																	? "ALREADY PLAYED"
																	: "PLAY QUIZ"}
												</button>
											</div>
										</div>
									);
								})}

							{!sessionsLoading && sessions && sessions.length === 0 && (
								<div className="glass-card rounded-xl p-8 col-span-full text-center text-on-surface-variant">
									Belum ada quiz session yang aktif saat ini.
								</div>
							)}
						</div>
					</div>

					{/* Sidebar (4 Columns) – tidak diubah untuk menjaga panjang jawaban */}
					<aside className="lg:col-span-4 space-y-8">
						{/* Leaderboard - Global World Cup */}
						<div className="glass-card rounded-xl p-6 neon-border bg-black/60">
							<h2 className="font-headline-md text-headline-md italic-bold text-white mb-6 flex items-center gap-3 neon-text">
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
													<div className="font-label-bold text-white truncate">
														{entry.name}
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

								{/* User NOT in top — show at bottom */}
								{leaderboardDisplay &&
									isAuthenticated &&
									user &&
									!leaderboardDisplay.userInTop &&
									myRankDisplay && (
										<div className="mt-6 pt-4 border-t border-outline-variant">
											<div className="flex items-center gap-4 bg-tertiary-container/30 p-3 rounded-lg border border-tertiary/60 shadow-[0_0_20px_rgba(255,143,99,0.3)] text-end">
												<div className="font-display-xl text-3xl italic-bold text-white opacity-50 w-8">
													{String(myRankDisplay.rank).padStart(2, "0")}
												</div>
												<div className="flex-1">
													<div className="font-label-bold text-white">
														{user.name}
														<span className="ml-2 text-xs text-tertiary-fixed-dim font-label-bold bg-tertiary-container/50 px-1.5 py-0.5 rounded">
															KAMU
														</span>
													</div>
													<div className="text-xs text-tertiary-fixed-dim font-bold uppercase">
														{myRankDisplay.points.toLocaleString()} POINTS
													</div>
												</div>
											</div>
											<div className="flex items-center justify-center gap-2 mt-3 text-xs text-on-surface-variant text-center">
												<Clock className="size-3" />
												<span>
													Durasi:{" "}
													{myRank
														? formatDurationFromApi(
																myRank.total_duration_formatted,
															)
														: "-"}
												</span>
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
							<Link
								href="/leaderboard"
								className="block w-full mt-6 py-3 rounded-lg font-label-bold text-center border border-primary/40 text-primary hover:bg-primary/10 transition-all"
							>
								LIHAT LEADERBOARD LENGKAP
							</Link>
						</div>

						{/* How to Play Section (tidak berubah) */}
						<div className="glass-card rounded-xl p-8">
							<h2 className="font-headline-md text-headline-md italic-bold text-white mb-6 neon-text text-center">
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
										PILIH QUIZ
									</h3>
									<p className="text-on-surface-variant text-sm">
										Pilih quiz yang tersedia sesuai sesi yang tersedia, pastikan
										kamu siap sebelum waktu habis!
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
									<p className="text-on-surface-variant text-sm">
										Jawab sejumlah pertanyaan pilihan ganda dalam waktu yang
										ditentukan
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
									<p className="text-on-surface-variant text-sm">
										Kumpulkan poin dan naik di leaderboard untuk menang hadiah!
									</p>
								</div>
							</div>
						</div>
					</aside>
				</div>
			</main>

			<style jsx global>{`
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
