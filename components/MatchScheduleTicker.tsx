"use client";

import { useState, useEffect, useRef, type ReactNode } from "react";
import Link from "next/link";
import { Clock, ChevronRight } from "lucide-react";
import { useQueries } from "@tanstack/react-query";
import { useUIStore } from "@/stores/uiStore";
import { FD_COMPETITIONS, type FdMatch } from "@/hooks/queries/useFootballData";
import { cn } from "@/lib/utils";
import { useMarquee } from "@/lib/useMarque";

const TOP_BAR_HEIGHT = 48; // px — satu baris konten, lebih rapat di atas navbar

type Status = "NOT_STARTED" | "LIVE" | "PAUSED" | "FINISHED";

function formatKickoff(utcDate: string): string {
	// football-data.org: string bebas (format "YYYY-MM-DDTHH:MM:SS" UTC).
	// Tampilkan di waktu lokal browser user (Indonesia = WIB/WITA), bukan UTC.
	const d = new Date(utcDate);
	if (isNaN(d.getTime())) return "";
	// Intl.DateTimeFormat dengan timeZone lokal + 24 jam → "14:00"
	const hhmm = d.toLocaleTimeString("id-ID", {
		hour: "2-digit",
		minute: "2-digit",
		hour12: false,
	});
	// Tanggal ringkas: "21 Okt" — kalau beda hari dari sekarang, tambahin "besok"
	const today = new Date();
	const matchDay =
		d.getDate() === today.getDate() &&
		d.getMonth() === today.getMonth() &&
		d.getFullYear() === today.getFullYear();
	const tomorrow = new Date(today.getTime() + 86400000);
	const isTomorrow =
		d.getDate() === tomorrow.getDate() &&
		d.getMonth() === tomorrow.getMonth() &&
		d.getFullYear() === tomorrow.getFullYear();

	const shortDate = d.toLocaleDateString("id-ID", {
		day: "numeric",
		month: "short",
	});

	if (matchDay) return hhmm;
	if (isTomorrow) return `${hhmm} (besok)`;
	return `${shortDate} ${hhmm}`;
}

function statusOf(m: FdMatch): Status {
	// football-data.org v4: status "SCHEDULED" | "IN_PLAY" | "PAUSED" | "FINISHED" | "AFTER" | "POSTPONED" | "CANCELLED"
	if (m.status === "FINISHED" || m.status === "AFTER") return "FINISHED";
	if (m.status === "IN_PLAY") return "LIVE";
	if (m.status === "PAUSED") return "PAUSED";
	return "NOT_STARTED";
}

async function fetchNextUpcoming(
	code: string,
): Promise<{ code: string; match: FdMatch | null }> {
	const today = new Date();
	const in10Days = new Date(today.getTime() + 10 * 86400000);
	// football-data.org: dateFrom & dateTo WAJIB berpasangan
	const res = await fetch(
		`/api/football-data/competitions/${code}/matches?dateFrom=${today.toISOString().slice(0, 10)}&dateTo=${in10Days.toISOString().slice(0, 10)}`,
		{ cache: "no-store" },
	);
	if (!res.ok) return { code, match: null };
	const data = await res.json();
	const matches: FdMatch[] = data?.matches ?? [];
	// Ambil yang paling dekat, yang belum selesai, dan yang statusnya valid
	const upcoming = matches
		.filter((m: FdMatch) => statusOf(m) !== "FINISHED")
		.sort(
			(a, b) => new Date(a.utcDate).getTime() - new Date(b.utcDate).getTime(),
		);
	return { code, match: upcoming[0] ?? null };
}

function ScheduleCell({
	code,
	label,
	slug,
	match,
	isDark,
}: {
	code: string;
	label: string;
	slug: string;
	match: FdMatch | null;
	isDark: boolean;
}) {
	const [hovered, setHovered] = useState(false);
	if (!match) return null;

	const st = statusOf(match);
	const kickoff = formatKickoff(match.utcDate);
	const homeTla =
		match.homeTeam.tla ||
		match.homeTeam.shortName?.slice(0, 3).toUpperCase() ||
		"";
	const awayTla =
		match.awayTeam.tla ||
		match.awayTeam.shortName?.slice(0, 3).toUpperCase() ||
		"";

	// Warna status: LIVE = merah, PAUSED = kuning, NOT_STARTED = netral
	const statusChip =
		st === "LIVE"
			? "bg-red-500/30 text-red-200 border-red-400/50"
			: st === "PAUSED"
				? "bg-amber-500/30 text-amber-200 border-amber-400/50"
				: "bg-[#0a7c6e]/20 text-[#43decc] border-[#43decc]/40";

	return (
		<Link
			href={`/football/${slug}`}
			className={cn(
				"group flex items-center gap-2 shrink-0 h-full px-3 min-w-0 border-r border-primary/25",
				"transition-all duration-300 hover:bg-primary/10",
			)}
			onMouseEnter={() => setHovered(true)}
			onMouseLeave={() => setHovered(false)}
			aria-label={`${label}: ${homeTla} vs ${awayTla}, ${st === "NOT_STARTED" ? "kickoff" : "status"} ${kickoff}`}
		>
			{/* Label liga — di kiri cell */}
			<span
				className={cn(
					"text-[9px] font-bold uppercase tracking-widest shrink-0",
					isDark ? "text-zinc-400" : "text-white",
				)}
			>
				{label}
			</span>

			{/* Jam kickoff */}
			<span
				className={cn(
					"text-[9px] font-bold tabular-nums shrink-0",
					st === "LIVE" ? "text-red-400" : "text-primary",
				)}
			>
				{kickoff}
			</span>

			{/* Match row — TLA + crest + vs + crest + TLA */}
			<div className="flex items-center gap-1.5 shrink-0">
				<span className={cn("text-[11px] font-bold tabular-nums text-white")}>
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

				{st === "LIVE" || st === "PAUSED" ? (
					<span
						className={cn(
							"px-1 py-0.5 rounded text-[8px] font-bold uppercase tracking-widest border",
							statusChip,
						)}
					>
						{st === "LIVE" ? "LIVE" : "PAUSED"}
					</span>
				) : (
					<span
						className={cn(
							"text-[9px] font-bold",
							isDark ? "text-zinc-500" : "text-gray-400",
						)}
					>
						vs
					</span>
				)}

				{match.awayTeam.crest && (
					<img
						src={match.awayTeam.crest}
						alt={match.awayTeam.name}
						className="w-4 h-4 object-contain"
						loading="lazy"
					/>
				)}
				<span className={cn("text-[11px] font-bold tabular-nums text-white")}>
					{awayTla}
				</span>
			</div>
		</Link>
	);
}

