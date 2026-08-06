"use client";

import Link from "next/link";
import { RefreshCw, Trophy } from "lucide-react";
import { TierBadge } from "@/components/guess-who/shared/TierBadge";
import {
	TIER_COLORS,
	TIER_LABEL,
	type Tier,
	type TierBreakdown,
} from "@/lib/guessWho/scoring";

const TIERS: Tier[] = ["perfect", "partial", "typo", "wrong"];

export function VawResultScreen({
	score,
	tierBreakdown,
	level,
	onRematch,
	onClose,
}: {
	score: number;
	tierBreakdown: TierBreakdown;
	level: number;
	onRematch: () => void;
	onClose: () => void;
}) {
	const total = (Object.values(tierBreakdown) as number[]).reduce<number>(
		(a, b) => a + b,
		0,
	);
	const correct =
		tierBreakdown.perfect + tierBreakdown.partial + tierBreakdown.typo;

	return (
		<section className="max-w-2xl mx-auto py-3 md:py-8 animate-fade-up">
			<div
				className="glass-panel rounded-3xl p-4 md:p-8 mb-4 text-center"
				style={{
					borderColor: "rgba(0, 194, 177, 0.3)",
					boxShadow: "0 0 40px rgba(0, 194, 177, 0.25)",
				}}
			>
				<h2 className="font-display-xl text-headline-lg uppercase mb-2">
					Full-Time!
				</h2>
				<p
					className="text-sm tracking-widest uppercase mb-2 md:mb-6"
					style={{ color: "#bbcac6" }}
				>
					Level {level}
				</p>
				<div
					className="font-display-xl text-display-xl italic tabular-nums mb-2"
					style={{ color: "#00C2B1" }}
				>
					{score}
				</div>
				<p
					className="text-xs font-black tracking-widest uppercase"
					style={{ color: "#bbcac6" }}
				>
					Total Poin
				</p>
			</div>

			<div className="glass-panel rounded-3xl p-6 mb-4">
				<h3
					className="font-label-bold tracking-widest uppercase mb-4"
					style={{ color: "#bbcac6" }}
				>
					Rincian Jawaban
				</h3>
				<div className="grid grid-cols-2 md:grid-cols-4 gap-3">
					{TIERS.map((tier) => {
						const c = TIER_COLORS[tier];
						return (
							<div
								key={tier}
								className="p-3 rounded-xl text-center"
								style={{
									background: c.bg,
									border: `1px solid ${c.border}`,
								}}
							>
								<div
									className="text-2xl font-black italic"
									style={{ color: c.text }}
								>
									{tierBreakdown[tier]}
								</div>
								<div
									className="text-[10px] font-black tracking-widest uppercase mt-1"
									style={{ color: c.text }}
								>
									{TIER_LABEL[tier]}
								</div>
							</div>
						);
					})}
				</div>
				<p className="text-xs text-center mt-4" style={{ color: "#bbcac6" }}>
					Benar: {correct} / {total} soal
				</p>
			</div>

			<div className="flex flex-col sm:flex-row gap-3">
				<button
					onClick={onRematch}
					className="flex-1 px-6 py-4 rounded-2xl font-label-bold tracking-widest text-sm uppercase transition-all hover:scale-105"
					style={{
						background: "linear-gradient(135deg, #43decc 0%, #0a7c6e 100%)",
						color: "#0a1412",
						boxShadow: "0 0 30px rgba(0, 194, 177, 0.3)",
					}}
				>
					<RefreshCw className="inline w-4 h-4 mr-2" />
					Main Lagi
				</button>
				<Link
					href="/guess-who"
					className="flex-1 px-6 py-4 rounded-2xl font-label-bold tracking-widest text-sm uppercase text-center transition-all"
					style={{
						background: "rgba(255, 255, 255, 0.05)",
						color: "#fff",
						border: "1px solid rgba(0, 194, 177, 0.3)",
					}}
				>
					Tutup
				</Link>
			</div>
		</section>
	);
}
