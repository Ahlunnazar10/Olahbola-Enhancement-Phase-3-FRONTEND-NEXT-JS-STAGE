"use client";

import { useState, useMemo, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { Trophy, Lock, Check, X, Info } from "lucide-react";
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
} from "@/hooks/queries/useFifaAseanCup";
import { EventEndedBanner } from "@/components/games/EventEndedBanner";
import { EVENT_STATUS } from "@/lib/games/eventStatus";
import { getImageUrl } from "@/lib/utils";
import toast from "react-hot-toast";

function getCountryInitials(name: string): string {
	const words = name.trim().split(/\s+/);
	if (words.length === 1) return words[0].slice(0, 2).toUpperCase();
	return words
		.map((w) => w[0])
		.join("")
		.slice(0, 2)
		.toUpperCase();
}

function TeamFlag({
	team,
}: {
	team: {
		name: string;
		logo_url?: string | null;
		flag_emoji?: string | null;
		flag_url?: string | null;
		flag?: string;
	};
}) {
	const flagSrc = team.logo_url
		? getImageUrl(team.logo_url)
		: team.flag_url
			? getImageUrl(team.flag_url)
			: null;
	if (flagSrc) {
		return (
			<div className="relative w-16 h-10 shrink-0 flex items-center justify-center">
				<Image
					src={flagSrc}
					alt={team.name}
					width={64}
					height={40}
					className="object-contain"
				/>
			</div>
		);
	}
	if (team.flag_emoji) {
		return (
			<div className="w-14 h-14 rounded-full bg-white/10 shrink-0 flex items-center justify-center">
				<span className="text-2xl leading-none">{team.flag_emoji}</span>
			</div>
		);
	}
	if (team.flag) {
		return (
			<div className="w-14 h-14 rounded-full bg-white/10 shrink-0 flex items-center justify-center">
				<span className="text-2xl leading-none">{team.flag}</span>
			</div>
		);
	}
	return (
		<div className="w-14 h-14 rounded-full bg-[rgba(67,222,204,0.15)] border border-[rgba(67,222,204,0.3)] flex items-center justify-center font-black text-sm text-primary shrink-0">
			{getCountryInitials(team.name)}
		</div>
	);
}

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
				{[0, 1].map((i) => (
					<div key={i} className="flex flex-col items-center gap-3 flex-1">
						<div
							className="w-14 h-14 rounded-full"
							style={{ background: "rgba(255,255,255,0.1)" }}
						/>
						<div
							className={`h-4 w-20 ${s}`}
							style={{ background: "rgba(255,255,255,0.1)" }}
						/>
					</div>
				))}
			</div>
			<div
				className="h-12 w-full rounded-2xl"
				style={{ background: "rgba(255,255,255,0.1)" }}
			/>
		</div>
	);
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
						Sedang mengambil data Prediksi Skor dan klasemen terbaru...
					</p>
				</div>
			</div>
		</div>
	);
}

const DARK_COLORS = {
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
	buttonActiveBg: "#43decc",
	buttonActiveText: "#003732",
	buttonInactiveBg: "rgba(255, 255, 255, 0.05)",
	buttonInactiveText: "#bbcac6",
} as const;

const LIGHT_COLORS = {
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
	buttonActiveBg: "#0a7c6e",
	buttonActiveText: "#ffffff",
	buttonInactiveBg: "rgba(0, 0, 0, 0.04)",
	buttonInactiveText: "#6b7280",
} as const;

