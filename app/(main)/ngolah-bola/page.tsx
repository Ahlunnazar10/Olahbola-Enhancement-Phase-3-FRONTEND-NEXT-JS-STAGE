"use client";

import { useRouter } from "next/navigation";
import {
	Zap,
	Gem,
	Coins,
	Flame,
	ArrowRight,
	Package,
	Swords,
	Play,
} from "lucide-react";
import {
	useNgolahBolaProfile,
	useNgolahBolaEnergy,
	useNgolahBolaPointsBalance,
	useDailyRewardStatus,
	useClaimDailyReward,
} from "@/hooks/queries/useNgolahBola";
import { useAuthStore } from "@/stores/authStore";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { useState } from "react";
import { ExchangeModal } from "@/components/games/ngolah-bola/ExchangeModal";

export default function NgolahBolaHome() {
	const router = useRouter();
	const { user } = useAuthStore();
	const { data: profile } = useNgolahBolaProfile();
	const { data: energy } = useNgolahBolaEnergy();
	const { data: pointsData } = useNgolahBolaPointsBalance();
	const { data: dailyReward } = useDailyRewardStatus();
	const { mutate: claimReward, isPending: claiming } = useClaimDailyReward();

	const gems = profile?.total_gems ?? 0;
	const points = pointsData?.points_balance ?? 0;
	const soft = profile?.soft_currency_balance ?? 0;
	const energyCurrent = energy?.energy ?? 0;
	const energyMax = energy?.energy_max ?? 100;
	const streak = profile?.daily_login_streak ?? 0;
	const canClaim = dailyReward && !dailyReward.has_claimed_today;
	const energyPct = Math.round((energyCurrent / energyMax) * 100);
	const [showExchange, setShowExchange] = useState(false);

	const handleClaim = () => {
		const key = `daily_${Date.now()}`;
		claimReward(
			{ idempotency_key: key },
			{
				onSuccess: (data) =>
					toast.success(`Reward hari ke-${data.streak} diklaim!`),
				onError: (err: any) =>
					toast.error(err?.response?.data?.message || "Gagal klaim."),
			},
		);
	};

	// Redirect to packs/inventory/squad if action needed
	const squadCount = 0; // Will be filled by squads API
	const cardCount = profile?.inventory_count ?? 0;

	return (
		<div className="max-w-lg mx-auto px-4 py-6 space-y-6 pb-24">
			{/* ─── Hero Header ─── */}
			<div className="text-center space-y-2 pt-2">
				<div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-teal-500/10 border border-teal-500/20 mb-3">
					{streak > 0 && <Flame className="w-3.5 h-3.5 text-orange-400" />}
					<span className="text-[10px] font-black uppercase tracking-widest text-teal-400">
						{streak > 0 ? `Streak ${streak} hari` : "Selamat Datang"}
					</span>
				</div>
				<h1 className="text-2xl font-black italic uppercase tracking-tight text-white">
					Halo,{" "}
					<span className="text-teal-400">
						{user?.name?.split(" ")[0] ?? "Pemain"}
					</span>
				</h1>
				<p className="text-sm text-white/40">
					Kumpulkan kartu, bangun skuad, taklukkan arena!
				</p>
			</div>

			{/* ─── Currency Strip ─── */}
			<div className="glass-card rounded-2xl p-4 flex items-center justify-between gap-3">
				<CurrencyChip icon={<Gem className="w-4 h-4 fill-teal-300 text-teal-300" />} value={gems} label="Gems" sub="Buka pack" />
				<div className="w-px h-8 bg-white/10" />
				<CurrencyChip
					icon={<Coins className="w-4 h-4 text-yellow-400" />}
					value={points}
					label="Points"
					sub="Tukar gems"
					onClick={() => setShowExchange(true)}
				/>
				<div className="w-px h-8 bg-white/10" />
				<CurrencyChip icon={<Zap className="w-4 h-4 text-amber-400" />} value={`${energyCurrent}`} sub={`${energyMax}`} label="Energi" accent />
				<div className="w-px h-8 bg-white/10" />
				<CurrencyChip icon={<Flame className="w-4 h-4 text-orange-400" />} value={streak} label="Streak" sub="Hari" />
			</div>

			{/* ─── Daily Reward Banner ─── */}
			{canClaim && (
				<button
					onClick={handleClaim}
					disabled={claiming}
					className="w-full rounded-2xl p-4 text-left relative overflow-hidden group border border-yellow-500/30 bg-gradient-to-r from-yellow-500/10 to-orange-500/10 hover:from-yellow-500/15 hover:to-orange-500/15 transition-all"
				>
					<div className="absolute top-0 right-0 w-24 h-24 bg-yellow-400/10 rounded-full blur-2xl -mr-8 -mt-8" />
					<div className="relative flex items-center gap-3">
						<div className="w-10 h-10 rounded-xl bg-yellow-500/20 flex items-center justify-center shrink-0">
							<span className="text-lg">🎁</span>
						</div>
						<div className="flex-1">
							<p className="font-black uppercase text-white text-sm">
								Reward Harian Tersedia!
							</p>
							<p className="text-xs text-white/40">
								Hari ke-{streak} —{" "}
								{streak === 7
									? "Dapatkan Bronze Pack!"
									: `+${dailyReward?.next_reward?.soft_currency ?? 0} gems & +${dailyReward?.next_reward?.points ?? 0} points`}
							</p>
						</div>
						{claiming ? (
							<span className="w-5 h-5 border-2 border-yellow-400/30 border-t-yellow-400 rounded-full animate-spin" />
						) : (
							<ArrowRight className="w-5 h-5 text-yellow-400" />
						)}
					</div>
				</button>
			)}

			{/* ─── Main Actions ─── */}
			<div className="space-y-3">
				<p className="text-[10px] font-black uppercase tracking-widest text-white/20 px-1">
					Pilih aksi
				</p>

				<ActionCard
					href="/ngolah-bola/packs"
					icon={<Package className="w-6 h-6" />}
					title="Buka Pack"
					desc="Dapatkan kartu pemain baru"
					subtitle={cardCount > 0 ? `${cardCount} kartu di inventory` : "Belum punya kartu"}
					gradient="from-purple-600 to-purple-800"
				/>
				<ActionCard
					href="/ngolah-bola/squad"
					icon={<Swords className="w-6 h-6" />}
					title="Build Squad"
					desc="Susun tim impianmu"
					subtitle={squadCount > 0 ? `${squadCount} squad tersedia` : "Belum ada squad"}
					gradient="from-teal-600 to-teal-800"
				/>
				<ActionCard
					href={squadCount > 0 ? "/ngolah-bola/duel" : "/ngolah-bola/squad"}
					icon={<Play className="w-6 h-6" />}
					title="Mulai Duel"
					desc="Tantang lawan di arena"
					subtitle={squadCount > 0 ? "Siap bertarung!" : "Buat squad dulu"}
					gradient="from-rose-600 to-rose-800"
				/>
			</div>

			{/* ─── How it works ─── */}
			<div className="glass-card rounded-2xl p-5">
				<h2 className="font-black uppercase text-white/50 text-xs mb-4 tracking-widest">
					Cara Bermain
				</h2>
				<div className="grid grid-cols-5 gap-1">
					{[
						{ step: "1", label: "Buka Pack", emoji: "📦" },
						{ step: "2", label: "Kumpul\nKartu", emoji: "🃏" },
						{ step: "3", label: "Build\nSquad", emoji: "⚽" },
						{ step: "4", label: "Duel\nLawan", emoji: "⚔️" },
						{ step: "5", label: "Menang\nReward", emoji: "🏆" },
					].map((s, i) => (
						<div key={i} className="text-center space-y-1.5">
							<div className="w-9 h-9 rounded-full bg-teal-500/15 border border-teal-500/30 flex items-center justify-center mx-auto text-base">
								{s.emoji}
							</div>
							<p className="text-[9px] font-bold text-white/40 leading-tight whitespace-pre-line">
								{s.label}
							</p>
						</div>
					))}
				</div>
			</div>

			{/* ─── Exchange Modal Overlay ─── */}
			{showExchange && (
				<ExchangeModal
					pointsBalance={points}
					onClose={() => setShowExchange(false)}
				/>
			)}
		</div>
	);
}

