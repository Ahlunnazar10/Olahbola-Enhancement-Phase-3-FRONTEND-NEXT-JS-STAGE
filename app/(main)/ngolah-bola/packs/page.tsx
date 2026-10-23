"use client";

import { useState } from "react";
import {
	Package,
	Gem as GemIcon,
	ArrowLeft,
	Sparkles,
} from "lucide-react";
import { useNgolahBolaPackCatalog, useOpenPack, useNgolahBolaProfile } from "@/hooks/queries/useNgolahBola";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import type { PackCatalog, PackOpenResult, PackOpenResponse } from "@/types/ngolahBola";
import { cn } from "@/lib/utils";

const RARITY_STYLES: Record<string, { bg: string; border: string; text: string; glow: string; shadow: string }> = {
	bronze: { bg: "from-amber-900/40 to-amber-700/10", border: "border-amber-600/40", text: "text-amber-400", glow: "shadow-amber-500/10", shadow: "shadow-amber-500/10" },
	silver: { bg: "from-gray-300/20 to-gray-400/5", border: "border-gray-300/40", text: "text-gray-200", glow: "shadow-gray-400/10", shadow: "shadow-gray-400/10" },
	gold: { bg: "from-yellow-500/30 to-yellow-400/10", border: "border-yellow-400/50", text: "text-yellow-400", glow: "shadow-yellow-400/20", shadow: "shadow-yellow-400/20" },
	legend: { bg: "from-purple-500/30 to-pink-500/15", border: "border-purple-400/60", text: "text-purple-300", glow: "shadow-purple-500/30", shadow: "shadow-purple-500/30" },
};

export default function PacksPage() {
	const router = useRouter();
	const { data: packs, isLoading: loading } = useNgolahBolaPackCatalog();
	const { data: profile } = useNgolahBolaProfile();
	const { mutate: openPack, isPending } = useOpenPack();
	const [selectedPackId, setSelectedPackId] = useState<string | null>(null);
	const [result, setResult] = useState<{ pack: string; results: PackOpenResult[]; gemsRemaining: number; isFree: boolean; freeBronze: number; freeSilver: number } | null>(null);
	const [showResult, setShowResult] = useState(false);

	const gems = profile?.total_gems ?? 0;
	const freeBronze = profile?.free_bronze_opens ?? 0;
	const freeSilver = profile?.free_silver_opens ?? 0;

	const getFreeStatus = (pack: PackCatalog) => {
		const name = pack.pack_name.toLowerCase();
		if (name.includes('bronze')) return freeBronze > 0;
		if (name.includes('silver')) return freeSilver > 0;
		return false; // gold & legend always paid
	};

	const handleOpen = (pack: PackCatalog) => {
		const isFree = getFreeStatus(pack);
		if (!isFree && gems < pack.cost_in_gems) {
			toast.error(`Gems tidak cukup! Butuh ${pack.cost_in_gems}`, {
				description: "Tukar points di menu Rewards.",
				action: { label: "Menu Rewards", onClick: () => router.push("/ngolah-bola/rewards") },
			});
			return;
		}
		setSelectedPackId(pack.id);
		setShowResult(false);
		openPack({ packId: pack.id }, {
			onSuccess: (data: PackOpenResponse) => {
				setResult({ pack: pack.pack_name, results: data.results, gemsRemaining: data.gems_remaining, isFree: data.is_free, freeBronze: data.free_bronze_opens, freeSilver: data.free_silver_opens });
				setShowResult(true);
			},
			onError: (err: any) => {
				toast.error(err?.response?.data?.message || "Gagal membuka pack.");
			},
		});
	};

	if (loading) return <Skeleton />;

	return (
		<div className="max-w-lg mx-auto px-4 py-6 space-y-5 pb-24">
			{/* Header */}
			<div className="flex items-center gap-3">
				<button onClick={() => router.back()} className="w-9 h-9 rounded-xl bg-white/5 flex items-center justify-center hover:bg-white/10 transition-colors">
					<ArrowLeft className="w-4 h-4 text-white/60" />
				</button>
				<div>
					<h1 className="text-lg font-black italic uppercase text-white">Buka Pack</h1>
					<p className="text-xs text-white/40">Raih kartu pemain legendaris!</p>
				</div>
			</div>

			{/* Gems balance */}
			<div className="glass-card rounded-xl p-3 flex items-center gap-4">
				<div className="flex items-center gap-2">
					<GemIcon className="w-4 h-4 text-teal-300 fill-teal-300 shrink-0" />
					<span className="text-sm text-white/50">Gems:</span>
					<span className="text-lg font-black text-teal-300">{gems}</span>
				</div>
				<div className="h-6 w-px bg-white/10" />
				<div className="flex items-center gap-2">
					<Package className="w-4 h-4 text-amber-400 shrink-0" />
					<span className="text-sm text-white/50">Bronze:</span>
					<span className="text-lg font-black text-amber-400">{freeBronze}</span>
				</div>
				<div className="h-6 w-px bg-white/10" />
				<div className="flex items-center gap-2">
					<Package className="w-4 h-4 text-gray-300 shrink-0" />
					<span className="text-sm text-white/50">Silver:</span>
					<span className="text-lg font-black text-gray-200">{freeSilver}</span>
				</div>
			</div>

			{/* Pack grid */}
			<div className="space-y-3">
							{/* Free opens info */}
				{(freeBronze > 0 || freeSilver > 0) && (
					<div className="bg-emerald-500/10 border border-emerald-500/30 rounded-xl px-4 py-2.5 flex items-center gap-2 text-sm">
						<span className="text-emerald-400 font-black">★ GRATIS MINGGU INI:</span>
						<span className="text-white/80">
							{freeBronze > 0 && <span className="text-amber-400 font-black">{freeBronze}x Bronze</span>}
							{freeBronze > 0 && freeSilver > 0 && <span className="text-white/40 mx-1">•</span>}
							{freeSilver > 0 && <span className="text-gray-200 font-black">{freeSilver}x Silver</span>}
							{freeBronze === 0 && freeSilver === 0 && <span className="text-white/50">Habis</span>}
						</span>
					</div>
				)}

				{packs?.map((pack) => {
					const packFree = getFreeStatus(pack);
					return (
						<PackCard
							key={pack.id}
							pack={pack}
							canAfford={packFree || gems >= pack.cost_in_gems}
							isFreePack={packFree}
							onOpen={() => handleOpen(pack)}
							isOpenPending={isPending && selectedPackId === pack.id}
						/>
					);
				})}
			</div>

			{/* Result modal */}
			{showResult && result && (
				<PackResultModal result={result} onClose={() => setShowResult(false)} onContinue={() => { setShowResult(false); router.push("/ngolah-bola/inventory"); }} />
			)}
		</div>
	);
}

