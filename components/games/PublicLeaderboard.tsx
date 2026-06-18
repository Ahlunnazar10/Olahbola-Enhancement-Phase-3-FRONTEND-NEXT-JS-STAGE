"use client";

import { Trophy, Activity, Target, TrendingUp } from "lucide-react";
import Image from "next/image";
import {
	usePublicLeaderboard,
	type PublicLeaderboardEntry,
} from "@/hooks/queries/usePublicLeaderboard";
import { LeaderboardSkeleton } from "./skeletons";

interface PublicLeaderboardProps {
	isDark: boolean;
}

export function PublicLeaderboard({ isDark }: PublicLeaderboardProps) {
	const {
		data: entries,
		isLoading,
		isError,
		refetch,
	} = usePublicLeaderboard(10);

	if (isLoading) {
		return <LeaderboardSkeleton isDark={isDark} />;
	}

	if (isError) {
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
					className="text-base mb-4"
					style={{
						color: isDark
							? "rgba(255, 255, 255, 0.7)"
							: "rgba(26, 26, 26, 0.7)",
					}}
				>
					Gagal memuat leaderboard. Silakan coba lagi.
				</p>
				<button
					onClick={() => refetch()}
					className="px-6 py-2.5 rounded-full font-bold text-sm transition-transform hover:scale-105"
					style={{
						background: isDark ? "#43decc" : "#0a7c6e",
						color: isDark ? "#003732" : "#ffffff",
					}}
				>
					Coba Lagi
				</button>
			</div>
		);
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

	const top3 = entries.slice(0, 3);
	const rest = entries.slice(3, 10);
	const accent = isDark ? "#00C2B1" : "#0a7c6e";

	return (
		<div className="space-y-6">
			{/* Top 3 Podium — 2 | 1 | 3 */}
			<div className="grid grid-cols-1 md:grid-cols-3 gap-6">
				{/* Rank 2 */}
				{top3[1] && (
					<div className="order-2 md:order-1 text-center">
						<PodiumCard
							entry={top3[1]}
							rank={2}
							isDark={isDark}
							isChampion={false}
							accent={accent}
						/>
					</div>
				)}
				{/* Rank 1 (Champion) */}
				{top3[0] && (
					<div className="order-1 md:order-2 text-center transform md:scale-110">
						<PodiumCard
							entry={top3[0]}
							rank={1}
							isDark={isDark}
							isChampion={true}
							accent={accent}
						/>
					</div>
				)}
				{/* Rank 3 */}
				{top3[2] && (
					<div className="order-3 md:order-3 text-center">
						<PodiumCard
							entry={top3[2]}
							rank={3}
							isDark={isDark}
							isChampion={false}
							accent={accent}
						/>
					</div>
				)}
			</div>

			{/* Rest of Top 10 */}
			{rest.length > 0 && (
				<div className="space-y-3">
					{rest.map((entry, idx) => (
						<RankRow
							key={entry.user_id}
							entry={entry}
							rank={entry.rank}
							isDark={isDark}
							accent={accent}
							index={idx}
						/>
					))}
				</div>
			)}
		</div>
	);
}