function CurrencyChip({
	icon,
	value,
	label,
	sub,
	accent,
	onClick,
}: {
	icon: React.ReactNode;
	value: number | string;
	label: string;
	sub: string;
	accent?: boolean;
	onClick?: () => void;
}) {
	return (
		<button
			type="button"
			onClick={onClick}
			className={cn(
				"flex-1 flex flex-col items-center gap-1",
				onClick && "cursor-pointer hover:opacity-80 transition-opacity",
			)}
		>
			<div className="flex items-center gap-1">
				{icon}
				<span className={cn("text-base font-black", accent ? "text-white" : "text-white")}>
					{value}
				</span>
			</div>
			<p className="text-[9px] font-bold uppercase tracking-wider text-white/40">{label}</p>
			<p className="text-[8px] text-white/20">{sub}</p>
		</button>
	);
}

function ActionCard({
	href,
	icon,
	title,
	desc,
	subtitle,
	gradient,
}: {
	href: string;
	icon: React.ReactNode;
	title: string;
	desc: string;
	subtitle: string;
	gradient: string;
}) {
	const router = useRouter();
	return (
		<button
			onClick={() => router.push(href)}
			className="w-full glass-card rounded-2xl p-4 flex items-center gap-4 text-left hover:border-white/20 transition-all group"
		>
			<div
				className={cn(
					"w-14 h-14 rounded-xl bg-linear-to-br flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform",
					gradient,
				)}
			>
				{icon}
			</div>
			<div className="flex-1 min-w-0">
				<h3 className="font-black uppercase tracking-wide text-white text-sm">{title}</h3>
				<p className="text-xs text-white/40 mt-0.5">{desc}</p>
				<p className="text-[10px] text-white/25 mt-0.5">{subtitle}</p>
			</div>
			<ArrowRight className="w-5 h-5 text-white/20 group-hover:text-white/60 transition-colors shrink-0" />
		</button>
	);
}