function PackCard({
	pack,
	canAfford,
	isFreePack,
	onOpen,
	isOpenPending,
}: {
	pack: PackCatalog;
	canAfford: boolean;
	isFreePack: boolean;
	onOpen: () => void;
	isOpenPending: boolean;
}) {
	return (
		<div className="glass-card rounded-2xl p-4 space-y-3 relative overflow-hidden">
			{/* Rarity badges */}
			<div className="flex flex-wrap gap-1.5">
				{pack.available_rarities.map((r) => {
					const styles = RARITY_STYLES[r] ?? RARITY_STYLES.bronze;
					const rate = Math.round((pack.drop_rates[r as keyof typeof pack.drop_rates] ?? 0) * 100);
					return (
						<span key={r} className={`text-[10px] font-bold px-2 py-0.5 rounded-full bg-white/5 border ${styles.border} ${styles.text}`}>
							{r.charAt(0).toUpperCase() + r.slice(1)} {rate}%
						</span>
					);
				})}
			</div>

			<div>
				<h3 className="text-base font-black uppercase tracking-wide text-white">{pack.pack_name}</h3>
				<div className="flex items-center gap-3 mt-1 text-xs text-white/40">
					<span className="flex items-center gap-1"><Package className="w-3 h-3" />{pack.cards_per_pack} kartu</span>
				</div>
			</div>

			<button
				onClick={onOpen}
				disabled={isOpenPending || !canAfford}
				className={cn(
					"w-full py-3 rounded-xl font-black uppercase tracking-wider text-sm flex items-center justify-center gap-2 transition-all",
					canAfford && !isOpenPending
						? isFreePack
							? "bg-emerald-500 text-black hover:bg-emerald-400 shadow-lg shadow-emerald-500/20"
							: "bg-teal-500 text-black hover:bg-teal-400 shadow-lg shadow-teal-500/20"
						: "bg-white/5 text-white/20 cursor-not-allowed",
				)}
			>
				{isOpenPending ? (
					<>
						<span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
						Membuka...
					</>
				) : canAfford ? (
					<>
						{isFreePack ? (
							<>
								<Sparkles className="w-4 h-4 text-emerald-700" />
								<span className="text-emerald-700">Buka Gratis</span>
							</>
						) : (
							<>
								<GemIcon className="w-4 h-4 fill-teal-200" />
								Buka — {pack.cost_in_gems} gems
							</>
						)}
					</>
				) : (
					<>
						<GemIcon className="w-4 h-4" />
						Tidak cukup gems
					</>
				)}
			</button>
		</div>
	);
}

