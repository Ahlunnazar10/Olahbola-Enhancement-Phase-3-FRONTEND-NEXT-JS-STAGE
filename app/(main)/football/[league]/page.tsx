"use client";

import { useMemo, useState, useEffect } from "react";
import { useParams, notFound } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { cn } from "@/lib/utils";
import { trackPageVisit } from "@/lib/analytics";
import {
	FD_COMPETITIONS,
	fdCodeFromSlug,
	useFdStandings,
	useFdMatches,
	type FdStandingsTable,
	type FdMatch,
	type FdCompetitionCode,
} from "@/hooks/queries/useFootballData";

// ----------------------------------------------------------------
// Konstanta
// ----------------------------------------------------------------

const EURO_SPOTS: Record<FdCompetitionCode, number> = {
	PL: 5,
	PD: 5,
	BL1: 4,
	SA: 4,
	FL1: 3,
	CL: 0,
};

const RELEGATION_SPOTS = 3;

const CL_ZONES = {
	greenEnd: 8,
	yellowEnd: 24,
};

const WIB_DATE = new Intl.DateTimeFormat("id-ID", {
	weekday: "short",
	day: "numeric",
	month: "short",
	timeZone: "Asia/Jakarta",
});

const WIB_TIME = new Intl.DateTimeFormat("id-ID", {
	hour: "2-digit",
	minute: "2-digit",
	hour12: false,
	timeZone: "Asia/Jakarta",
});

function formatDate(iso: string) {
	return WIB_DATE.format(new Date(iso));
}

function formatTime(iso: string) {
	return WIB_TIME.format(new Date(iso));
}

function byMdMap(matches: FdMatch[]): Map<number, FdMatch[]> {
	const m = new Map<number, FdMatch[]>();
	for (const match of matches) {
		if (match.matchday == null) continue;
		m.set(match.matchday, [...(m.get(match.matchday) ?? []), match]);
	}
	return m;
}

// ----------------------------------------------------------------
// Sub-komponen
// ----------------------------------------------------------------

function StandingRow({
	row,
	total,
	euroCutoff,
	relegationCutoff,
	competition,
}: {
	row: FdStandingsTable;
	total: number;
	euroCutoff: number;
	relegationCutoff: number;
	competition: FdCompetitionCode;
}) {
	const isCL = competition === "CL";

	const zoneClass = isCL
		? row.position <= CL_ZONES.greenEnd
			? "bg-emerald-500/5 hover:bg-emerald-500/10"
			: row.position <= CL_ZONES.yellowEnd
				? "bg-amber-500/5 hover:bg-amber-500/10"
				: "bg-red-500/5 hover:bg-red-500/10"
		: row.position <= euroCutoff
			? "bg-teal-500/5 hover:bg-teal-500/10"
			: row.position > total - relegationCutoff
				? "bg-red-500/5 hover:bg-red-500/10"
				: "hover:bg-white/5";

	const posClass = isCL
		? row.position <= CL_ZONES.greenEnd
			? "bg-emerald-400 text-zinc-900"
			: row.position <= CL_ZONES.yellowEnd
				? "bg-amber-400/80 text-zinc-900"
				: "bg-red-400/15 text-red-300"
		: row.position <= euroCutoff
			? "bg-teal-400 text-zinc-900"
			: row.position > total - relegationCutoff
				? "bg-red-400/15 text-red-300"
				: "text-zinc-400 group-hover:text-zinc-200";

	const poinClass = isCL
		? row.position <= CL_ZONES.greenEnd
			? "text-emerald-400"
			: row.position <= CL_ZONES.yellowEnd
				? "text-amber-400"
				: "text-red-300/70"
		: row.position <= euroCutoff
			? "text-teal-400"
			: "text-zinc-100";

	return (
		<tr className={cn("transition-colors group", zoneClass)}>
			<td className="py-2.5 px-3 text-center">
				<span
					className={cn(
						"inline-flex items-center justify-center w-6 h-6 rounded-md font-bold text-xs",
						posClass,
					)}
				>
					{row.position}
				</span>
			</td>

			<td className="py-2.5 px-3">
				<div className="flex items-center gap-2.5 min-w-0">
					<div className="relative w-7 h-7 shrink-0">
						<Image
							src={row.team.crest}
							alt={row.team.name}
							width={28}
							height={28}
							className="w-7 h-7 object-contain"
							unoptimized
						/>
					</div>
					<span className="text-sm font-semibold truncate text-zinc-200 group-hover:text-teal-300 transition-colors">
						{row.team.shortName}
					</span>
				</div>
			</td>

			<td className="py-2.5 px-2 text-center text-xs text-zinc-400 tabular-nums">
				{row.playedGames}
			</td>
			<td className="py-2.5 px-2 text-center text-xs font-semibold text-zinc-200 tabular-nums">
				{row.won}
			</td>
			<td className="py-2.5 px-2 text-center text-xs text-zinc-400 tabular-nums">
				{row.draw}
			</td>
			<td className="py-2.5 px-2 text-center text-xs text-zinc-400 tabular-nums">
				{row.lost}
			</td>

			<td className="py-2.5 px-4 text-right">
				<span className={cn("text-sm font-bold tabular-nums", poinClass)}>
					{row.points}
				</span>
			</td>
		</tr>
	);
}

