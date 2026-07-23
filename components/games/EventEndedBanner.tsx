"use client";

import { Trophy } from "lucide-react";
import { EVENT_ENDED_NOTICE, mailtoClaim } from "@/lib/games/eventStatus";

interface EventEndedBannerProps {
	isDark: boolean;
	/** "compact" = 1 baris kecil (bisa di card), "full" = card glass (halaman detail) */
	variant?: "compact" | "full";
}

export function EventEndedBanner({
	isDark,
	variant = "full",
}: EventEndedBannerProps) {
	const gold = isDark ? "#FFD700" : "#B45309";
	const goldBg = isDark ? "rgba(255, 215, 0, 0.08)" : "rgba(180, 83, 9, 0.06)";
	const goldBorder = isDark
		? "rgba(255, 215, 0, 0.2)"
		: "rgba(180, 83, 9, 0.15)";

	if (variant === "compact") {
		return (
			<div
				className="flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-bold whitespace-nowrap"
				style={{
					background: goldBg,
					border: `1px solid ${goldBorder}`,
					color: gold,
				}}
			>
				<span>{EVENT_ENDED_NOTICE.title}</span>
			</div>
		);
	}

	/* --- full variant --- */
	return (
		<div
			className="rounded-2xl p-5 flex flex-col items-center text-center gap-3"
			style={{
				background: goldBg,
				border: `1px solid ${goldBorder}`,
			}}
		>
			<h3
				className="text-lg font-black italic tracking-tight uppercase"
				style={{ color: gold }}
			>
				{EVENT_ENDED_NOTICE.title}
			</h3>
			<p
				className="text-sm max-w-md leading-relaxed"
				style={{
					color: isDark ? "rgba(255,255,255,0.55)" : "rgba(26,26,26,0.55)",
				}}
			>
				{EVENT_ENDED_NOTICE.message}
			</p>
			<a
				href={mailtoClaim}
				target="_blank"
				rel="noopener noreferrer"
				className="mt-1 inline-flex items-center gap-2 px-5 py-2 rounded-full font-bold text-sm transition-all hover:scale-105"
				style={{
					background: gold,
					color: isDark ? "#000" : "#000",
				}}
			>
				Hubungi Admin
			</a>
		</div>
	);
}
