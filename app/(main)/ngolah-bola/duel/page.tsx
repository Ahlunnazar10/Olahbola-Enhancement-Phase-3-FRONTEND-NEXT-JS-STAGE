"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useState } from "react";
import {
	Swords, ArrowLeft, Zap, Gem as GemIcon, Coins,
	Trophy, RefreshCw, Shield, ShieldOff, Activity, Play,
	Flame, Wind, Snowflake,
} from "lucide-react";
import {
	useSquads,
	useSquadDetail,
	useDuelChallenge,
	useDuelHistory,
	useRefillEnergy,
	useNgolahBolaEnergy,
} from "@/hooks/queries/useNgolahBola";
import { PlayerCard, PlayerCardList } from "@/components/games/ngolah-bola/PlayerCard";
import type { Tactic, DuelResult, DuelHistoryEntry } from "@/types/ngolahBola";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { Suspense as ReactSuspense } from "react";

const TACTICS: { key: Tactic; label: string; desc: string; beats: string; icon: any; color: string }[] = [
	{ key: "attacking", label: "Attack", desc: "Serang habis", beats: "Defensive", icon: ShieldOff, color: "from-rose-500 to-orange-500" },
	{ key: "defensive", label: "Defend", desc: "Pertahanan kuat", beats: "Counter", icon: Shield, color: "from-blue-500 to-indigo-500" },
	{ key: "counter", label: "Counter", desc: "Balas cepat", beats: "Attacking", icon: Activity, color: "from-green-500 to-teal-500" },
	{ key: "highPress", label: "High Press", desc: "Tekan lawan di area pertahanan mereka sendiri", beats: "Possession", icon: Flame, color: "from-orange-500 to-amber-500" },
	{ key: "possessionPlay", label: "Possession", desc: "Menguasai bola lama untuk mengontrol pertandingan (tiki-taka)", beats: "High Press", icon: Wind, color: "from-cyan-500 to-blue-500" },
	{ key: "lowBlock", label: "Low Block", desc: "Bertahan rapat dan dalam di area sendiri", beats: "Attacking", icon: Snowflake, color: "from-slate-400 to-slate-600" },
];

type SquadPlayerDisplay = { slot: string; card_id: string; player_name: string; position_primary: string; overall_rating: number; rarity: "bronze" | "silver" | "gold" | "legend" };

function getPlayerCards(squad: { players?: any[] }): SquadPlayerDisplay[] {
	if (!squad?.players) return [];
	return squad.players.map((p: any) => ({
		slot: p.slot,
		card_id: p.card_id,
		player_name: p.player_name,
		position_primary: p.position_primary,
		overall_rating: p.overall_rating,
		rarity: (p.rarity ?? "bronze") as SquadPlayerDisplay["rarity"],
	}));
}

function avgRating(players: any[], slotKeys: string[]): number {
	const filtered = players?.filter((p: any) => slotKeys.includes(p.slot)) ?? [];
	if (!filtered.length) return 0;
	return Math.round(filtered.reduce((sum: number, p: any) => sum + (p.overall_rating ?? 0), 0) / filtered.length);
}

