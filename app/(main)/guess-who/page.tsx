"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { useAuthStore } from "@/stores/authStore";
import { useUIStore } from "@/stores/uiStore";
import { useQueryClient } from "@tanstack/react-query";
import {
	useGuessWhoConfig,
	useGuessWhoStart,
	useGuessWhoLevelProgress,
	useGuessWhoAttemptCounts,
} from "@/hooks/queries/useGuessWho";
import { clearSessionState, loadSessionState } from "@/lib/guessWho/storage";
import {
	buildCacheFromQuestions,
	clearQuestionCache,
	saveQuestionCache,
} from "@/lib/guessWho/cache";
import type { GuessWhoSession } from "@/types";
import type { TierBreakdown } from "@/lib/guessWho/scoring";
import {
	VawHero,
	DailyChallengeCard,
	PracticeModeCard,
	VawLevelCard,
} from "@/components/guess-who/cards/VawCards";
import { VawLeaderboardPanel } from "@/components/guess-who/VawLeaderboardPanel";
import { VawLevelCardSkeleton } from "@/components/guess-who/shared/VawSkeleton";
import { VawDemoScreen } from "@/components/guess-who/screens/VawDemoScreen";
import { VawGameplayScreen } from "@/components/guess-who/screens/VawGameplayScreen";
import { VawResultScreen } from "@/components/guess-who/screens/VawResultScreen";
import { VawLoginModal } from "@/components/guess-who/modals/VawLoginModal";
import { LoadingOverlay } from "@/components/guess-who/shared/LoadingOverlay";

type AppMode = "intro" | "demo" | "playing" | "result";

