import type { GuessWhoQuestion } from "@/types";
import type { TierBreakdown } from "./scoring";

export const STORAGE_KEY = "ola_guesswho_session";

export interface SessionSnapshot {
	session_id: string;
	level: number;
	level_name: string;
	questionIndex: number;
	currentScore: number;
	tierBreakdown: TierBreakdown;
	timer: number;
	cluesRemaining: number;
	currentQuestion: GuessWhoQuestion | null;
	durationSeconds: number;
	savedAt: number;
}

export function saveSessionState(snapshot: SessionSnapshot): void {
	try {
		sessionStorage.setItem(STORAGE_KEY, JSON.stringify(snapshot));
	} catch {}
}

export function loadSessionState(): SessionSnapshot | null {
	try {
		const raw = sessionStorage.getItem(STORAGE_KEY);
		if (!raw) return null;
		return JSON.parse(raw) as SessionSnapshot;
	} catch {
		return null;
	}
}

export function clearSessionState(): void {
	try {
		sessionStorage.removeItem(STORAGE_KEY);
	} catch {}
}