function DuelPageInner() {
	const router = useRouter();
	const searchParams = useSearchParams();
	const preselectedSquad = searchParams.get("squad");

	const { data: squads, isLoading: squadsLoading } = useSquads();
	const { data: energy } = useNgolahBolaEnergy();
	const { data: history } = useDuelHistory();
	const { mutate: challenge, isPending } = useDuelChallenge();
	const { mutate: refillEnergy } = useRefillEnergy();

	const [selectedSquad, setSelectedSquad] = useState<string>(preselectedSquad ?? "");
	const [selectedTactic, setSelectedTactic] = useState<Tactic | null>(null);
	const [battleResult, setBattleResult] = useState<DuelResult | null>(null);
	const [showHistory, setShowHistory] = useState(false);

	const energyCurrent = energy?.energy ?? 0;
	const canPlay = selectedSquad && selectedTactic && energyCurrent >= 10;
	useSquadDetail(selectedSquad ?? "");

	const handleChallenge = () => {
		if (!selectedSquad || !selectedTactic) {
			toast.error("Pilih squad dan taktik.");
			return;
		}
		if (energyCurrent < 10) {
			toast.error("Energi tidak cukup!", {
				description: "Butuh 10 energi.",
				action: { label: "Isi Ulang", onClick: () => router.push("/ngolah-bola/rewards") },
			});
			return;
		}
		const key = `duel_${selectedSquad}_${Date.now()}`;
		challenge(
			{ squad_id: selectedSquad, tactic: selectedTactic, idempotency_key: key },
			{ onSuccess: (data) => setBattleResult(data), onError: (err: any) => toast.error(err?.response?.data?.message || "Gagal duel.") },
		);
	};

	const handleRefill = (amount = 50) => {
		refillEnergy({ amount }, {
			onSuccess: () => toast.success(`+${amount} energi!`),
			onError: (err: any) => toast.error(err?.response?.data?.message || "Gagal isi energi."),
		});
	};

	if (squadsLoading) return <Skeleton />;

	return (
		<div className="max-w-lg mx-auto px-4 py-6 space-y-5 pb-24">
			{/* Header */}
			<div className="flex items-center justify-between">
				<div className="flex items-center gap-3">
					<button onClick={() => router.back()} className="w-9 h-9 rounded-xl bg-white/5 flex items-center justify-center hover:bg-white/10 transition-colors">
						<ArrowLeft className="w-4 h-4 text-white/60" />
					</button>
					<div>
						<h1 className="text-lg font-black italic uppercase text-white">Duel Arena</h1>
						<p className="text-xs text-white/40">{energyCurrent}/100 energi</p>
					</div>
				</div>
				<button onClick={() => setShowHistory(!showHistory)} className="px-3 py-2 bg-white/5 text-white/50 text-xs font-bold uppercase rounded-xl hover:bg-white/10 transition-colors">
					Riwayat
				</button>
			</div>

			{/* Low energy warning */}
			{energyCurrent < 10 && (
				<div className="glass-card rounded-xl p-4 bg-amber-500/10 border border-amber-500/30 flex items-center justify-between">
					<div className="flex items-center gap-2 text-amber-400">
						<Zap className="w-5 h-5" />
						<span className="text-sm font-bold">Energi hampir habis!</span>
					</div>
					<button onClick={() => handleRefill(50)} className="px-4 py-2 bg-amber-500 text-black font-black uppercase text-xs rounded-xl hover:bg-amber-400 transition-colors">
						Isi (50g)
					</button>
				</div>
			)}

			{!battleResult ? (
				<>
					{/* Squad selection with player cards */}
					<div className="glass-card rounded-2xl p-4 space-y-3">
						<h2 className="font-black uppercase text-white text-sm flex items-center gap-2">
							<span className="w-5 h-5 rounded-full bg-teal-500/20 text-teal-400 text-[10px] font-black flex items-center justify-center">1</span>
							Pilih Squad
						</h2>
						{!squads || squads.length === 0 ? (
							<div className="text-center py-4 text-white/30 text-sm">
								Belum ada squad.
								<button onClick={() => router.push("/ngolah-bola/squad")} className="ml-2 text-teal-400 underline">
									Buat Squad
								</button>
							</div>
						) : (
							<div className="space-y-2">
								{squads.map((s) => (
									<button
										key={s.id}
										onClick={() => setSelectedSquad(s.id)}
										className={cn(
											"w-full rounded-xl border-2 transition-all text-left overflow-hidden",
											selectedSquad === s.id ? "border-teal-500 bg-teal-500/10" : "border-white/5 bg-white/5 hover:border-white/20",
										)}
									>
										{/* Squad header row */}
										<div className="flex items-center gap-3 p-3">
											<div className="w-10 h-10 rounded-lg bg-rose-500/20 flex items-center justify-center shrink-0">
												<Swords className="w-5 h-5 text-rose-400" />
											</div>
											<div className="flex-1 min-w-0">
												<p className="text-sm font-black text-white uppercase truncate">{s.name}</p>
												<p className="text-[10px] text-white/40">{s.formation} · {s.filled_slots ?? s.players?.length ?? 0} pemain</p>
												<div className="flex gap-2 mt-1">
													<span className="text-[9px] font-bold text-teal-400 bg-teal-500/10 px-1.5 py-0.5 rounded">ATK {avgRating(s.players ?? [], ["ST", "LW", "RW", "CAM"])}</span>
													<span className="text-[9px] font-bold text-blue-400 bg-blue-500/10 px-1.5 py-0.5 rounded">MID {avgRating(s.players ?? [], ["CDM", "CM", "LM", "RM"])}</span>
													<span className="text-[9px] font-bold text-green-400 bg-green-500/10 px-1.5 py-0.5 rounded">DEF {avgRating(s.players ?? [], ["LB", "CB", "RB", "LWB", "RWB"])}</span>
												</div>
											</div>
											{selectedSquad === s.id && (
												<div className="w-5 h-5 rounded-full bg-teal-500 flex items-center justify-center shrink-0">
													<svg className="w-3 h-3 text-black" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>
												</div>
											)}
										</div>

										{/* Player cards row */}
										{selectedSquad === s.id && s.players && (
											<div className="px-3 pb-3">
												<PlayerCardList players={getPlayerCards(s)} size="sm" />
											</div>
										)}
									</button>
								))}
							</div>
						)}
					</div>

					{/* Tactic selection — 6 options */}
					<div className="glass-card rounded-2xl p-4 space-y-3">
						<h2 className="font-black uppercase text-white text-sm flex items-center gap-2">
							<span className="w-5 h-5 rounded-full bg-rose-500/20 text-rose-400 text-[10px] font-black flex items-center justify-center">2</span>
							Pilih Taktik
						</h2>
						<p className="text-[10px] text-white/30">Attack {'>'} Defend {'>'} Counter {'>'} Attack</p>
						<div className="grid grid-cols-3 gap-2">
							{TACTICS.map((t) => {
								const Icon = t.icon;
								return (
									<button
										key={t.key}
										onClick={() => setSelectedTactic(t.key)}
										className={cn(
											"p-2.5 rounded-xl border-2 transition-all text-center",
											selectedTactic === t.key
												? "border-teal-500 bg-teal-500/10"
												: "border-white/5 bg-white/5 hover:border-white/20",
										)}
									>
										<div className={`w-8 h-8 rounded-lg bg-gradient-to-br ${t.color} flex items-center justify-center mx-auto mb-1.5`}>
											<Icon className="w-4 h-4 text-white" />
										</div>
										<p className="text-[10px] font-black uppercase text-white leading-tight">{t.label}</p>
										<p className="text-[8px] text-white/30 mt-0.5 leading-tight">{t.beats}</p>
									</button>
								);
							})}
						</div>
						{/* Tactics hint */}
						{selectedTactic && (
							<p className="text-[10px] text-white/50 px-1">
								{(() => {
									const t = TACTICS.find((t) => t.key === selectedTactic);
									return t ? t.desc : "";
								})()}
							</p>
						)}
					</div>

					{/* Interactive Play button */}
					<button
						onClick={() => {
							if (!canPlay) return;
							router.push(`/ngolah-bola/duel/play?squadId=${selectedSquad}&tactic=${selectedTactic}&mode=bot`);
						}}
						disabled={!canPlay}
						className={cn(
							"w-full py-4 rounded-2xl font-black uppercase tracking-wider text-sm flex items-center justify-center gap-2 transition-all",
							canPlay
								? "bg-gradient-to-r from-teal-500 to-emerald-500 text-black hover:from-teal-400 hover:to-emerald-400 shadow-lg shadow-teal-500/20"
								: "bg-white/5 text-white/20 cursor-not-allowed",
						)}
					>
						<Play className="w-5 h-5 fill-black" />
						{"MAIN SEKARANG! (-10 Energi)"}
					</button>

					{/* Quick Challenge button */}
					<button
						onClick={handleChallenge}
						disabled={!canPlay || isPending}
						className={cn(
							"w-full py-3 rounded-2xl font-black uppercase tracking-wider text-xs flex items-center justify-center gap-2 transition-all",
							canPlay && !isPending
								? "bg-white/5 text-white/60 hover:bg-white/10 border border-white/10"
								: "bg-white/5 text-white/20 cursor-not-allowed border border-white/5",
						)}
					>
						{isPending ? (
							<span className="w-3 h-3 border-2 border-white/30 border-t-white rounded-full animate-spin" />
						) : (
							<RefreshCw className="w-3.5 h-3.5" />
						)}
						{"TANTANG CEPAT (tanpa game)"}
					</button>
				</>
			) : (
				<BattleResult result={battleResult} onAgain={() => { setBattleResult(null); setSelectedTactic(null); }} />
			)}

			{/* History */}
			{showHistory && (
				<div className="glass-card rounded-2xl p-4 space-y-3">
					<h2 className="font-black uppercase text-white text-sm">Riwayat Duel</h2>
					{!history || history.length === 0 ? (
						<p className="text-sm text-white/30 text-center py-4">Belum ada duel.</p>
					) : (
						<div className="space-y-2">
							{history.map((h) => <DuelRow key={h.id} entry={h} />)}
						</div>
					)}
				</div>
			)}
		</div>
	);
}

