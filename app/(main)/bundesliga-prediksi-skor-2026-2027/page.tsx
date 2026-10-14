"use client";

import { useState, useMemo, useEffect, useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { Lock, Check, X, Trophy, Circle, ChevronDown } from "lucide-react";
import { useUIStore } from "@/stores/uiStore";
import { useAuthStore } from "@/stores/authStore";
import {
	useMatchdays,
	useMatches,
	useTeams,
	useLeaderboard,
	useMyPredictions,
	useMyRank,
	useMySummary,
	useSubmitPrediction,
	formatMatchDate,
	type Match,
	type LeaderboardEntry,
} from "@/hooks/queries/useBundesliga";
import { PublicLeaderboard } from "@/components/games/PublicLeaderboard";
import { EventEndedBanner } from "@/components/games/EventEndedBanner";
import { EVENT_STATUS } from "@/lib/games/eventStatus";
import toast from "react-hot-toast";

// ============================================================
// SKELETON LOADER
// ============================================================
function MatchCardSkeleton() {
	const s = "rounded-xl animate-pulse";
	return (
		<div
			className="p-8 rounded-3xl backdrop-blur-xl border"
			style={{
				background: "rgba(255,255,255,0.03)",
				borderColor: "rgba(255,255,255,0.07)",
			}}
		>
			<div className="flex justify-between items-center mb-8">
				<div
					className={`h-3 w-24 ${s}`}
					style={{ background: "rgba(255,255,255,0.1)" }}
				/>
				<div
					className={`h-3 w-16 ${s}`}
					style={{ background: "rgba(255,255,255,0.1)" }}
				/>
			</div>
			<div className="flex items-center justify-between gap-4 mb-10">
				<div className="flex flex-col items-center gap-3 flex-1">
					<div
						className="w-20 h-20 rounded-full"
						style={{ background: "rgba(255,255,255,0.1)" }}
					/>
					<div
						className={`h-4 w-20 ${s}`}
						style={{ background: "rgba(255,255,255,0.1)" }}
					/>
				</div>
				<div
					className={`h-8 w-12 ${s}`}
					style={{ background: "rgba(255,255,255,0.1)" }}
				/>
				<div className="flex flex-col items-center gap-3 flex-1">
					<div
						className="w-20 h-20 rounded-full"
						style={{ background: "rgba(255,255,255,0.1)" }}
					/>
					<div
						className={`h-4 w-20 ${s}`}
						style={{ background: "rgba(255,255,255,0.1)" }}
					/>
				</div>
			</div>
			<div
				className="h-12 w-full rounded-2xl"
				style={{ background: "rgba(255,255,255,0.1)" }}
			/>
		</div>
	);
}

// ============================================================
// TEAM BADGE (logo or initials)
// ============================================================
function TeamBadge({
	team,
	isDark,
}: {
	team: { name: string; code: string; logo_url: string | null };
	isDark: boolean;
}) {
	const primary = isDark ? "#43decc" : "#0a7c6e";
	const bgColor = isDark
		? "rgba(67, 222, 204, 0.15)"
		: "rgba(10, 124, 110, 0.15)";
	const borderColor = isDark
		? "rgba(67, 222, 204, 0.3)"
		: "rgba(10, 124, 110, 0.3)";
	const textColor = isDark ? "#43decc" : "#0a7c6e";

	if (team.logo_url) {
		return (
			<div
				className="w-14 h-14 rounded-full overflow-hidden flex items-center justify-center border"
				style={{ background: bgColor, borderColor }}
			>
				<img
					src={team.logo_url}
					alt={team.name}
					className="w-full h-full object-cover"
					loading="lazy"
				/>
			</div>
		);
	}

	const words = team.name.trim().split(/\s+/);
	const abbr =
		words.length === 1
			? words[0].slice(0, 2).toUpperCase()
			: words
					.map((w) => w[0])
					.join("")
					.slice(0, 2)
					.toUpperCase();

	return (
		<div
			className="w-14 h-14 rounded-full flex items-center justify-center font-black text-md border"
			style={{ background: bgColor, color: textColor, borderColor }}
		>
			{abbr}
		</div>
	);
}

// ============================================================
// LOADING OVERLAY
// ============================================================
function LoadingOverlay() {
	const [progress, setProgress] = useState(0);
	useEffect(() => {
		setProgress(0);
		const start = Date.now();
		const id = setInterval(() => {
			const elapsed = Date.now() - start;
			const ratio = Math.min(elapsed / 4000, 1);
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
			<div
				className="rounded-2xl p-10 flex flex-col items-center gap-6 max-w-sm w-full mx-4 border"
				style={{
					background: "rgba(255,255,255,0.03)",
					borderColor: "rgba(67, 222, 204, 0.3)",
				}}
			>
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
							style={{ color: "#43decc" }}
							className="transition-[stroke-dashoffset] duration-100 ease-out"
						/>
					</svg>
					<span className="relative font-medium italic text-xl text-primary tabular-nums">
						{progress}%
					</span>
				</div>
				<div className="text-center space-y-1">
					<p className="font-bold text-lg" style={{ color: "#e5e2e1" }}>
						Tunggu bentar ya!
					</p>
					<p className="text-sm" style={{ color: "#bbcac6" }}>
						Memuat Data Pertandingan Bundesliga 2026/2027...
					</p>
				</div>
			</div>
		</div>
	);
}

// ============================================================
// CONFIG — ubah nilai ini untuk geser matchday aktif default
// ============================================================
const DEFAULT_ACTIVE_MATCHDAY = 6;

// ============================================================
// MAIN PAGE
// ============================================================
export default function PrediksiSkorPage() {
	const { theme } = useUIStore();
	const { isAuthenticated, user } = useAuthStore();
	const router = useRouter();
	const isDark = theme === "dark";

	const [activeMatchday, setActiveMatchday] = useState<number>(
		DEFAULT_ACTIVE_MATCHDAY,
	);
	const [dropdownOpen, setDropdownOpen] = useState(false);
	const dropdownRef = useRef<HTMLDivElement>(null);
	useEffect(() => {
		const handleClickOutside = (e: MouseEvent) => {
			if (
				dropdownRef.current &&
				!dropdownRef.current.contains(e.target as Node)
			) {
				setDropdownOpen(false);
			}
		};
		document.addEventListener("mousedown", handleClickOutside);
		return () => document.removeEventListener("mousedown", handleClickOutside);
	}, []);
	const [activeTab, setActiveTab] = useState<"matches" | "leaderboard">(
		"matches",
	);
	const [isAuthReady, setIsAuthReady] = useState(false);
	useEffect(() => {
		setIsAuthReady(true);
	}, []);
	const [selectedMatch, setSelectedMatch] = useState<Match | null>(null);
	const [homeScore, setHomeScore] = useState<number | "">(0);
	const [awayScore, setAwayScore] = useState<number | "">(0);
	const [showLeaderboardModal, setShowLeaderboardModal] = useState(false);
	const [showLoginPrompt, setShowLoginPrompt] = useState(false);

	useEffect(() => {
		if (isAuthenticated) {
			setShowLoginPrompt(false);
			return;
		}
		if (typeof window === "undefined") return;
		const seen = sessionStorage.getItem("ngolah-bola:loginPromptSeen");
		if (seen) return;
		setShowLoginPrompt(true);
		sessionStorage.setItem("ngolah-bola:loginPromptSeen", "1");
	}, [isAuthenticated]);

	// Fetch teams once (for logo lookup)
	const { data: teamsData, isLoading: teamsLoading } = useTeams();
	const teamsMap = useMemo(() => {
		const map: Record<
			string,
			{ name: string; code: string; logo_url: string | null }
		> = {};
		(teamsData ?? []).forEach((t: any) => {
			map[t.code] = { name: t.name, code: t.code, logo_url: t.logo_url };
		});
		return map;
	}, [teamsData]);

	const { data: matchdaysData, isLoading: matchdaysLoading } = useMatchdays();
	const { data: matchesData, isLoading: matchesLoading } =
		useMatches(activeMatchday);
	const { data: leaderboardData, isLoading: leaderboardLoading } =
		useLeaderboard();
	const { data: myPredictionsData, isLoading: myPredictionsLoading } =
		useMyPredictions();
	const { data: myRankData, isLoading: myRankLoading } = useMyRank();
	const { data: mySummaryData, isLoading: mySummaryLoading } = useMySummary();
	const submitPrediction = useSubmitPrediction();

	// Restore draft prediction after login redirect back to this page
	const matchesDataRef = useRef(matchesData);
	matchesDataRef.current = matchesData;
	useEffect(() => {
		if (!isAuthenticated) return;
		if (typeof window === "undefined") return;
		const raw = sessionStorage.getItem("bundesliga:draft");
		if (!raw) return;
		let draft: {
			match_id: string;
			home_score: number | "";
			away_score: number | "";
			active_matchday?: number;
		};
		try {
			draft = JSON.parse(raw);
		} catch {
			sessionStorage.removeItem("bundesliga:draft");
			return;
		}
		// Restore active matchday first so matchesData refetches the right one
		if (draft.active_matchday) setActiveMatchday(draft.active_matchday);
		// Keep draft until the match is actually found — data may still be
		// loading or fetching the restored matchday, and this effect re-runs then
		const data = matchesDataRef.current?.data;
		if (!data) return;
		const match = data.find((m: Match) => m.id === draft.match_id);
		if (!match) return;
		sessionStorage.removeItem("bundesliga:draft");
		setHomeScore(draft.home_score);
		setAwayScore(draft.away_score);
		setSelectedMatch(match);
	}, [isAuthenticated, matchesDataRef.current]);

	const [initialLoadDone, setInitialLoadDone] = useState(false);
	const isAnyLoading =
		teamsLoading ||
		matchdaysLoading ||
		matchesLoading ||
		leaderboardLoading ||
		myPredictionsLoading ||
		myRankLoading ||
		mySummaryLoading;
	useEffect(() => {
		if (!isAnyLoading && !initialLoadDone) setInitialLoadDone(true);
	}, [isAnyLoading, initialLoadDone]);
	const showInitialOverlay = !initialLoadDone;

	// Dynamic Colors
	const colors = isDark
		? {
				primary: "#43decc",
				primaryDark: "#0a7c6e",
				secondary: "#0D645F",
				primaryAlpha: "rgba(67, 222, 204, 0.15)",
				surface: "#131313",
				surfaceContainer: "#201f1f",
				text: "#e5e2e1",
				textSecondary: "#bbcac6",
				outline: "#859490",
				white: "#ffffff",
				whiteAlpha5: "rgba(255, 255, 255, 0.05)",
				whiteAlpha10: "rgba(255, 255, 255, 0.1)",
				bg: "#050505",
				cardBg: "rgba(255,255,255,0.03)",
				cardBorder: "rgba(255,255,255,0.07)",
				primary15: "rgba(67, 222, 204, 0.15)",
				primary20: "rgba(67, 222, 204, 0.2)",
				primary30: "rgba(67, 222, 204, 0.3)",
				primary40: "rgba(67, 222, 204, 0.4)",
				primary05: "rgba(67, 222, 204, 0.05)",
				badgeActiveBg: "#43decc",
				badgeActiveText: "#003732",
				badgeInactiveBg: "rgba(255, 255, 255, 0.05)",
				badgeInactiveText: "#bbcac6",
				badgeInactiveBorder: "rgba(255, 255, 255, 0.1)",
				lockText: "rgba(187, 202, 198, 0.4)",
				lockBorder: "rgba(133, 148, 144, 0.2)",
				teamBadgeBg: "rgba(67, 222, 204, 0.15)",
				teamBadgeText: "#43decc",
				teamBadgeBorder: "rgba(67, 222, 204, 0.3)",
				meshPattern: "#43decc",
				glowColor: "rgba(67, 222, 204, 0.15)",
				predictionBg: "rgba(67, 222, 204, 0.15)",
				buttonActiveBg: "#43decc",
				buttonActiveText: "#003732",
				buttonInactiveBg: "rgba(255, 255, 255, 0.05)",
				buttonInactiveText: "#bbcac6",
			}
		: {
				primary: "#0a7c6e",
				primaryDark: "#0a7c6e",
				secondary: "#0a7c6e",
				primaryAlpha: "rgba(10, 124, 110, 0.15)",
				surface: "#f5f5f5",
				surfaceContainer: "#ffffff",
				text: "#1a1a1a",
				textSecondary: "#5a5a5a",
				outline: "#9ca3af",
				white: "#ffffff",
				whiteAlpha5: "rgba(0, 0, 0, 0.05)",
				whiteAlpha10: "rgba(0, 0, 0, 0.1)",
				bg: "#f8fafc",
				cardBg: "rgba(255, 255, 255, 0.95)",
				cardBorder: "rgba(0, 0, 0, 0.08)",
				primary15: "rgba(10, 124, 110, 0.12)",
				primary20: "rgba(10, 124, 110, 0.15)",
				primary30: "rgba(10, 124, 110, 0.2)",
				primary40: "rgba(10, 124, 110, 0.25)",
				primary05: "rgba(10, 124, 110, 0.05)",
				badgeActiveBg: "#0a7c6e",
				badgeActiveText: "#ffffff",
				badgeInactiveBg: "rgba(0, 0, 0, 0.04)",
				badgeInactiveText: "#6b7280",
				badgeInactiveBorder: "rgba(0, 0, 0, 0.08)",
				lockText: "rgba(107, 114, 128, 0.6)",
				lockBorder: "rgba(107, 114, 128, 0.15)",
				teamBadgeBg: "rgba(10, 124, 110, 0.15)",
				teamBadgeText: "#0a7c6e",
				teamBadgeBorder: "rgba(10, 124, 110, 0.3)",
				meshPattern: "#0a7c6e",
				glowColor: "rgba(10, 124, 110, 0.1)",
				predictionBg: "rgba(10, 124, 110, 0.12)",
				buttonActiveBg: "#0a7c6e",
				buttonActiveText: "#ffffff",
				buttonInactiveBg: "rgba(0, 0, 0, 0.04)",
				buttonInactiveText: "#6b7280",
			};

	const primary = colors.primary;
	const secondary = colors.secondary;
	const primaryAlpha = colors.primaryAlpha;
	const bg = colors.bg;
	const text = colors.text;
	const textSecondary = colors.textSecondary;
	const outline = colors.outline;
	const whiteAlpha5 = colors.whiteAlpha5;
	const whiteAlpha10 = colors.whiteAlpha10;
	const gold = "#ffd700";
	const silver = "#c0c0c0";
	const bronze = "#cd7f32";

	// ============================================================
	// HELPERS
	// ============================================================
	const getUserPrediction = (matchId: string) => {
		if (!myPredictionsData?.data) return null;
		return myPredictionsData.data.find((p: any) => p.match_id === matchId);
	};

	const handleSubmit = async () => {
		if (!selectedMatch) return;
		if (!isAuthenticated) {
			sessionStorage.setItem(
				"bundesliga:draft",
				JSON.stringify({
					match_id: selectedMatch.id,
					home_score: homeScore,
					away_score: awayScore,
					active_matchday: activeMatchday,
				}),
			);
			router.push("/login");
			return;
		}
		try {
			await submitPrediction.mutateAsync({
				match_id: selectedMatch.id,
				home_score_predicted: Number(homeScore) || 0,
				away_score_predicted: Number(awayScore) || 0,
			});
			toast.success("Prediksi berhasil disimpan!");
			setSelectedMatch(null);
		} catch {
			toast.error("Gagal menyimpan prediksi");
		}
	};

	const openModal = (match: Match) => {
		const existing = getUserPrediction(match.id);
		if (existing) {
			setHomeScore(existing.home_score_predicted);
			setAwayScore(existing.away_score_predicted);
		} else {
			setHomeScore("");
			setAwayScore("");
		}
		setSelectedMatch(match);
	};

	const predictedWinner = useMemo(() => {
		if (homeScore > awayScore) return "home";
		if (homeScore < awayScore) return "away";
		return "draw";
	}, [homeScore, awayScore]);

	const getTeamInfo = (code: string) =>
		teamsMap[code] ?? { name: code, code, logo_url: null };

	// ============================================================
	// ENDED STATE VIEW
	// ============================================================
	if (EVENT_STATUS.ngolahBola2026.isEnded) {
		return (
			<div
				className="min-h-screen pb-24 md:pb-12"
				style={{ background: bg, color: text }}
			>
				<main className="pt-10 md:pt-18 relative max-w-5xl mx-auto px-6 md:px-8 space-y-12">
					<section className="text-center space-y-4">
						<h1
							className="text-4xl md:text-6xl font-black italic tracking-tighter uppercase"
							style={{ color: text, fontFamily: "Space Grotesk, sans-serif" }}
						>
							Prediksi Skor <br />
							<span style={{ color: primary }}>Ngolah Bola 2026/2027</span>
						</h1>
						<EventEndedBanner
							isDark={isDark}
							variant="full"
							endedNotice={null}
						/>
					</section>
					<section>
						<div className="text-center mb-6">
							<h2
								className="text-2xl md:text-3xl font-black italic tracking-tight uppercase mb-1"
								style={{ color: text }}
							>
								Final Klasemen Akhir
							</h2>
							<p
								className="text-xs font-bold uppercase tracking-widest"
								style={{ color: textSecondary }}
							>
								Ngolah Bola Season 1 Ended
							</p>
						</div>
						<PublicLeaderboard isDark={isDark} />
					</section>
				</main>
			</div>
		);
	}

	// ============================================================
	// NORMAL VIEW
	// ============================================================
	return (
		<div
			className="min-h-screen pb-24 md:pb-12"
			style={{ background: bg, color: text }}
		>
			{showInitialOverlay && <LoadingOverlay />}
			{/* Velocity Mesh Background */}
			<div
				className="fixed inset-0 z-0 opacity-5 pointer-events-none"
				style={{
					backgroundImage: `repeating-linear-gradient(45deg, ${primary} 0, ${primary} 1px, transparent 0, transparent 50%)`,
					backgroundSize: "100px 100px",
				}}
			/>

			<main className="pt-10 md:pt-18 relative">
				{/* Hero Section */}
				<section className="max-w-7xl mx-auto px-6 md:px-8 text-center mb-6 relative">
					<div
						className="absolute -top-12 left-1/2 -translate-x-1/2 w-70 h-70 rounded-full blur-[80px]"
						style={{ background: primaryAlpha }}
					/>
					<h1
						className="text-4xl md:text-7xl font-bold max-w-3xl mx-auto italic uppercase tracking-tighter mb-4"
						style={{ color: text, fontFamily: "Space Grotesk, sans-serif" }}
					>
						Prediksi Skor <br />
						<span style={{ color: primary }}>Bundesliga 2026/2027</span>
					</h1>
					<p
						className="text-sm italic font-normal tracking-normal mb-10"
						style={{ color: textSecondary }}
					>
						*Tebak akurat dapat 30 poin, tebak pemenang dapat 15 poin, jika
						salah dapat 0 poin
					</p>

					{/* Stats Bento Grid */}
					<div className="flex flex-row gap-4 max-w-4xl mx-auto overflow-x-auto pb-2 md:grid md:grid-cols-3 md:overflow-visible">
						<div
							className="min-w-35 flex-1 p-6 rounded-2xl backdrop-blur-xl border transition-all hover:-translate-y-1"
							style={{
								background: colors.primary05,
								borderColor: colors.primary30,
							}}
						>
							<div className="text-3xl font-bold mb-1" style={{ color: text }}>
								{mySummaryData?.total_predictions ?? 0}
							</div>
							<div
								className="text-xs font-semibold uppercase tracking-widest"
								style={{ color: outline }}
							>
								Total Prediksi Kamu
							</div>
						</div>
						<div
							className="p-6 rounded-2xl backdrop-blur-xl border transition-all hover:-translate-y-1"
							style={{
								background: colors.primary05,
								borderColor: colors.primary30,
							}}
						>
							<div className="text-3xl font-bold mb-1" style={{ color: text }}>
								{mySummaryData?.total_points?.toLocaleString() ?? 0}
							</div>
							<div
								className="text-xs font-semibold uppercase tracking-widest"
								style={{ color: outline }}
							>
								Point Didapatkan
							</div>
						</div>
						<div
							className="p-6 rounded-2xl backdrop-blur-xl border transition-all hover:-translate-y-1 cursor-pointer"
							style={{
								background: colors.primary05,
								borderColor: colors.primary30,
							}}
							onClick={() => setShowLeaderboardModal(true)}
						>
							<div className="text-3xl font-bold mb-1" style={{ color: text }}>
								#{myRankData?.rank ?? "-"}
							</div>
							<div
								className="text-xs font-semibold uppercase tracking-widest"
								style={{ color: outline }}
							>
								Klasemen Kamu
							</div>
						</div>
					</div>
				</section>

				{/* Matchday Selector + Tab Navigation */}
				<section className="max-w-7xl mx-auto px-6 md:px-8 mb-4 md:mb-8">
					<div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-start">
						{/* Matchday Dropdown */}
						<div ref={dropdownRef} className="relative w-full sm:w-56 shrink-0">
							<button
								type="button"
								onClick={() => setDropdownOpen((v) => !v)}
								className="w-full flex items-center justify-between gap-2 px-4 py-2.5 rounded-full font-semibold text-sm transition-all outline-none focus:ring-2 focus:ring-primary/40"
								style={{
									background: colors.badgeInactiveBg,
									color: colors.badgeInactiveText,
									border: `1px solid ${colors.badgeInactiveBorder}`,
								}}
							>
								<span>Matchday {activeMatchday}</span>
								<ChevronDown
									size={16}
									className={`transition-transform duration-200 ${dropdownOpen ? "rotate-180" : ""}`}
									style={{ color: colors.primary }}
								/>
							</button>
							{dropdownOpen && (
								<div
									className="absolute z-9999 top-full mt-2 left-0 w-full rounded-2xl overflow-hidden shadow-2xl"
									style={{
										background: isDark ? "#131313" : "#ffffff",
										border: `1px solid ${colors.cardBorder}`,
									}}
								>
									{(matchdaysData ?? []).map((md: number) => {
										const isActive = activeMatchday === md;
										return (
											<button
												key={md}
												type="button"
												onClick={() => {
													setActiveMatchday(md);
													setDropdownOpen(false);
												}}
												className="w-full text-left px-4 py-3 font-semibold text-sm transition-all hover:font-bold"
												style={
													isActive
														? {
																background: colors.buttonActiveBg,
																color: colors.buttonActiveText,
															}
														: {
																background: "transparent",
																color: colors.badgeInactiveText,
															}
												}
											>
												Matchday {md}
												{isActive && (
													<ChevronDown
														size={14}
														className="float-right mt-0.5"
														style={{ color: colors.buttonActiveText }}
													/>
												)}
											</button>
										);
									})}
								</div>
							)}
						</div>

						{/* Tab Navigation */}
						<div
							className="inline-flex rounded-xl p-1"
							style={{ background: whiteAlpha5 }}
						>
							{(["matches", "leaderboard"] as const).map((tab) => {
								const isActive = activeTab === tab;
								return (
									<button
										key={tab}
										onClick={() => setActiveTab(tab)}
										className="px-6 py-2 rounded-lg font-semibold text-sm transition-all"
										style={
											isActive
												? {
														background: colors.buttonActiveBg,
														color: colors.buttonActiveText,
													}
												: { color: colors.badgeInactiveText }
										}
									>
										{tab === "matches" ? "Pertandingan" : "Klasemen"}
									</button>
								);
							})}
						</div>
					</div>
				</section>

				{/* Matches Grid */}
				{activeTab === "matches" && (
					<section className="max-w-7xl mx-auto px-6 md:px-8 grid grid-cols-1 lg:grid-cols-2 gap-6 mb-24 md:mb-16">
						{matchesLoading ? (
							<>
								{[1, 2, 3, 4].map((i) => (
									<MatchCardSkeleton key={i} />
								))}
							</>
						) : (matchesData ?? []).length === 0 ? (
							<div
								className="col-span-2 text-center py-16 rounded-3xl"
								style={{
									background: whiteAlpha5,
									border: `1px solid ${whiteAlpha10}`,
								}}
							>
								<p className="text-xl font-bold mb-2" style={{ color: text }}>
									Tidak ada pertandingan
								</p>
								<p className="text-sm" style={{ color: textSecondary }}>
									Belum ada pertandingan untuk matchday ini.
								</p>
							</div>
						) : (
							(matchesData ?? []).map((match: Match) => {
								const userPred = getUserPrediction(match.id);
								const hasPrediction = !!userPred;
								const isEditable = match.is_prediction_open && isAuthReady;
								const isCompleted = match.status === "completed";
								const homeTeam = getTeamInfo(match.home_team.code);
								const awayTeam = getTeamInfo(match.away_team.code);

								return (
									<div
										key={match.id}
										className="match-card px-3 md:px-8 py-5 md:py-8 rounded-3xl backdrop-blur-xl border transition-all duration-300 group relative overflow-hidden"
										style={{
											background: whiteAlpha5,
											borderColor: whiteAlpha10,
										}}
									>
										{/* Date row */}
										<div className="flex justify-between items-center mb-8 relative z-10">
											<span
												className="text-[10px] md:text-xs font-semibold uppercase tracking-widest"
												style={{ color: outline }}
											>
												{formatMatchDate(
													match.match_date,
													match.kickoff_time,
													"WIB",
												)}
											</span>
											{isCompleted && userPred && (
												<div
													className="flex items-center gap-1.5 text-xs font-semibold px-3 py-1 rounded-full"
													style={{
														background: userPred.score_exact
															? "rgba(34, 197, 94, 0.2)"
															: userPred.result_correct
																? "rgba(234, 179, 8, 0.2)"
																: "rgba(239, 68, 68, 0.2)",
														color: userPred.score_exact
															? "#22c55e"
															: userPred.result_correct
																? "#eab308"
																: "#ef4444",
													}}
												>
													+{userPred.points_earned ?? 0} pts
												</div>
											)}
											{!isEditable && hasPrediction && !isCompleted && (
												<div
													className="flex items-center gap-1.5"
													style={{ color: outline }}
												>
													<Lock className="size-3.5" />
													<span className="text-xs font-semibold">Locked</span>
												</div>
											)}
										</div>

										{/* Teams */}
										<div className="flex items-center justify-between gap-0 mb-10 relative z-10">
											<div className="flex flex-col items-center gap-3 flex-1">
												<TeamBadge team={homeTeam} isDark={isDark} />
												<span
													className="text-sm font-bold tracking-tight text-center"
													style={{ color: text }}
												>
													{homeTeam.name.toUpperCase()}
												</span>
											</div>
											<div className="px-4 flex flex-col items-center gap-2">
												{isCompleted && (
													<span
														className="text-xs font-bold"
														style={{ color: primary }}
													>
														Full-time
													</span>
												)}
												{isCompleted ? (
													<span
														className="text-2xl md:text-3xl font-black"
														style={{ color: text }}
													>
														{match.home_score} - {match.away_score}
													</span>
												) : hasPrediction ? (
													<span
														className="text-2xl md:text-3xl font-black"
														style={{ color: text }}
													>
														{userPred.home_score_predicted} -{" "}
														{userPred.away_score_predicted}
													</span>
												) : (
													<span
														className="text-4xl font-black"
														style={{ color: outline }}
													>
														VS
													</span>
												)}
											</div>
											<div className="flex flex-col items-center gap-3 flex-1">
												<TeamBadge team={awayTeam} isDark={isDark} />
												<span
													className="text-sm font-bold tracking-tight text-center"
													style={{ color: text }}
												>
													{awayTeam.name.toUpperCase()}
												</span>
											</div>
										</div>

										{/* Action */}
										<div className="relative z-10">
											{isCompleted && hasPrediction ? (
												<div
													className={`w-full py-4 px-4 text-sm md:text-base rounded-2xl flex flex-col items-center justify-center gap-1 border`}
													style={{ background: colors.primary15 }}
												>
													<span
														className="font-bold text-center"
														style={{ color: primary }}
													>
														{`Prediksi Kamu ${userPred.home_score_predicted} - ${userPred.away_score_predicted}`}
													</span>
												</div>
											) : isCompleted ? (
												<button
													className="w-full py-4 text-sm md:text-base rounded-2xl font-bold flex items-center justify-center gap-2"
													style={{
														background: colors.surfaceContainer,
														color: outline,
													}}
													disabled
												>
													<Check className="size-5" />
													Full-time
												</button>
											) : hasPrediction ? (
												<div
													className="w-full py-4 px-4 text-sm md:text-base rounded-2xl flex flex-col items-center justify-center gap-2"
													style={{
														background: colors.primary15,
														border: `1px solid ${primary}40`,
													}}
												>
													<div className="flex items-center gap-2">
														<Check
															className="size-4"
															style={{ color: primary }}
														/>
														<span
															className="rounded-2xl font-bold"
															style={{ color: primary }}
														>
															Prediksi Terkirim
														</span>
													</div>
												</div>
											) : isEditable ? (
												<button
													onClick={() => openModal(match)}
													className="w-full py-4 text-sm md:text-base rounded-2xl font-bold text-white/90 flex items-center justify-center gap-2 transition-all duration-200 hover:scale-[1.02] active:scale-[0.98] hover:shadow-lg group/btn"
													style={{
														background: secondary,
														boxShadow: `0 4px 20px ${primaryAlpha}`,
													}}
												>
													Prediksi Skor!
												</button>
											) : (
												<button
													className="w-full py-4 text-sm md:text-base rounded-2xl font-bold flex items-center justify-center gap-2 cursor-not-allowed opacity-60"
													style={{
														background: whiteAlpha5,
														color: outline,
														border: `1px solid ${primary}50`,
													}}
													disabled
												>
													<Lock className="size-5" />
													Pertandingan Terkunci
												</button>
											)}
										</div>
									</div>
								);
							})
						)}
					</section>
				)}

				{/* Leaderboard — Podium + List Style */}
				{activeTab === "leaderboard" && (
					<section className="max-w-5xl mx-auto px-6 md:px-8 mb-24 md:mb-16">
						{/* Section Badge */}
						<div className="text-center mb-8">
							<p
								className="text-sm md:text-lg mt-2"
								style={{ color: colors.textSecondary }}
							>
								Klasemen Sementara Berdasarkan Performa Bundesliga 2026-2027
								Prediksi Skor
							</p>
						</div>

						{/* Loading */}
						{leaderboardLoading ? (
							<div className="max-w-5xl mx-auto">
								<div
									className="flex items-center gap-4 p-4 mb-6 rounded-2xl animate-pulse"
									style={{
										background: colors.cardBg,
										border: `1px solid ${colors.cardBorder}`,
									}}
								>
									<div
										className="w-14 h-14 rounded-full"
										style={{ background: `${primary}30` }}
									/>
									<div className="flex-1 space-y-2">
										<div
											className="h-5 rounded w-3/4"
											style={{ background: `${primary}20` }}
										/>
										<div
											className="h-4 rounded w-1/2"
											style={{ background: `${primary}10` }}
										/>
									</div>
									<div
										className="h-8 rounded-lg w-24"
										style={{ background: `${primary}20` }}
									/>
								</div>
								<div className="grid grid-cols-1 md:grid-cols-3 gap-4">
									{[1, 2, 3].map((i) => (
										<div
											key={i}
											className="h-48 rounded-2xl animate-pulse"
											style={{
												background: colors.cardBg,
												border: `1px solid ${colors.cardBorder}`,
											}}
										/>
									))}
								</div>
							</div>
						) : (
							(() => {
								const rows = (
									(Array.isArray(leaderboardData)
										? leaderboardData
										: []) as any[]
								).sort((a, b) => (a.rank ?? 0) - (b.rank ?? 0));
								const empty = rows.length === 0;
								if (empty) {
									return (
										<div className="text-center py-16 max-w-md mx-auto">
											<Circle
												className="size-10 mx-auto mb-4"
												style={{ color: colors.outline }}
											/>
											<p
												className="text-lg font-bold mb-4"
												style={{ color: colors.text }}
											>
												Belum ada data leaderboard
											</p>
											<p
												className="text-sm"
												style={{ color: colors.textSecondary }}
											>
												Pertandingan belum dimulai atau belum ada yang prediksi.
											</p>
										</div>
									);
								}

								const accent = primary;
								const accentLight = colors.primaryDark;
								const gold = "#FFD700";
								const silver = "#C0C0C0";
								const bronze = "#CD7F32";
								const formatScore = (s: number) =>
									Number(s).toLocaleString("id-ID");

								return (
									<>
										{/* Top 3 Podium — Desktop Grid */}
										<div
											className="hidden md:grid gap-4 mb-8 items-end"
											style={{ gridTemplateColumns: "repeat(3, 1fr)" }}
										>
											{/* Rank 2 */}
											{rows[1] && (
												<div
													className="relative p-5 rounded-3xl text-center order-1 transition-all duration-300 hover:scale-[1.02]"
													style={{
														background: `linear-gradient(135deg, ${colors.cardBg} 0%, ${silver}15 100%)`,
														backdropFilter: "blur(20px)",
														border: `1px solid ${colors.cardBorder}`,
														marginBottom: "10px",
													}}
												>
													<div
														className="absolute -top-5 left-1/2 -translate-x-1/2 w-12 h-12 rounded-full flex items-center justify-center font-black text-xl shadow-lg"
														style={{
															background: `linear-gradient(135deg, ${silver} 0%, #A0A0A0 100%)`,
															boxShadow: `0 0 20px ${silver}50`,
														}}
													>
														2
													</div>
													<div className="pt-5">
														{rows[1].profile_picture ? (
															<div className="relative w-16 h-16 mx-auto rounded-2xl overflow-hidden mb-3">
																<Image
																	src={rows[1].profile_picture}
																	alt={rows[1].user_name}
																	fill
																	sizes="64px"
																	style={{
																		objectFit: "cover",
																		borderColor: silver,
																	}}
																/>
															</div>
														) : (
															<div className="relative w-16 h-16 mx-auto rounded-2xl overflow-hidden mb-3">
																<Image
																	src="/icons/football-player.png"
																	alt="Player Icon"
																	fill
																	sizes="64px"
																	style={{ objectFit: "cover" }}
																/>
															</div>
														)}
														<h3
															className="font-bold text-lg truncate"
															style={{ color: colors.text }}
														>
															{rows[1].user_name}
														</h3>
														<p
															className="text-sm mb-3"
															style={{ color: colors.textSecondary }}
														>
															{`${rows[1].total_predictions ?? 0} prediksi · ${rows[1].exact_scores ?? 0} tepat`}
														</p>
														<div
															className="inline-flex items-center gap-2 px-4 py-2 rounded-full"
															style={{ background: `${silver}20` }}
														>
															<Circle
																className="size-3.5"
																fill="currentColor"
																style={{ color: colors.text }}
															/>
															<span
																className="font-bold text-lg"
																style={{ color: colors.text }}
															>
																{formatScore(rows[1].total_points)}
															</span>
														</div>
													</div>
												</div>
											)}

											{/* Rank 1 — Champion */}
											{rows[0] && (
												<div
													className="relative p-6 rounded-3xl text-center order-2 transition-all duration-300 hover:scale-[1.03]"
													style={{
														background: `linear-gradient(135deg, ${colors.cardBg} 0%, ${gold}25 100%)`,
														backdropFilter: "blur(20px)",
														border: `2px solid ${gold}50`,
														boxShadow: `0 0 40px ${gold}30`,
														marginBottom: "20px",
													}}
												>
													<div
														className="absolute -top-6 left-1/2 -translate-x-1/2 w-14 h-14 rounded-full flex items-center justify-center shadow-xl"
														style={{
															background: `linear-gradient(135deg, ${gold} 0%, #FFA500 100%)`,
															boxShadow: `0 0 30px ${gold}60`,
														}}
													>
														<span
															className="text-2xl font-black"
															style={{ color: "#003732" }}
														>
															1
														</span>
													</div>
													<div
														className="absolute top-3 right-3 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider"
														style={{
															background: `linear-gradient(135deg, ${gold} 0%, #FFA500 100%)`,
															color: "#003732",
														}}
													>
														Champion
													</div>
													<div className="pt-5">
														{rows[0].profile_picture ? (
															<div className="relative w-20 h-20 mx-auto rounded-2xl overflow-hidden mb-4">
																<Image
																	src={rows[0].profile_picture}
																	alt={rows[0].user_name}
																	fill
																	sizes="80px"
																	style={{
																		objectFit: "cover",
																		borderColor: gold,
																	}}
																/>
															</div>
														) : (
															<div className="relative w-20 h-20 mx-auto rounded-2xl overflow-hidden mb-4">
																<Image
																	src="/icons/football-player.png"
																	alt="Player Icon"
																	fill
																	sizes="80px"
																	style={{ objectFit: "cover" }}
																/>
															</div>
														)}
														<h3
															className="font-black text-xl mb-1"
															style={{ color: colors.text }}
														>
															{rows[0].user_name}
														</h3>
														<p
															className="text-sm mb-4"
															style={{ color: colors.textSecondary }}
														>
															{`${rows[0].total_predictions ?? 0} prediksi · ${rows[0].exact_scores ?? 0} tepat`}
														</p>
														<div
															className="inline-flex items-center gap-2 px-5 py-3 rounded-full"
															style={{
																background: `${gold}25`,
																border: `1px solid ${gold}40`,
															}}
														>
															<Circle
																className="size-5"
																fill="currentColor"
																style={{ color: colors.text }}
															/>
															<span
																className="font-black text-2xl"
																style={{ color: colors.text }}
															>
																{formatScore(rows[0].total_points)}
															</span>
														</div>
													</div>
												</div>
											)}

											{/* Rank 3 */}
											{rows[2] && (
												<div
													className="relative p-5 rounded-3xl text-center order-3 transition-all duration-300 hover:scale-[1.02]"
													style={{
														background: `linear-gradient(135deg, ${colors.cardBg} 0%, ${bronze}15 100%)`,
														backdropFilter: "blur(20px)",
														border: `1px solid ${colors.cardBorder}`,
														marginBottom: "10px",
													}}
												>
													<div
														className="absolute -top-5 left-1/2 -translate-x-1/2 w-12 h-12 rounded-full flex items-center justify-center shadow-lg"
														style={{
															background: `linear-gradient(135deg, ${bronze} 0%, #A0522D 100%)`,
															boxShadow: `0 0 15px ${bronze}40`,
														}}
													>
														<span
															className="text-xl font-black"
															style={{ color: "#fff" }}
														>
															3
														</span>
													</div>
													<div className="pt-5">
														{rows[2].profile_picture ? (
															<div className="relative w-16 h-16 mx-auto rounded-2xl overflow-hidden mb-3">
																<Image
																	src={rows[2].profile_picture}
																	alt={rows[2].user_name}
																	fill
																	sizes="64px"
																	style={{
																		objectFit: "cover",
																		borderColor: bronze,
																	}}
																/>
															</div>
														) : (
															<div className="relative w-16 h-16 mx-auto rounded-2xl overflow-hidden mb-3">
																<Image
																	src="/icons/football-player.png"
																	alt="Player Icon"
																	fill
																	sizes="64px"
																	style={{ objectFit: "cover" }}
																/>
															</div>
														)}
														<h3
															className="font-bold text-lg truncate"
															style={{ color: colors.text }}
														>
															{rows[2].user_name}
														</h3>
														<p
															className="text-sm mb-3"
															style={{ color: colors.textSecondary }}
														>
															{`${rows[2].total_predictions ?? 0} prediksi · ${rows[2].exact_scores ?? 0} tepat`}
														</p>
														<div
															className="inline-flex items-center gap-2 px-4 py-2 rounded-full"
															style={{ background: `${bronze}20` }}
														>
															<Circle
																className="size-3.5"
																fill="currentColor"
																style={{ color: colors.text }}
															/>
															<span
																className="font-bold text-lg"
																style={{ color: colors.text }}
															>
																{formatScore(rows[2].total_points)}
															</span>
														</div>
													</div>
												</div>
											)}
										</div>

										{/* Top 3 Mobile Cards */}
										<div className="md:hidden space-y-4 mb-6">
											{rows.slice(0, 3).map((player, index) => (
												<div
													key={player.rank}
													className="relative flex items-center gap-4 p-4 rounded-2xl backdrop-blur-xl border transition-all duration-300"
													style={{
														background:
															index === 0
																? `linear-gradient(135deg, ${colors.cardBg} 0%, ${gold}20 100%)`
																: index === 1
																	? `linear-gradient(135deg, ${colors.cardBg} 0%, ${silver}15 100%)`
																	: `linear-gradient(135deg, ${colors.cardBg} 0%, ${bronze}15 100%)`,
														borderColor:
															index === 0
																? `${gold}40`
																: index === 1
																	? `${silver}30`
																	: `${bronze}30`,
													}}
												>
													<div
														className="w-12 h-12 rounded-xl flex items-center justify-center font-black text-xl shadow-lg shrink-0"
														style={{
															background:
																index === 0
																	? `linear-gradient(135deg, ${gold} 0%, #FFA500 100%)`
																	: index === 1
																		? `linear-gradient(135deg, ${silver} 0%, #A0A0A0 100%)`
																		: `linear-gradient(135deg, ${bronze} 0%, #A0522D 100%)`,
															color: "#003732",
														}}
													>
														{index + 1}
													</div>
													{player.profile_picture ? (
														<div className="relative w-12 h-12 rounded-xl overflow-hidden border shrink-0">
															<Image
																src={player.profile_picture}
																alt={player.user_name}
																fill
																sizes="48px"
																style={{ objectFit: "cover" }}
															/>
														</div>
													) : (
														<div className="relative w-12 h-12 rounded-xl overflow-hidden shrink-0">
															<Image
																src="/icons/football-player.png"
																alt="Player Icon"
																fill
																sizes="48px"
																style={{ objectFit: "cover" }}
															/>
														</div>
													)}
													<div className="flex-1 min-w-0">
														<h3
															className="font-bold truncate"
															style={{ color: colors.text }}
														>
															{player.user_name}
														</h3>
														<p
															className="text-sm"
															style={{ color: colors.textSecondary }}
														>
															{`${player.total_predictions ?? 0} prediksi · ${player.exact_scores ?? 0} tepat`}
														</p>
													</div>
													<div
														className="flex items-center gap-2 px-3 py-2 rounded-full shrink-0"
														style={{
															background: `${accent}10`,
															border: `1px solid ${accent}30`,
														}}
													>
														<Circle
															className="size-3.5"
															fill="currentColor"
															style={{ color: colors.text }}
														/>
														<span
															className="font-bold"
															style={{ color: colors.text }}
														>
															{formatScore(player.total_points)}
														</span>
													</div>
												</div>
											))}
										</div>

										{/* Rank 4+ List */}
										{rows.length > 3 && (
											<div>
												<div className="items-center gap-3 mb-4 hidden md:flex">
													<div
														className="h-px flex-1"
														style={{ background: colors.cardBorder }}
													/>
													<span
														className="text-xs font-bold uppercase tracking-widest"
														style={{ color: colors.textSecondary }}
													>
														Peringkat Berikutnya
													</span>
													<div
														className="h-px flex-1"
														style={{ background: colors.cardBorder }}
													/>
												</div>
												<div className="space-y-3">
													{rows.slice(3, 10).map((player, index) => (
														<div
															key={player.rank}
															className="flex items-center justify-between px-5 py-4 rounded-2xl backdrop-blur-xl border transition-all duration-300 cursor-pointer group"
															style={{
																background: colors.cardBg,
																borderColor: colors.cardBorder,
															}}
															onMouseEnter={(e) => {
																const el = e.currentTarget;
																el.style.borderColor = `${accent}50`;
																el.style.transform = "translateX(4px)";
															}}
															onMouseLeave={(e) => {
																const el = e.currentTarget;
																el.style.borderColor = colors.cardBorder;
																el.style.transform = "translateX(0)";
															}}
														>
															<div className="flex items-center gap-4">
																<div
																	className="w-10 h-10 rounded-xl flex items-center justify-center font-bold"
																	style={{
																		background: `${accent}15`,
																		color: accent,
																	}}
																>
																	{index + 4}
																</div>
																{player.profile_picture ? (
																	<div className="relative w-10 h-10 rounded-xl overflow-hidden">
																		<Image
																			src={player.profile_picture}
																			alt={player.user_name}
																			fill
																			sizes="40px"
																			style={{ objectFit: "cover" }}
																		/>
																	</div>
																) : (
																	<div className="relative w-10 h-10 rounded-xl overflow-hidden">
																		<Image
																			src="/icons/football-player.png"
																			alt="Player Icon"
																			fill
																			sizes="40px"
																			style={{ objectFit: "cover" }}
																		/>
																	</div>
																)}
																<div>
																	<h4
																		className="font-semibold"
																		style={{ color: colors.text }}
																	>
																		{player.user_name}
																	</h4>
																	<p
																		className="text-sm"
																		style={{ color: colors.textSecondary }}
																	>
																		{`${player.total_predictions ?? 0} prediksi · ${player.exact_scores ?? 0} tepat`}
																	</p>
																</div>
															</div>
															<div
																className="flex items-center gap-2 px-4 py-2 rounded-full transition-all duration-300"
																style={{
																	background: `${accent}10`,
																	border: `1px solid ${accent}30`,
																}}
															>
																<Circle
																	className="size-3.5"
																	fill="currentColor"
																	style={{ color: colors.text }}
																/>
																<span
																	className="font-bold"
																	style={{ color: colors.text }}
																>
																	{formatScore(player.total_points)}
																</span>
															</div>
														</div>
													))}
												</div>
											</div>
										)}

										{/* User My Rank Footer */}
										{myRankData && myRankData.rank > 5 && (
											<div
												className="mt-8 p-5 rounded-2xl text-center backdrop-blur-xl border"
												style={{
													background: `${accent}10`,
													border: `2px solid ${accent}`,
												}}
											>
												<Trophy
													className="size-8 mx-auto mb-2"
													style={{ color: gold }}
												/>
												<p
													className="text-3xl font-black"
													style={{ color: colors.text }}
												>
													#{myRankData.rank}
												</p>
												<p
													className="text-sm mt-1"
													style={{ color: colors.textSecondary }}
												>
													dari {myRankData.total_participants ?? 0} peserta
												</p>
											</div>
										)}
									</>
								);
							})()
						)}
					</section>
				)}
			</main>

			{/* Prediction Modal */}
			{selectedMatch && (
				<div
					className="fixed inset-0 z-100 flex items-center justify-center p-4 animate-fadeIn"
					style={{
						background: "rgba(0,0,0,0.85)",
						backdropFilter: "blur(8px)",
					}}
					onClick={() => setSelectedMatch(null)}
				>
					<div
						className="w-full max-w-md p-6 rounded-3xl border relative overflow-hidden animate-scaleIn"
						style={{
							background: colors.surface,
							borderColor: colors.primary30,
							boxShadow: `0 0 40px ${primaryAlpha}, 0 15px 30px rgba(0,0,0,0.4)`,
						}}
						onClick={(e) => e.stopPropagation()}
					>
						<div
							className="absolute -top-10 left-1/2 -translate-x-1/2 w-40 h-40 rounded-full blur-[60px] pointer-events-none"
							style={{ background: primaryAlpha }}
						/>
						<button
							onClick={(e) => {
								e.stopPropagation();
								setSelectedMatch(null);
							}}
							className="absolute top-3 right-3 w-8 h-8 rounded-full flex items-center justify-center transition-all hover:scale-110 z-20"
							style={{ background: whiteAlpha5, color: textSecondary }}
						>
							<X className="size-4" />
						</button>
						<div className="text-center mb-6 relative z-10">
							<h3 className="text-xl font-bold mb-1" style={{ color: text }}>
								{selectedMatch.home_team.name} vs {selectedMatch.away_team.name}
							</h3>
							<p className="text-xs" style={{ color: textSecondary }}>
								{formatMatchDate(
									selectedMatch.match_date,
									selectedMatch.kickoff_time,
									"WIB",
								)}
							</p>
						</div>
						<div className="flex items-center justify-center gap-6 mb-6 relative z-10">
							<div className="text-center">
								<p
									className="text-xs mb-2 truncate max-w-25"
									style={{ color: textSecondary }}
								>
									{selectedMatch.home_team.code}
								</p>
								<input
									type="number"
									value={homeScore}
									onChange={(e) => {
										const raw = e.target.value;
										if (raw === "") {
											setHomeScore("");
											return;
										}
										const v = parseInt(raw);
										if (Number.isNaN(v)) return;
										setHomeScore(Math.min(99, Math.max(0, v)));
									}}
									className="w-16 h-14 text-center text-4xl font-black bg-transparent border-b-2 transition-all focus:scale-105"
									style={{ borderColor: outline, color: primary }}
									min="0"
									max="99"
									placeholder="0"
								/>
							</div>
							<span
								className="text-3xl font-black mb-4"
								style={{ color: outline }}
							>
								-
							</span>
							<div className="text-center">
								<p
									className="text-xs mb-2 truncate max-w-25"
									style={{ color: textSecondary }}
								>
									{selectedMatch.away_team.code}
								</p>
								<input
									type="number"
									value={awayScore}
									onChange={(e) => {
										const raw = e.target.value;
										if (raw === "") {
											setAwayScore("");
											return;
										}
										const v = parseInt(raw);
										if (Number.isNaN(v)) return;
										setAwayScore(Math.min(99, Math.max(0, v)));
									}}
									className="w-16 h-14 text-center text-4xl font-black bg-transparent border-b-2 transition-all focus:scale-105"
									style={{ borderColor: outline, color: primary }}
									min="0"
									max="99"
									placeholder="0"
								/>
							</div>
						</div>
						<div className="text-center mb-5 relative z-10">
							<p className="text-xs mb-1" style={{ color: textSecondary }}>
								Prediksi Kamu:
							</p>
							<p className="text-base font-bold" style={{ color: primary }}>
								{predictedWinner === "home"
									? `${selectedMatch.home_team.name} Menang`
									: predictedWinner === "away"
										? `${selectedMatch.away_team.name} Menang`
										: "Seri"}
							</p>
						</div>
						<div className="flex flex-col gap-2 relative z-10">
							<button
								onClick={handleSubmit}
								disabled={submitPrediction.isPending}
								className="w-full py-3 rounded-xl font-bold text-sm uppercase tracking-wider transition-all hover:scale-[1.02] active:scale-[0.98] flex items-center justify-center gap-2"
								style={{
									background: primary,
									color: "#003732",
									boxShadow: `0 2px 15px ${primaryAlpha}`,
								}}
							>
								{submitPrediction.isPending
									? "Menyimpan..."
									: "Simpan Prediksi"}
							</button>
							<button
								onClick={() => setSelectedMatch(null)}
								className="w-full py-2 rounded-lg transition-all hover:opacity-80 text-sm"
								style={{ color: textSecondary }}
							>
								Batal
							</button>
						</div>
					</div>
				</div>
			)}

			{/* Login Prompt Modal */}
			{showLoginPrompt && (
				<div
					className="fixed inset-0 z-200 flex items-center justify-center p-4 animate-fadeIn"
					style={{
						background: "rgba(0,0,0,0.85)",
						backdropFilter: "blur(8px)",
					}}
					onClick={() => setShowLoginPrompt(false)}
				>
					<div
						className="w-full max-w-sm p-6 rounded-3xl border relative overflow-hidden animate-scaleIn text-center"
						style={{
							background: colors.surface,
							borderColor: colors.primary30,
							boxShadow: `0 0 40px ${primaryAlpha}, 0 15px 30px rgba(0,0,0,0.4)`,
						}}
						onClick={(e) => e.stopPropagation()}
					>
						<div
							className="absolute -top-10 left-1/2 -translate-x-1/2 w-40 h-40 rounded-full blur-[60px] pointer-events-none"
							style={{ background: primaryAlpha }}
						/>
						<button
							onClick={() => setShowLoginPrompt(false)}
							className="absolute top-3 right-3 w-8 h-8 rounded-full flex items-center justify-center transition-all hover:scale-110 z-20"
							style={{ background: whiteAlpha5, color: textSecondary }}
						>
							<X className="size-4" />
						</button>
						<div className="relative z-10">
							<div
								className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4"
								style={{
									background: colors.primary15,
									border: `2px solid ${colors.primary30}`,
								}}
							>
								<Lock className="size-7" style={{ color: primary }} />
							</div>
							<h3 className="text-xl font-black mb-2" style={{ color: text }}>
								<span style={{ color: primary }}>Login Dulu Ya!</span>
							</h3>
							<p
								className="text-sm mb-6 leading-relaxed"
								style={{ color: textSecondary }}
							>
								Kamu belum login sob. Login dulu biar bisa ikut main prediksi
								skor Ngolah Bola 2026/2027!
							</p>
							<Link href="/login">
								<div
									className="w-full py-3 rounded-xl font-bold text-xs uppercase tracking-wider transition-all hover:scale-[1.02] active:scale-[0.98] flex items-center justify-center gap-2 cursor-pointer"
									style={{
										background: primary,
										color: "#003732",
										boxShadow: `0 2px 15px ${primaryAlpha}`,
									}}
								>
									Login Sekarang
								</div>
							</Link>
						</div>
					</div>
				</div>
			)}

			{/* Leaderboard Modal */}
			{showLeaderboardModal && (
				<div
					className="fixed inset-0 z-100 flex items-center justify-center p-4 animate-fadeIn"
					style={{
						background: "rgba(0,0,0,0.85)",
						backdropFilter: "blur(8px)",
					}}
					onClick={() => setShowLeaderboardModal(false)}
				>
					<div
						className="w-full max-w-md max-h-[85vh] flex flex-col p-6 rounded-3xl border relative overflow-hidden animate-scaleIn"
						style={{
							background: colors.surface,
							borderColor: colors.primary30,
							boxShadow: `0 0 40px ${primaryAlpha}, 0 15px 30px rgba(0,0,0,0.4)`,
						}}
						onClick={(e) => e.stopPropagation()}
					>
						<div
							className="absolute -top-10 left-1/2 -translate-x-1/2 w-40 h-40 rounded-full blur-[60px] pointer-events-none"
							style={{ background: primaryAlpha }}
						/>
						<button
							onClick={() => setShowLeaderboardModal(false)}
							className="absolute top-3 right-3 w-8 h-8 rounded-full flex items-center justify-center transition-all hover:scale-110 z-20"
							style={{ background: whiteAlpha5, color: textSecondary }}
						>
							<X className="size-4" />
						</button>
						<div className="text-center mb-5 relative z-10">
							<h3 className="text-xl font-bold mb-1" style={{ color: text }}>
								Klasemen Sementara!
							</h3>
							<p className="text-xs" style={{ color: textSecondary }}>
								Top 5 Player dengan poin tertinggi.
							</p>
						</div>
						<div className="flex-1 overflow-y-auto space-y-2 pr-1 relative z-10">
							{(() => {
								const raw = leaderboardData ?? [];
								if (!Array.isArray(raw) || raw.length === 0) {
									return (
										<div
											className="text-center py-8"
											style={{ color: textSecondary }}
										>
											<p className="text-sm">Belum ada data leaderboard</p>
										</div>
									);
								}
								const top5 = raw
									.sort(
										(a: LeaderboardEntry, b: LeaderboardEntry) =>
											a.rank - b.rank,
									)
									.slice(0, 5);
								return top5.map((entry: LeaderboardEntry) => {
									const isCurrentUser =
										user?.id !== undefined && entry.user_id === user?.id;
									return (
										<div
											key={entry.user_id}
											className="p-3 rounded-xl flex items-center gap-3 transition-all"
											style={{
												background: isCurrentUser
													? colors.primary20
													: whiteAlpha5,
												border: isCurrentUser
													? `2px solid ${primary}`
													: `1px solid ${whiteAlpha10}`,
											}}
										>
											<div
												className="w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm shrink-0"
												style={{
													background: isCurrentUser
														? colors.primary30
														: whiteAlpha10,
													color: isCurrentUser ? primary : text,
												}}
											>
												{entry.rank}
											</div>
											<div className="flex-1 min-w-0">
												<p
													className="font-bold text-sm truncate"
													style={{ color: text }}
												>
													{entry.user_name}
													{isCurrentUser && (
														<span
															className="ml-1.5 text-xs font-semibold"
															style={{ color: primary }}
														>
															(Kamu)
														</span>
													)}
												</p>
												<p className="text-xs" style={{ color: textSecondary }}>
													{entry.total_predictions} prediksi
												</p>
											</div>
											<div className="text-right shrink-0">
												<p
													className="text-xl font-black"
													style={{ color: primary }}
												>
													{entry.total_points}
												</p>
												<p
													className="text-[10px] uppercase tracking-wider"
													style={{ color: textSecondary }}
												>
													poin
												</p>
											</div>
										</div>
									);
								});
							})()}
							{myRankData && myRankData.rank > 5 && (
								<div
									className="p-3 rounded-xl flex items-center gap-3 mt-2"
									style={{
										background: colors.primary20,
										border: `2px solid ${primary}`,
									}}
								>
									<div
										className="w-10 h-10 rounded-full flex items-center justify-center font-bold text-lg shrink-0"
										style={{ background: colors.primary30, color: primary }}
									>
										#{myRankData.rank}
									</div>
									<div className="flex-1 min-w-0">
										<p
											className="font-bold text-sm truncate"
											style={{ color: text }}
										>
											{myRankData.user_name ?? "Kamu"}
											<span
												className="ml-1.5 text-xs font-semibold"
												style={{ color: primary }}
											>
												(Kamu)
											</span>
										</p>
										<p className="text-xs" style={{ color: textSecondary }}>
											{myRankData.total_points ?? 0} poin total
										</p>
									</div>
									<div className="text-right shrink-0">
										<p
											className="text-xl font-black"
											style={{ color: primary }}
										>
											{myRankData.total_points ?? 0}
										</p>
										<p
											className="text-[10px] uppercase tracking-wider"
											style={{ color: textSecondary }}
										>
											poin
										</p>
									</div>
								</div>
							)}
						</div>
					</div>
				</div>
			)}

			<style jsx global>{`
				@keyframes fadeIn {
					from {
						opacity: 0;
					}
					to {
						opacity: 1;
					}
				}
				@keyframes scaleIn {
					from {
						opacity: 0;
						transform: scale(0.9);
					}
					to {
						opacity: 1;
						transform: scale(1);
					}
				}
				.animate-fadeIn {
					animation: fadeIn 0.2s ease-out;
				}
				.animate-scaleIn {
					animation: scaleIn 0.3s ease-out;
				}
				.match-card:hover {
					border-color: ${primary}60 !important;
					box-shadow: 0 8px 40px ${primaryAlpha};
					transform: scale(1.02);
				}
				@keyframes shimmer {
					0% {
						background-position: -200% 0;
					}
					100% {
						background-position: 200% 0;
					}
				}
				.animate-pulse {
					background: linear-gradient(
						90deg,
						rgba(255, 255, 255, 0.05) 0%,
						rgba(255, 255, 255, 0.1) 50%,
						rgba(255, 255, 255, 0.05) 100%
					);
					background-size: 200% 100%;
					animation: shimmer 1.5s infinite;
				}
			`}</style>
		</div>
	);
}
