"use client";

import { formatTime } from "@/lib/guessWho/scoring";

export function CircularTimer({
	seconds,
	totalSeconds,
}: {
	seconds: number;
	totalSeconds: number;
}) {
	const radius = 28;
	const circumference = 2 * Math.PI * radius;
	const safeTotal = Math.max(1, totalSeconds);
	const ratio = Math.min(1, Math.max(0, seconds / safeTotal));
	const offset = circumference * (1 - ratio);
	const color = ratio > 0.5 ? "#22c55e" : ratio > 0.25 ? "#fbbf24" : "#ef4444";

	return (
		<div className="relative inline-flex items-center justify-center">
			<svg width="64" height="64" className="-rotate-90" aria-hidden="true">
				<circle
					cx="32"
					cy="32"
					r={radius}
					fill="none"
					stroke="rgba(255,255,255,0.1)"
					strokeWidth="4"
				/>
				<circle
					cx="32"
					cy="32"
					r={radius}
					fill="none"
					stroke={color}
					strokeWidth="4"
					strokeLinecap="round"
					strokeDasharray={circumference}
					strokeDashoffset={offset}
					style={{
						transition: "stroke-dashoffset 1s linear, stroke 0.3s linear",
						filter: `drop-shadow(0 0 3px ${color})`,
					}}
				/>
			</svg>
			<span
				className="absolute font-black tabular-nums text-sm"
				style={{ color }}
			>
				{formatTime(seconds)}
			</span>
		</div>
	);
}
