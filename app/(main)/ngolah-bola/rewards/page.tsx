"use client";

import { useState } from "react";
import { CalendarCheck, Star, Gem as GemIcon, Coins, Zap, ArrowLeft, CheckCircle, Clock } from "lucide-react";
import {
	useDailyRewardStatus,
	useClaimDailyReward,
	useExchangePoints,
	useNgolahBolaProfile,
	useNgolahBolaPointsBalance,
	useNgolahBolaEnergy,
	useRefillEnergy,
} from "@/hooks/queries/useNgolahBola";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { generateId } from "@/lib/utils";
import { cn } from "@/lib/utils";

const REWARD_TIERS = [
	{ day: 1, soft: 50, hard: 0, points: 0 },
	{ day: 2, soft: 75, hard: 0, points: 0 },
	{ day: 3, soft: 100, hard: 0, points: 5 },
	{ day: 4, soft: 150, hard: 0, points: 0 },
	{ day: 5, soft: 200, hard: 0, points: 0 },
	{ day: 6, soft: 250, hard: 0, points: 10 },
	{ day: 7, soft: 300, hard: 0, points: 0, pack: "Bronze Pack" },
];

export default function RewardsPage() {
	const router = useRouter();
	const { data: dailyReward } = useDailyRewardStatus();
	const { data: profile } = useNgolahBolaProfile();
	const { data: pointsData } = useNgolahBolaPointsBalance();
	const { mutate: claimReward, isPending: claiming } = useClaimDailyReward();
	const { mutate: exchangePoints, isPending: exchanging } = useExchangePoints();
	const { mutate: refillEnergy, isPending: refilling } = useRefillEnergy();

	const [exchangeAmount, setExchangeAmount] = useState(100);

	const streak = profile?.daily_login_streak ?? 0;
	const canClaim = dailyReward && !dailyReward.has_claimed_today;
	const pointsBalance = pointsData?.points_balance ?? 0;
	const exchangeRate = pointsData?.exchange_rate ?? 100;

	const handleClaim = () => {
		const key = `daily_${new Date().toISOString().split("T")[0]}_${generateId()}`;
		claimReward({ idempotency_key: key }, {
			onSuccess: (data) => toast.success(`Reward hari ke-${data.streak_day}!`),
			onError: (err: any) => toast.error(err?.response?.data?.message || "Gagal klaim."),
		});
	};

	const handleExchange = () => {
		if (pointsBalance < exchangeAmount) {
			toast.error("Points tidak cukup.");
			return;
		}
		const key = `exchange_${Date.now()}_${generateId()}`;
		exchangePoints({ points_amount: exchangeAmount, idempotency_key: key }, {
			onSuccess: (data) => toast.success(`+${data.gems_received} gems!`),
			onError: (err: any) => toast.error(err?.response?.data?.message || "Gagal tukar."),
		});
	};

	const handleRefill = (amount: number) => {
		refillEnergy({ amount }, {
			onSuccess: (data) => toast.success(`+${data.energy_added} energi!`),
			onError: (err: any) => toast.error(err?.response?.data?.message || "Gagal isi energi."),
		});
	};

	return (
		<div className="max-w-lg mx-auto px-4 py-6 space-y-5 pb-24">
			{/* Header */}
			<div className="flex items-center gap-3">
				<button onClick={() => router.back()} className="w-9 h-9 rounded-xl bg-white/5 flex items-center justify-center hover:bg-white/10 transition-colors">
					<ArrowLeft className="w-4 h-4 text-white/60" />
				</button>
				<div>
					<h1 className="text-lg font-black italic uppercase text-white">Rewards</h1>
					<p className="text-xs text-white/40">Streak: <span className="text-orange-400 font-black">{streak} hari</span></p>
				</div>
			</div>

			{/* Daily Reward */}
			<div className="glass-card rounded-2xl p-4 space-y-4">
				<div className="flex items-center justify-between">
					<h2 className="font-black uppercase text-white text-sm flex items-center gap-2">
						<CalendarCheck className="w-4 h-4 text-yellow-400" />
						Reward Harian
					</h2>
					{canClaim && (
						<span className="text-[10px] font-black uppercase tracking-wider bg-yellow-400/20 text-yellow-400 px-2 py-0.5 rounded-full animate-pulse">
							Tersedia!
						</span>
					)}
				</div>

				<div className="grid grid-cols-7 gap-1">
					{REWARD_TIERS.map((tier) => {
						const isPassed = tier.day < streak;
						const isCurrent = tier.day === (canClaim ? (dailyReward?.next_reward_day ?? streak) : Math.min(streak, 7));
						return (
							<div key={tier.day} className="flex flex-col items-center gap-1">
								<div className={cn(
									"w-full aspect-square rounded-lg flex flex-col items-center justify-center text-xs font-black border-2",
									isPassed ? "bg-teal-500/20 border-teal-500/50 text-teal-400" :
									isCurrent ? "bg-yellow-400/20 border-yellow-400/60 text-yellow-300" :
									"bg-white/5 border-white/10 text-white/20",
								)}>
									<span>{tier.day}</span>
									{isPassed && <CheckCircle className="w-2.5 h-2.5 mt-0.5" />}
								</div>
								{tier.pack && <span className="text-[7px] text-purple-400 font-bold">Pack</span>}
							</div>
						);
					})}
				</div>

				{canClaim && (
					<button
						onClick={handleClaim}
						disabled={claiming}
						className="w-full py-3 bg-gradient-to-r from-yellow-500 to-orange-500 text-black font-black uppercase text-sm rounded-xl hover:from-yellow-400 hover:to-orange-400 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
					>
						{claiming ? (
							<span className="w-4 h-4 border-2 border-black/30 border-t-black rounded-full animate-spin" />
						) : (
							<Star className="w-4 h-4 fill-black" />
						)}
						Klaim Reward
					</button>
				)}
				{!canClaim && streak > 0 && (
					<p className="text-center text-xs text-white/30">Sudah diklaim hari ini.</p>
				)}
			</div>

			{/* Points Exchange */}
			<div className="glass-card rounded-2xl p-4 space-y-4">
				<h2 className="font-black uppercase text-white text-sm flex items-center gap-2">
					<Coins className="w-4 h-4 text-yellow-400" />
					Tukar Points
				</h2>
				<div className="grid grid-cols-2 gap-3">
					<div className="bg-white/5 rounded-xl p-3">
						<p className="text-[10px] text-white/40 uppercase font-bold">Points</p>
						<p className="text-2xl font-black text-yellow-400">{pointsBalance}</p>
					</div>
					<div className="bg-white/5 rounded-xl p-3">
						<p className="text-[10px] text-white/40 uppercase font-bold">Gems</p>
						<p className="text-2xl font-black text-teal-300">{profile?.total_gems ?? 0}</p>
					</div>
				</div>
				<div className="space-y-2">
					<div className="flex justify-between text-xs text-white/40">
						<span>Jumlah</span>
						<span className="font-bold text-white">{exchangeAmount} pts = {Math.floor(exchangeAmount / exchangeRate)} gems</span>
					</div>
					<input
						type="range"
						min={exchangeRate}
						max={Math.min(pointsBalance, 1000)}
						step={exchangeRate}
						value={exchangeAmount}
						onChange={(e) => setExchangeAmount(Number(e.target.value))}
						className="w-full accent-teal-500"
					/>
					<div className="flex justify-between text-[10px] text-white/20">
						<span>{exchangeRate} pts = 1 gem</span>
						<span>Maks {pointsBalance}</span>
					</div>
				</div>
				<button
					onClick={handleExchange}
					disabled={exchanging || pointsBalance < exchangeAmount}
					className="w-full py-3 bg-teal-500/20 text-teal-400 font-black uppercase text-xs tracking-wider rounded-xl hover:bg-teal-500/30 transition-colors disabled:opacity-30 flex items-center justify-center gap-2"
				>
					<Trophy className="w-4 h-4" />
					Tukar {exchangeAmount} Points → {Math.floor(exchangeAmount / exchangeRate)} Gems
				</button>
			</div>

			{/* Energy Refill */}
			<div className="glass-card rounded-2xl p-4 space-y-3">
				<h2 className="font-black uppercase text-white text-sm flex items-center gap-2">
					<Zap className="w-4 h-4 text-amber-400" />
					Isi Ulang Energi
				</h2>
				<p className="text-xs text-white/40">1 gem = 1 energi. Maks 100.</p>
				<div className="grid grid-cols-3 gap-2">
					{[10, 30, 50].map((amt) => (
						<EnergyBtn key={amt} amount={amt} onClick={handleRefill} isPending={refilling} />
					))}
				</div>
			</div>
		</div>
	);
}

