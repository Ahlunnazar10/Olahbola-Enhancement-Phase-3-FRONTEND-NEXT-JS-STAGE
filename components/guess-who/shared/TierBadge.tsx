"use client";

import { Sparkles } from "lucide-react";
import { TIER_COLORS, TIER_LABEL, type Tier } from "@/lib/guessWho/scoring";

export function TierBadge({ tier, points }: { tier: Tier; points: number }) {
	const c = TIER_COLORS[tier];
	return (
		<div
			className="inline-flex items-center gap-2 px-4 py-2 rounded-full font-black italic tracking-widest text-sm"
			style={{
				background: c.bg,
				color: c.text,
				border: `1px solid ${c.border}`,
				boxShadow: `0 0 20px ${c.border}`,
			}}
		>
			{TIER_LABEL[tier]}
			<span className="text-xs opacity-80">+{points} poin</span>
		</div>
	);
}