export default function GuessWhoPage() {
	const { theme } = useUIStore();
	const isDark = theme === "dark";
	const { isAuthenticated } = useAuthStore();
	const router = useRouter();

	const [mode, setMode] = useState<AppMode>("intro");
	const [selectedLevel, setSelectedLevel] = useState<number | null>(null);
	const [session, setSession] = useState<GuessWhoSession | null>(null);
	const [showLoginModal, setShowLoginModal] = useState(false);
	const [startLoading, setStartLoading] = useState(false);
	const [resultData, setResultData] = useState<{
		score: number;
		breakdown: TierBreakdown;
		level: number;
	} | null>(null);

	const { data: config, isLoading: configLoading } = useGuessWhoConfig();
	const startMutation = useGuessWhoStart();
	const { data: levelProgress, isLoading: levelProgressLoading } = useGuessWhoLevelProgress();
	const attemptCounts = useGuessWhoAttemptCounts();

	const meshRef = useRef<HTMLDivElement | null>(null);

	useEffect(() => {
		const mesh = meshRef.current;
		if (!mesh) return;

		let raf = 0;
		let tx = 0;
		let ty = 0;
		const onMove = (e: MouseEvent) => {
			tx = (e.clientX / window.innerWidth - 0.5) * 20;
			ty = (e.clientY / window.innerHeight - 0.5) * 20;
			if (!raf) {
				raf = requestAnimationFrame(() => {
					mesh.style.transform = `translate(${tx}px, ${ty}px)`;
					raf = 0;
				});
			}
		};

		document.addEventListener("mousemove", onMove);
		return () => {
			document.removeEventListener("mousemove", onMove);
			if (raf) cancelAnimationFrame(raf);
		};
	}, []);

	const qc = useQueryClient();

	const sorted = (config?.levels ?? []).slice().sort((a, b) => a.level - b.level);
	const completedSet = new Set(levelProgress?.completed_levels ?? []);
	const unlockedSet = new Set(levelProgress?.unlocked_levels ?? []);
	const highestCompleted = levelProgress?.highest_completed_level ?? 0;
	const maxLevel = levelProgress?.max_level ?? 5;
	const isAllComplete = highestCompleted >= maxLevel;
	const activeLevel = sorted.find(
		(l) => unlockedSet.has(l.level) && !completedSet.has(l.level),
	)?.level ?? null;

	const levelCards = sorted.map((level, index) => {
		const isCompleted = completedSet.has(level.level);
		const isUnlocked = unlockedSet.has(level.level);
		const isLocked = !isUnlocked;
		const isActive = !isAllComplete && level.level === activeLevel;
		return (
			<VawLevelCard
				key={level.id}
				level={level}
				index={index}
				isActive={isActive}
				isLocked={isLocked}
				attemptCount={attemptCounts[level.level] ?? 0}
				isCompleted={isCompleted}
				onStart={() => handleStartAuthenticated(level.id)}
			/>
		);
	});

	useEffect(() => {
		if (typeof window === "undefined") return;
		window.scrollTo({ top: 0, left: 0, behavior: "auto" });
	}, [mode]);

	const handleStartAuthenticated = async (level: number) => {
		setSelectedLevel(level);
		if (!isAuthenticated) {
			setShowLoginModal(true);
			return;
		}
		const snap = loadSessionState();
		if (snap && snap.level === level) {
			// Session yang belum selesai dianggap hangus — hapus dan mulai ulang.
			clearSessionState();
		}
		clearQuestionCache();
		setStartLoading(true);
		try {
			const fresh = await startMutation.mutateAsync(level);

			// Simpan semua pertanyaan + clue_initials + correct_answer ke cache
			const cacheData = buildCacheFromQuestions(
				fresh.session_id,
				fresh.level,
				fresh.duration_seconds,
				fresh.total_questions,
				fresh.clues_remaining,
				fresh.questions,
			);
			saveQuestionCache(cacheData);

			setSession(fresh);
			setMode("playing");
			if (fresh?.session_id) {
				// Invalidate stale session cache so play page fetches fresh data
				qc.invalidateQueries({ queryKey: ["guess-who", "session"] });
				router.push(`/guess-who/play/${fresh.session_id}`);
			}
		} catch (err) {
			setStartLoading(false);
			console.error("Start session failed:", err);
			toast.error("Gagal memulai permainan. Coba lagi.");
			setMode("intro");
		}
	};

	const handleDailyPlay = () => {
		if (!isAuthenticated) {
			setShowLoginModal(true);
			return;
		}
		const completedSet = new Set(levelProgress?.completed_levels ?? []);
		const maxLevel = levelProgress?.max_level ?? 5;
		const highestCompleted = Math.max(0, ...Array.from(completedSet));
		let nextLevel: number;
		if (highestCompleted >= maxLevel) {
			nextLevel = Math.floor(Math.random() * maxLevel) + 1;
		} else {
			nextLevel = highestCompleted + 1;
		}
		handleStartAuthenticated(nextLevel);
	};

	const handleFinish = (
		score: number,
		breakdown: TierBreakdown,
		level: number,
	) => {
		clearSessionState();
		clearQuestionCache();
		// Invalidate stale session cache so "lanjutkan" won't appear for finished session
		qc.invalidateQueries({ queryKey: ["guess-who", "session"] });
		// Optimistic update: mark current level as completed, unlock next level
		const currentAccessToken = useAuthStore.getState().accessToken;
		const progressKey = ["guess-who", "level-progress", currentAccessToken] as const;
		qc.setQueryData(
			progressKey,
			(prev: any) => {
				if (!prev) return prev;
				const currentCompleted = new Set(prev.completed_levels ?? []);
				currentCompleted.add(level);
				const currentUnlocked = new Set(prev.unlocked_levels ?? []);
				const maxLevel = prev.max_level ?? 5;
				// 基于当前完成的 level 计算下一关
				const nextLevel = Math.min(level + 1, maxLevel);
				if (!currentUnlocked.has(nextLevel)) {
					currentUnlocked.add(nextLevel);
				}
				return {
					...prev,
					completed_levels: Array.from(currentCompleted),
					unlocked_levels: Array.from(currentUnlocked),
					highest_completed_level: Math.max(
						prev.highest_completed_level ?? 0,
						level,
					),
				};
			},
		);
		// NOTE: we intentionally do NOT invalidate progressKey here.
		// The optimistic update is already in cache; invalidating would refetch
		// from server and overwrite it before the server has processed the finish.
		qc.invalidateQueries({ queryKey: ["guess-who", "my-sessions"] });
		setSession((s) =>
			s ? { ...s, current_score: score, is_finished: true } : s,
		);
		setResultData({ score, breakdown, level });
		setMode("result");
	};

	const handlePlayAgain = () => {
		if (!resultData) return;
		clearSessionState();
		clearQuestionCache();
		qc.invalidateQueries({ queryKey: ["guess-who", "session"] });
		// Refresh level progress so completed_levels + unlocked_levels are up to date
		qc.invalidateQueries({ queryKey: ["guess-who", "level-progress"] });
		qc.invalidateQueries({ queryKey: ["guess-who", "my-sessions"] });
		setMode("intro");
		setResultData(null);
		setSession(null);
	};

	return (
		<div
			className="relative min-h-screen pb-24 overflow-hidden"
			style={{
				background: isDark ? "#050505" : "#f5f5f5",
				color: isDark ? "#e5e2e1" : "#1a1a1a",
			}}
		>
			{/* Background effects — mesh + batik overlay */}
			<div
				className="absolute inset-0 pointer-events-none overflow-hidden"
				aria-hidden
			>
				<div
					ref={meshRef}
					className={`absolute inset-0 ${isDark ? "velocity-mesh" : "velocity-mesh-light"}`}
					style={{
						maskImage:
							"radial-gradient(circle at center, black, transparent 80%)",
						WebkitMaskImage:
							"radial-gradient(circle at center, black, transparent 80%)",
					}}
				/>
				<div className="batik-overlay absolute inset-0" />
				<div
					className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] rounded-full"
					style={{
						background: "rgba(0, 194, 177, 0.12)",
						filter: "blur(150px)",
					}}
				/>
				<div
					className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full"
					style={{
						background: "rgba(0, 194, 177, 0.08)",
						filter: "blur(120px)",
					}}
				/>
			</div>

			<div className="relative mx-auto px-8 md:px-14 py-5 md:py-10">
				{mode === "intro" && (
					<>
						<div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
							<section className="lg:col-span-9 flex flex-col gap-6">
								<VawHero
									onPlay={() => handleStartAuthenticated(1)}
									onDemo={() => setMode("demo")}
								/>
								<div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4">
									<DailyChallengeCard onClick={handleDailyPlay} />
									<PracticeModeCard onClick={() => setMode("demo")} />
								</div>

								{isAuthenticated && (
									<>
										{(configLoading || levelProgressLoading) ? (
											<div className="mt-2">
												<h3 className="font-headline-md text-xl mb-4 uppercase tracking-wider">
													Semua Level
												</h3>
												<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
													{[1, 2, 3, 4, 5].map((i) => (
														<VawLevelCardSkeleton key={i} />
													))}
												</div>
											</div>
										) : config && config.levels.length > 0 ? (
											<div className="mt-2">
												<h3 className="font-headline-md text-xl mb-4 uppercase tracking-wider">
													Semua Level
												</h3>
												<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
													{levelCards}
												</div>
											</div>
										) : null}
									</>
								)}
							</section>

							<aside className="lg:col-span-3 flex flex-col gap-6">
								<VawLeaderboardPanel />
							</aside>
						</div>
					</>
				)}

				{mode === "demo" && (
					<VawDemoScreen
						onBack={() => setMode("intro")}
						onShowLogin={() => setShowLoginModal(true)}
						onFinished={handleDailyPlay}
						showLoginButton={!isAuthenticated}
					/>
				)}

				{mode === "playing" && session && (
					<VawGameplayScreen
						level={selectedLevel ?? session.level}
						initialSession={session}
						resumedSnapshot={null}
						onExit={() => {
							clearSessionState();
							setMode("intro");
							setSession(null);
						}}
						onFinish={handleFinish}
					/>
				)}

				{mode === "result" && resultData && (
					<VawResultScreen
						score={resultData.score}
						tierBreakdown={resultData.breakdown}
						level={resultData.level}
						onRematch={handlePlayAgain}
						onClose={() => setMode("intro")}
					/>
				)}
			</div>

			{showLoginModal && (
				<VawLoginModal onClose={() => setShowLoginModal(false)} />
			)}

			{startLoading && <LoadingOverlay message="Tunggu bentar ya..." />}
		</div>
	);
}
