"use client";

import { memo } from "react";
import Image from "next/image";
import { Play, ChevronRight, Lock, RefreshCcw, Bolt } from "lucide-react";
import type { GuessWhoLevelConfig } from "@/types";
import { cn } from "@/lib/utils";

// ===== VawHero =====
export function VawHero({
	onPlay,
	onDemo,
}: {
	onPlay: () => void;
	onDemo: () => void;
}) {
	return (
		<div
			className="active-glass rounded-3xl p-8 md:p-10 flex flex-col md:flex-row items-center gap-8 relative overflow-hidden group"
			style={{ boxShadow: "0 0 50px rgba(0,194,177,0.2)" }}
		>
			<div
				className="absolute -top-20 -right-20 w-64 h-64 rounded-full"
				style={{
					background: "rgba(0, 194, 177, 0.2)",
					filter: "blur(100px)",
				}}
				aria-hidden
			/>
			<div
				className="absolute inset-0 pointer-events-none"
				style={{
					background:
						"linear-gradient(135deg, rgba(0,194,177,0.08) 0%, transparent 50%, rgba(0,0,0,0.6) 100%)",
				}}
				aria-hidden
			/>
			<div
				className="absolute inset-0 pointer-events-none"
				style={{
					background:
						"radial-gradient(circle at top left, rgba(0, 194, 177, 0.08), transparent 50%)",
				}}
				aria-hidden
			/>

			<div className="relative z-10 flex-1 space-y-5">
				<div className="flex items-center gap-2">
					<div className="live-dot" aria-hidden />
					<span
						className="font-label-bold uppercase tracking-widest"
						style={{ color: "#00C2B1" }}
					>
						Olahbola New Game
					</span>
				</div>

				<h1
					className="font-display-xl text-display-xl italic uppercase leading-none"
					style={{ color: "#e5e2e1", textShadow: "4px 4px 0px #00C2B1" }}
				>
					GUESS WHO?
				</h1>

				<p className="font-body-lg max-w-xl" style={{ color: "#bbcac6" }}>
					Kenalin para bintang sepak bola dunia cuma dari clue, nomor punggung,
					dan jersey mereka.{" "}
					<span className="hidden md:inline">
						Buktikan kalo lo adalah <b>the ultimate baller</b>, bukan cuma jago
						nge-dribble di game tapi juga jago baca pemain di balik tiap jersey
						ikonik!
					</span>
				</p>
			</div>

			<div
				className="relative z-10 w-full md:w-1/3 aspect-square max-w-95 hidden md:block"
				aria-hidden
			>
				<div
					className="w-full h-full rounded-2xl"
					style={{ filter: "drop-shadow(0 0 50px rgba(0, 194, 177, 0.3))" }}
				>
					<Image
						src="/images/games/guess-who.png"
						alt="Guess Who Hero"
						width={350}
						height={320}
						className="w-full h-full rounded-2xl object-cover object-top"
						priority
					/>
				</div>
				<div
					className="absolute inset-0 pointer-events-none rounded-2xl"
					style={{
						background:
							"linear-gradient(to top, rgba(0, 0, 0, 0.6), transparent)",
					}}
				/>
			</div>
		</div>
	);
}

// ===== DailyChallengeCard =====
export function DailyChallengeCard({ onClick }: { onClick: () => void }) {
	return (
		<div
			className="glass-panel rounded-3xl p-6 flex items-center justify-between group cursor-pointer transition-colors"
			onClick={onClick}
			onMouseEnter={(e) => {
				e.currentTarget.style.borderColor = "rgba(0, 194, 177, 0.5)";
			}}
			onMouseLeave={(e) => {
				e.currentTarget.style.borderColor = "";
			}}
		>
			<div className="flex items-center gap-4">
				<div
					className="w-16 h-16 rounded-xl flex items-center justify-center border border-white/5 transition-colors"
					style={{ background: "rgba(255, 255, 255, 0.05)" }}
				>
					<Play
						className="text-[32px]"
						style={{ color: "#00C2B1", width: 32, height: 32 }}
					/>
				</div>
				<div>
					<h3 className="font-headline-md text-headline-md">Main Sekarang</h3>
					<p className="text-sm" style={{ color: "#bbcac6" }}>
						Main dan tembus klasemen teratas!
					</p>
				</div>
			</div>
			<span
				className="opacity-0 group-hover:opacity-100 transition-opacity"
				style={{ color: "#00C2B1" }}
			>
				›
			</span>
		</div>
	);
}

