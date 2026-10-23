"use client";

import { useState } from "react";
import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { useQueries } from "@tanstack/react-query";
import { useUIStore } from "@/stores/uiStore";
import { FD_COMPETITIONS, type FdMatch } from "@/hooks/queries/useFootballData";
import { cn } from "@/lib/utils";

const TICKER_HEIGHT = 52; // px

async function fetchLatestFinished(
	code: string,
): Promise<{ code: string; match: FdMatch | null }> {
	const res = await fetch(`/api/football-data/competitions/${code}/matches`, {
		cache: "no-store",
	});
	if (!res.ok) return { code, match: null };
	const data = await res.json();
	const matches: FdMatch[] = data?.matches ?? [];
	const finished = matches
		.filter(
			(m: FdMatch) =>
				m.status === "FINISHED" &&
				m.score?.fullTime?.home != null &&
				m.score?.fullTime?.away != null,
		)
		.sort(
			(a, b) => new Date(b.utcDate).getTime() - new Date(a.utcDate).getTime(),
		);
	return { code, match: finished[0] ?? null };
}

/* ------------------------------------------------------------------ */
/* Single league cell — sesuai layout gambar:                          */
/*  [ label ] [ TLA  FT  TLA ] [ crest ] [ score ] [ crest ]          */
/* ------------------------------------------------------------------ */
function LeagueCell({
	code,
	label,
	match,
	isDark,
}: {
	code: string;
	label: string;
	match: FdMatch | null;
	isDark: boolean;
}) {
	const [hovered, setHovered] = useState(false);
	if (!match) return null;

	const home = match.score?.fullTime?.home ?? 0;
	const away = match.score?.fullTime?.away ?? 0;
	const homeTla =
		match.homeTeam.tla ||
		match.homeTeam.shortName?.slice(0, 3).toUpperCase() ||
		"";
	const awayTla =
		match.awayTeam.tla ||
		match.awayTeam.shortName?.slice(0, 3).toUpperCase() ||
		"";

	return (
		<Link
			href={`/football/${FD_COMPETITIONS.find((c) => c.code === code)?.slug ?? "primer-league"}`}
			className={cn(
				"group flex flex-col justify-center shrink-0 rounded-lg px-3 py-0.5 min-w-0",
				"transition-all duration-300",
				isDark ? "hover:bg-white/10" : "hover:bg-[#0a7c6e]/5",
			)}
			onMouseEnter={() => setHovered(true)}
			onMouseLeave={() => setHovered(false)}
		>
			{/* Label liga — baris atas */}
			<span
				className={cn(
					"text-[9px] font-bold uppercase tracking-widest mb-0.5",
					isDark ? "text-zinc-500" : "text-gray-400",
				)}
			>
				{label}
			</span>

			{/* Match row ��� baris bawah */}
			<div className="flex items-center gap-2">
				<div className="flex items-center gap-1.5">
					<span
						className={cn(
							"text-[11px] font-bold tabular-nums text-right",
							isDark ? "text-white" : "text-zinc-900",
						)}
					>
						{homeTla}
					</span>
					{match.homeTeam.crest && (
						<img
							src={match.homeTeam.crest}
							alt={match.homeTeam.name}
							className="w-4 h-4 object-contain"
							loading="lazy"
						/>
					)}
				</div>

				{hovered ? (
					<span
						className={cn(
							"px-2 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-widest",
							"transition-all duration-300",
							isDark
								? "bg-primary/20 text-primary border border-primary/30"
								: "bg-[#0a7c6e]/10 text-[#0a7c6e] border border-[#0a7c6e]/30",
						)}
					>
						Selengkapnya
					</span>
				) : (
					<div
						className={cn(
							"shrink-0 flex items-center gap-1 leading-tight",
							"transition-transform duration-300",
						)}
					>
						<span
							className={cn(
								"text-[11px] font-black tabular-nums",
								isDark ? "text-white" : "text-zinc-900",
							)}
						>
							{home}
						</span>
						<span
							className={cn(
								"text-[10px] font-bold",
								isDark ? "text-zinc-500" : "text-gray-400",
							)}
						>
							–
						</span>
						<span
							className={cn(
								"text-[11px] font-black tabular-nums",
								isDark ? "text-white" : "text-zinc-900",
							)}
						>
							{away}
						</span>
						<span
							className={cn(
								"text-[8px] font-bold uppercase tracking-widest ml-1",
								isDark ? "text-zinc-500" : "text-gray-400",
							)}
						>
							FT
						</span>
					</div>
				)}

				<div className="flex items-center gap-1.5">
					{match.awayTeam.crest && (
						<img
							src={match.awayTeam.crest}
							alt={match.awayTeam.name}
							className="w-4 h-4 object-contain"
							loading="lazy"
						/>
					)}
					<span
						className={cn(
							"text-[11px] font-bold tabular-nums",
							isDark ? "text-white" : "text-zinc-900",
						)}
					>
						{awayTla}
					</span>
				</div>
			</div>

			{/* Chevron — muncul saat hover */}
			<ChevronRight
				className={cn(
					"w-3.5 h-3.5 shrink-0 transition-all duration-300 self-end -mr-1",
					hovered ? "opacity-100 translate-x-0" : "opacity-0 -translate-x-1",
					isDark ? "text-primary" : "text-[#0a7c6e]",
				)}
			/>
		</Link>
	);
}
