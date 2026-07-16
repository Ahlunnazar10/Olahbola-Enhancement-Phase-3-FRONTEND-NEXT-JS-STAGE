"use client";

import { useState, useMemo, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import {
	Trophy,
	TrendingUp,
	Edit3,
	Lock,
	Check,
	User,
	Menu,
	X,
	Star,
	Bell,
	ChevronRight,
	Info,
} from "lucide-react";
import { useUIStore } from "@/stores/uiStore";
import { useAuthStore } from "@/stores/authStore";
import {
	usePhases,
	useMatches,
	useLeaderboard,
	useMyPredictions,
	useMyRank,
	useMySummary,
	useSubmitPrediction,
	formatMatchDate,
	type Phase,
	type Match,
	type LeaderboardEntry,
} from "@/hooks/queries/usePredictions";
import toast from "react-hot-toast";

// ============================================================
// CONSTANTS & UTILITIES
// ============================================================

// Extract country initials from name
function getCountryInitials(name: string): string {
	const words = name.trim().split(/\s+/);
	if (words.length === 1) {
		return words[0].slice(0, 2).toUpperCase();
	}
	return words
		.map((w) => w[0])
		.join("")
		.slice(0, 2)
		.toUpperCase();
}

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
			{/* Date row */}
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

			{/* Teams row */}
			<div className="flex items-center justify-between gap-4 mb-10">
				{/* Home */}
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

				{/* VS */}
				<div
					className={`h-8 w-12 ${s}`}
					style={{ background: "rgba(255,255,255,0.1)" }}
				/>

				{/* Away */}
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

			{/* Button */}
			<div
				className="h-12 w-full rounded-2xl"
				style={{ background: "rgba(255,255,255,0.1)" }}
			/>
		</div>
	);
}

// ============================================================
// COUNTRY BADGE
// ============================================================
function CountryBadge({
	name,
	size = "md",
	bgColor = "rgba(67, 222, 204, 0.15)",
	textColor = "#43decc",
	borderColor = "rgba(67, 222, 204, 0.3)",
}: {
	name: string;
	size?: "sm" | "md" | "lg";
	bgColor?: string;
	textColor?: string;
	borderColor?: string;
}) {
	const abbr = getCountryInitials(name);
	const sizeClasses = {
		sm: "w-10 h-10 text-sm",
		md: "w-14 h-14 text-md",
		lg: "w-28 h-28 text-4xl",
	};
	return (
		<div
			className={`${sizeClasses[size]} rounded-full flex items-center justify-center font-black`}
			style={{
				background: bgColor,
				color: textColor,
				border: `1px solid ${borderColor}`,
			}}
		>
			{abbr}
		</div>
	);
}

// ============================================================
// LOADING OVERLAY (percentage-based)
// ============================================================
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
						Memuat Prediksi Skor...
					</p>
					<p className="text-sm" style={{ color: "#bbcac6" }}>
						Mengambil data Prediksi Skor dan klasemen terbaru. Tunggu sebentar
						ya!
					</p>
				</div>
			</div>
		</div>
	);
}