// ===== PracticeModeCard =====
export function PracticeModeCard({ onClick }: { onClick: () => void }) {
	return (
		<div
			className="glass-panel rounded-3xl p-6 flex items-center justify-between group cursor-pointer transition-colors"
			onClick={onClick}
			onMouseEnter={(e) => {
				e.currentTarget.style.borderColor = "rgba(0, 194, 177, 0.5)";
			}}
			onMouseLeave={(e) => {
				e.currentTarget.style.borderColor = "";
			}}
		>
			<div className="flex items-center gap-4">
				<div
					className="w-16 h-16 rounded-xl flex items-center justify-center border border-white/5 transition-colors"
					style={{ background: "rgba(255, 255, 255, 0.05)" }}
				>
					<RefreshCcw
						className="text-[32px]"
						style={{ color: "#00C2B1", width: 32, height: 32 }}
					/>
				</div>
				<div>
					<h3 className="font-headline-md text-headline-md">Mode Latihan</h3>
					<p className="text-sm" style={{ color: "#bbcac6" }}>
						Coba demo tanpa login
					</p>
				</div>
			</div>
			<span
				className="opacity-0 group-hover:opacity-100 transition-opacity"
				style={{ color: "#00C2B1" }}
			>
				›
			</span>
		</div>
	);
}

// ===== VawLevelCard =====
export const VawLevelCard = memo(function VawLevelCard({
	level,
	index,
	isActive,
	isLocked,
	isCompleted,
	attemptCount = 0,
	onStart,
}: {
	level: GuessWhoLevelConfig;
	index: number;
	isActive: boolean;
	isLocked: boolean;
	isCompleted: boolean;
	attemptCount?: number;
	onStart: () => void;
}) {
	return (
		<div
			className={cn(
				"glass-panel rounded-3xl p-4 flex flex-col justify-between gap-6 group transition-all duration-500 relative overflow-hidden",
				isActive && "active-glass",
				isLocked && "opacity-70 cursor-not-allowed",
			)}
		>
			<div
				className="absolute -top-10 -right-10 w-32 h-32 rounded-full glow-blur"
				style={{
					background: isActive
						? "rgba(0, 194, 177, 0.2)"
						: isLocked
							? "rgba(255, 193, 132, 0.1)"
							: "rgba(0, 194, 177, 0.05)",
				}}
				aria-hidden
			/>

			<div className="relative z-10">
				<span
					className="text-7xl md:text-6xl font-extrabold italic leading-none"
					style={{
						color: isActive
							? "rgba(0, 194, 177, 0.5)"
							: isLocked
								? "rgba(255, 255, 255, 0.2)"
								: "rgba(0, 194, 177, 0.3)",
					}}
				>
					{String(level.level ?? index + 1).padStart(2, "0")}{" "}
					<span className="text-xl md:text-[14px] font-semibold">
						{attemptCount > 0 && (
							<span style={{ color: "rgba(0, 194, 177, 0.7)" }}>
								· {attemptCount}x Main
							</span>
						)}
					</span>
				</span>
				<h3
					className="text-2xl md:text-xl font-semibold mt-2"
					style={{ color: "#e5e2e1" }}
				>
					{level.name}
				</h3>
			</div>

			<div className="relative z-10 flex flex-col gap-3">
				<div
					className="flex items-center gap-2"
					style={{
						color: isLocked
							? "rgba(255, 255, 255, 0.4)"
							: isCompleted
								? "#9ca3af"
								: "#00C2B1",
					}}
				>
					<span
						className="text-[10px] font-label-bold uppercase flex items-center gap-1.5"
						style={{
							color: isCompleted ? "rgba(255, 255, 255, 0.55)" : undefined,
						}}
					>
						{isLocked ? "Locked" : isCompleted ? <>Completed</> : "Unlocked"}
					</span>
				</div>
				<button
					onClick={onStart}
					disabled={isLocked}
					className={cn(
						"w-full py-3 font-label-bold rounded-xl transition-all",
						isLocked
							? "cursor-not-allowed"
							: "cursor-pointer hover:scale-105 active:scale-95",
					)}
					style={{
						background: isLocked
							? "rgba(255, 255, 255, 0.05)"
							: isActive
								? "#00C2B1"
								: isCompleted
									? "rgba(255, 255, 255, 0.15)"
									: "rgba(255, 255, 255, 0.08)",
						color: isLocked
							? "rgba(255, 255, 255, 0.4)"
							: isActive
								? "#001a17"
								: isCompleted
									? "rgba(255, 255, 255, 0.85)"
									: "rgba(255, 255, 255, 0.8)",
						boxShadow:
							isActive && !isLocked
								? "0 0 20px rgba(0, 194, 177, 0.4)"
								: "none",
					}}
				>
					<div>{isLocked ? "LOCKED" : isActive ? "START" : "Main Lagi"}</div>
				</button>
			</div>
		</div>
	);
});