function PackResultModal({
	result,
	onClose,
	onContinue,
}: {
	result: { pack: string; results: PackOpenResult[]; gemsRemaining: number; isFree: boolean; freeBronze: number; freeSilver: number };
	onClose: () => void;
	onContinue: () => void;
}) {
	const [revealed, setRevealed] = useState<Set<number>>(new Set());

	const toggle = (i: number) => {
		setRevealed((prev) => {
			const next = new Set(prev);
			next.has(i) ? next.delete(i) : next.add(i);
			return next;
		});
	};

	const allRevealed = revealed.size === result.results.length;

	return (
		<div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/80 backdrop-blur-sm p-4">
			<div className="bg-[#111817] border border-white/10 rounded-2xl w-full max-w-sm p-5 space-y-4">
				<div className="text-center">
					<Sparkles className="w-8 h-8 text-yellow-400 mx-auto mb-2" />
					<h2 className="text-lg font-black italic uppercase text-teal-400">{result.pack}</h2>
					<p className="text-xs text-white/40 mt-1">
						Gems tersisa: <span className="text-teal-300 font-black">{result.gemsRemaining}</span>
						{result.isFree && <span className="ml-2 text-purple-400 font-black">• Gratis (B:{result.freeBronze} S:{result.freeSilver} sisa)</span>}
					</p>
				</div>

				<div className="grid grid-cols-5 gap-2">
					{result.results.map((card, i) => {
						const styles = RARITY_STYLES[card.rarity] ?? RARITY_STYLES.bronze;
						const isRevealed = revealed.has(i);
						return (
							<button
								key={`${result.pack}-${i}`}
								onClick={() => toggle(i)}
								className={cn(
									"aspect-[3/4] rounded-xl border-2 bg-gradient-to-br flex flex-col items-center justify-center p-1 transition-all hover:scale-105",
									styles.border,
									styles.bg,
									styles.shadow,
									"shadow-lg",
								)}
							>
								{isRevealed ? (
									<div className="text-center space-y-1">
										<span className={`text-[8px] font-black ${styles.text} uppercase`}>{card.rarity}</span>
										<div className={`w-7 h-7 rounded-full bg-white/10 mx-auto flex items-center justify-center text-xs font-black ${styles.text}`}>
											{card.overall_rating}
										</div>
										<p className="text-[7px] font-bold text-white/80 leading-tight line-clamp-2 px-0.5">{card.player_name.split(" ")[0]}</p>
										{card.guaranteed && (
											<span className="text-[6px] bg-yellow-400/20 text-yellow-300 px-1 py-0.5 rounded font-black uppercase">
												Guaranteed
											</span>
										)}
									</div>
								) : (
									<div className="text-center">
										<Package className="w-5 h-5 text-white/15 mx-auto" />
										<p className="text-[7px] text-white/20 mt-1">Tap</p>
									</div>
								)}
							</button>
						);
					})}
				</div>

				{allRevealed ? (
					<div className="space-y-2">
						<button onClick={onContinue} className="w-full py-3 bg-teal-500 text-black font-black uppercase text-sm rounded-xl hover:bg-teal-400 transition-colors">
							Lihat Inventory
						</button>
						<button onClick={onClose} className="w-full py-2 text-xs text-white/30 hover:text-white/60 transition-colors">
							Tutup
						</button>
					</div>
				) : (
					<p className="text-center text-xs text-white/30">Tap kartu untuk melihat detail</p>
				)}
			</div>
		</div>
	);
}

function Skeleton() {
	return (
		<div className="max-w-lg mx-auto px-4 py-6 space-y-4">
			<div className="h-7 w-32 bg-white/5 rounded-lg animate-pulse" />
			<div className="glass-card rounded-xl h-10 bg-white/5 animate-pulse" />
			<div className="space-y-3">
				{[1, 2].map((i) => (
					<div key={i} className="glass-card rounded-2xl p-4 space-y-3 animate-pulse">
						<div className="flex gap-2">
							{[1, 2, 3].map((j) => <div key={j} className="h-5 w-12 bg-white/5 rounded-full" />)}
						</div>
						<div className="h-5 w-28 bg-white/5 rounded" />
						<div className="h-10 w-full bg-white/5 rounded-xl" />
					</div>
				))}
			</div>
		</div>
	);
}
