"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "@/lib/api/client";
import { endpoints } from "@/lib/api/endpoints";
import type {
	// Profile & HUD
	NgolahBolaProfile,
	EnergyData,
	PointsBalance,
	FullHUDData,
	// Packs
	PackCatalog,
	PackOpenResponse,
	// Inventory
	InventoryItem,
	// Reference
	League,
	Club,
	Player,
	FormationsResponse,
	// Squads
	Squad,
	SquadCreateData,
	AddPlayerData,
	SquadChemistryData,
	ValidateDuelResult,
	// Duel
	DuelChallengeRequest,
	DuelResult,
	DuelHistoryEntry,
	DuelPlayChoice,
	DuelPlaySubmitData,
	DuelPlayResult,
	RefillEnergyRequest,
	RefillEnergyResult,
	// Daily Reward
	DailyRewardStatus,
	DailyRewardClaimRequest,
	DailyRewardClaimResult,
	// Share
	ShareData,
	ShareLogRequest,
	ShareLogResult,
	// Points Exchange
	ExchangePointsRequest,
	ExchangePointsResult,
} from "@/types/ngolahBola";

// ─── Profile & HUD ────────────────────��──────────────────────────────────────

export function useNgolahBolaProfile() {
	return useQuery({
		queryKey: ["ngolah-bola-profile"],
		queryFn: async () => {
			const res = await apiClient.get<{ data: NgolahBolaProfile }>(
				endpoints.ngolahBolaProfile,
			);
			return res.data.data;
		},
		staleTime: 5 * 60 * 1000,
	});
}

export function useNgolahBolaEnergy() {
	return useQuery({
		queryKey: ["ngolah-bola-energy"],
		queryFn: async () => {
			const res = await apiClient.get<{ data: EnergyData }>(
				endpoints.ngolahBolaEnergy,
			);
			return res.data.data;
		},
		staleTime: 30 * 1000,
	});
}

export function useNgolahBolaPointsBalance() {
	return useQuery({
		queryKey: ["ngolah-bola-points"],
		queryFn: async () => {
			const res = await apiClient.get<{ data: PointsBalance }>(
				endpoints.ngolahBolaPointsBalance,
			);
			return res.data.data;
		},
		staleTime: 5 * 60 * 1000,
	});
}

// ─── Packs ────────────────────────────────────────────────────────────────────

export function useNgolahBolaPackCatalog() {
	return useQuery({
		queryKey: ["ngolah-bola-pack-catalog"],
		queryFn: async () => {
			const res = await apiClient.get<{ data: PackCatalog[] }>(
				endpoints.ngolahBolaPackCatalog,
			);
			return res.data.data;
		},
		staleTime: 10 * 60 * 1000,
	});
}

export function useOpenPack() {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: async ({ packId }: { packId: string }) => {
			const res = await apiClient.post<{ data: PackOpenResponse }>(
				endpoints.ngolahBolaOpenPack(packId),
			);
			return res.data.data;
		},
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["ngolah-bola-profile"] });
			queryClient.invalidateQueries({ queryKey: ["ngolah-bola-inventory"] });
		},
	});
}

// ─── Inventory ────────────────────────────────────────────────────────────────

export function useNgolahBolaInventory(params?: {
	rarity?: string;
	page?: number;
}) {
	return useQuery({
		queryKey: ["ngolah-bola-inventory", params],
		queryFn: async () => {
			const qs = new URLSearchParams();
			if (params?.rarity) qs.set("rarity", params.rarity);
			if (params?.page) qs.set("page", String(params.page));
			const suffix = qs.toString() ? `?${qs}` : "";
			const res = await apiClient.get<{
				data: InventoryItem[];
				meta: { total: number; per_page: number; current_page: number; last_page: number };
			}>(endpoints.ngolahBolaInventory + suffix);
			return res.data;
		},
		staleTime: 5 * 60 * 1000,
	});
}

// ─── Reference Data ───────────────────────────────────────────────────────────