function StandingSkeleton() {
	return (
		<>
			{Array.from({ length: 10 }).map((_, i) => (
				<tr key={i} className="animate-pulse">
					<td colSpan={8} className="py-3">
						<div className="h-8 rounded-lg bg-white/5" />
					</td>
				</tr>
			))}
		</>
	);
}

// ----------------------------------------------------------------
// Match card
// ----------------------------------------------------------------

type MatchVariant =
	| "finished"
	| "upcoming"
	| "live"
	| "matchOfMday"
	| "blowout"
	| "upcomingHighlight";

function getMatchVariant(
	match: FdMatch,
	isBlowout: boolean,
	isMatchOfMday: boolean,
): MatchVariant {
	const live = match.status === "LIVE" || match.status === "IN_PLAY";
	if (live) return "live";
	const home = match.score?.fullTime?.home;
	const away = match.score?.fullTime?.away;
	const finished = match.status === "FINISHED" && home != null && away != null;
	if (finished && isBlowout) return "blowout";
	if (finished && isMatchOfMday) return "matchOfMday";
	if (finished) return "finished";
	return "upcoming";
}

function MatchCard({
	match,
	variant,
	isHighlighted,
}: {
	match: FdMatch;
	variant: MatchVariant;
	isHighlighted: boolean;
}) {
	const home = match.score?.fullTime?.home;
	const away = match.score?.fullTime?.away;
	const isLive = variant === "live";
	const isFinished = home != null && away != null;
	const isBlowout = variant === "blowout";
	const isMatchOfMday = variant === "matchOfMday";

	const dateLabel = formatDate(match.utcDate);
	const timeLabel = formatTime(match.utcDate);

	const leftBorder = isMatchOfMday ? "border-l-2 border-l-teal-400" : "";

	return (
		<div
			className={cn(
				"relative flex items-center justify-between gap-3 p-3 rounded-xl cursor-pointer transition-all",
				isMatchOfMday &&
					"bg-teal-500/8 shadow-[0_0_16px_rgba(67,222,204,0.12)]",
				isBlowout && "bg-white/6",
				variant === "finished" && "bg-white/3 hover:bg-white/6",
				variant === "upcoming" && !isHighlighted
					? "bg-white/3 hover:bg-white/6"
					: "bg-linear-to-r from-teal-500/10 to-white/4 border border-teal-400/25 shadow-md",
				isLive && "bg-red-500/6 border border-red-400/30",
				leftBorder,
				"group",
			)}
		>
			<div className="w-20 shrink-0 flex flex-col">
				<span
					className={cn(
						"text-[11px] font-semibold uppercase tracking-wider",
						isMatchOfMday ? "text-teal-300" : "text-zinc-500",
					)}
				>
					{isMatchOfMday ? "Match of The Week" : dateLabel}
				</span>
				{isLive ? (
					<span className="text-[12px] font-bold text-red-400 flex items-center gap-1">
						<span className="w-1.5 h-1.5 rounded-full bg-red-400 animate-pulse" />
						LIVE
					</span>
				) : isFinished ? (
					<span className="text-[12px] font-bold text-teal-400">FT</span>
				) : (
					<span className="text-[12px] font-bold text-zinc-300">
						{timeLabel} WIB
					</span>
				)}
			</div>

			<div className="flex items-center justify-between flex-1 px-2 min-w-0">
				<div className="flex items-center gap-2 w-[45%] justify-end min-w-0">
					<span
						className={cn(
							"text-[13px] font-semibold truncate text-right",
							isMatchOfMday ? "text-teal-300 font-bold" : "text-zinc-200",
						)}
					>
						{match.homeTeam.shortName}
					</span>
					<Image
						src={match.homeTeam.crest}
						alt=""
						width={24}
						height={24}
						className="w-6 h-6 object-contain shrink-0"
						unoptimized
					/>
				</div>

				{isLive ? (
					<div className="px-3 mx-2 py-1 rounded-lg bg-red-500/15 text-red-400 font-bold text-[12px] shrink-0">
						LIVE
					</div>
				) : isFinished ? (
					<div
						className={cn(
							"px-3 py-1 rounded-lg font-bold text-[14px] tabular-nums tracking-wider shrink-0",
							isMatchOfMday
								? "bg-teal-500/20 text-teal-300 shadow-[0_0_12px_rgba(67,222,204,0.35)]"
								: isBlowout
									? "bg-white/10 text-zinc-100"
									: "bg-white/8 text-zinc-100",
						)}
						style={{ margin: "0 10px 0 10px" }}
					>
						{home} – {away}
					</div>
				) : (
					<div
						className={cn(
							"px-3 mx-2 py-1 rounded-lg font-bold text-[12px] tracking-wider uppercase shrink-0",
							isHighlighted
								? "bg-teal-500/20 text-teal-300"
								: "bg-white/8 text-zinc-400",
						)}
					>
						{isHighlighted ? "VS" : "vs"}
					</div>
				)}

				<div className="flex items-center gap-2 w-[45%] justify-start min-w-0">
					<Image
						src={match.awayTeam.crest}
						alt=""
						width={24}
						height={24}
						className="w-6 h-6 object-contain shrink-0"
						unoptimized
					/>
					<span
						className={cn(
							"text-[13px] font-semibold truncate",
							isMatchOfMday ? "text-teal-300 font-bold" : "text-zinc-200",
						)}
					>
						{match.awayTeam.shortName}
					</span>
				</div>
			</div>
		</div>
	);
}