// ============================================================
// MAIN PAGE
// ============================================================
export default function PrediksiSkorPage() {
	const { theme } = useUIStore();
	const { isAuthenticated, user } = useAuthStore();
	const isDark = theme === "dark";

	const [activePhase, setActivePhase] = useState("third_place");
	const [activeGroup, setActiveGroup] = useState("A");
	const [activeTab, setActiveTab] = useState<"matches" | "leaderboard">(
		"matches",
	);
	const [selectedMatch, setSelectedMatch] = useState<Match | null>(null);
	const [homeScore, setHomeScore] = useState<number | "">(0);
	const [awayScore, setAwayScore] = useState<number | "">(0);
	const [showLeaderboardModal, setShowLeaderboardModal] = useState(false);
	const [showLoginPrompt, setShowLoginPrompt] = useState(false);

	// Show login prompt modal once for unauthenticated visitors on first visit
	useEffect(() => {
		if (isAuthenticated) {
			setShowLoginPrompt(false);
			return;
		}
		if (typeof window === "undefined") return;
		const seen = sessionStorage.getItem("prediksi-skor:loginPromptSeen");
		if (seen) return;
		setShowLoginPrompt(true);
		sessionStorage.setItem("prediksi-skor:loginPromptSeen", "1");
	}, [isAuthenticated]);

	// Data hooks
	const { data: phasesData, isLoading: phasesLoading } = usePhases();
	const { data: matchesData, isLoading: matchesLoading } = useMatches({
		phase: activePhase,
		...(activePhase === "group_stage" && { group: activeGroup }),
	});
	const { data: leaderboardData, isLoading: leaderboardLoading } =
		useLeaderboard();
	const { data: myPredictionsData, isLoading: myPredictionsLoading } =
		useMyPredictions();
	const { data: myRankData, isLoading: myRankLoading } = useMyRank();
	const { data: mySummaryData, isLoading: mySummaryLoading } = useMySummary();
	const submitPrediction = useSubmitPrediction();

	// Initial overlay: only shown during the very first mount/refresh.
	// Once every query has resolved at least once, the overlay is gone forever
	// (subsequent tab/group switches show skeleton loaders, not the overlay).
	const [initialLoadDone, setInitialLoadDone] = useState(false);
	const isAnyLoading =
		phasesLoading ||
		matchesLoading ||
		leaderboardLoading ||
		myPredictionsLoading ||
		myRankLoading ||
		mySummaryLoading;
	useEffect(() => {
		if (!isAnyLoading && !initialLoadDone) {
			setInitialLoadDone(true);
		}
	}, [isAnyLoading, initialLoadDone]);
	const showInitialOverlay = !initialLoadDone;

	// Points text changes per phase
	const POINTS_TEXT: Record<string, string> = {
		group_stage:
			"*Tebak akurat dapat 10 poin, tebak pemenang / tebak skor dapat 5 poin, jika salah dapat 0 poin",
		round_of_32:
			"*Tebak akurat dapat 10 poin, tebak pemenang / tebak skor dapat 5 poin, jika salah dapat 0 poin",
		round_of_16:
			"*Tebak akurat dapat 10 poin, tebak pemenang / tebak skor dapat 5 poin, jika salah dapat 0 poin",
		quarter_final:
			"*Tebak akurat dapat 20 poin, tebak pemenang / tebak skor dapat 10 poin, jika salah dapat 0 poin",
		semi_final:
			"*Tebak akurat dapat 30 poin, tebak pemenang / tebak skor dapat 15 poin, jika salah dapat 0 poin",
		third_place:
			"*Tebak akurat dapat 40 poin, tebak pemenang / tebak skor dapat 20 poin, jika salah dapat 0 poin",
		final:
			"*Tebak akurat dapat 50 poin, tebak pemenang / tebak skor dapat 25 poin, jika salah dapat 0 poin",
	};
	const pointsSubtitle =
		POINTS_TEXT[activePhase] ??
		"*Tebak akurat dapat 20 poin, tebak pemenang / tebak skor dapat 10 poin, jika salah dapat 0 poin";

	const groups = ["A", "B", "C", "D", "E", "F", "G", "H", "I", "J", "K", "L"];

	// Dynamic Colors based on theme
	const colors: Record<string, string> = isDark
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
				primary40: "rgba(67, 222, 204, 0.4)",
				primary50: "rgba(67, 222, 204, 0.5)",
				primary20: "rgba(67, 222, 204, 0.2)",
				primary05: "rgba(67, 222, 204, 0.05)",
				primary30: "rgba(67, 222, 204, 0.3)",
				primaryDark30: "rgba(10, 124, 110, 0.3)",
				badgeActiveBg: "#43decc",
				badgeActiveText: "#003732",
				badgeInactiveBg: "rgba(255, 255, 255, 0.05)",
				badgeInactiveText: "#bbcac6",
				badgeInactiveBorder: "rgba(255, 255, 255, 0.1)",
				lockText: "rgba(187, 202, 198, 0.4)",
				lockBorder: "rgba(133, 148, 144, 0.2)",
				meshPattern: "#43decc",
				glowColor: "rgba(67, 222, 204, 0.15)",
				predictionBg: "rgba(67, 222, 204, 0.15)",
				countryBadgeBg: "rgba(67, 222, 204, 0.15)",
				countryBadgeText: "#43decc",
				countryBadgeBorder: "rgba(67, 222, 204, 0.3)",
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
				primary40: "rgba(10, 124, 110, 0.25)",
				primary50: "rgba(10, 124, 110, 0.35)",
				primary20: "rgba(10, 124, 110, 0.15)",
				primary05: "rgba(10, 124, 110, 0.05)",
				primary30: "rgba(10, 124, 110, 0.2)",
				primaryDark30: "rgba(10, 124, 110, 0.2)",
				badgeActiveBg: "#0a7c6e",
				badgeActiveText: "#ffffff",
				badgeInactiveBg: "rgba(0, 0, 0, 0.04)",
				badgeInactiveText: "#6b7280",
				badgeInactiveBorder: "rgba(0, 0, 0, 0.08)",
				lockText: "rgba(107, 114, 128, 0.6)",
				lockBorder: "rgba(107, 114, 128, 0.15)",
				meshPattern: "#0a7c6e",
				glowColor: "rgba(10, 124, 110, 0.1)",
				predictionBg: "rgba(10, 124, 110, 0.12)",
				countryBadgeBg: "rgba(10, 124, 110, 0.15)",
				countryBadgeText: "#0a7c6e",
				countryBadgeBorder: "rgba(10, 124, 110, 0.3)",
				buttonActiveBg: "#0a7c6e",
				buttonActiveText: "#ffffff",
				buttonInactiveBg: "rgba(0, 0, 0, 0.04)",
				buttonInactiveText: "#6b7280",
			};

	// Individual color constants for convenience
	const primary = colors.primary;
	const secondary = colors.secondary;
	const primaryAlpha = colors.primaryAlpha;
	const surface = colors.surface;
	const surfaceContainer = colors.surfaceContainer;
	const text = colors.text;
	const textSecondary = colors.textSecondary;
	const outline = colors.outline;
	const white = colors.white;
	const whiteAlpha5 = colors.whiteAlpha5;
	const whiteAlpha10 = colors.whiteAlpha10;
	const bg = colors.bg;
	const gold = "#ffd700";
	const silver = "#c0c0c0";
	const bronze = "#cd7f32";

	// ============================================================
	// PHASE LOCKING LOGIC
	// ============================================================
	const handlePhaseClick = (phase: Phase) => {
		if (!phase.is_active) return;
		setActivePhase(phase.slug);
	};

	// ============================================================
	// PREDICTION HELPERS
	// ============================================================
	const getUserPrediction = (matchId: string) => {
		if (!myPredictionsData?.data) return null;

		return myPredictionsData.data.find((p: any) => p.match_id === matchId);
	};

	const handleSubmit = async () => {
		if (!selectedMatch || !isAuthenticated) return;
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

	return (
		<div
			className="min-h-screen pb-24 md:pb-12"
			style={{ background: bg, color: text }}
		>
			{/* Initial loader overlay — only removed once every query has resolved at least once */}
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
				<section className="max-w-7xl mx-auto px-6 md:px-8 text-center mb-6  relative">
					<div
						className="absolute -top-12 left-1/2 -translate-x-1/2 w-70 h-70 rounded-full blur-[80px]"
						style={{ background: primaryAlpha }}
					/>

					<h1
						className="text-4xl md:text-7xl font-bold max-w-3xl mx-auto italic uppercase tracking-tighter mb-10"
						style={{
							color: text,
							fontFamily: "Space Grotesk, sans-serif",
						}}
					>
						Prediksi Skor <br />{" "}
						<span style={{ color: primary }}>Teater Bola Dunia</span>
						<span
							className="block mt-1 text-xs italic font-normal tracking-normal"
							style={{ color: textSecondary }}
						>
							{pointsSubtitle}
						</span>
					</h1>

					{/* Stats Bento Grid */}
					<div className="flex flex-row gap-4 max-w-4xl mx-auto overflow-x-auto pb-2 px-0 md:grid md:grid-cols-3 md:overflow-visible">
						<div
							className="min-w-35 flex-1 p-6 rounded-2xl backdrop-blur-xl border transition-all hover:-translate-y-1"
							style={{
								background: colors.primary05,
								borderColor: colors.primary30,
							}}
						>
							<div className="text-3xl font-bold mb-1" style={{ color: text }}>
								{mySummaryData?.data?.total_predictions ?? 0}
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
								{mySummaryData?.data?.total_points?.toLocaleString() ?? 0}
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
								#{myRankData?.data?.rank ?? "-"}
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

				{/* Knockout Info Box — show only in knockout phases (not group stage) */}
				{activePhase !== "group_stage" && (
					<section className="max-w-7xl mx-auto px-6 md:px-8 mb-6 md:mb-6">
						<div
							className="flex items-start gap-3 px-5 py-4 rounded-2xl border"
							style={{
								background: colors.predictionBg,
								borderColor: colors.primary30,
							}}
						>
							<Info
								className="size-5 shrink-0 mt-0.5"
								style={{ color: primary }}
							/>
							<div>
								<p
									className="text-sm font-bold leading-snug"
									style={{ color: primary }}
								>
									Catatan Skor
								</p>
								<p
									className="text-xs mt-0.5 leading-relaxed"
									style={{ color: textSecondary }}
								>
									Skor dihitung hingga{" "}
									<strong style={{ color: text }}>extra-time</strong>. Adu
									penalti tidak diperhitungkan. Jika pertandingan berakhir seri
									setelah extra-time, maka dianggap sebagai{" "}
									<strong style={{ color: text }}>pertandingan seri</strong>.
								</p>
							</div>
						</div>
					</section>
				)}

				{/* Phase Tabs */}
				<section className="max-w-7xl mx-auto px-6 md:px-8 mb-4 md:mb-8 overflow-x-auto">
					<div
						className="flex gap-4 pb-4 border-b"
						style={{ borderColor: whiteAlpha5 }}
					>
						{(phasesData?.data as Phase[] | undefined)?.map((phase: Phase) => {
							const isActive = activePhase === phase.slug;
							const isLocked = !phase.is_active;
							return (
								<button
									key={phase.id}
									onClick={() => handlePhaseClick(phase)}
									className="relative px-6 py-2 rounded-full font-semibold text-sm whitespace-nowrap transition-all flex items-center gap-2"
									style={
										isActive
											? {
													background: colors.buttonActiveBg,
													color: colors.buttonActiveText,
												}
											: isLocked
												? {
														background: colors.badgeInactiveBg,
														color: colors.lockText,
														border: `1px solid ${colors.lockBorder}`,
														cursor: "not-allowed",
													}
												: {
														background: colors.badgeInactiveBg,
														color: colors.badgeInactiveText,
														border: `1px solid ${colors.badgeInactiveBorder}`,
													}
									}
								>
									{isLocked && <Lock className="size-3.5" />}
									{phase.name}
								</button>
							);
						})}
					</div>
				</section>

				{/* Group Tabs */}
				{activePhase === "group_stage" && (
					<section className="max-w-7xl mx-auto px-6 md:px-8 mb-8">
						<div className="hidden md:flex gap-3">
							{groups.map((g) => (
								<button
									key={g}
									onClick={() => setActiveGroup(g)}
									className="w-12 h-12 rounded-xl font-bold text-lg transition-all"
									style={
										activeGroup === g
											? {
													background: colors.buttonActiveBg,
													color: colors.buttonActiveText,
												}
											: {
													background: colors.badgeInactiveBg,
													color: colors.badgeInactiveText,
													border: `1px solid ${colors.badgeInactiveBorder}`,
												}
									}
								>
									{g}
								</button>
							))}
						</div>
						<div className="flex md:hidden gap-3 overflow-x-auto pb-2">
							{groups.slice(0, 6).map((g) => (
								<button
									key={g}
									onClick={() => setActiveGroup(g)}
									className="w-12 h-12 rounded-xl font-bold text-lg transition-all"
									style={
										activeGroup === g
											? {
													background: colors.buttonActiveBg,
													color: colors.buttonActiveText,
												}
											: {
													background: colors.badgeInactiveBg,
													color: colors.badgeInactiveText,
													border: `1px solid ${colors.badgeInactiveBorder}`,
												}
									}
								>
									{g}
								</button>
							))}
						</div>
						<div className="flex md:hidden gap-3 overflow-x-auto">
							{groups.slice(6).map((g) => (
								<button
									key={g}
									onClick={() => setActiveGroup(g)}
									className="w-12 h-12 rounded-xl font-bold text-lg transition-all"
									style={
										activeGroup === g
											? {
													background: colors.buttonActiveBg,
													color: colors.buttonActiveText,
												}
											: {
													background: colors.badgeInactiveBg,
													color: colors.badgeInactiveText,
													border: `1px solid ${colors.badgeInactiveBorder}`,
												}
									}
								>
									{g}
								</button>
							))}
						</div>
					</section>
				)}

				{/* Matches Grid */}
				{activeTab === "matches" && (
					<section className="max-w-7xl mx-auto px-6 md:px-8 grid grid-cols-1 lg:grid-cols-2 gap-6 mb-24 md:mb-16">
						{matchesLoading ? (
							<>
								{[1, 2, 3, 4].map((i) => (
									<MatchCardSkeleton key={i} />
								))}
							</>
						) : matchesData?.data?.length === 0 ? (
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
									Belum ada pertandingan untuk fase ini.
								</p>
							</div>
						) : (
							matchesData?.data?.map((match: Match) => {
								const userPred = getUserPrediction(match.id);
								const hasPrediction = !!userPred;
								const isEditable = match.is_prediction_open && isAuthenticated;
								const isCompleted = match.status === "completed";

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

										{/* Teams & Score */}
										<div className="flex items-center justify-between gap-0 mb-10 relative z-10">
											{/* Home Team */}
											<div className="flex flex-col items-center gap-3 flex-1">
												<CountryBadge
													name={match.home_team.name}
													size="md"
													bgColor={colors.countryBadgeBg}
													textColor={colors.countryBadgeText}
													borderColor={colors.countryBadgeBorder}
												/>
												<span
													className="text-sm font-bold tracking-tight text-center"
													style={{ color: text }}
												>
													{match.home_team.name.toUpperCase()}
												</span>
											</div>

											{/* Score / VS */}
											<div className="px-4 flex flex-col items-center gap-2">
												{isCompleted && (
													<span
														className="text-xs font-bold "
														style={{ color: primary }}
													>
														Full-time
													</span>
												)}
												{isCompleted ? (
													<span
														className="text-2xl md:text-3xl font-black transition-all"
														style={{ color: text }}
													>
														{match.home_score} - {match.away_score}
													</span>
												) : hasPrediction ? (
													<span
														className="text-2xl md:text-3xl font-black transition-all"
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

											{/* Away Team */}
											<div className="flex flex-col items-center gap-3 flex-1">
												<CountryBadge
													name={match.away_team.name}
													size="md"
													bgColor={colors.countryBadgeBg}
													textColor={colors.countryBadgeText}
													borderColor={colors.countryBadgeBorder}
												/>
												<span
													className="text-sm font-bold tracking-tight text-center"
													style={{ color: text }}
												>
													{match.away_team.name.toUpperCase()}
												</span>
											</div>
										</div>

										{/* Action Button */}
										<div className="relative z-10">
											{isCompleted && hasPrediction ? (
												/* Show prediction result vs actual score for completed matches */
												<div
													className={`w-full py-4 px-4 text-sm md:text-base rounded-2xl flex flex-col items-center justify-center gap-1 border ${
														userPred.score_exact
															? "border-green-400/40"
															: userPred.result_correct
																? "border-yellow-400/40"
																: "border-red-400/40"
													}`}
													style={{
														background: colors.primary15,
													}}
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
														background: surfaceContainer,
														color: outline,
													}}
													disabled
												>
													<Check className="size-5" />
													Full-time
												</button>
											) : hasPrediction ? (
												/* Show prediction result instead of button */
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

				{/* Leaderboard */}
				{activeTab === "leaderboard" && (
					<section className="max-w-4xl mx-auto px-6 md:px-8 mb-24 md:mb-16">
						{leaderboardLoading ? (
							<div className="space-y-3">
								{[1, 2, 3, 4, 5].map((i) => (
									<div
										key={i}
										className="h-20 rounded-xl animate-pulse"
										style={{ background: "rgba(255,255,255,0.05)" }}
									/>
								))}
							</div>
						) : (
							<>
								{myRankData?.data && (
									<div
										className="p-6 rounded-2xl text-center mb-8 backdrop-blur-xl"
										style={{
											background: colors.primary20,
											border: `2px solid ${primary}`,
										}}
									>
										<Trophy
											className="size-12 mx-auto mb-2"
											style={{ color: gold }}
										/>
										<p
											className="text-5xl font-black mb-2"
											style={{ color: text }}
										>
											#{myRankData.data.rank}
										</p>
										<p className="text-lg" style={{ color: textSecondary }}>
											dari {myRankData.data.total_participants} peserta
										</p>
									</div>
								)}

								<div className="space-y-3">
									{(Array.isArray(leaderboardData) ? leaderboardData : []).map(
										(entry: any, index: number) => {
											const medals = ["🥇", "🥈", "🥉"];
											const isTop3 = index < 3;

											return (
												<div
													key={entry.rank}
													className="p-4 rounded-xl flex items-center gap-4 transition-all"
													style={{
														background: isTop3
															? index === 0
																? `${gold}20`
																: index === 1
																	? `${silver}20`
																	: `${bronze}20`
															: whiteAlpha5,
														border: isTop3
															? `2px solid ${index === 0 ? gold : index === 1 ? silver : bronze}`
															: `1px solid ${whiteAlpha10}`,
														transform: isTop3 ? "scale(1.02)" : "scale(1)",
													}}
												>
													<div
														className="w-12 h-12 rounded-full flex items-center justify-center font-bold text-xl"
														style={{
															background: isTop3
																? index === 0
																	? gold
																	: index === 1
																		? silver
																		: bronze
																: whiteAlpha10,
															color: isTop3 ? "#000" : text,
														}}
													>
														{medals[index] || entry.rank}
													</div>
													<div className="flex-1">
														<p className="font-bold" style={{ color: text }}>
															{entry.user_name}
														</p>
														<p
															className="text-sm"
															style={{ color: textSecondary }}
														>
															{entry.total_predictions} prediksi
														</p>
													</div>
													<div className="text-right">
														<p
															className="text-2xl font-black"
															style={{ color: primary }}
														>
															{entry.total_points}
														</p>
														<p
															className="text-xs uppercase tracking-wider"
															style={{ color: textSecondary }}
														>
															poin
														</p>
													</div>
												</div>
											);
										},
									)}
								</div>
							</>
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
							background: surface,
							borderColor: colors.primary30,
							boxShadow: `0 0 40px ${primaryAlpha}, 0 15px 30px rgba(0,0,0,0.4)`,
						}}
						onClick={(e) => e.stopPropagation()}
					>
						{/* Glow effect */}
						<div
							className="absolute -top-10 left-1/2 -translate-x-1/2 w-40 h-40 rounded-full blur-[60px] pointer-events-none"
							style={{ background: primaryAlpha }}
						/>

						{/* Close button */}
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

						{/* Header */}
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

						{/* Score Inputs */}
						<div className="flex items-center justify-center gap-6 mb-6 relative z-10">
							{/* Home Score */}
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
									style={{
										borderColor: outline,
										color: primary,
									}}
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

							{/* Away Score */}
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
									style={{
										borderColor: outline,
										color: primary,
									}}
									min="0"
									max="99"
									placeholder="0"
								/>
							</div>
						</div>

						{/* Prediction Result */}
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

						{/* Action Buttons */}
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
								{submitPrediction.isPending ? (
									"Menyimpan..."
								) : (
									<>Simpan Prediksi</>
								)}
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

			{/* Login Prompt Modal (guest only, shown once) */}
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
							background: surface,
							borderColor: colors.primary30,
							boxShadow: `0 0 40px ${primaryAlpha}, 0 15px 30px rgba(0,0,0,0.4)`,
						}}
						onClick={(e) => e.stopPropagation()}
					>
						{/* Glow */}
						<div
							className="absolute -top-10 left-1/2 -translate-x-1/2 w-40 h-40 rounded-full blur-[60px] pointer-events-none"
							style={{ background: primaryAlpha }}
						/>

						{/* Close button */}
						<button
							onClick={() => setShowLoginPrompt(false)}
							className="absolute top-3 right-3 w-8 h-8 rounded-full flex items-center justify-center transition-all hover:scale-110 z-20"
							style={{ background: whiteAlpha5, color: textSecondary }}
						>
							<X className="size-4" />
						</button>

						{/* Content */}
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
								skor Teater Bola Dunia!
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
							background: surface,
							borderColor: colors.primary30,
							boxShadow: `0 0 40px ${primaryAlpha}, 0 15px 30px rgba(0,0,0,0.4)`,
						}}
						onClick={(e) => e.stopPropagation()}
					>
						{/* Glow */}
						<div
							className="absolute -top-10 left-1/2 -translate-x-1/2 w-40 h-40 rounded-full blur-[60px] pointer-events-none"
							style={{ background: primaryAlpha }}
						/>

						{/* Close button */}
						<button
							onClick={() => setShowLeaderboardModal(false)}
							className="absolute top-3 right-3 w-8 h-8 rounded-full flex items-center justify-center transition-all hover:scale-110 z-20"
							style={{ background: whiteAlpha5, color: textSecondary }}
						>
							<X className="size-4" />
						</button>

						{/* Header */}
						<div className="text-center mb-5 relative z-10">
							<h3 className="text-xl font-bold mb-1" style={{ color: text }}>
								Klasemen Sementara!
							</h3>
							<p className="text-xs" style={{ color: textSecondary }}>
								Top 5 Player dengan poin tertinggi.
							</p>
						</div>

						{/* List */}
						<div className="flex-1 overflow-y-auto space-y-2 pr-1 relative z-10">
							{(() => {
								const raw = leaderboardData?.data;
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

							{/* Show current user rank if outside top 5 */}
							{myRankData?.data &&
								myRankData.data.rank > 5 &&
								(() => {
									return (
										<div
											className="p-3 rounded-xl flex items-center gap-3 mt-2"
											style={{
												background: colors.primary20,
												border: `2px solid ${primary}`,
											}}
										>
											<div
												className="w-10 h-10 rounded-full flex items-center justify-center font-bold text-lg shrink-0"
												style={{
													background: colors.primary30,
													color: primary,
												}}
											>
												#{myRankData.data.rank}
											</div>
											<div className="flex-1 min-w-0">
												<p
													className="font-bold text-sm truncate"
													style={{ color: text }}
												>
													{myRankData.data.user_name ?? "Kamu"}
													<span
														className="ml-1.5 text-xs font-semibold"
														style={{ color: primary }}
													>
														(Kamu)
													</span>
												</p>
												<p className="text-xs" style={{ color: textSecondary }}>
													{myRankData.data.total_points ?? 0} poin total
												</p>
											</div>
											<div className="text-right shrink-0">
												<p
													className="text-xl font-black"
													style={{ color: primary }}
												>
													{myRankData.data.total_points ?? 0}
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
								})()}
						</div>
					</div>
				</div>
			)}

			<style jsx global>{`
				@keyframes pulse {
					0%,
					100% {
						transform: scale(0.95);
						opacity: 1;
					}
					50% {
						transform: scale(1.05);
						opacity: 0.7;
					}
				}
				.pulse-indicator {
					animation: pulse 2s infinite;
				}

				/* Match card hover effects */
				.match-card:hover {
					border-color: ${primary}60 !important;
					box-shadow: 0 8px 40px ${primaryAlpha};
					transform: scale(1.02);
				}

				/* Skeleton shimmer */
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

				/* Modal animations */
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
			`}</style>
		</div>
	);
}
