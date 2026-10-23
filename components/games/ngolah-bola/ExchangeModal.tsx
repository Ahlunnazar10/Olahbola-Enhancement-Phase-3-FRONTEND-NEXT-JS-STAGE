"use client";

import { Coins, X, Gem } from "lucide-react";
import { useState } from "react";
import { useExchangePoints } from "@/hooks/queries/useNgolahBola";
import { toast } from "sonner";

const EXCHANGE_RATE = 100; // 100 points = 1 gem

export function ExchangeModal({
	pointsBalance,
	onClose,
}: {
	pointsBalance: number;
	onClose: () => void;
}) {
	const [amount, setAmount] = useState("");
	const { mutate: exchange, isPending } = useExchangePoints();

	const pts = parseInt(amount, 10);
	const gemsReceive = Number.isInteger(pts)
		? Math.floor(pts / EXCHANGE_RATE)
		: 0;
	const isValid =
		pts >= EXCHANGE_RATE && pts <= pointsBalance && pts % EXCHANGE_RATE === 0;

	const handleSubmit = () => {
		if (!isValid) return;
		const key = `exchange_${Date.now()}`;
		exchange(
			{ points_amount: pts, idempotency_key: key },
			{
				onSuccess: (data) => {
					toast.success(`${data.gems_received} gems ditambahkan!`);
					onClose();
				},
				onError: (err: any) => {
					toast.error(err?.response?.data?.message || "Gagal menukar points.");
				},
			},
		);
	};

	return (
		<div className="fixed inset-0 z-99 flex items-center justify-center px-4">
			{/* backdrop */}
			<div
				className="absolute inset-0 bg-black/70 backdrop-blur-sm"
				onClick={onClose}
			/>

			{/* card */}
			<div className="relative w-full max-w-sm rounded-3xl border border-white/10 bg-[#0f1412]/95 p-6 shadow-2xl">
				<button
					onClick={onClose}
					className="absolute top-4 right-4 text-white/30 hover:text-white/70 transition-colors"
				>
					<X className="w-5 h-5" />
				</button>

				<div className="flex items-center gap-3 mb-6">
					<div className="w-10 h-10 rounded-xl bg-yellow-500/15 flex items-center justify-center">
						<Coins className="w-5 h-5 text-yellow-400" />
					</div>
					<div>
						<h2 className="font-black uppercase text-white text-sm tracking-wide">
							Tukar Points
						</h2>
						<p className="text-[10px] text-white/40">
							{pointsBalance} points tersedia
						</p>
					</div>
				</div>

				{/* rate info */}
				<div className="flex items-center gap-2 mb-5 px-3 py-2.5 rounded-xl bg-white/5 border border-white/10">
					<Coins className="w-4 h-4 text-yellow-400 shrink-0" />
					<span className="text-xs text-white/50">{EXCHANGE_RATE} Points</span>
					<span className="text-white/20">→</span>
					<Gem className="w-4 h-4 fill-teal-300 text-teal-300 shrink-0" />
					<span className="text-xs text-white/50">1 Gem</span>
				</div>

				{/* amount input */}
				<div className="space-y-2 mb-5">
					<label className="text-[10px] font-bold uppercase tracking-wider text-white/40">
						Jumlah Points
					</label>
					<input
						type="number"
						min={EXCHANGE_RATE}
						max={pointsBalance}
						step={EXCHANGE_RATE}
						value={amount}
						onChange={(e) => setAmount(e.target.value)}
						placeholder={`Kelipatan ${EXCHANGE_RATE}`}
						className="w-full rounded-xl bg-white/5 border border-white/15 px-4 py-3 text-white font-black text-lg placeholder:text-white/20 outline-none focus:border-teal-500/60 transition-colors"
					/>
					{amount && !Number.isNaN(pts) && (
						<p className="text-[11px] text-teal-400/70 font-medium">
							Dapat {gemsReceive} Gems
						</p>
					)}
					{amount && !isValid && pts > 0 && (
						<p className="text-[11px] text-red-400/70">
							{pts > pointsBalance
								? "Points tidak cukup"
								: `Kelipatan ${EXCHANGE_RATE} saja`}
						</p>
					)}
				</div>

				<button
					onClick={handleSubmit}
					disabled={!isValid || isPending}
					className="w-full py-3 rounded-xl font-black uppercase tracking-wide text-sm transition-all disabled:opacity-30 disabled:cursor-not-allowed bg-gradient-to-r from-yellow-500 to-orange-500 text-black hover:from-yellow-400 hover:to-orange-400 active:scale-[0.98]"
				>
					{isPending ? (
						<span className="flex items-center justify-center gap-2">
							<span className="w-4 h-4 border-2 border-black/30 border-t-black rounded-full animate-spin" />
							Memproses…
						</span>
					) : (
						" Tukar Sekarang"
					)}
				</button>
			</div>
		</div>
	);
}