// ----------------------------------------------------------------
// MatchdayGroup
// ----------------------------------------------------------------

function MatchdayGroup({
	md,
	matches,
	isActive,
}: {
	md: number;
	matches: FdMatch[];
	isActive: boolean;
	onPrev: () => void;
	onNext: () => void;
	canPrev: boolean;
	canNext: boolean;
}) {
	const totalGoals = (m: FdMatch) =>
		(m.score?.fullTime?.home ?? 0) + (m.score?.fullTime?.away ?? 0);
	const bestMatch = useMemo(() => {
		const finished = matches.filter(
			(m) => m.status === "FINISHED" && m.score?.fullTime?.home != null,
		);
		if (finished.length === 0) return null;
		return finished.reduce((a, b) => (totalGoals(b) > totalGoals(a) ? b : a));
	}, [matches]);

	const blowoutIds = useMemo(() => {
		return new Set(
			matches
				.filter(
					(m) =>
						m.status === "FINISHED" &&
						m.score?.fullTime?.home != null &&
						m.score?.fullTime?.away != null &&
						Math.abs(
							(m.score?.fullTime?.home ?? 0) - (m.score?.fullTime?.away ?? 0),
						) >= 4,
				)
				.map((m) => m.id),
		);
	}, [matches]);

	const upcomingHighlightId = useMemo(() => {
		const upcoming = matches.filter(
			(m) =>
				m.status !== "FINISHED" &&
				m.status !== "LIVE" &&
				m.status !== "IN_PLAY",
		);
		return upcoming[0]?.id ?? null;
	}, [matches]);

	return (
		<div
			className={cn(
				"rounded-xl border transition-colors",
				isActive
					? "border-teal-400/40 bg-teal-500/6"
					: "border-white/10 bg-white/2",
			)}
		>
			<div className="p-3 flex flex-col gap-2">
				{matches.map((m) => {
					const isBlowout = blowoutIds.has(m.id);
					const isMday = bestMatch?.id === m.id;
					const isUpcomingHl = upcomingHighlightId === m.id;
					const variant = getMatchVariant(m, isBlowout, isMday);
					return (
						<MatchCard
							key={m.id}
							match={m}
							variant={variant}
							isHighlighted={isUpcomingHl}
						/>
					);
				})}
			</div>
		</div>
	);
}