function BattleResult({ result, onAgain }: { result: DuelResult; onAgain: () => void }) {
	const isWin = result.result === "win";
	const isDraw = result.result === "draw";
	return (
		<div className="glass-card rounded-2xl p-5 space-y-5">
			<div className={cn("text-center py-6 rounded-2xl border",
				isWin ? "bg-teal-500/10 border-teal-500/30" :
				isDraw ? "bg-yellow-500/10 border-yellow-500/30" :
				"bg-red-500/10 border-red-500/30"
			)}>
				<Trophy className={cn("w-10 h-10 mx-auto mb-2", isWin ? "text-teal-400" : isDraw ? "text-yellow-400" : "text-red-400")} />
				<h2 className={cn("text-2xl font-black italic uppercase",
					isWin ? "text-teal-400" : isDraw ? "text-yellow-400" : "text-red-400"
				)}>
					{isWin ? "MENANG!" : isDraw ? "SERI!" : "KALAH!"}
				</h2>
				<p className="text-sm text-white/50 mt-1">{result.my_score.toFixed(1)} — {result.opponent_score.toFixed(1)}</p>
			</div>

			<div className="space-y-2">
				{(["attack", "midfield", "defense"] as const).map((line) => (
					<div key={line} className="flex items-center gap-3">
						<span className="text-[10px] font-bold uppercase text-white/40 w-16">{line}</span>
						<div className="flex-1 h-2 bg-white/5 rounded-full overflow-hidden flex">
							<div className="h-full bg-teal-400 rounded-l-full" style={{ width: `${(result.score_breakdown[line].my / (result.score_breakdown[line].my + result.score_breakdown[line].opponent)) * 100}%` }} />
							<div className="h-full bg-rose-400 rounded-r-full" style={{ width: `${(result.score_breakdown[line].opponent / (result.score_breakdown[line].my + result.score_breakdown[line].opponent)) * 100}%` }} />
						</div>
						<span className="text-xs text-white/50 w-16 text-right">{result.score_breakdown[line].my.toFixed(1)}-{result.score_breakdown[line].opponent.toFixed(1)}</span>
					</div>
				))}
			</div>

			<div className="grid grid-cols-3 gap-2">
				<RewardBox icon={<Zap className="w-4 h-4 text-amber-400" />} label="Energi" value={`-${result.energy.spent} +${result.energy.refunded}`} sub={`${result.energy.remaining}/${result.energy.max}`} />
				<RewardBox icon={<GemIcon className="w-4 h-4 text-teal-300" />} label="Gems" value={`${result.reward.gems_won >= 0 ? '+' : ''}${result.reward.gems_won}`} sub={`${result.reward.total_gems} total`} />
				<RewardBox icon={<Coins className="w-4 h-4 text-yellow-400" />} label="Points" value={`+${result.reward.points_earned ?? 0}`} sub="100 pts = 1 gem" />
			</div>

			<p className="text-center text-xs text-white/30">
				Rekor: {result.duel_record.won}W / {result.duel_record.lost}L / {result.duel_record.played - result.duel_record.won - result.duel_record.lost}D
			</p>

			<button onClick={onAgain} className="w-full py-4 bg-rose-500 text-white font-black uppercase tracking-wider rounded-2xl hover:bg-rose-400 transition-all flex items-center justify-center gap-2">
				<RefreshCw className="w-4 h-4" />
				Duel Lagi
			</button>
		</div>
	);
}

