"use client";

import { useEffect, useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Swords, ArrowLeft, CheckCircle, XCircle, MinusCircle, Flame, Wind, Snowflake, ShieldOff, Activity, Shield } from "lucide-react";
import { DuelPhase } from "@/components/games/ngolah-bola/duel/DuelPhase";
import { PlayerCard } from "@/components/games/ngolah-bola/PlayerCard";
import { useDuelPlaySession } from "@/hooks/useDuelPlaySession";
import { useNgolahBolaProfile } from "@/hooks/queries/useNgolahBola";
import { useSquadDetail } from "@/hooks/queries/useNgolahBola";
import { getCoachDecisionByHook, coachDecisions } from "@/lib/duel/scenarios";
import { cn } from "@/lib/utils";
import type { DuelPhase as PhaseType, Tactic, SquadPlayer } from "@/types/ngolahBola";

const PHASE_LABELS: Record<PhaseType, string> = {
	attack: "⚔️ Serang",
	midfield: "🎯 Tengah Lapangan",
	defense: "🛡️ Pertahanan",
};

type GameState = "playing" | "coachDecision" | "summary" | "submitting" | "result";
type CoachDecisionState = { decision: any; choiceIndex: number | null };

const TACTIC_ICONS: Record<Tactic, React.ReactNode> = {
	attacking: <ShieldOff className="w-3 h-3" />,
	defensive: <Shield className="w-3 h-3" />,
	counter: <Activity className="w-3 h-3" />,
	highPress: <Flame className="w-3 h-3" />,
	possessionPlay: <Wind className="w-3 h-3" />,
	lowBlock: <Snowflake className="w-3 h-3" />,
};

// Player positions on pitch (4-3-3 default, bottom attacking up)
const PITCH_POSITIONS: Record<string, { left: number; top: number }> = {
	GK: { left: 50, top: 92 },
	LB: { left: 14, top: 76 }, CB: { left: 38, top: 78 }, RB: { left: 86, top: 76 },
	LWB: { left: 10, top: 68 }, RWB: { left: 90, top: 68 },
	CDM: { left: 50, top: 62 }, CM: { left: 50, top: 52 },
	CAM: { left: 50, top: 40 },
	LW: { left: 18, top: 28 }, ST: { left: 50, top: 20 }, RW: { left: 82, top: 28 },
	LM: { left: 22, top: 42 }, RM: { left: 78, top: 42 },
};

function getPositionForSlot(slot: string) {
	const base = slot.split("-")[0];
	return PITCH_POSITIONS[base] ?? { left: 50, top: 50 };
}

