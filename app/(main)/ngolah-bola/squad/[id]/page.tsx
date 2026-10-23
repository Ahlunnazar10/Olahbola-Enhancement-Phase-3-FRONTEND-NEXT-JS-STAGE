"use client";

import { useParams, useRouter } from "next/navigation";
import { ArrowLeft, Plus, X, Save, AlertCircle } from "lucide-react";
import { useSquadDetail, useAddPlayerToSquad, useRemovePlayerFromSquad, useValidateSquad } from "@/hooks/queries/useNgolahBola";
import { useNgolahBolaInventory } from "@/hooks/queries/useNgolahBola";
import { useAuthStore } from "@/stores/authStore";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { useMemo, useState } from "react";

export default function SquadBuilderPage() {
	const params = useParams();
	const router = useRouter();
	const squadId = params.id as string;
	const { data: squad, isLoading: squadLoading } = useSquadDetail(squadId);
	const { data: inventory } = useNgolahBolaInventory();
	const { mutate: addPlayer, isPending: adding } = useAddPlayerToSquad(squadId);
	const { mutate: removePlayer } = useRemovePlayerFromSquad(squadId);
	const { mutate: validateSquad, isPending: validating } = useValidateSquad(squadId);
	const [selectedSlotIndex, setSelectedSlotIndex] = useState<number | null>(null);
	const [validationResult, setValidationResult] = useState<{ ready: boolean; errors: Record<string, string>; player_count: number } | null>(null);

	const players = squad?.players ?? [];
	const rawSlots = squad?.slots ?? [];

	// Build unique slot keys from display names (backend sends ["GK","LB","CB","CB","CB","RWB","CM","CM","CM","ST","ST"])
	const slots = rawSlots.map((slot: string, i: number, arr: string[]) => {
		const prevSame = arr.slice(0, i).filter(s => s === slot).length;
		return prevSame === 0 ? slot : `${slot}-${prevSame}`;
	});

	// Build map: card_id -> slot_key
	const playerSlotMap = useMemo(() => {
		const map: Record<string, string> = {};
		players.forEach(p => {
			if (p.slot) map[p.card_id] = p.slot;
		});
		return map;
	}, [players]);

	const handleAddPlayer = (slotKey: string, cardId: string) => {
		addPlayer({ card_id: cardId, slot: slotKey }, {
			onSuccess: () => {
				setSelectedSlotIndex(null);
				toast.success("Pemain ditambahkan!");
			},
			onError: (err: any) => {
				toast.error(err?.response?.data?.message || "Gagal menambahkan pemain.");
			},
		});
	};

	const handleRemovePlayer = (slotKey: string) => {
		removePlayer(slotKey, {
			onSuccess: () => toast.success("Pemain dilepas."),
		});
	};

	const handleValidate = () => {
		validateSquad(undefined, {
			onSuccess: (data) => setValidationResult(data),
			onError: (err: any) => toast.error(err?.response?.data?.message || "Validasi gagal."),
		});
	};

	if (squadLoading) return <BuilderSkeleton />;
	if (!squad) return <div className="text-center py-20 text-white/30">Skuad tidak ditemukan.</div>;

	const getPlayerAtSlot = (slotKey: string) => players.find((p) => p.slot === slotKey);

	return (
		<div className="max-w-2xl mx-auto px-4 py-6 space-y-5">
			{/* Back */}
			<button
				onClick={() => router.push("/ngolah-bola/squad")}
				className="flex items-center gap-2 text-sm text-white/40 hover:text-white transition-colors"
			>
				<ArrowLeft className="w-4 h-4" />
				Kembali ke Squad
			</button>

			{/* Squad header */}
			<div className="glass-card rounded-2xl p-5 space-y-3">
				<div className="flex items-center justify-between">
					<div>
						<h1 className="text-xl font-black italic uppercase text-white">{squad.name}</h1>
						<p className="text-xs text-white/40 mt-1">
							Formasi: <span className="text-teal-400 font-bold uppercase">{squad.formation}</span>
							{` · Budget: ${squad.budget_used ?? 0}/${squad.budget_cap}`}
							{` · Kimia: ${squad.chemistry ?? "?"}`}
						</p>
					</div>
					<div className="text-right">
						<span className={`text-2xl font-black ${((squad.filled_slots ?? 0) >= 11) ? "text-teal-400" : "text-yellow-400"}`}>
							{squad.filled_slots ?? 0}/11
						</span>
						<p className="text-[10px] text-white/30 uppercase font-bold">pemain</p>
					</div>
				</div>

				{/* Budget bar */}
				<div className="h-1.5 bg-white/5 rounded-full overflow-hidden">
					<div
						className={cn("h-full rounded-full transition-all",
							(squad.budget_used ?? 0) > squad.budget_cap ? "bg-red-500" : "bg-teal-400"
						)}
						style={{ width: `${Math.min(100, ((squad.budget_used ?? 0) / squad.budget_cap) * 100)}%` }}
					/>
				</div>
			</div>

			{/* Formation pitch */}
			<div className="glass-card rounded-2xl p-4">
				<div className="relative aspect-[3/4] sm:aspect-square bg-gradient-to-b from-green-900/40 to-green-800/20 rounded-xl border border-white/5 overflow-hidden">
					{/* Pitch lines */}
					<PitchLines />

					{/* Slots */}
					{slots.map((slotKey, i) => {
						const player = getPlayerAtSlot(slotKey);
						const isSelected = selectedSlotIndex === i;
						const baseSlot = slotKey.split('-')[0];

						return (
							<div
								key={`${slotKey}-${i}`}
								className={cn(
									"absolute w-10 h-10 sm:w-12 sm:h-12 rounded-full flex items-center justify-center cursor-pointer transition-all border-2",
									player
										? "bg-teal-500/30 border-teal-400 text-white hover:bg-teal-500/50"
										: isSelected
											? "bg-teal-400/40 border-teal-300 animate-pulse"
											: "bg-white/5 border-white/10 hover:border-white/30 hover:bg-white/10",
								)}
								style={{
									left: `${getPositionX(baseSlot, slots.slice(0, i).filter(s => s.split('-')[0] === baseSlot).length, slots.filter(s => s.split('-')[0] === baseSlot).length)}%`,
									top: `${getPositionY(baseSlot)}%`,
									transform: "translate(-50%, -50%)",
								}}
								onClick={() => {
									if (player) {
										if (confirm(`Lepas ${player.player_name}?`)) {
											handleRemovePlayer(slotKey);
										}
									} else {
										setSelectedSlotIndex(isSelected ? null : i);
									}
								}}
							>
								{player ? (
									<div className="text-center" title={`${player.player_name} (${player.overall_rating})`}>
										<span className="text-[10px] sm:text-xs font-black">{player.overall_rating}</span>
									</div>
								) : (
									<span className="text-[10px] font-black text-white/30">{baseSlot}</span>
								)}
							</div>
						);
					})}
				</div>

				{/* Selected slot picker */}
				{selectedSlotIndex !== null && !getPlayerAtSlot(slots[selectedSlotIndex]) && (
					<div className="mt-4 space-y-2">
						<div className="flex items-center justify-between">
							<span className="text-sm font-bold text-white">
								Pilih kartu untuk slot <span className="text-teal-400">{slots[selectedSlotIndex].split('-')[0]}</span>
							</span>
							<button onClick={() => setSelectedSlotIndex(null)}>
								<X className="w-4 h-4 text-white/30" />
							</button>
						</div>
						<PlayerPicker
							baseSlot={slots[selectedSlotIndex].split('-')[0]}
							onSelect={(cardId) => handleAddPlayer(slots[selectedSlotIndex], cardId)}
							availableCards={inventory?.data ?? []}
							filledSlots={playerSlotMap}
							isPending={adding}
						/>
					</div>
				)}
			</div>

			{/* Validate button */}
			<button
				onClick={handleValidate}
				disabled={validating || (squad.filled_slots ?? 0) < 11}
				className={cn(
					"w-full py-4 rounded-2xl font-black uppercase tracking-wider text-sm flex items-center justify-center gap-2 transition-all",
					(squad.filled_slots ?? 0) >= 11
						? "bg-gradient-to-r from-teal-500 to-teal-600 text-black hover:from-teal-400 hover:to-teal-500 shadow-lg shadow-teal-500/20"
						: "bg-white/5 text-white/20 cursor-not-allowed",
				)}
			>
				{validating ? (
					<>
						<span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
						Mengecek...
					</>
				) : (
					<>
						<Save className="w-4 h-4" />
						{(squad.filled_slots ?? 0) >= 11 ? "Siap Duel!" : `Siapkan ${11 - (squad.filled_slots ?? 0)} pemain lagi`}
					</>
				)}
			</button>

			{/* Validation result */}
			{validationResult && (
				<div className={cn(
					"rounded-xl p-4 space-y-2",
					validationResult.ready ? "bg-teal-500/10 border border-teal-500/30" : "bg-red-500/10 border border-red-500/30",
				)}>
					<div className="flex items-center gap-2">
						{validationResult.ready ? (
							<span className="text-teal-400 font-black uppercase text-sm">Squad siap untuk duel!</span>
						) : (
							<>
								<AlertCircle className="w-4 h-4 text-red-400" />
								<span className="text-red-400 font-black uppercase text-sm">Squad belum siap</span>
							</>
						)}
					</div>
					{Object.entries(validationResult.errors).map(([key, msg]) => (
						<p key={key} className="text-xs text-red-300/70 ml-6">{msg}</p>
					))}
					{validationResult.ready && (
						<button
							onClick={() => router.push(`/ngolah-bola/duel?squad=${squadId}`)}
							className="mt-2 w-full py-3 bg-rose-500 text-white font-black uppercase text-sm rounded-xl hover:bg-rose-400 transition-colors"
						>
							Mulai Duel!
						</button>
					)}
				</div>
			)}
		</div>
	);
}