export function useNgolahBolaReferenceLeagues() {
	return useQuery({
		queryKey: ["ngolah-bola-leagues"],
		queryFn: async () => {
			const res = await apiClient.get<{ data: League[] }>(
				endpoints.ngolahBolaReferenceLeagues,
			);
			return res.data.data;
		},
		staleTime: 30 * 60 * 1000,
	});
}

export function useNgolahBolaReferenceClubs(leagueId?: string) {
	return useQuery({
		queryKey: ["ngolah-bola-clubs", leagueId],
		queryFn: async () => {
			const qs = leagueId ? `?league_id=${leagueId}` : "";
			const res = await apiClient.get<{ data: Club[] }>(
				endpoints.ngolahBolaReferenceClubs + qs,
			);
			return res.data.data;
		},
		enabled: !!leagueId,
		staleTime: 30 * 60 * 1000,
	});
}

export function useNgolahBolaReferenceFormations() {
	return useQuery({
		queryKey: ["ngolah-bola-formations"],
		queryFn: async () => {
			const res = await apiClient.get<FormationsResponse>(
				endpoints.ngolahBolaReferenceFormations,
			);
			return res.data;
		},
		staleTime: 30 * 60 * 1000,
	});
}

// ─── Squads ───────────────────────────────────────────────────────────────────

export function useSquads() {
	return useQuery({
		queryKey: ["ngolah-bola-squads"],
		queryFn: async () => {
			const res = await apiClient.get<{ data: Squad[] }>(
				endpoints.ngolahBolaSquads,
			);
			return res.data.data;
		},
		staleTime: 5 * 60 * 1000,
	});
}

export function useSquadDetail(id: string) {
	return useQuery({
		queryKey: ["ngolah-bola-squad", id],
		queryFn: async () => {
			const res = await apiClient.get<{ data: Squad }>(
				endpoints.ngolahBolaSquadDetail(id),
			);
			return res.data.data;
		},
		enabled: !!id,
		staleTime: 5 * 60 * 1000,
	});
}

export function useCreateSquad() {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: async (data: SquadCreateData) => {
			const res = await apiClient.post<{ data: Squad }>(
				endpoints.ngolahBolaSquads,
				data,
			);
			return res.data.data;
		},
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["ngolah-bola-squads"] });
		},
	});
}

export function useAddPlayerToSquad(squadId: string) {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: async (data: AddPlayerData) => {
			const res = await apiClient.post<{ data: unknown }>(
				endpoints.ngolahBolaAddPlayerToSquad(squadId),
				data,
			);
			return res.data;
		},
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["ngolah-bola-squad", squadId] });
		},
	});
}

export function useRemovePlayerFromSquad(squadId: string) {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: async (slot: string) => {
			const res = await apiClient.delete<{ message: string }>(
				endpoints.ngolahBolaRemovePlayerFromSquad(squadId, slot),
			);
			return res.data;
		},
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["ngolah-bola-squad", squadId] });
		},
	});
}

export function useSquadChemistry(id: string) {
	return useQuery({
		queryKey: ["ngolah-bola-squad-chemistry", id],
		queryFn: async () => {
			const res = await apiClient.get<{ data: SquadChemistryData }>(
				endpoints.ngolahBolaSquadChemistry(id),
			);
			return res.data.data;
		},
		enabled: !!id,
		staleTime: 5 * 60 * 1000,
	});
}

export function useValidateSquad(id: string) {
	return useMutation({
		mutationFn: async () => {
			const res = await apiClient.post<{ data: ValidateDuelResult }>(
				endpoints.ngolahBolaValidateSquad(id),
			);
			return res.data.data;
		},
	});
}

// ─── Duel ─────────────────────────────────────────────────────────────────────

