"use client";

import { Clock } from "lucide-react";
import { useQuizGlobalLeaderboard } from "@/hooks/queries/useQuiz";

const WORLD_CUP_EVENT_SLUG = "world-cup-2026";

interface QuizWorldCupLeaderboardProps {
	isDark: boolean;
}

export function QuizWorldCupLeaderboard({
	isDark,
}: QuizWorldCupLeaderboardProps) {
	const { data: entries, isLoading } =
		useQuizGlobalLeaderboard(WORLD_CUP_EVENT_SLUG);

	const accent = isDark ? "#00C2B1" : "#0a7c6e";

	if (isLoading) {
		return <QuizLeaderboardSkeleton isDark={isDark} />;
	}

	if (!entries || entries.length === 0) {
		return (
			<div
				className="p-8 md:p-12 rounded-3xl text-center"
				style={{
					background: isDark
						? "rgba(255, 255, 255, 0.03)"
						: "rgba(0, 0, 0, 0.02)",
					border: `1px solid ${isDark ? "rgba(255, 255, 255, 0.08)" : "rgba(0, 0, 0, 0.08)"}`,
				}}
			>
				<p
					style={{
						color: isDark
							? "rgba(255, 255, 255, 0.6)"
							: "rgba(26, 26, 26, 0.6)",
					}}
				>
					Belum ada data leaderboard
				</p>
			</div>
		);
	}

	return (
		<div className="space-y-3">
			{entries.map((entry) => (
				<QuizRankRow
					key={entry.user_id}
					entry={entry}
					rank={entry.rank}
					isDark={isDark}
					accent={accent}
				/>
			))}
		</div>
	);
}

function formatDuration(raw: string | undefined): string {
	if (!raw) return "-";
	const abs = raw.replace("-", "");
	const secMatch = abs.match(/^(\d+)s$/);
	if (secMatch) {
		const s = parseInt(secMatch[1], 10);
		if (s === 1) return "1 detik";
		if (s < 60) return `${s} detik`;
	}
	const minMatch = abs.match(/^(\d+)m$/);
	if (minMatch) {
		const m = parseInt(minMatch[1], 10);
		if (m === 1) return "1 menit";
		return `${m} menit`;
	}
	const bothMatch = abs.match(/^(\d+)m\s+(\d+)s$/);
	if (bothMatch) {
		const m = parseInt(bothMatch[1], 10);
		const s = parseInt(bothMatch[2], 10);
		const mText = m === 1 ? "1 menit" : `${m} menit`;
		const sText = s === 1 ? "1 detik" : `${s} detik`;
		return `${mText} ${sText}`;
	}
	return abs;
}

function QuizRankRow({
	entry,
	rank,
	isDark,
	accent,
}: {
	entry: {
		rank: number;
		user_id: string;
		name: string;
		total_points: number;
		total_duration_formatted: string;
	};
	rank: number;
	isDark: boolean;
	accent: string;
}) {
	const isTopThree = rank <= 3;
	const rankColors: Record<number, string> = {
		1: isDark ? "#1FE6DA" : "#0a7c6e",
		2: isDark ? "#1FE6DA" : "#0a7c6e",
		3: isDark ? "#1FE6DA" : "#0a7c6e",
	};

	return (
		<div
			className="group flex items-center justify-between p-4 rounded-2xl transition-all duration-300"
			style={{
				background: isDark
					? "rgba(255, 255, 255, 0.05)"
					: "rgba(0, 0, 0, 0.03)",
				border: `1px solid ${isDark ? "rgba(255, 255, 255, 0.05)" : "rgba(0, 0, 0, 0.05)"}`,
			}}
			onMouseEnter={(e) => {
				e.currentTarget.style.transform = "scale(1.02)";
				e.currentTarget.style.boxShadow = isDark
					? `0 4px 20px rgba(0, 194, 177, 0.15)`
					: `0 4px 20px rgba(10, 124, 110, 0.12)`;
			}}
			onMouseLeave={(e) => {
				e.currentTarget.style.transform = "scale(1)";
				e.currentTarget.style.boxShadow = "none";
			}}
		>
			<div className="flex items-center gap-8 min-w-0">
				<span
					className="font-black italic text-xl w-6 transition-transform duration-300 group-hover:translate-x-1 shrink-0"
					style={{
						color: isTopThree
							? rankColors[rank]
							: isDark
								? "rgba(255, 255, 255, 0.3)"
								: "rgba(26, 26, 26, 0.4)",
					}}
				>
					#{rank}
				</span>

				<div className="min-w-0">
					<p
						className="font-black uppercase tracking-tight truncate transition-all duration-300 group-hover:translate-x-1"
						style={{ color: isDark ? "#ffffff" : "#1a1a1a" }}
						title={entry.name}
					>
						{entry.name}
					</p>
					<div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest mt-0.5">
						<Clock className="w-3 h-3 shrink-0" style={{ color: accent }} />
						<span
							style={{
								color: isDark
									? "rgba(255, 255, 255, 0.4)"
									: "rgba(26, 26, 26, 0.5)",
							}}
						>
							{formatDuration(entry.total_duration_formatted)}
						</span>
					</div>
				</div>
			</div>

			<div className="text-right shrink-0 transition-transform duration-300 group-hover:scale-110">
				<p
					className="font-black tracking-widest transition-colors duration-300"
					style={{ color: accent }}
				>
					{entry.total_points.toLocaleString()}
				</p>
				<p
					className="text-[8px] font-black uppercase"
					style={{
						color: isDark
							? "rgba(255, 255, 255, 0.3)"
							: "rgba(26, 26, 26, 0.4)",
					}}
				>
					Points
				</p>
			</div>
		</div>
	);
}

function QuizLeaderboardSkeleton({ isDark }: { isDark: boolean }) {
	const surface = isDark ? "rgba(255, 255, 255, 0.06)" : "rgba(0, 0, 0, 0.06)";
	const dimSurface = isDark
		? "rgba(255, 255, 255, 0.04)"
		: "rgba(0, 0, 0, 0.04)";

	return (
		<div className="space-y-3">
			{Array.from({ length: 7 }).map((_, i) => (
				<div
					key={i}
					className="flex items-center gap-4 p-4 rounded-2xl animate-pulse"
					style={{
						background: isDark
							? "rgba(255, 255, 255, 0.03)"
							: "rgba(0, 0, 0, 0.02)",
						border: `1px solid ${isDark ? "rgba(255, 255, 255, 0.05)" : "rgba(0, 0, 0, 0.05)"}`,
					}}
				>
					<div
						className="w-7 h-5 rounded shrink-0"
						style={{ background: surface }}
					/>
					<div
						className="w-9 h-9 rounded-lg shrink-0"
						style={{ background: surface }}
					/>
					<div className="flex-1 space-y-1.5">
						<div
							className="h-3 rounded w-1/2"
							style={{ background: surface }}
						/>
						<div
							className="h-2 rounded w-1/3"
							style={{ background: dimSurface }}
						/>
					</div>
					<div
						className="w-12 h-5 md:h-6 rounded shrink-0"
						style={{ background: surface }}
					/>
				</div>
			))}
		</div>
	);
}
