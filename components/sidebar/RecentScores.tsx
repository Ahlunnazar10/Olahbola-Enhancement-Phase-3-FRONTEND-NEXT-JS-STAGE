"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useUIStore } from "@/stores/uiStore";
import { useQueries } from "@tanstack/react-query";
import {
	FD_COMPETITIONS,
	type FdMatch,
	type FdTeam,
} from "@/hooks/queries/useFootballData";
import { cn } from "@/lib/utils";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface LeagueResult {
	competitionCode: string;
	emblem: string;
	matchday: number;
	match: FdMatch | null;
}

// ---------------------------------------------------------------------------
// Fetch: latest finished "match of the mday" per liga — logika sama dengan
// halaman /klasemen:
// 1) standings → currentMatchday + emblem
// 2) fetch SEMUA match kompetisi
// 3) matchday aktif = currentMatchday; kalau SEMUA match di MD itu sudah
//    FINISHED (pekan sudah lewat), geser ke matchday yang masih punya
//    match belum selesai
// 4) dari MD aktif, ambil match dengan total gol terbanyak
// ---------------------------------------------------------------------------

async function fetchLatest(code: string): Promise<LeagueResult> {
	const base: LeagueResult = {
		competitionCode: code,
		emblem: "",
		matchday: 0,
		match: null,
	};

	// 1) standings
	const sRes = await fetch(
		`/api/football-data/competitions/${code}/standings`,
		{ cache: "no-store" },
	);
	if (!sRes.ok) return base;
	const sData = await sRes.json();
	const currentMatchday: number | null = sData?.season?.currentMatchday ?? null;
	const emblem: string = sData?.competition?.emblem ?? "";

	if (currentMatchday == null) return { ...base, emblem };

	// 2) semua match kompetisi
	const mRes = await fetch(`/api/football-data/competitions/${code}/matches`, {
		cache: "no-store",
	});
	if (!mRes.ok) return { ...base, emblem };
	const mData = await mRes.json();
	const allMatches: FdMatch[] = mData?.matches ?? [];

	// group by matchday
	const byMd = new Map<number, FdMatch[]>();
	for (const m of allMatches) {
		if (m.matchday == null) continue;
		byMd.set(m.matchday, [...(byMd.get(m.matchday) ?? []), m]);
	}

	const isDone = (m: FdMatch) =>
		(m.status === "FINISHED" || m.status === "POSTPONED") &&
		m.score?.fullTime?.home != null &&
		m.score?.fullTime?.away != null;

	// 3) Sumber skor: matchday currentMatchday.
	//    Kalau di currentMatchday sudah semua selesai (pekan sudah lewat),
	//    mundur ke currentMatchday - 1 (pekan terakhir yang sudah selesai).
	const totalGoals = (m: FdMatch) =>
		(m.score?.fullTime?.home ?? 0) + (m.score?.fullTime?.away ?? 0);
	const bestFrom = (matches: FdMatch[]) => {
		const fin = matches.filter(isDone);
		if (fin.length === 0) return null;
		return fin.reduce((a, b) => (totalGoals(b) > totalGoals(a) ? b : a));
	};

	let activeMd = currentMatchday;
	let best = bestFrom(byMd.get(activeMd) ?? []);

	// currentMatchday sudah semua selesai → mundur satu pekan
	if (best === null) {
		for (let i = activeMd - 1; i >= 1; i--) {
			const b = bestFrom(byMd.get(i) ?? []);
			if (b) {
				activeMd = i;
				best = b;
				break;
			}
		}
	}

	return {
		competitionCode: code,
		emblem,
		matchday: activeMd,
		match: best,
	};
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function matchStatus(match: FdMatch) {
	const home = match.score?.fullTime?.home;
	const away = match.score?.fullTime?.away;
	const finished =
		(match.status === "FINISHED" || match.status === "POSTPONED") &&
		home != null &&
		away != null;
	const live = match.status === "LIVE" || match.status === "IN_PLAY";
	return { home, away, finished, live };
}

function teamName(team: FdTeam): string {
	return team.shortName || team.name;
}

// ---------------------------------------------------------------------------
// Match slide (1 match per slide)
// ---------------------------------------------------------------------------

function MatchSlide({
	leagurest,
	isDark,
}: {
	leagurest: LeagueResult;
	isDark: boolean;
}) {
	const match = leagurest.match;
	if (!match) return null;

	const { home, away, finished, live } = matchStatus(match);
	const hasScore = home != null || away != null;

	// date & time WIB
	const d = new Date(match.utcDate);
	const wibDay = new Date(Date.now() + 7 * 3600000).getUTCDate();
	const isToday = d.getUTCDate() === wibDay;
	const dayLabel = isToday
		? "Hrs ini"
		: `${d.getUTCDate()}/${String(d.getUTCMonth() + 1).padStart(2, "0")}`;
	const wibH = (d.getUTCHours() + 7) % 24;
	const wibM = String(d.getUTCMinutes()).padStart(2, "0");
	const timeLabel = `${dayLabel} ${wibH}:${wibM}  WIB`;

	const teamNameCls = cn(
		"text-sm font-bold truncate max-w-[130px]",
		isDark ? "text-zinc-100" : "text-zinc-900",
	);

	return (
		<div className="w-full shrink-0 flex items-center gap-2 px-4 py-4">
			{/* home team */}
			<div className="flex flex-1 items-center justify-end gap-1 min-w-0">
				<span className={cn(teamNameCls, "text-right")}>
					{teamName(match.homeTeam)}
				</span>
				{match.homeTeam.crest && (
					<img
						src={match.homeTeam.crest}
						alt={match.homeTeam.name}
						className={`w-7 h-7 object-cover`}
						loading="lazy"
					/>
				)}
			</div>

			<div className="flex flex-row gap-1">
				{/* skor + waktu */}
				<div className="shrink-0 flex flex-col items-center ">
					<div
						className={cn(
							"w-15 h-8 flex items-center justify-center rounded-lg text-base font-black tabular-nums tracking-wider",
							finished &&
								(isDark
									? "bg-teal-500/15 text-teal-300"
									: "bg-teal-50 text-teal-700"),
							live && "bg-red-500/15 text-red-400",
							!finished &&
								!live &&
								(isDark
									? "bg-white/5 text-zinc-400"
									: "bg-gray-100 text-zinc-500"),
						)}
					>
						{hasScore ? (
							<>
								{home ?? "–"}
								<span
									className={cn(
										"mx-1",
										isDark ? "text-zinc-500" : "text-zinc-400",
									)}
								>
									:
								</span>
								{away ?? "–"}
							</>
						) : finished ? (
							<span className="text-xs font-bold uppercase tracking-wider">
								FT
							</span>
						) : live ? (
							<span className="text-xs font-black uppercase tracking-wider animate-pulse">
								LIVE
							</span>
						) : (
							<span className="text-xs font-medium">–:–</span>
						)}
					</div>
				</div>
			</div>

			{/* away team */}
			<div className="flex flex-1 items-center gap-1 min-w-0">
				{match.awayTeam.crest && (
					<img
						src={match.awayTeam.crest}
						alt={match.awayTeam.name}
						className={`w-7 h-7 object-cover`}
						loading="lazy"
					/>
				)}
				<span className={teamNameCls}>{teamName(match.awayTeam)}</span>
			</div>

			<span
				className={cn(
					"text-[10px] font-medium tracking-wide",
					isDark ? "text-zinc-500" : "text-zinc-400",
				)}
			>
				{timeLabel}
			</span>
		</div>
	);
}

// ---------------------------------------------------------------------------
// Main component
// ---------------------------------------------------------------------------

export function RecentScoresSidebar() {
	const { theme } = useUIStore();
	const isDark = theme === "dark";

	const queries = useQueries({
		queries: FD_COMPETITIONS.map((c) => ({
			queryKey: ["recent-scores", c.code] as const,
			queryFn: () => fetchLatest(c.code),
			staleTime: 5 * 60 * 1000,
		})),
	});

	const allLoading = queries.every((q) => q.isLoading);
	const allResults: LeagueResult[] = queries.map(
		(q, i) =>
			q.data ?? {
				competitionCode: FD_COMPETITIONS[i].code,
				emblem: "",
				matchday: 0,
				match: null,
			},
	);
	const slideIndices = allResults
		.map((r, i) => (r.match ? i : -1))
		.filter((i) => i >= 0);
	const totalSlides = slideIndices.length;

	const [active, setActive] = useState(0);
	const [paused, setPaused] = useState(false);

	// auto-slide tiap 3.5 detik
	useEffect(() => {
		if (paused || totalSlides <= 1) return;
		const id = setInterval(() => {
			setActive((p) => (p + 1) % totalSlides);
		}, 3500);
		return () => clearInterval(id);
	}, [paused, totalSlides]);

	// hold: kalau totalSlides berubah, reset active ke 0
	useEffect(() => {
		if (totalSlides > 0 && active >= totalSlides) setActive(0);
	}, [totalSlides, active]);

	// index hasil yang sedang aktif
	const activeIdx = totalSlides > 0 ? slideIndices[active] : 0;

	if (allLoading) {
		return (
			<div
				className={cn(
					"rounded-xl p-4 space-y-3",
					isDark
						? "glass-panel border border-white/5"
						: "bg-white shadow border border-gray-200",
				)}
			>
				<div className="flex items-center gap-3">
					<div className="w-8 h-8 rounded-full bg-zinc-800 animate-pulse" />
					<div className="flex-1 h-4 bg-zinc-800/60 rounded animate-pulse" />
				</div>
				<div className="h-8 bg-zinc-800/40 rounded animate-pulse" />
				<div className="h-8 bg-zinc-800/40 rounded animate-pulse" />
			</div>
		);
	}

	if (totalSlides === 0) return null;

	const activeResult = allResults[activeIdx];

	return (
		<div className="space-y-2">
			{/* Section header */}
			<div
				className={cn(
					"flex items-center justify-between px-1",
					isDark ? "text-zinc-100" : "text-zinc-900",
				)}
			>
				<h3 className="text-base font-black italic uppercase tracking-wide flex items-center gap-2">
					Skor Terbaru
				</h3>
				{activeResult?.emblem && (
					<div className="w-10 h-10 rounded-full overflow-hidden">
						<img
							src={activeResult.emblem}
							alt=""
							className={cn(
								"p-2 object-cover rounded-full",
								isDark
									? "bg-white/30 backdrop-blur-sm ring-1 ring-white/30"
									: "bg-gray-100 ring-1 ring-gray-200",
							)}
						/>
					</div>
				)}
			</div>

			{/* Single card */}
			<div
				className={cn(
					"rounded-xl overflow-hidden",
					isDark
						? "glass-panel border border-white/5"
						: "bg-white shadow border border-gray-200",
				)}
				onMouseEnter={() => setPaused(true)}
				onMouseLeave={() => setPaused(false)}
			>
				{/* Match slide area */}
				<div className="overflow-hidden">
					<div
						className="flex transition-transform duration-300 ease-out"
						style={{ transform: `translateX(-${active * 100}%)` }}
					>
						{slideIndices.map((idx, slideNum) => (
							<div key={idx} className="w-full shrink-0">
								<MatchSlide leagurest={allResults[idx]} isDark={isDark} />
							</div>
						))}
					</div>
				</div>

				{/* Footer: dots + arrows */}
				{totalSlides > 1 && (
					<div
						className={cn(
							"flex items-center justify-between px-3 py-2",
							isDark
								? "border-t border-zinc-800/60"
								: "border-t border-gray-100",
						)}
					>
						<button
							aria-label="Sebelumnya"
							onClick={() =>
								setActive((p) => (p - 1 + totalSlides) % totalSlides)
							}
							className="p-1 rounded-full hover:bg-zinc-800/60 transition-colors text-zinc-500"
						>
							<ChevronLeft className="w-4 h-4" />
						</button>

						<div className="flex gap-1">
							{slideIndices.map((idx, slideNum) => (
								<button
									key={allResults[idx].competitionCode}
									aria-label={`Slide ${slideNum + 1}`}
									onClick={() => setActive(slideNum)}
									className={cn(
										"rounded-full transition-all",
										slideNum === active
											? "w-4 h-1.5 bg-teal-400"
											: "w-1.5 h-1.5 bg-zinc-700 hover:bg-zinc-600",
									)}
								/>
							))}
						</div>

						<span className="text-[10px] text-zinc-600 font-medium">
							{active + 1} / {totalSlides}
						</span>

						<button
							aria-label="Berikutnya"
							onClick={() => setActive((p) => (p + 1) % totalSlides)}
							className="p-1 rounded-full hover:bg-zinc-800/60 transition-colors text-zinc-500"
						>
							<ChevronRight className="w-4 h-4" />
						</button>
					</div>
				)}
			</div>

			{/* CTA */}
			{/* <Link
				href="/klasemen"
				className={cn(
					"flex items-center justify-between w-full px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-colors",
					isDark
						? "bg-teal-500/8 border border-teal-400/20 text-teal-300 hover:bg-teal-500/15"
						: "bg-teal-50 border border-teal-200 text-teal-700 hover:bg-teal-100",
				)}
			>
				Lihat Semua Klasemen &amp; Jadwal
				<ChevronRight className="w-4 h-4" />
			</Link> */}
		</div>
	);
}
