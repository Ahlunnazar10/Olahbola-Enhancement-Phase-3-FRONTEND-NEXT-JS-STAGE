import { Check, Crown, ShieldCheck } from "lucide-react";

interface PricingCardProps {
	priceIdr: number;
	onBuy: () => void;
	isLoading?: boolean;
	isDark: boolean;
}

export function PricingCard({ priceIdr, onBuy, isLoading, isDark }: PricingCardProps) {
	const features = [
		"Full akses semua games & quiz",
		"Prediksi skor tanpa batasan",
		"Leaderboard khusus member",
		"Akses konten premium",
	];

	return (
		<div className="max-w-md w-full">
			<div
				className={`rounded-3xl p-8 border transition-all duration-300 ${
					isDark
						? "bg-[#1c211e]/80 backdrop-blur-md border-[#00c2b1]/30 shadow-[0_0_40px_rgba(0,194,177,0.15)]"
						: "bg-white/90 backdrop-blur-md border-[#0a7c6e]/20 shadow-xl"
				}`}
			>
				<div className="text-center mb-8">
					<div
						className={`inline-flex items-center justify-center w-16 h-16 rounded-2xl mb-4 ${
							isDark
								? "bg-[#00c2b1]/20 text-[#00c2b1]"
								: "bg-[#0a7c6e]/20 text-[#0a7c6e]"
						}`}
					>
						<Crown className="w-8 h-8" />
					</div>
					<h2
						className={`font-headline-md uppercase italic mb-2 ${
							isDark ? "text-white" : "text-[#1a1a1a]"
						}`}
					>
						Olahbola Premium
					</h2>
					<p
						className={`text-sm ${isDark ? "text-white/60" : "text-[#5a5a5a]"}`}
					>
						Member Premium untuk pengalaman lengkap
					</p>
				</div>

				<div className="text-center mb-8">
					<div className="flex items-baseline justify-center gap-1">
						<span
							className={`text-lg font-semibold ${
								isDark ? "text-white/60" : "text-[#5a5a5a]"
							}`}
						>
							Rp
						</span>
						<span
							className={`font-display-xl ${
								isDark ? "text-[#00c2b1]" : "text-[#0a7c6e]"
							}`}
						>
							{priceIdr.toLocaleString("id-ID")}
						</span>
					</div>
					<p
						className={`text-sm mt-1 ${isDark ? "text-white/50" : "text-[#5a5a5a]"}`}
					>
						Sekali bayar, akses selamanya
					</p>
				</div>

				<div className="space-y-3 mb-8">
					{features.map((feature) => (
						<div key={feature} className="flex items-center gap-3">
							<Check
								className={`w-5 h-5 shrink-0 ${
									isDark ? "text-[#00c2b1]" : "text-[#0a7c6e]"
								}`}
							/>
							<span
								className={`text-sm ${
									isDark ? "text-white/80" : "text-[#1a1a1a]"
								}`}
							>
								{feature}
							</span>
						</div>
					))}
				</div>

				<button
					onClick={onBuy}
					disabled={isLoading}
					className={`w-full py-4 rounded-xl text-base font-bold uppercase tracking-widest transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed hover:scale-[1.02] active:scale-[0.98] ${
						isDark
							? "bg-[#00c2b1] text-black shadow-[0_0_25px_rgba(64,220,202,0.4)] hover:shadow-[0_0_35px_rgba(64,220,202,0.6)]"
							: "bg-[#0a7c6e] text-white hover:bg-[#095a50] shadow-lg"
					}`}
				>
					{isLoading ? (
						<span className="flex items-center justify-center gap-2">
							<ShieldCheck className="w-5 h-5 animate-pulse" />
							Memproses...
						</span>
					) : (
						"Beli Premium"
					)}
				</button>

				<div
					className={`mt-6 flex items-center justify-center gap-2 text-xs ${
						isDark ? "text-white/40" : "text-[#5a5a5a]"
					}`}
				>
					<ShieldCheck className="w-4 h-4" />
					<span>Pembayaran Aman & Terenkripsi</span>
				</div>
			</div>
		</div>
	);
}