function EnergyBtn({ amount, onClick, isPending }: { amount: number; onClick: (a: number) => void; isPending: boolean }) {
	const { data: energy } = useNgolahBolaEnergy();
	const { data: profile } = useNgolahBolaProfile();
	const current = energy?.energy ?? 0;
	const max = energy?.energy_max ?? 100;
	const gems = profile?.total_gems ?? 0;
	const canAfford = gems >= amount && current + amount <= max;

	return (
		<button
			onClick={() => canAfford && onClick(amount)}
			disabled={!canAfford || isPending}
			className={cn(
				"py-3 rounded-xl text-xs font-black uppercase transition-all",
				canAfford
					? "bg-amber-500/20 text-amber-400 border border-amber-500/30 hover:bg-amber-500/30"
					: "bg-white/5 text-white/20 border border-white/10 cursor-not-allowed",
			)}
		>
			{isPending ? "..." : `+${amount} (${amount}g)`}
		</button>
	);
}

function Trophy({ className }: { className?: string }) {
	return (
		<svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
			<path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6" /><path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18" />
			<path d="M4 22h16" /><path d="M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20.24 7 22" />
			<path d="M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20.24 17 22" />
			<path d="M18 2H6v7a6 6 0 0 0 12 0V2Z" />
		</svg>
	);
}