function PlayerPicker({
	baseSlot,
	onSelect,
	availableCards,
	filledSlots,
	isPending,
}: {
	baseSlot: string;
	onSelect: (cardId: string) => void;
	availableCards: Array<{ id: string; card_id: string; player_name: string; overall_rating: number; rarity: string; position_primary: string }>;
	filledSlots: Record<string, string>;
	isPending: boolean;
}) {
	const [search, setSearch] = useState("");
	const positionMap: Record<string, string[]> = {
		LB: ['LB', 'LWB', 'LM', 'CAM'],
		RB: ['RB', 'RWB', 'RM', 'CAM'],
		CB: ['CB', 'LB', 'RB', 'LWB', 'RWB'],
		LWB: ['LWB', 'LB', 'LM', 'CB'],
		RWB: ['RWB', 'RB', 'RM', 'CB'],
		CDM: ['CDM', 'CM', 'CAM'],
		CM: ['CM', 'CDM', 'CAM', 'LM', 'RM'],
		CAM: ['CAM', 'CM', 'CDM', 'LM', 'RM', 'LW', 'RW', 'ST'],
		LM: ['LM', 'LW', 'CM', 'CAM', 'LB', 'LWB'],
		RM: ['RM', 'RW', 'CM', 'CAM', 'RB', 'RWB'],
		LW: ['LW', 'LM', 'CAM'],
		RW: ['RW', 'RM', 'CAM'],
		ST: ['ST', 'CAM', 'LW', 'RW'],
	};
	const validPositions = positionMap[baseSlot] ?? [baseSlot];

	const filtered = availableCards
		.filter((card) => !filledSlots[card.card_id])
		.filter((card) => {
			const matchesPos = validPositions.includes(card.position_primary);
			const matchesSearch = card.player_name.toLowerCase().includes(search.toLowerCase());
			return matchesPos && matchesSearch;
		})
		.slice(0, 20);

	if (filtered.length === 0) {
		return (
			<div className="text-center py-6 text-white/30 text-sm">
				Tidak ada kartu yang cocok untuk posisi {baseSlot}.
			</div>
		);
	}

	return (
		<div className="space-y-2 max-h-60 overflow-y-auto pr-1">
			<input
				type="text"
				placeholder="Cari pemain..."
				value={search}
				onChange={(e) => setSearch(e.target.value)}
				className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-xs text-white placeholder:text-white/20 focus:outline-none focus:border-teal-500/50 mb-2"
			/>
			{filtered.map((card) => (
				<button
					key={card.id}
					onClick={() => onSelect(card.card_id)}
					disabled={isPending}
					className="w-full flex items-center gap-3 p-2 rounded-lg bg-white/5 hover:bg-white/10 transition-colors text-left"
				>
					<div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center text-xs font-black text-teal-400">
						{card.overall_rating}
					</div>
					<div className="flex-1 min-w-0">
						<p className="text-xs font-bold text-white truncate">{card.player_name}</p>
						<p className="text-[10px] text-white/40">{card.position_primary} · {card.rarity}</p>
					</div>
					<Plus className="w-4 h-4 text-teal-400 shrink-0" />
				</button>
			))}
		</div>
	);
}