export function useDuelChallenge() {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: async (data: DuelChallengeRequest) => {
			const res = await apiClient.post<{ data: DuelResult }>(
				endpoints.ngolahBolaDuelChallenge,
				data,
			);
			return res.data.data;
		},
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["ngolah-bola-energy"] });
			queryClient.invalidateQueries({ queryKey: ["ngolah-bola-profile"] });
			queryClient.invalidateQueries({ queryKey: ["ngolah-bola-points"] });
			queryClient.invalidateQueries({ queryKey: ["ngolah-bola-duel-history"] });
		},
	});
}

export function useDuelHistory() {
	return useQuery({
		queryKey: ["ngolah-bola-duel-history"],
		queryFn: async () => {
			const res = await apiClient.get<{ data: DuelHistoryEntry[] }>(
				endpoints.ngolahBolaDuelHistory,
			);
			return res.data.data;
		},
		staleTime: 2 * 60 * 1000,
	});
}

export function useDuelPlaySubmit() {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: async (data: DuelPlaySubmitData) => {
			const res = await apiClient.post<{ data: DuelPlayResult }>(
				endpoints.ngolahBolaDuelPlaySubmit,
				data,
			);
			return res.data.data;
		},
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["ngolah-bola-energy"] });
			queryClient.invalidateQueries({ queryKey: ["ngolah-bola-profile"] });
			queryClient.invalidateQueries({ queryKey: ["ngolah-bola-points"] });
			queryClient.invalidateQueries({ queryKey: ["ngolah-bola-duel-history"] });
		},
	});
}

export function useRefillEnergy() {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: async (data?: RefillEnergyRequest) => {
			const res = await apiClient.post<{ data: RefillEnergyResult }>(
				endpoints.ngolahBolaRefillEnergy,
				data ?? {},
			);
			return res.data.data;
		},
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["ngolah-bola-energy"] });
			queryClient.invalidateQueries({ queryKey: ["ngolah-bola-profile"] });
		},
	});
}

// ─── Daily Reward ─────────────────────────────────────────────────────────────

export function useDailyRewardStatus() {
	return useQuery({
		queryKey: ["ngolah-bola-daily-reward"],
		queryFn: async () => {
			const res = await apiClient.get<{ data: DailyRewardStatus }>(
				endpoints.ngolahBolaDailyRewardStatus,
			);
			return res.data.data;
		},
		staleTime: 60 * 1000,
	});
}

export function useClaimDailyReward() {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: async (data: DailyRewardClaimRequest) => {
			const res = await apiClient.post<{ data: DailyRewardClaimResult }>(
				endpoints.ngolahBolaDailyRewardClaim,
				data,
			);
			return res.data.data;
		},
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["ngolah-bola-daily-reward"] });
			queryClient.invalidateQueries({ queryKey: ["ngolah-bola-points"] });
			queryClient.invalidateQueries({ queryKey: ["ngolah-bola-profile"] });
		},
	});
}

// ─── Share ────────────────────────────────────────────────────────────────────

export function useShareData(id: string) {
	return useQuery({
		queryKey: ["ngolah-bola-share-data", id],
		queryFn: async () => {
			const res = await apiClient.get<{ data: ShareData }>(
				endpoints.ngolahBolaShareData(id),
			);
			return res.data.data;
		},
		enabled: !!id,
		staleTime: 5 * 60 * 1000,
	});
}

export function useShareLog(squadId: string) {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: async (data: ShareLogRequest) => {
			const res = await apiClient.post<{ data: ShareLogResult }>(
				endpoints.ngolahBolaShareLog(squadId),
				data,
			);
			return res.data.data;
		},
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["ngolah-bola-points"] });
			queryClient.invalidateQueries({ queryKey: ["ngolah-bola-profile"] });
		},
	});
}

// ���── Points Exchange ──────────────────────────────────────────────────────────

export function useExchangePoints() {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: async (data: ExchangePointsRequest) => {
			const res = await apiClient.post<{ data: ExchangePointsResult }>(
				endpoints.ngolahBolaExchangePoints,
				data,
			);
			return res.data.data;
		},
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["ngolah-bola-points"] });
			queryClient.invalidateQueries({ queryKey: ["ngolah-bola-profile"] });
		},
	});
}
