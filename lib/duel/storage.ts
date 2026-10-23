import type { DuelPlaySessionSnapshot } from "@/types/ngolahBola";

const STORAGE_KEY = "ola_duel_play_session";

export function saveDuelSession(s: DuelPlaySessionSnapshot): void {
	try {
		sessionStorage.setItem(STORAGE_KEY, JSON.stringify(s));
	} catch {
		// sessionStorage unavailable — continue without persistence
	}
}

export function loadDuelSession(): DuelPlaySessionSnapshot | null {
	try {
		const raw = sessionStorage.getItem(STORAGE_KEY);
		if (!raw) return null;
		return JSON.parse(raw) as DuelPlaySessionSnapshot;
	} catch {
		return null;
	}
}

export function clearDuelSession(): void {
	try {
		sessionStorage.removeItem(STORAGE_KEY);
	} catch {
		// ignore
	}
}