function PitchLines() {
	return (
		<svg className="absolute inset-0 w-full h-full opacity-10" viewBox="0 0 100 100" preserveAspectRatio="none">
			{/* Center circle */}
			<circle cx="50" cy="50" r="15" fill="none" stroke="white" strokeWidth="0.5" />
			<line x1="0" y1="50" x2="100" y2="50" stroke="white" strokeWidth="0.5" />
			{/* Penalty areas */}
			<rect x="20" y="0" width="60" height="20" fill="none" stroke="white" strokeWidth="0.5" />
			<rect x="20" y="80" width="60" height="20" fill="none" stroke="white" strokeWidth="0.5" />
			{/* Goal areas */}
			<rect x="35" y="0" width="30" height="7" fill="none" stroke="white" strokeWidth="0.5" />
			<rect x="35" y="93" width="30" height="7" fill="none" stroke="white" strokeWidth="0.5" />
		</svg>
	);
}

function getPositionX(baseSlot: string, occurrence: number, total: number): number {
	const xBase: Record<string, number> = {
		GK: 50, LB: 12, CB: 50, RB: 88,
		LWB: 10, RWB: 90,
		CDM: 50, CM: 50, CAM: 50,
		LM: 20, RM: 80,
		LW: 18, RW: 82, ST: 50,
	};
	const x = xBase[baseSlot] ?? 50;
	if (total <= 1) return x;
	const spread = baseSlot === 'CB' ? 18 : baseSlot === 'CM' ? 18 : baseSlot === 'ST' ? 12 : 15;
	return x + (occurrence - (total - 1) / 2) * spread;
}

function getPositionY(baseSlot: string): number {
	const yBase: Record<string, number> = {
		GK: 90,
		LB: 74, CB: 75, RB: 74,
		LWB: 68, RWB: 68,
		CDM: 60, CM: 55, CAM: 45,
		LM: 50, RM: 50,
		LW: 30, RW: 30, ST: 15,
	};
	return yBase[baseSlot] ?? 50;
}

function BuilderSkeleton() {
	return (
		<div className="max-w-2xl mx-auto px-4 py-6 space-y-4">
			<div className="h-8 w-32 bg-white/5 rounded-lg animate-pulse" />
			<div className="glass-card rounded-2xl p-5 animate-pulse space-y-3">
				<div className="h-5 w-48 bg-white/5 rounded" />
				<div className="h-3 w-32 bg-white/5 rounded" />
			</div>
			<div className="glass-card rounded-2xl aspect-square animate-pulse bg-white/5" />
		</div>
	);
}
