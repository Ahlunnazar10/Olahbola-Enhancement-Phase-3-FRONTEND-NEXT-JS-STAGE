import type { DuelPhase } from "@/types/ngolahBola";

// Multiplier per choice key — encodes tactical preference
const CHOICE_MULTIPLIERS: Record<string, number> = {
	// Attack
	shoot:   1.0,
	pass:    0.85,
	dribble: 1.15,
	// Midfield
	distribute: 1.0,
	press:       0.75,
	retain:      1.2,
	// Defense
	mark:     1.0,
	intercept: 1.25,
	clear:    0.7,
};

const RANDOM_VARIANCE = 0.15; // ±15% matches backend BattleSimulationService

const SPEED_BONUS_CAP = 0.10; // up to +10% for fast choices
const SKILL_FACTOR_RANGE = 0.2; // 0.9x – 1.1x based on win rate

export function calculateChoiceScore(
	choiceKey: string,
	baseScore: number,
	elapsedMs: number,
	totalTimeMs: number,
	winRate: number,
): number {
	const choiceMult = CHOICE_MULTIPLIERS[choiceKey] ?? 1.0;
	const variance   = (Math.random() * RANDOM_VARIANCE * 2) - RANDOM_VARIANCE;
	const speedRatio = elapsedMs / totalTimeMs; // 0 = instant, 1 = last second
	const speed      = 1 + (SPEED_BONUS_CAP * (1 - speedRatio));
	const skill      = 0.9 + (winRate * SKILL_FACTOR_RANGE);

	const score = baseScore * choiceMult * (1 + variance) * speed * skill;
	return Math.round(score * 100) / 100;
}

export function validateScoreRange(
	submitted: number,
	squadAvgRating: number,
	opponentAvgRating: number,
): { valid: boolean; min: number; max: number } {
	let min = 20;
	let max = 120;
	const diff = squadAvgRating - opponentAvgRating;
	if (diff < -10)      max = 60;
	else if (diff < -5)  max = 80;
	else if (diff > 10)  min = 70;
	return { valid: submitted >= min && submitted <= max, min, max };
}

export function calculatePhaseBaseScore(
	phase: DuelPhase,
	attackAvg: number,
	midfieldAvg: number,
	defenseAvg: number,
): number {
	const weights: Record<DuelPhase, { attack: number; midfield: number; defense: number }> = {
		attack:   { attack: 0.5, midfield: 0.3, defense: 0.2 },
		midfield: { attack: 0.2, midfield: 0.5, defense: 0.3 },
		defense:  { attack: 0.1, midfield: 0.3, defense: 0.6 },
	};
	const w = weights[phase];
	return Math.round(
		(attackAvg  * w.attack  +
		 midfieldAvg * w.midfield +
		 defenseAvg  * w.defense) * 100
	) / 100;
}

export function getWinRate(duelsWon: number, duelsPlayed: number): number {
	if (duelsPlayed === 0) return 0.5;
	return duelsWon / duelsPlayed;
}
