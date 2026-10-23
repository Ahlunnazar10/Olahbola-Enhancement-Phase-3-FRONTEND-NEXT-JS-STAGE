"use client";

import { useState } from "react";
import { BookOpen, Search, X, ArrowLeft, Filter } from "lucide-react";
import { useNgolahBolaInventory } from "@/hooks/queries/useNgolahBola";
import type { InventoryItem, Rarity } from "@/types/ngolahBola";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";

const RARITY_STYLES: Record<Rarity, { border: string; bg: string; text: string }> = {
	bronze: { border: "border-amber-700/40", bg: "from-amber-900/25 to-amber-800/8", text: "text-amber-400" },
	silver: { border: "border-gray-300/40", bg: "from-gray-300/15 to-gray-400/5", text: "text-gray-200" },
	gold: { border: "border-yellow-400/50", bg: "from-yellow-500/20 to-yellow-400/6", text: "text-yellow-400" },
	legend: { border: "border-purple-400/60", bg: "from-purple-500/25 to-pink-500/10", text: "text-purple-300" },
};

const RARITY_ORDER: Rarity[] = ["legend", "gold", "silver", "bronze"];

export default function InventoryPage() {
	const router = useRouter();
	const { data, isLoading } = useNgolahBolaInventory();
	const [filter, setFilter] = useState("all");
	const [search, setSearch] = useState("");

	const items: InventoryItem[] = data?.data ?? [];
	const total = data?.meta?.total ?? 0;

	const filtered = items
		.filter((item) => filter === "all" || item.rarity === filter)
		.filter((item) =>
			search ? item.player_name.toLowerCase().includes(search.toLowerCase()) : true,
		)
		.sort((a, b) => b.overall_rating - a.overall_rating);

	return (
		<div className="max-w-lg mx-auto px-4 py-6 space-y-4 pb-24">
			{/* Header */}
			<div className="flex items-center gap-3">
				<button onClick={() => router.back()} className="w-9 h-9 rounded-xl bg-white/5 flex items-center justify-center hover:bg-white/10 transition-colors">
					<ArrowLeft className="w-4 h-4 text-white/60" />
				</button>
				<div className="flex-1">
					<h1 className="text-lg font-black italic uppercase text-white">Inventory</h1>
					<p className="text-xs text-white/40">{total} kartu</p>
				</div>
			</div>

			{/* Search */}
			<div className="relative">
				<Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
				<input
					type="text"
					placeholder="Cari pemain..."
					value={search}
					onChange={(e) => setSearch(e.target.value)}
					className="w-full bg-white/5 border border-white/10 rounded-xl pl-10 pr-9 py-2.5 text-sm text-white placeholder:text-white/20 focus:outline-none focus:border-teal-500/50"
				/>
				{search && (
					<button onClick={() => setSearch("")} className="absolute right-3 top-1/2 -translate-y-1/2">
						<X className="w-4 h-4 text-white/30" />
					</button>
				)}
			</div>

			{/* Rarity filter */}
			<div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-hide">
				<Filter className="w-3.5 h-3.5 text-white/30 shrink-0" />
				{["all", ...RARITY_ORDER].map((r) => (
					<button
						key={r}
						onClick={() => setFilter(r)}
						className={cn(
							"px-3 py-1.5 rounded-lg text-xs font-bold uppercase whitespace-nowrap transition-all shrink-0",
							filter === r
								? r === "all"
									? "bg-teal-500/20 text-teal-400 border border-teal-500/30"
									: `${RARITY_STYLES[r as Rarity].border} ${RARITY_STYLES[r as Rarity].text} bg-white/5`
								: "bg-white/5 text-white/30 border border-white/10",
						)}
					>
						{r === "all" ? "Semua" : r.charAt(0).toUpperCase() + r.slice(1)}
					</button>
				))}
			</div>

			{/* Cards grid */}
			{isLoading ? (
				<SkeletonGrid />
			) : filtered.length === 0 ? (
				<EmptyState />
			) : (
				<div className="grid grid-cols-4 sm:grid-cols-5 gap-2">
					{filtered.map((item) => (
						<Card key={item.id} item={item} />
					))}
				</div>
			)}
		</div>
	);
}

function Card({ item }: { item: InventoryItem }) {
	const styles = RARITY_STYLES[item.rarity];
	return (
		<div className={cn(
			"aspect-[3/4] rounded-xl border-2 bg-gradient-to-br p-1.5 flex flex-col items-center justify-between cursor-pointer hover:scale-105 transition-transform",
			styles.border,
			styles.bg,
		)}>
			<span className={`text-[8px] font-black uppercase ${styles.text}`}>{item.rarity}</span>
			<div className={`w-8 h-8 rounded-full bg-white/10 flex items-center justify-center text-sm font-black ${styles.text}`}>
				{item.overall_rating}
			</div>
			<div className="text-center w-full">
				<p className="text-[8px] font-bold text-white/80 leading-tight line-clamp-2">{item.player_name.split(" ")[0]}</p>
				<p className="text-[7px] text-white/30 mt-0.5">{item.position_primary}</p>
			</div>
		</div>
	);
}

function EmptyState() {
	const router = useRouter();
	return (
		<div className="text-center py-16 space-y-4">
			<BookOpen className="w-12 h-12 text-white/10 mx-auto" />
			<h3 className="text-base font-black uppercase text-white/30">Belum ada kartu</h3>
			<p className="text-sm text-white/20 max-w-xs mx-auto">
				Buka pack untuk mulai mengumpulkan kartu pemain!
			</p>
			<button
				onClick={() => router.push("/ngolah-bola/packs")}
				className="inline-flex items-center gap-2 px-6 py-3 bg-teal-500 text-black font-black uppercase text-sm rounded-xl hover:bg-teal-400 transition-colors"
			>
				Buka Pack
			</button>
		</div>
	);
}

function SkeletonGrid() {
	return (
		<div className="grid grid-cols-4 sm:grid-cols-5 gap-2">
			{Array.from({ length: 10 }).map((_, i) => (
				<div key={i} className="aspect-[3/4] rounded-xl bg-white/5 animate-pulse" />
			))}
		</div>
	);
}