// ----------------------------------------------------------------
// Tab bar — tab aktif selalu di posisi paling kiri (rotasi)
// ----------------------------------------------------------------

function LeagueTabs({ activeSlug }: { activeSlug: string }) {
	const rotated = useMemo(() => {
		const idx = FD_COMPETITIONS.findIndex((c) => c.slug === activeSlug);
		if (idx === -1) return FD_COMPETITIONS;
		return [...FD_COMPETITIONS.slice(idx), ...FD_COMPETITIONS.slice(0, idx)];
	}, [activeSlug]);

	return (
		<div className="flex items-center gap-2 overflow-x-auto pb-2 mb-6 scrollbar-none">
			{rotated.map((c) => (
				<Link
					key={c.code}
					href={`/football/${c.slug}`}
					className={cn(
						"px-4 py-2.5 rounded-lg text-sm font-semibold whitespace-nowrap shrink-0 transition-all active:scale-95",
						c.slug === activeSlug
							? "bg-teal-400 text-zinc-900 shadow-[0_0_18px_rgba(67,222,204,0.35)] flex items-center gap-2"
							: "bg-white/6 text-zinc-400 hover:bg-white/10 hover:text-zinc-200",
					)}
				>
					{c.label}
				</Link>
			))}
		</div>
	);
}

// ----------------------------------------------------------------
// Page
// ----------------------------------------------------------------