function RewardBox({ icon, label, value, sub }: { icon: React.ReactNode; label: string; value: string; sub: string }) {
	return (
		<div className="bg-white/5 rounded-xl p-3 text-center space-y-1">
			<div className="flex justify-center">{icon}</div>
			<p className="text-xs font-bold text-white/50 uppercase">{label}</p>
			<p className="text-sm font-black text-white">{value}</p>
			<p className="text-[9px] text-white/30">{sub}</p>
		</div>
	);
}

function DuelRow({ entry }: { entry: DuelHistoryEntry }) {
	const isWin = entry.result === "win";
	const isDraw = entry.result === "draw";
	return (
		<div className={cn("flex items-center gap-3 p-3 rounded-xl", isWin ? "bg-teal-500/10" : isDraw ? "bg-yellow-500/10" : "bg-red-500/10")}>
			<span className={cn("text-xs font-black uppercase w-10", isWin ? "text-teal-400" : isDraw ? "text-yellow-400" : "text-red-400")}>
				{isWin ? "WIN" : isDraw ? "DRAW" : "LOSE"}
			</span>
			<div className="flex-1">
				<p className="text-xs text-white/60">{entry.my_tactic} vs {entry.opponent_tactic}</p>
				<p className="text-[10px] text-white/30">{new Date(entry.created_at).toLocaleDateString("id-ID")}</p>
			</div>
			<div className="text-right">
				<p className="text-xs font-bold text-yellow-400">+{entry.points_earned} pts</p>
				<p className="text-[10px] text-teal-400">+{entry.gems_won} gems</p>
			</div>
		</div>
	);
}

function Skeleton() {
	return (
		<div className="max-w-lg mx-auto px-4 py-6 space-y-4">
			<div className="h-7 w-32 bg-white/5 rounded-lg animate-pulse" />
			{[1, 2, 3].map((i) => <div key={i} className="glass-card rounded-2xl p-4 animate-pulse space-y-3"><div className="h-4 w-24 bg-white/5 rounded" /><div className="h-12 w-full bg-white/5 rounded-xl" /></div>)}
		</div>
	);
}

export default function DuelPage() {
	return (
		<ReactSuspense fallback={<Skeleton />}>
			<DuelPageInner />
		</ReactSuspense>
	);
}