function DuelPlayPageInner() {
	const router = useRouter();
	const searchParams = useSearchParams();
	const squadId = searchParams.get("squadId");
	const tactic = (searchParams.get("tactic") ?? "attacking") as Tactic;
	const mode = searchParams.get("mode") ?? "bot";

	const { data: profile } = useNgolahBolaProfile();
	const { data: squadDetail } = useSquadDetail(squadId ?? "");

	const [gameState, setGameState] = useState<GameState>("playing");
	const [finalResult, setFinalResult] = useState<any>(null);
	const [error, setError] = useState<string | null>(null);
	const [coachDecision, setCoachDecision] = useState<CoachDecisionState | null>(null);

	const phaseOrder: PhaseType[] = ["attack", "midfield", "defense"];

	const handleChoice = (_choiceKey: string, _elapsedMs: number) => {
		// Handled internally by useDuelPlaySession
	};

	const handleComplete = (result: any) => {
		setGameState("result");
		setFinalResult(result);
	};

	const handleError = (message: string) => {
		setGameState("result");
		setFinalResult(null);
		setError(message);
	};

	const {
		phaseIndex,
		currentPhase,
		currentScenario,
		timer,
		isFinished,
		choices,
		phaseScores,
		handleChoice: handleChoiceInternal,
		handleSubmit,
		handleExit,
	} = useDuelPlaySession({
		squadId: squadId ?? "",
		tactic,
		mode: mode as "bot" | "real",
		energy: profile?.energy ?? 0,
		maxEnergy: profile?.energy_max ?? 100,
		duelsWon: profile?.duels_won ?? 0,
		duelsPlayed: profile?.duels_played ?? 0,
		onComplete: handleComplete,
		onError: handleError,
	});

	const totalScore = Object.values(phaseScores).reduce((a, b) => a + b, 0);

	// Check for coach decision triggers
	useEffect(() => {
		if (isFinished || gameState !== "playing") return;
		// Simulate coach decision after each phase choice
		const lastChoice = choices[choices.length - 1];
		if (lastChoice) {
			const hookMap: Record<string, string> = {
				attack: "goal_conceded_early",
				midfield: "leading_late_pressure",
				defense: "trailing_need_goal",
			};
			const hook = hookMap[lastChoice.phase];
			if (hook) {
				const decision = getCoachDecisionByHook(hook);
				if (decision && Math.random() > 0.5) {
					setCoachDecision({ decision, choiceIndex: null });
					setGameState("coachDecision");
				}
			}
		}
	}, [choices, isFinished, gameState]);

	// Show summary after all phases complete but before submit
	useEffect(() => {
		if (isFinished && gameState === "playing") {
			setGameState("summary");
		}
	}, [isFinished, gameState]);

	const handleCoachChoice = (key: string) => {
		setCoachDecision(null);
		setGameState("playing");
		// Apply tactical effect to next phase
	};

	const handleProceedToSubmit = async () => {
		setGameState("submitting");
		await handleSubmit();
	};

	if (!squadId) {
		return (
			<div className="max-w-lg mx-auto px-4 py-6 text-center">
				<p className="text-white/50">Parameter squadId tidak ditemukan.</p>
				<button
					onClick={() => router.push("/ngolah-bola/duel")}
					className="mt-4 px-4 py-2 bg-teal-500 text-black font-bold rounded-xl"
				>
					Kembali ke Duel
				</button>
			</div>
		);
	}

	const players: SquadPlayer[] = squadDetail?.players ?? [];

	return (
		<div className="max-w-lg mx-auto px-4 py-6 space-y-4 pb-24">
			{/* Header */}
			<div className="flex items-center justify-between">
				<button
					onClick={handleExit}
					className="w-9 h-9 rounded-xl bg-white/5 flex items-center justify-center hover:bg-white/10 transition-colors"
				>
					<ArrowLeft className="w-4 h-4 text-white/60" />
				</button>
				<div className="flex items-center gap-2">
					<Swords className="w-4 h-4 text-rose-400" />
					<span className="text-xs font-black uppercase text-white/60">Duel Interaktif</span>
				</div>
				<div className="w-9" />
			</div>

			{/* Progress indicator */}
			<div className="flex items-center gap-2">
				{phaseOrder.map((phase, i) => (
					<div key={phase} className="flex items-center gap-2 flex-1">
						<div
							className={cn(
								"h-1.5 flex-1 rounded-full transition-all duration-300",
								i < phaseIndex ? "bg-teal-500" :
								i === phaseIndex ? "bg-white/40 animate-pulse" : "bg-white/10",
							)}
						/>
						{ i < phaseOrder.length - 1 && (
							<div className="w-1 h-1 rounded-full bg-white/20 shrink-0" />
						)}
					</div>
				))}
			</div>

			{/* Live pitch with player cards */}
			<div className="glass-card rounded-2xl p-3">
				<div className="relative aspect-[3/4] bg-gradient-to-b from-green-900/50 to-green-800/30 rounded-xl border border-white/10 overflow-hidden">
					{/* Pitch lines */}
					<svg className="absolute inset-0 w-full h-full opacity-15" viewBox="0 0 100 100" preserveAspectRatio="none">
						<line x1="0" y1="50" x2="100" y2="50" stroke="white" strokeWidth="0.5" />
						<circle cx="50" cy="50" r="12" fill="none" stroke="white" strokeWidth="0.5" />
						<rect x="20" y="0" width="60" height="18" fill="none" stroke="white" strokeWidth="0.5" />
						<rect x="20" y="82" width="60" height="18" fill="none" stroke="white" strokeWidth="0.5" />
					</svg>

					{/* Player cards on pitch */}
					{players.map((player) => {
						const pos = getPositionForSlot(player.slot);
						return (
							<div
								key={player.card_id}
								className="absolute transition-all duration-500"
								style={{
									left: `${pos.left}%`,
									top: `${pos.top}%`,
									transform: "translate(-50%, -50%)",
								}}
							>
								<PlayerCard
									player_name={player.player_name}
									overall_rating={player.overall_rating}
									rarity={player.rarity}
									position_primary={player.position_primary}
									position_slot={player.slot}
									size="sm"
								/>
							</div>
						);
					})}

					{/* Phase indicator overlay */}
					{currentScenario && (
						<div className="absolute top-2 left-1/2 -translate-x-1/2 px-3 py-1 rounded-full bg-black/60 backdrop-blur-sm">
							<span className={cn(
								"text-xs font-black uppercase",
								currentPhase === "attack" ? "text-rose-400" :
								currentPhase === "midfield" ? "text-blue-400" : "text-teal-400",
							)}>
								{PHASE_LABELS[currentPhase]} • {timer}s
							</span>
						</div>
					)}
				</div>
			</div>

			{/* Decision content */}
			{gameState === "playing" && currentScenario && (
				<DuelPhase
					phase={currentPhase}
					scenario={currentScenario}
					timeLeft={timer}
					onChoice={handleChoiceInternal}
					disabled={false}
				/>
			)}

			{gameState === "playing" && !currentScenario && (
				<div className="flex items-center justify-center py-12">
					<div className="w-8 h-8 border-2 border-white/20 border-t-teal-500 rounded-full animate-spin" />
				</div>
			)}

			{/* Coach Decision Panel */}
			{gameState === "coachDecision" && coachDecision && (
				<div className="fixed inset-0 z-50 flex items-end justify-center bg-black/70 backdrop-blur-sm">
					<div className="w-full max-w-lg bg-gradient-to-b from-[#1a2a24] to-[#0f1412] rounded-t-3xl p-6 border-t-2 border-teal-500 animate-slide-up">
						<div className="flex items-center justify-center gap-2 mb-4">
							<Flame className="w-5 h-5 text-amber-400 animate-pulse" />
							<span className="text-sm font-black uppercase text-amber-400">Keputusan Pelatih!</span>
						</div>
						<div className="text-center mb-6">
							<h3 className="text-lg font-black uppercase text-white mb-2">
								{coachDecision.decision.label}
							</h3>
							<p className="text-sm text-white/60">{coachDecision.decision.description}</p>
						</div>
						<div className="space-y-3">
							{coachDecision.decision.choices.map((choice: any, i: number) => (
								<button
									key={choice.key}
									onClick={() => handleCoachChoice(choice.key)}
									className={cn(
										"w-full p-4 rounded-xl border-2 transition-all text-left",
										coachDecision.choiceIndex === i
											? "border-teal-500 bg-teal-500/10"
											: "border-white/10 bg-white/5 hover:border-white/20",
									)}
								>
									<div className="flex items-center gap-3">
										<div className={cn(
											"w-8 h-8 rounded-lg flex items-center justify-center",
											choice.risk === "high" ? "bg-rose-500/20" :
											choice.risk === "medium" ? "bg-amber-500/20" : "bg-green-500/20",
										)}>
											<span className="text-xs font-black uppercase">{choice.risk[0].toUpperCase()}</span>
										</div>
										<div className="flex-1">
											<p className="text-sm font-black uppercase text-white">{choice.label}</p>
											<p className="text-[11px] text-white/40 mt-0.5">{choice.description}</p>
										</div>
										{choice.tacticalEffect && (
											<span className="text-[9px] font-bold uppercase text-teal-400 bg-teal-500/10 px-2 py-1 rounded">
												{Object.keys(choice.tacticalEffect)[0]}
											</span>
										)}
									</div>
								</button>
							))}
						</div>
					</div>
				</div>
			)}

			{gameState === "summary" && (
				<div className="space-y-4">
					<h2 className="text-lg font-black uppercase text-white text-center">
						Semua Fase Selesai!
					</h2>
					<div className="glass-card rounded-2xl p-4 space-y-3">
						{phaseOrder.map((phase, i) => {
							const choice = choices.find(c => c.phase === phase);
							return (
								<div key={phase} className="flex items-center justify-between py-2 border-b border-white/5 last:border-0">
									<span className="text-sm text-white/60">{PHASE_LABELS[phase]}</span>
									<div className="flex items-center gap-3">
										<span className="text-xs text-white/40 uppercase">{choice?.choice}</span>
										<span className="font-black text-white">{choice?.score.toFixed(1)}</span>
									</div>
								</div>
							);
						})}
						<div className="flex items-center justify-between pt-2 border-t border-white/10">
							<span className="font-black uppercase text-white/80">Total Skor</span>
							<span className="font-black text-2xl text-teal-400">{totalScore.toFixed(1)}</span>
						</div>
					</div>
					<button
						onClick={handleProceedToSubmit}
						disabled={!choices.length}
						className="w-full py-4 bg-gradient-to-r from-teal-500 to-emerald-500 text-black font-black uppercase text-sm tracking-wider rounded-xl hover:from-teal-400 hover:to-emerald-400 transition-all disabled:opacity-50"
					>
						Kirim Hasil & Claim Reward
					</button>
				</div>
			)}

			{gameState === "submitting" && (
				<div className="flex flex-col items-center justify-center py-12 space-y-4">
					<div className="w-12 h-12 border-4 border-white/20 border-t-teal-500 rounded-full animate-spin" />
					<p className="text-sm text-white/60 font-medium">Mengirim hasil duel...</p>
				</div>
			)}

			{gameState === "result" && (
				<ResultScreen
					result={finalResult}
					error={error}
					choices={choices}
					totalScore={totalScore}
					tactic={tactic}
					onBack={() => router.push("/ngolah-bola/duel")}
				/>
			)}
		</div>
	);
}