export default function KlasemenLeaguePage() {
	const params = useParams();
	const slug = params.league as string;

	const competition = fdCodeFromSlug(slug);

	if (!competition) notFound();

	const [matchday, setMatchday] = useState<number>(0);

	const allMatchesQ = useFdMatches(competition);
	const standingsQ = useFdStandings(competition);

	const totalTable =
		standingsQ.data?.standings.find((s) => s.type === "TOTAL")?.table ?? [];
	const allMatches = allMatchesQ.data?.matches ?? [];

	const grouped = useMemo(() => byMdMap(allMatches), [allMatches]);

	const apiCurrentMd = standingsQ.data?.season.currentMatchday ?? null;
	const activeMatchday = useMemo(() => {
		if (apiCurrentMd == null || grouped.size === 0) return apiCurrentMd;
		const ms = grouped.get(apiCurrentMd);
		if (ms && ms.every((m) => m.status === "FINISHED")) {
			for (let i = apiCurrentMd + 1; i <= 38; i++) {
				const next = grouped.get(i);
				if (next && !next.every((m) => m.status === "FINISHED")) return i;
				if (!next) break;
			}
		}
		return apiCurrentMd;
	}, [apiCurrentMd, grouped]);

	const effectiveMatchday = matchday || activeMatchday || 0;

	const matchdayList = useMemo(
		() => [...grouped.keys()].sort((a, b) => a - b),
		[grouped],
	);

	const matchdayGroups = useMemo(() => {
		if (effectiveMatchday === 0)
			return [...grouped.entries()].sort((a, b) => a[0] - b[0]);
		const ms = grouped.get(effectiveMatchday) ?? [];
		return [[effectiveMatchday, ms] as [number, FdMatch[]]];
	}, [grouped, effectiveMatchday]);

	const totalGoalsThisMday = useMemo(() => {
		if (activeMatchday == null) return 0;
		const ms = grouped.get(activeMatchday) ?? [];
		return ms.reduce((sum, m) => {
			const h = m.score?.fullTime?.home ?? 0;
			const a = m.score?.fullTime?.away ?? 0;
			return m.status === "FINISHED" ? sum + h + a : sum;
		}, 0);
	}, [grouped, activeMatchday]);

	const seasonLabel = useMemo(() => {
		const s = standingsQ.data?.season;
		if (!s?.startDate) return "—";
		const yy = s.startDate.slice(0, 4).slice(-2);
		const next = String(Number(s.startDate.slice(0, 4)) + 1).slice(-2);
		return `${yy}/${next}`;
	}, [standingsQ.data]);

	const prevMatchday = () => {
		const idx = matchdayList.indexOf(effectiveMatchday);
		if (idx > 0) setMatchday(matchdayList[idx - 1]);
	};
	const nextMatchday = () => {
		const idx = matchdayList.indexOf(effectiveMatchday);
		if (idx < matchdayList.length - 1) setMatchday(matchdayList[idx + 1]);
	};
	const canPrev =
		effectiveMatchday > 0 && matchdayList.indexOf(effectiveMatchday) > 0;
	const canNext =
		effectiveMatchday > 0 &&
		matchdayList.indexOf(effectiveMatchday) < matchdayList.length - 1;

	useEffect(() => {
		setMatchday(0);
		const label = FD_COMPETITIONS.find((c) => c.slug === slug)?.label;
		document.title = label
			? `${label} — Update Skor Pertandingan, Klasemen & Jadwal | Olahbola`
			: "Update Skor Pertandingan, Klasemen & Jadwal | Olahbola";
		trackPageVisit();
	}, [slug]);

	const activeCompetition = FD_COMPETITIONS.find((c) => c.slug === slug);

	return (
		<div className="min-h-screen bg-background relative overflow-hidden">
			<Image
				src="/images/games/match-bg.webp"
				alt=""
				fill
				priority
				sizes="100vw"
				className="object-cover object-center pointer-events-none"
				style={{ opacity: 0.29 }}
			/>

			<div className="relative z-10 max-w-7xl mx-auto px-4 py-8 sm:py-10">
				{/* ── HEADER ───────────────────────────────────── */}
				<div className="flex flex-col md:flex-row md:items-end justify-between gap-5 mb-6">
					<div className="flex flex-col gap-2">
						<h1 className="text-2xl sm:text-4xl font-bold italic tracking-tight uppercase text-zinc-100">
							{activeCompetition?.label}
						</h1>
						<p className="text-sm text-zinc-500 flex items-center gap-1.5">
							Skor Pertandingan, Klasemen & Jadwal pertandingan terbaru.
						</p>
					</div>

					{/* quick stats widget */}
					<div className="flex items-center gap-4 bg-white/4 backdrop-blur-xl p-3 px-5 rounded-xl border-l-2 border-teal-400 shadow-lg self-start md:self-end">
						<div className="flex flex-col">
							<span className="text-[10px] font-bold uppercase text-zinc-500 tracking-wider">
								Musim
							</span>
							<span className="text-sm font-bold text-zinc-100">
								{seasonLabel}
							</span>
						</div>
						<div className="w-px h-7 bg-white/10" />
						<div className="flex flex-col">
							<span className="text-[10px] font-bold uppercase text-zinc-500 tracking-wider">
								Pekan
							</span>
							<span className="text-sm font-bold text-teal-400">
								Matchday {activeMatchday ?? "—"}
							</span>
						</div>
						<div className="w-px h-7 bg-white/10" />
						<div className="flex flex-col">
							<span className="text-[10px] font-bold uppercase text-zinc-500 tracking-wider">
								Gol Pekan Ini
							</span>
							<span className="text-sm font-bold text-zinc-100">
								{totalGoalsThisMday} Gol
							</span>
						</div>
					</div>
				</div>

				{/* ── COMPETITION TABS ───────────────────────────── */}
				<LeagueTabs activeSlug={slug} />

				{/* ── 2 KOLOM: JADWAL + KLASEMEN ──────── */}
				<div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
					{/* ════ LEFT: JADWAL ════ */}
					<div className="lg:col-span-7 flex flex-col gap-3 bg-white/4 backdrop-blur-2xl p-4 sm:p-5 rounded-2xl shadow-2xl border border-white/5">
						<div className="flex items-center justify-between pb-2">
							<h2 className="text-base font-bold uppercase tracking-wide text-zinc-200">
								Jadwal Pertandingan
							</h2>
							<span className="text-[11px] font-bold text-teal-400 bg-teal-400/10 px-2.5 py-1 rounded-md">
								MD {effectiveMatchday || "—"} / 38
							</span>
						</div>

						<div className="bg-white/6 p-2.5 rounded-xl flex items-center justify-between gap-2">
							<div className="flex items-center gap-2 pl-2 min-w-0">
								<span className="w-2 h-2 rounded-full bg-teal-400 animate-pulse shrink-0" />
								<span className="text-[13px] font-bold text-zinc-200 truncate">
									MATCHDAY {effectiveMatchday || "—"}{" "}
									<span className="text-zinc-500 font-normal">
										{effectiveMatchday === activeMatchday
											? "· Pekan Ini"
											: "· Dipilih"}
									</span>
								</span>
							</div>
							<div className="flex items-center gap-1 shrink-0">
								<button
									onClick={prevMatchday}
									disabled={!canPrev}
									className={cn(
										"w-7 h-7 rounded-lg flex items-center justify-center text-[16px] transition-colors",
										canPrev
											? "bg-white/8 hover:bg-white/15 text-zinc-300"
											: "bg-white/3 text-zinc-600 cursor-not-allowed",
									)}
								>
									‹
								</button>
								<button
									onClick={nextMatchday}
									disabled={!canNext}
									className={cn(
										"w-7 h-7 rounded-lg flex items-center justify-center text-[16px] transition-colors",
										canNext
											? "bg-white/8 hover:bg-white/15 text-zinc-300"
											: "bg-white/3 text-zinc-600 cursor-not-allowed",
									)}
								>
									›
								</button>
							</div>
						</div>

						<div className="flex flex-col gap-2">
							{allMatchesQ.isLoading ? (
								<div className="space-y-2 py-2">
									{Array.from({ length: 4 }).map((_, i) => (
										<div
											key={i}
											className="h-14 rounded-xl animate-pulse bg-white/5"
										/>
									))}
								</div>
							) : allMatchesQ.isError ? (
								<div className="text-center py-8 text-zinc-400 text-sm">
									Gagal memuat jadwal —{" "}
									{allMatchesQ.error?.message ?? "coba lagi"}
								</div>
							) : matchdayGroups.length === 0 ? (
								<div className="text-center py-8 text-zinc-400 text-sm">
									Tidak ada pertandingan untuk pilihan ini.
								</div>
							) : (
								matchdayGroups.map(([md, ms]) => (
									<MatchdayGroup
										key={md}
										md={md}
										matches={ms}
										isActive={md === activeMatchday}
										onPrev={prevMatchday}
										onNext={nextMatchday}
										canPrev={canPrev}
										canNext={canNext}
									/>
								))
							)}
						</div>
					</div>

					{/* ════ RIGHT: KLASEMEN ════ */}
					<div className="lg:col-span-5 flex flex-col gap-3 bg-white/4 backdrop-blur-2xl p-4 sm:p-5 rounded-2xl shadow-2xl border border-white/5">
						<div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2">
							<div className="flex items-center gap-3">
								{standingsQ.data && (
									<div className="w-10 h-10 rounded-xl bg-white/6 flex items-center justify-center shrink-0">
										<Image
											src={standingsQ.data.competition.emblem}
											alt=""
											width={36}
											height={36}
											className="w-8 h-8 object-contain"
											unoptimized
										/>
									</div>
								)}
								<div>
									<h2 className="text-base sm:text-lg font-bold tracking-tight uppercase text-zinc-100 flex items-center gap-2">
										{standingsQ.data?.competition.name ?? "Klasemen"}
										<span className="text-teal-400 text-[11px] font-bold tracking-normal bg-teal-400/10 px-2 py-0.5 rounded-full">
											Musim {seasonLabel}
										</span>
									</h2>
									<p className="text-[11px] text-zinc-500">
										{competition === "CL"
											? "1–8 langsung 16 besar · 9–24 playoff · 25–36 tereliminasi"
											: EURO_SPOTS[competition] > 0
												? ` ${EURO_SPOTS[competition]} Tim Lolos UCL · Degradasi 3 tim`
												: "Kompetisi Eropa"}
									</p>
								</div>
							</div>
							<span className="px-2.5 py-1 rounded bg-white/8 text-zinc-300 text-[12px] font-bold self-end sm:self-auto">
								Matchday {activeMatchday ?? "—"}
							</span>
						</div>

						<div className="overflow-x-auto rounded-xl">
							<table className="w-full border-collapse">
								<thead>
									<tr className="bg-white/6 text-zinc-500 text-[11px] font-bold uppercase tracking-wider">
										<th className="py-2.5 px-3 text-center w-8">#</th>
										<th className="py-2.5 px-3 text-left">Tim</th>
										<th className="py-2.5 px-2 text-center w-8">M</th>
										<th className="py-2.5 px-2 text-center w-8">Mng</th>
										<th className="py-2.5 px-2 text-center w-8">S</th>
										<th className="py-2.5 px-2 text-center w-8">K</th>
										<th className="py-2.5 px-4 text-right w-14 text-teal-400">
											Poin
										</th>
									</tr>
								</thead>
								<tbody className="font-semibold text-[13px]">
									{standingsQ.isLoading ? (
										<StandingSkeleton />
									) : standingsQ.isError ? (
										<tr>
											<td
												colSpan={8}
												className="text-center py-10 text-zinc-400 text-sm"
											>
												Gagal memuat klasemen —{" "}
												{standingsQ.error?.message ?? "coba lagi"}
											</td>
										</tr>
									) : (
										totalTable.map((row) => (
											<StandingRow
												key={row.team.id}
												row={row}
												total={totalTable.length}
												euroCutoff={EURO_SPOTS[competition]}
												relegationCutoff={RELEGATION_SPOTS}
												competition={competition}
											/>
										))
									)}
								</tbody>
							</table>
						</div>

						<div className="flex items-center justify-between text-[11px] text-zinc-500">
							<div className="flex items-center gap-4 flex-wrap">
								{competition === "CL" ? (
									<>
										<span className="flex items-center gap-1.5">
											<span className="w-2.5 h-2.5 rounded bg-emerald-400/30 border border-emerald-400/50" />
											1–8 · 16 Besar
										</span>
										<span className="flex items-center gap-1.5">
											<span className="w-2.5 h-2.5 rounded bg-amber-400/30 border border-amber-400/50" />
											9–24 · Playoff
										</span>
										<span className="flex items-center gap-1.5">
											<span className="w-2.5 h-2.5 rounded bg-red-400/30 border border-red-400/50" />
											25–36 · Eliminasi
										</span>
									</>
								) : (
									<>
										<span className="flex items-center gap-1.5">
											<span className="w-2.5 h-2.5 rounded bg-teal-400/20 border border-teal-400/40" />
											UCL ({EURO_SPOTS[competition]})
										</span>
										<span className="flex items-center gap-1.5">
											<span className="w-2.5 h-2.5 rounded bg-red-400/20 border border-red-400/40" />
											Degradasi (3)
										</span>
									</>
								)}
							</div>
						</div>
					</div>
				</div>
			</div>
		</div>
	);
}