// ============================================================
// MAIN PAGE
// ============================================================
export default function FifaAseanCupPage() {
	const { theme } = useUIStore();
	const { isAuthenticated, user } = useAuthStore();
	const isDark = theme === "dark";

	const [activePhase, setActivePhase] = useState("group_stage");
	const [activeGroup, setActiveGroup] = useState("A");
	const [activeTab, setActiveTab] = useState<"matches" | "leaderboard">(
		"matches",
	);
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
		const seen = sessionStorage.getItem("fifa-asean-cup:loginPromptSeen");
		if (seen) return;
		setShowLoginPrompt(true);
		sessionStorage.setItem("fifa-asean-cup:loginPromptSeen", "1");
	}, [isAuthenticated]);

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

	const [initialLoadDone, setInitialLoadDone] = useState(false);
	const isAnyLoading =
		phasesLoading ||
		matchesLoading ||
		leaderboardLoading ||
		myPredictionsLoading ||
		myRankLoading ||
		mySummaryLoading;
	useEffect(() => {
		if (!isAnyLoading && !initialLoadDone) setInitialLoadDone(true);
	}, [isAnyLoading, initialLoadDone]);
	const showInitialOverlay = !initialLoadDone;

	const getPointsSubtitle = (phase: string) => {
		switch (phase) {
			case "group_stage":
				return "*Tebak akurat dapat 30 poin, tebak pemenang dapat 15 poin, jika salah dapat 0 poin";
			case "third_place":
				return "*Tebak akurat dapat 50 poin, tebak pemenang dapat 25 poin, jika salah dapat 0 poin";
			case "final":
				return "*Tebak akurat dapat 80 poin, tebak pemenang dapat 40 poin, jika salah dapat 0 poin";
			default:
				return "*Tebak akurat dapat 10 poin, tebak pemenang dapat 5 poin, jika salah dapat 0 poin";
		}
	};

	const pointsSubtitle = useMemo(
		() => getPointsSubtitle(activePhase),
		[activePhase],
	);
	const groups = ["A", "B"];

	const colors = isDark ? DARK_COLORS : LIGHT_COLORS;
	const primary = colors.primary;
	const secondary = colors.secondary;
	const primaryAlpha = colors.primaryAlpha;
	const surface = colors.surface;
	const text = colors.text;
	const textSecondary = colors.textSecondary;
	const outline = colors.outline;
	const whiteAlpha5 = colors.whiteAlpha5;
	const whiteAlpha10 = colors.whiteAlpha10;
	const bg = colors.bg;
	const surfaceContainer = colors.surfaceContainer;

	const handlePhaseClick = (phase: Phase) => {
		if (!phase.is_active) return;
		setActivePhase(phase.slug);
	};

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

	// ============================================================
	// ENDED STATE VIEW
	// ============================================================
	if (EVENT_STATUS.fifaAseanCup.isEnded) {
		return (
			<div
				className="min-h-screen pb-24 md:pb-12"
				style={{ background: bg, color: text }}
			>
				<div
					className="fixed inset-0 z-0 opacity-5 pointer-events-none"
					style={{
						backgroundImage: `repeating-linear-gradient(45deg, ${primary} 0, ${primary} 1px, transparent 0, transparent 50%)`,
						backgroundSize: "100px 100px",
					}}
				/>

				<main className="pt-10 md:pt-18 relative max-w-5xl mx-auto px-6 md:px-8 space-y-12">
					<section className="text-center space-y-4">
						<h1
							className="text-4xl md:text-6xl font-black italic tracking-tighter uppercase"
							style={{ color: text, fontFamily: "Space Grotesk, sans-serif" }}
						>
							Prediksi Skor <br />
							<span style={{ color: primary }}>FIFA Asean Cup 2026</span>
						</h1>
						<EventEndedBanner
							isDark={isDark}
							variant="full"
							endedNotice={EVENT_STATUS.fifaAseanCup.endedNotice}
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
								Olahbola FIFA Asean Cup 2026 Ended
							</p>
						</div>
					</section>

					<style jsx global>{`
						@keyframes fadeIn {
							from {
								opacity: 0;
							}
							to {
								opacity: 1;
							}
						}
						.animate-fadeIn {
							animation: fadeIn 0.3s ease-out;
						}
					`}</style>
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

			<div
				className="fixed inset-0 z-0 opacity-5 pointer-events-none"
				style={{
					backgroundImage: `repeating-linear-gradient(45deg, ${primary} 0, ${primary} 1px, transparent 0, transparent 50%)`,
					backgroundSize: "100px 100px",
				}}
			/>

			<main className="pt-10 md:pt-18 relative">
				{/* Hero */}
				<section className="max-w-7xl mx-auto px-6 md:px-8 text-center mb-6 relative">
					<div
						className="absolute -top-12 left-1/2 -translate-x-1/2 w-70 h-70 rounded-full blur-[80px]"
						style={{ background: primaryAlpha }}
					/>
					<h1
						className="text-4xl md:text-7xl font-bold max-w-4xl mx-auto italic uppercase tracking-tighter mb-10"
						style={{ color: text, fontFamily: "Space Grotesk, sans-serif" }}
					>
						Prediksi Skor <br />
						<span style={{ color: primary }}>FIFA Asean Cup 2026</span>
						<span
							className="block mt-1 text-xs italic font-normal tracking-normal"
							style={{ color: textSecondary }}
						>
							{pointsSubtitle}
						</span>
					</h1>

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

				{/* Prize Showcase */}
				<section className="max-w-7xl mx-auto px-6 md:px-8 mb-12">
					<div
						className="relative rounded-3xl border overflow-hidden"
						style={{
							background: colors.surfaceContainer,
							borderColor: colors.primary30,
						}}
					>
						{/* Ambient glow */}
						<div
							className="absolute top-0 right-0 w-80 h-80 rounded-full blur-[100px] pointer-events-none opacity-40"
							style={{ background: colors.primary }}
						/>
						<div
							aria-hidden
							className="absolute bottom-0 left-0 w-60 h-60 rounded-full pointer-events-none"
							style={{
								background:
									"radial-gradient(circle, rgba(67, 222, 204, 0.2) 0%, transparent 70%)",
								filter: "blur(40px)",
							}}
						/>

						<div className="relative z-10 flex flex-col md:flex-row items-center md:gap-12 px-5 md:px-12 py-4 md:py-0">
							{/* Left: Text */}
							<div className="flex-1 text-center md:text-left">
								<div className="inline-flex items-center gap-2 bg-primary/10 border border-primary/20 px-3 py-1.5 rounded-full mb-3">
									<span className="relative flex h-2 w-2">
										<span className="absolute inline-flex h-full w-full rounded-full bg-primary animate-ping opacity-75" />
										<span
											className={`relative inline-flex rounded-full h-2 w-2 ${isDark ? "bg-primary" : "bg-[#0a7c6e]"}`}
										/>
									</span>
									<span
										className="text-[9px] font-bold uppercase tracking-widest"
										style={{ color: colors.primary }}
									>
										Hadiah Esklusif
									</span>
								</div>
								<h2
									className="text-lg md:text-3xl font-black italic uppercase leading-tight mb-1"
									style={{ color: colors.text }}
								>
									Third Jersey
									<span style={{ color: colors.primary }}>
										{" "}
										Timnas Indonesia{" "}
									</span>
								</h2>
								<p
									className="text-xs md:text-sm max-w-xl"
									style={{ color: colors.textSecondary }}
								>
									Cukup ikut prediksi skor di setiap laga FIFA ASEAN CUP 2026
									dan bawa pulang olahbola merchandise atau jersey Timnas
									Indonesia edisi terbatas!
								</p>
							</div>

							{/* Right: Prize Image */}
							<div className="shrink-0 relative">
								<div className="relative w-56 h-56">
									<Image
										src="/images/home/timnas-prize-1.png"
										alt="Jersey Timnas Indonesia - Hadiah FIFA ASEAN CUP 2026"
										width={288}
										height={288}
										className="w-full h-full object-contain drop-shadow-[0_0_30px_rgba(67,222,204,0.4)]"
										loading="lazy"
									/>
								</div>
							</div>
						</div>
					</div>
				</section>

				{/* Phase Tabs */}
				<section className="max-w-7xl mx-auto px-4 md:px-8 mb-4 md:mb-8 overflow-x-auto">
					<div
						className="flex gap-2 md:gap-4 pb-4 border-b"
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
						<div className="flex gap-3">
							{groups.map((g) => (
								<button
									key={g}
									onClick={() => setActiveGroup(g)}
									className="w-44 h-12 rounded-xl font-bold text-lg transition-all"
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
									Group {g}
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

										<div className="flex items-center justify-between gap-0 mb-10 relative z-10">
											<div className="flex flex-col items-center gap-3 flex-1">
												<TeamFlag team={match.home_team} />
												<span
													className="text-sm font-bold tracking-tight text-center"
													style={{ color: text }}
												>
													{match.home_team.name.toUpperCase()}
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
											<div className="flex flex-col items-center gap-3 flex-1">
												<TeamFlag team={match.away_team} />
												<span
													className="text-sm font-bold tracking-tight text-center"
													style={{ color: text }}
												>
													{match.away_team.name.toUpperCase()}
												</span>
											</div>
										</div>

										<div className="relative z-10">
											{isCompleted && hasPrediction ? (
												<div
													className={`w-full py-4 px-4 text-sm md:text-base rounded-2xl flex flex-col items-center justify-center gap-1 border ${
														userPred.score_exact
															? "border-green-400/40"
															: userPred.result_correct
																? "border-yellow-400/40"
																: "border-red-400/40"
													}`}
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
														background: surfaceContainer,
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
							background: surface,
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
								skor FIFA Asean Cup 2026!
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

							{myRankData?.data && myRankData.data.rank > 5 && (
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
							)}
						</div>
					</div>
				</div>
			)}

			<style jsx global>{`
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
					animation: fadeIn 0.3s ease-out;
				}
				.animate-scaleIn {
					animation: scaleIn 0.3s ease-out;
				}
			`}</style>
		</div>
	);
}