function PodiumCard({
	entry,
	rank,
	isDark,
	isChampion,
	accent,
}: {
	entry: PublicLeaderboardEntry;
	rank: number;
	isDark: boolean;
	isChampion: boolean;
	accent: string;
}) {
	const medalColors = {
		1: { ring: accent, fill: "#00C2B1", chip: "#00C2B1" },
		2: {
			ring: isDark ? "rgba(255, 255, 255, 0.5)" : "rgba(26, 26, 26, 0.3)",
			fill: "#C0C0C0",
			chip: "#C0C0C0",
		},
		3: {
			ring: isDark ? "rgba(255, 255, 255, 0.5)" : "rgba(26, 26, 26, 0.3)",
			fill: "#CD7F32",
			chip: "#CD7F32",
		},
	};
	const medal = medalColors[rank as 1 | 2 | 3];

	// Sesuai sample: bg-gradient-to-b from-primary/10 to-transparent + border-2 border-primary/40 untuk champion
	const cardStyle = isChampion
		? {
				background: `linear-gradient(180deg, ${accent}1a 0%, transparent 100%)`,
				border: `2px solid ${accent}66`,
				boxShadow: `0 20px 50px ${accent}26`,
			}
		: {
				background: isDark
					? "rgba(255, 255, 255, 0.02)"
					: "rgba(255, 255, 255, 0.03)",
				border: `1px solid ${isDark ? "rgba(255, 255, 255, 0.05)" : "rgba(0, 0, 0, 0.05)"}`,
			};

	return (
		<div
			className={`rounded-3xl md:rounded-4xl p-6 md:p-8 relative overflow-hidden transition-all ${
				!isChampion ? "hover:bg-white/4 cursor-default" : ""
			}`}
			style={cardStyle}
		>
			{isChampion && (
				<div
					className="absolute -top-4 left-1/2 -translate-x-1/2 px-4 py-1 rounded-full text-[10px] font-black uppercase tracking-widest whitespace-nowrap"
					style={{
						background: accent,
						color: isDark ? "#003732" : "#ffffff",
					}}
				>
					Champion
				</div>
			)}

			{/* Avatar dengan rank chip */}
			<div
				className={`relative mx-auto mb-4 ${
					isChampion ? "w-24 h-24 md:w-16 md:h-16" : "w-20 h-20 md:w-14 md:h-14"
				}`}
			>
				<div
					className="absolute inset-0 rounded-2xl overflow-hidden "
					style={{
						border: `2px solid ${isChampion ? accent : medal.ring}`,
					}}
				>
					{entry.profile_picture ? (
						<Image
							src={entry.profile_picture}
							alt={entry.user_name}
							fill
							sizes="(max-width: 768px) 96px, 96px"
							style={{ objectFit: "cover" }}
						/>
					) : (
						<Image
							src="/icons/football-player.png"
							alt="Player"
							fill
							sizes="(max-width: 768px) 96px, 96px"
							style={{ objectFit: "cover" }}
						/>
					)}
				</div>
				<div
					className={`absolute -top-2 -right-2 rounded-full flex items-center justify-center font-black text-black shadow-lg ${
						isChampion ? "w-6 h-6 text-base" : "w-5 h-5 text-xs"
					}`}
					style={{
						background: medal.chip,
						boxShadow: `0 0 12px ${medal.fill}80`,
					}}
				>
					{rank}
				</div>
			</div>

			{/* Nama */}
			<h4
				className={`font-black tracking-tight uppercase mb-1 truncate px-1 ${
					isChampion ? "text-2xl md:text-sm" : "text-lg md:text-sm"
				}`}
				style={{
					color: isDark ? "#ffffff" : "#1a1a1a",
					textShadow: isChampion
						? `0 0 15px ${isDark ? "rgba(0, 194, 177, 0.6)" : "rgba(10, 124, 110, 0.4)"}`
						: "none",
				}}
				title={entry.user_name}
			>
				{entry.user_name}
			</h4>

			{/* Points */}
			<div
				className={`font-black tracking-widest ${isChampion ? "text-xl md:text-xl" : "text-sm md:text-sm"}`}
				style={{ color: accent }}
			>
				{entry.total_points.toLocaleString()}{" "}
				<span className="text-[10px]">PTS</span>
			</div>
		</div>
	);
}

function RankRow({
	entry,
	rank,
	isDark,
	accent,
	index,
}: {
	entry: PublicLeaderboardEntry;
	rank: number;
	isDark: boolean;
	accent: string;
	index: number;
}) {
	const exactPct =
		entry.total_predictions > 0
			? Math.round((entry.exact_scores / entry.total_predictions) * 100)
			: 0;

	return (
		<div
			className="group flex items-center justify-between p-4 rounded-2xl transition-all duration-300"
			style={{
				background: isDark
					? "rgba(255, 255, 255, 0.05)"
					: "rgba(0, 0, 0, 0.03)",
				border: `1px solid ${isDark ? "rgba(255, 255, 255, 0.05)" : "rgba(0, 0, 0, 0.05)"}`,
			}}
			// Animasi hover: scale-up card + avatar glow (bukan border color change)
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
			{/* Rank Number + Avatar + Nama/Stats */}
			<div className="flex items-center gap-6 md:gap-4">
				<span
					className="font-black italic text-xl w-6 transition-transform duration-300 group-hover:translate-x-1"
					style={{
						color: isDark
							? "rgba(255, 255, 255, 0.3)"
							: "rgba(26, 26, 26, 0.4)",
					}}
				>
					#{rank}
				</span>

				{/* Avatar dengan glow effect saat hover */}
				<div className="relative hidden md:flex w-10 h-10 rounded-lg overflow-hidden shrink-0 group-avatar">
					<div
						className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-lg"
						style={{
							background: `radial-gradient(circle, ${accent}4d 0%, transparent 70%)`,
							filter: "blur(8px)",
						}}
					/>
					{entry.profile_picture ? (
						<Image
							src={entry.profile_picture}
							alt={entry.user_name}
							fill
							sizes="40px"
							style={{ objectFit: "cover" }}
							className="transition-transform duration-300 group-hover:scale-110"
						/>
					) : (
						<Image
							src="/icons/football-player.png"
							alt="Player"
							fill
							sizes="40px"
							style={{ objectFit: "cover" }}
							className="transition-transform duration-300 group-hover:scale-110"
						/>
					)}
				</div>

				<div className="flex-1 min-w-0 max-w-[180px] md:max-w-[200px]">
					<p
						className="font-black uppercase tracking-tight truncate transition-all duration-300 group-hover:translate-x-1"
						style={{ color: isDark ? "#ffffff" : "#1a1a1a" }}
						title={entry.user_name}
					>
						{entry.user_name}
					</p>
					<div className="flex items-center gap-3 text-[10px] font-bold uppercase tracking-widest mt-0.5">
						<span
							className="flex items-center gap-1 transition-colors duration-300 group-hover:text-teal-400"
							style={{
								color: isDark
									? "rgba(255, 255, 255, 0.4)"
									: "rgba(26, 26, 26, 0.5)",
							}}
						>
							{entry.total_predictions} PREDICTIONS
						</span>
					</div>
				</div>
			</div>

			{/* Points */}
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
