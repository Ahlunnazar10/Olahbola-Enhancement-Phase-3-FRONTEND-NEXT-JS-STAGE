import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import type { DuelPhase, DuelPlayChoice, Tactic } from "@/types/ngolahBola";
import { getRandomScenario, getPhaseOrder } from "@/lib/duel/scenarios";
import { calculateChoiceScore, calculatePhaseBaseScore, getWinRate } from "@/lib/duel/scoring";
import { saveDuelSession, loadDuelSession, clearDuelSession } from "@/lib/duel/storage";

const PHASE_TIME_MS = 15000; // 15 seconds per phase
const AUTO_SELECT_THRESHOLD_MS = 12000; // auto-select if no choice after 12s

interface UseDuelPlaySessionOptions {
	squadId: string;
	tactic: Tactic;
	mode: "bot" | "real";
	energy: number;
	maxEnergy: number;
	duelsWon: number;
	duelsPlayed: number;
	onComplete: (result: any) => void;
	onError: (message: string) => void;
}

export function useDuelPlaySession({
	squadId,
	tactic,
	mode,
	energy,
	maxEnergy,
	duelsWon,
	duelsPlayed,
	onComplete,
	onError,
}: UseDuelPlaySessionOptions) {
	const router = useRouter();
	const phases = getPhaseOrder();

	const [phaseIndex, setPhaseIndex] = useState(0);
	const [choices, setChoices] = useState<DuelPlayChoice[]>([]);
	const [phaseScores, setPhaseScores] = useState<Record<DuelPhase, number>>({
		attack: 0,
		midfield: 0,
		defense: 0,
	});
	const [timer, setTimer] = useState(PHASE_TIME_MS / 1000);
	const [phaseStartTimeMs, setPhaseStartTimeMs] = useState(0);
	const [isFinished, setIsFinished] = useState(false);
	const [isAutoSelecting, setIsAutoSelecting] = useState(false);
	const [currentScenario, setCurrentScenario] = useState<any>(null);

	// Load squad data for base score calculation
	const [squadStats, setSquadStats] = useState<{ attackAvg: number; midfieldAvg: number; defenseAvg: number }>({
		attackAvg: 70,
		midfieldAvg: 70,
		defenseAvg: 70,
	});

	// Resume from sessionStorage
	useEffect(() => {
		const saved = loadDuelSession();
		if (saved?.squad_id === squadId && saved?.mode === mode && !isFinished) {
			setPhaseIndex(saved.phase_index);
			setChoices(saved.choices);
			setPhaseScores(saved.phase_scores);
			setPhaseStartTimeMs(saved.started_at);
		}
	}, [squadId, mode, isFinished]);

	// Get scenario for current phase
	useEffect(() => {
		if (isFinished) return;
		const scenario = getRandomScenario(phases[phaseIndex]);
		setCurrentScenario(scenario);
		setTimer(PHASE_TIME_MS / 1000);
		setPhaseStartTimeMs(Date.now());
	}, [phaseIndex, isFinished]);

	// Timer countdown
	useEffect(() => {
		if (isFinished || timer <= 0) return;

		const interval = setInterval(() => {
			setTimer((t) => {
				if (t <= 1) {
					clearInterval(interval);
					// Auto-select random choice when time runs out
					if (currentScenario?.choices?.length > 0) {
						const randomChoice = currentScenario.choices[Math.floor(Math.random() * currentScenario.choices.length)];
						handleChoice(randomChoice.key, PHASE_TIME_MS);
					}
					return 0;
				}
				return t - 1;
			});
		}, 1000);

		return () => clearInterval(interval);
	}, [timer, isFinished, currentScenario]);

	// Calculate base scores from squad stats
	useEffect(() => {
		// These would normally come from the squad API, using defaults for now
		setSquadStats({
			attackAvg: 75,
			midfieldAvg: 72,
			defenseAvg: 70,
		});
	}, [squadId]);

	const winRate = getWinRate(duelsWon, duelsPlayed);

	const handleChoice = useCallback((choiceKey: string, elapsedMs: number) => {
		if (isFinished) return;

		const currentPhase = phases[phaseIndex];
		const baseScore = calculatePhaseBaseScore(
			currentPhase,
			squadStats.attackAvg,
			squadStats.midfieldAvg,
			squadStats.defenseAvg,
		);

		const scenario = getRandomScenario(currentPhase);
		const choiceData = scenario.choices.find((c: any) => c.key === choiceKey);
		const finalBaseScore = choiceData?.baseScore ?? baseScore;

		const score = calculateChoiceScore(
			choiceKey,
			finalBaseScore,
			elapsedMs,
			PHASE_TIME_MS,
			winRate,
		);

		const newChoice: DuelPlayChoice = {
			phase: currentPhase,
			choice: choiceKey,
			score,
			selected_at_ms: Date.now(),
		};

		setChoices((prev) => [...prev, newChoice]);
		setPhaseScores((prev) => ({ ...prev, [currentPhase]: score }));

		// Save session state
		saveDuelSession({
			session_id: `${squadId}_${Date.now()}`,
			squad_id: squadId,
			tactic,
			mode,
			phase_index: phaseIndex,
			choices: [...choices, newChoice],
			phase_scores: { ...phaseScores, [currentPhase]: score },
			total_score: Object.values({ ...phaseScores, [currentPhase]: score }).reduce((a, b) => a + b, 0),
			started_at: phaseStartTimeMs,
		});

		// Move to next phase after delay
		setTimeout(() => {
			if (phaseIndex < phases.length - 1) {
				setPhaseIndex((prev) => prev + 1);
			} else {
				setIsFinished(true);
			}
		}, 1500);
	}, [isFinished, phaseIndex, choices, phaseScores, phaseStartTimeMs, squadStats, winRate, squadId, tactic, mode, phases]);

	const handleSubmit = useCallback(async () => {
		if (choices.length !== 3) {
			toast.error("Harap lengkapi semua fase!");
			return;
		}

		const totalScore = Object.values(phaseScores).reduce((a, b) => a + b, 0);
		const startedAt = phaseStartTimeMs || Date.now();

		try {
			const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/v1/ngolah-bola/duel/play/submit`, {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
					"Accept": "application/json",
				},
				credentials: "include",
				body: JSON.stringify({
					squad_id: squadId,
					tactic,
					choices,
					total_score: totalScore,
					started_at: startedAt,
				}),
			});

			if (!response.ok) {
				const data = await response.json();
				throw new Error(data.message || "Gagal submit duel");
			}

			const data = await response.json();
			clearDuelSession();
			onComplete(data.data);
		} catch (err: any) {
			onError(err.message);
		}
	}, [choices, phaseScores, phaseStartTimeMs, squadId, tactic, onComplete, onError]);

	const handleExit = useCallback(() => {
		clearDuelSession();
		router.push("/ngolah-bola/duel");
	}, [router]);

	return {
		phaseIndex,
		currentPhase: phases[phaseIndex],
		currentScenario,
		choices,
		phaseScores,
		timer,
		isFinished,
		isAutoSelecting,
		totalScore: Object.values(phaseScores).reduce((a, b) => a + b, 0),
		handleChoice,
		handleSubmit,
		handleExit,
	};
}