export default function DuelPlayPage() {
	return (
		<Suspense fallback={
			<div className="max-w-lg mx-auto px-4 py-12 text-center">
				<div className="w-8 h-8 border-2 border-white/20 border-t-teal-500 rounded-full animate-spin mx-auto" />
				<p className="text-white/40 mt-4">Memuat...</p>
			</div>
		}>
			<DuelPlayPageInner />
		</Suspense>
	);
}

function ResultScreen({
	result,
	error,
	choices,
	totalScore,
	tactic,
	onBack,
}: {
	result: any;
	error: string | null;
	choices: any[];
	totalScore: number;
	tactic: Tactic;
	onBack: () => void;
}) {
	const isWin = result?.result === "win";
	const isDraw = result?.result === "draw";
	const isLose = result?.result === "lose";

	return (
		<div className="space-y-4">
			{error ? (
				<div className="glass-card rounded-2xl p-6 text-center space-y-4">
					<XCircle className="w-12 h-12 text-red-400 mx-auto" />
					<h2 className="text-lg font-black uppercase text-red-400">Gagal!</h2>
					<p className="text-sm text-white/60">{error}</p>
					<button
						onClick={onBack}
						className="px-6 py-3 bg-white/10 text-white font-bold rounded-xl hover:bg-white/20 transition-colors"
					>
						Kembali ke Duel
					</button>
				</div>
			) : result ? (
				<div className="space-y-4">
					{/* Result banner */}
					<div className={cn(
						"rounded-2xl p-6 text-center",
						isWin ? "bg-gradient-to-br from-teal-500/30 to-emerald-500/10 border border-teal-500/30" :
						isDraw ? "bg-gradient-to-br from-yellow-500/30 to-orange-500/10 border border-yellow-500/30" :
						"bg-gradient-to-br from-rose-500/30 to-red-500/10 border border-rose-500/30",
					)}>
						{isWin && <CheckCircle className="w-12 h-12 text-teal-400 mx-auto mb-2" />}
						{isDraw && <MinusCircle className="w-12 h-12 text-yellow-400 mx-auto mb-2" />}
						{isLose && <XCircle className="w-12 h-12 text-rose-400 mx-auto mb-2" />}
						<h2 className={cn(
							"text-2xl font-black italic uppercase",
							isWin ? "text-teal-400" :
							isDraw ? "text-yellow-400" : "text-rose-400",
						)}>
							{isWin ? "MENANG!" : isDraw ? "SERI!" : "KALAH!"}
						</h2>
						<p className="text-sm text-white/60 mt-1">
							{totalScore.toFixed(1)} — {result.opponent_score?.toFixed(1)}
						</p>
						<div className="flex items-center justify-center gap-2 mt-2">
							{TACTIC_ICONS[tactic]}
							<span className="text-xs font-bold uppercase text-white/50">{tactic}</span>
						</div>
					</div>

					{/* Score breakdown */}
					<div className="glass-card rounded-2xl p-4 space-y-2">
						<h3 className="font-black uppercase text-white text-sm mb-3">Breakdown Pilihan</h3>
						{choices.map((choice, i) => {
							const phaseIcons = ["⚔️", "🎯", "🛡️"];
							return (
								<div key={i} className="flex items-center justify-between py-2 border-b border-white/5 last:border-0">
									<div className="flex items-center gap-2">
										<span>{phaseIcons[i]}</span>
										<span className="text-xs text-white/60 uppercase">{choice.phase}</span>
									</div>
									<span className="font-bold text-white">{choice.score.toFixed(1)}</span>
								</div>
							);
						})}
					</div>

					{/* Rewards */}
					<div className="glass-card rounded-2xl p-4 grid grid-cols-3 gap-3">
						<div className="text-center">
							<p className="text-[10px] text-white/40 uppercase font-bold">Energi</p>
							<p className={cn(
								"font-black text-lg",
								result.energy?.refunded > 0 ? "text-teal-400" : "text-white/80",
							)}>
								{result.energy?.remaining ?? 0}/{result.energy?.max ?? 100}
							</p>
						</div>
						<div className="text-center">
							<p className="text-[10px] text-white/40 uppercase font-bold">Gems</p>
							<p className="font-black text-lg text-teal-300">
								{result.reward?.gems_won ?? 0}
							</p>
						</div>
						<div className="text-center">
							<p className="text-[10px] text-white/40 uppercase font-bold">Points</p>
							<p className="font-black text-lg text-yellow-400">
								+{result.reward?.points_earned ?? 0}
							</p>
						</div>
					</div>

					{/* Duel record */}
					<div className="text-center text-xs text-white/40">
						Rekor: {result.duel_record?.won ?? 0}W / {result.duel_record?.lost ?? 0}L / {(result.duel_record?.played ?? 0) - (result.duel_record?.won ?? 0) - (result.duel_record?.lost ?? 0)}D
					</div>

					<button
						onClick={onBack}
						className="w-full py-4 bg-gradient-to-r from-teal-500 to-emerald-500 text-black font-black uppercase text-sm tracking-wider rounded-xl hover:from-teal-400 hover:to-emerald-400 transition-all"
					>
						Duel Lagi
					</button>
				</div>
			) : (
				<div className="text-center py-12">
					<p className="text-white/40">Terjadi kesalahan.</p>
					<button
						onClick={onBack}
						className="mt-4 px-6 py-3 bg-white/10 text-white font-bold rounded-xl hover:bg-white/20"
					>
						Kembali
					</button>
				</div>
			)}
		</div>
	);
}