export function MatchScheduleTicker() {
	const { theme } = useUIStore();
	const isDark = theme === "dark";

	const containerRef = useRef<HTMLDivElement>(null);
	const trackRef = useRef<HTMLDivElement>(null);
	const cellRefs = useRef<HTMLDivElement[]>([]);
	const [isMobile, setIsMobile] = useState(false);

	useEffect(() => {
		const mq = window.matchMedia("(max-width: 767px)");
		const onMq = (e: MediaQueryListEvent) => setIsMobile(e.matches);
		setIsMobile(mq.matches);
		mq.addEventListener("change", onMq);
		return () => mq.removeEventListener("change", onMq);
	}, []);

	useMarquee(isMobile, trackRef, containerRef, cellRefs);

	const queries = useQueries({
		queries: FD_COMPETITIONS.map((c) => ({
			queryKey: ["match-schedule-ticker", c.code],
			queryFn: () => fetchNextUpcoming(c.code),
			staleTime: 5 * 60 * 1000,
			retry: 2,
		})),
	});

	const results = queries.map((q, i) => ({
		...FD_COMPETITIONS[i],
		match: q.data?.match ?? null,
		isLoading: q.isLoading,
	}));

	const hasData = results.some((r) => r.match);
	// Marquee mobile: konten [asli] + [duplikat] → geser 1 slide, reset di sambungan
	const cellItems: ReactNode[] = [];
	const allResults = isMobile ? [...results, ...results] : results;
	allResults.forEach(({ code, label, slug, match, isLoading }, i) => {
		const isDuplicate = isMobile && i >= results.length;
		const refCb =
			isMobile && !isDuplicate
				? (el: HTMLDivElement | null) => {
						if (el) cellRefs.current[i] = el;
					}
				: undefined;
		cellItems.push(
			<div key={`${code}-${i}`} ref={refCb} className="shrink-0 h-full">
				{isLoading ? (
					<div className="shrink-0 h-full flex items-center px-4 border-r border-primary/25">
						<div className="flex items-center gap-2 h-4">
							<div
								className={cn(
									"h-3 w-16 rounded animate-pulse",
									isDark ? "bg-white/15" : "bg-white/40",
								)}
							/>
							<div
								className={cn(
									"h-3 w-20 rounded animate-pulse",
									isDark ? "bg-white/15" : "bg-white/40",
								)}
							/>
						</div>
					</div>
				) : (
					<ScheduleCell
						code={code}
						label={label}
						slug={slug}
						match={match}
						isDark={isDark}
					/>
				)}
			</div>,
		);
	});

	return (
		<div
			role="complementary"
			aria-label="Jadwal pertandingan terdekat"
			className={cn(
				"w-full flex overflow-hidden",
				"border-b-2 transition-colors duration-300",
				// bg lebih mencolok agar kontras dengan navbar di bawahnya
				isDark
					? "bg-linear-to-r from-[#0a2a26] via-[#0f1412] to-[#0a2a26] border-primary/40"
					: "bg-linear-to-r from-[#0a7c6e] via-[#095a50] to-[#0a7c6e] border-white/20",
			)}
			style={{ height: TOP_BAR_HEIGHT }}
		>
			{/* Center: horizontal scroll cells / marquee track di mobile */}
			<div
				ref={containerRef}
				className="flex-1 flex items-center overflow-x-auto scrollbar-none"
			>
				<div ref={trackRef} className="flex items-center min-w-max h-full">
					{cellItems}
				</div>
			</div>

			{/* Right CTA — fixed di ujung kanan, tidak ikut scroll; disembunyikan saat marquee aktif */}
			{hasData && !isMobile && (
				<Link
					href="/football/primer-league"
					className={cn(
						"shrink-0 flex items-center gap-1 px-4 h-full border-l transition-colors",
						"text-[11px] font-bold uppercase tracking-wider",
						isDark
							? "border-primary/30 text-primary hover:text-white hover:bg-white/10"
							: "border-white/30 text-white hover:bg-white/20",
					)}
				>
					Jadwal Lengkap
					<ChevronRight className="w-3.5 h-3.5" />
				</Link>
			)}
		</div>
	);
}
