"use client";

import { useUIStore } from "@/stores/uiStore";
import { GameCard } from "@/components/games/GameCard";
import { PublicLeaderboard } from "@/components/games/PublicLeaderboard";
import { EventEndedBanner } from "@/components/games/EventEndedBanner";
import { EVENT_STATUS, getEventEndedStatus } from "@/lib/games/eventStatus";
import { useEffect, useRef } from "react";
import {
	useLeaderboard as useBLLeaderboard,
	type LeaderboardEntry as BLLeaderboardEntry,
} from "@/hooks/queries/useBundesliga";
import Image from "next/image";

export function GamesPageContent() {
	const { theme } = useUIStore();
	const isDark = theme === "dark";

	const accent = "#00C2B1";
	const accentSoft = isDark
		? "rgba(0, 194, 177, 0.5)"
		: "rgba(10, 124, 110, 0.4)";

	const meshRef = useRef<HTMLDivElement | null>(null);

	// Mouse parallax on the velocity mesh
	useEffect(() => {
		const mesh = meshRef.current;
		if (!mesh) return;

		let raf = 0;
		let tx = 0;
		let ty = 0;
		const onMove = (e: MouseEvent) => {
			tx = (e.clientX / window.innerWidth - 0.5) * 20;
			ty = (e.clientY / window.innerHeight - 0.5) * 20;
			if (!raf) {
				raf = requestAnimationFrame(() => {
					mesh.style.transform = `translate(${tx}px, ${ty}px)`;
					raf = 0;
				});
			}
		};

		document.addEventListener("mousemove", onMove);
		return () => {
			document.removeEventListener("mousemove", onMove);
			if (raf) cancelAnimationFrame(raf);
		};
	}, []);

	return (
		<div
			className="relative min-h-screen pt-0 md:pt-6 pb-24 overflow-hidden"
			style={{
				background: isDark ? "#050505" : "#f5f5f5",
				color: isDark ? "#e5e2e1" : "#1a1a1a",
			}}
		>
			<style jsx global>{`
				.games-velocity-mesh {
					background-image:
						linear-gradient(
							${isDark ? "rgba(0, 194, 177, 0.05)" : "rgba(10, 124, 110, 0.07)"}
								1px,
							transparent 1px
						),
						linear-gradient(
							90deg,
							${isDark ? "rgba(0, 194, 177, 0.05)" : "rgba(10, 124, 110, 0.07)"}
								1px,
							transparent 1px
						);
					background-size: 50px 50px;
					-webkit-mask-image: radial-gradient(
						circle at center,
						black,
						transparent 80%
					);
					mask-image: radial-gradient(circle at center, black, transparent 80%);
				}
				.games-glass-card {
					background: ${isDark
						? "rgba(255, 255, 255, 0.03)"
						: "rgba(255, 255, 255, 0.55)"};
					backdrop-filter: blur(40px);
					border: 1px solid
						${isDark ? "rgba(255, 255, 255, 0.1)" : "rgba(0, 0, 0, 0.08)"};
					transition: all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
				}
				.games-glass-card:hover {
					border-color: ${accent};
					box-shadow: 0 0 30px
						${isDark ? "rgba(0, 194, 177, 0.2)" : "rgba(10, 124, 110, 0.18)"};
					transform: translateY(-8px) scale(1.02);
				}
				.games-glow-text {
					text-shadow: 0 0 15px
						${isDark ? "rgba(0, 194, 177, 0.6)" : "rgba(10, 124, 110, 0.45)"};
				}
				.games-pulse-ring {
					animation: games-pulse-ring 2s infinite;
				}
				@keyframes games-pulse-ring {
					0% {
						transform: scale(0.9);
						opacity: 1;
					}
					100% {
						transform: scale(1.8);
						opacity: 0;
					}
				}
			`}</style>

			{/* Background effects - velocity mesh + blurred orbs */}
			<div
				className="absolute inset-0 pointer-events-none overflow-hidden"
				aria-hidden
			>
				<div ref={meshRef} className="games-velocity-mesh absolute inset-0" />
				<div
					className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] rounded-full"
					style={{
						background: `${accent}1a`,
						filter: "blur(150px)",
					}}
				/>
				<div
					className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full"
					style={{
						background: `${accent}0d`,
						filter: "blur(120px)",
					}}
				/>
			</div>

			<div className="relative max-w-7xl mx-auto px-6 py-12">
				{/* Hero Section */}
				<section className="text-center mb-10 md:mb-14 space-y-6">
					<div
						className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full mb-4"
						style={{
							background: `${accent}1a`,
							border: `1px solid ${accent}33`,
						}}
					>
						<span
							className="w-2 h-2 rounded-full animate-pulse"
							style={{ background: accent }}
						/>
						<span
							className="text-[10px] font-black tracking-widest uppercase"
							style={{ color: accent }}
						>
							Olahbola Games
						</span>
					</div>
					<h1 className="text-4xl md:text-[84px] font-black italic tracking-tighter leading-none">
						<span style={{ color: isDark ? "#ffffff" : "#1a1a1a" }}>
							PLAY THE GAME
						</span>
						<br />
						<span
							className="italic games-glow-text"
							style={{
								backgroundImage: `linear-gradient(90deg, ${accent} 0%, ${isDark ? "#ffffff" : "#1a1a1a"} 100%)`,
								WebkitBackgroundClip: "text",
								WebkitTextFillColor: "transparent",
								backgroundClip: "text",
							}}
						>
							OWN THE PITCH.
						</span>
					</h1>
					<p
						className="max-w-2xl mx-auto font-medium text-lg leading-relaxed"
						style={{
							color: isDark
								? "rgba(255, 255, 255, 0.5)"
								: "rgba(26, 26, 26, 0.6)",
						}}
					>
						Ini panggungmu. Waktumu bersinar. Tunjukkan bahwa kamu lebih dari
						sekadar penonton, kamu adalah pemainnya.
					</p>
				</section>

				{/* Active Game Cards Grid - diagonal: 1 active + 2 ended */}
				<section className="grid grid-cols-1  gap-4 md:gap-8 mb-6 md:mb-8">
					{/* Prediksi Skor - Bundesliga 2026/2027 (ACTIVE) */}
					<GameCard
						title="Prediksi Skor"
						subtitle="Bundesliga 2026/2027"
						description="Tebak skor pertandingan Bundesliga 2026/2027. Raih poin untuk setiap match dan jadilah si paling tau bola!"
						href="/bundesliga-prediksi-skor-2026-2027"
						isActive={true}
						bgImage="/images/games/bundesliga-2.jpg"
						accentColor={accent}
						isDark={isDark}
					/>
				</section>

				{/* Inactive Game Cards Grid - 1 kolom */}
				<section className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6 mb-6 md:mb-18">
					{/* Prediksi Skor - Teater Bola Asean 2026 (ENDED) */}
					<GameCard
						title="Prediksi Skor"
						subtitle="Teater Bola Asean 2026"
						description=""
						href="/teater-bola-asean-2026"
						isActive={true}
						eventState={
							getEventEndedStatus("teaterBolaAsean") ? "ended" : "live"
						}
						bgImage="/images/games/teater-bola-asean-prediction-bg.webp"
						accentColor={accent}
						isDark={isDark}
						endedNotice={EVENT_STATUS.teaterBolaAsean.endedNotice}
					/>

					{/* OlahBola Kuis - Pro Quiz */}
					<GameCard
						title="OlahBola Kuis"
						subtitle="Teater Bola Dunia"
						description="Ikuti olahbola kuis, adu pengetahuan seputar sepak bola, dan buktikan kamu si paling jago bola!"
						href="/quiz"
						isActive={true}
						eventState={getEventEndedStatus("quiz") ? "ended" : "live"}
						bgImage="/images/games/quiz-bg.webp"
						accentColor={accent}
						isDark={isDark}
						endedNotice={EVENT_STATUS.quiz.endedNotice}
					/>

					{/* Prediksi Skor - Teater Bola Dunia (ENDED) */}
					<GameCard
						title="Prediksi Skor"
						subtitle="Teater Bola Dunia"
						description=""
						href="/prediksi-skor"
						isActive={true}
						eventState={getEventEndedStatus("prediksiSkor") ? "ended" : "live"}
						bgImage="/images/games/prediction-bg.webp"
						accentColor={accent}
						isDark={isDark}
						endedNotice={EVENT_STATUS.prediksiSkor.endedNotice}
					/>
				</section>

				{/* Tournament Prizes Section */}
				<section className="mb-10 md:mb-24">
					<div className="flex flex-col items-center text-center mb-12">
						<h2
							className="text-3xl md:text-4xl font-black italic tracking-tighter uppercase mb-2"
							style={{ color: isDark ? "#ffffff" : "#1a1a1a" }}
						>
							Tournament Mystery Prizes
						</h2>
						<p
							className="text-xs md:text-sm font-bold tracking-widest  max-w-xl"
							style={{
								color: isDark
									? "rgba(255, 255, 255, 0.4)"
									: "rgba(26, 26, 26, 0.5)",
							}}
						>
							Ini adalah hadiah yang bisa kamu menangkan pada tiap game quiz dan
							prediksi skor. Semakin tinggi peringkatmu, semakin keren
							hadiahnya!
						</p>
						<div
							className="w-24 h-1 bg-primary mt-4 rounded-full"
							style={{ background: accent }}
						/>
					</div>

					<div className="grid grid-cols-1 md:grid-cols-3 gap-8">
						{/* Champion */}
						<div className="games-glass-card rounded-4xl p-6 flex flex-col items-center text-center group">
							<div className="relative mb-6 w-full aspect-square rounded-2xl overflow-hidden border border-white/10">
								<div
									aria-hidden
									className="absolute inset-0 pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-500"
									style={{
										background: `radial-gradient(circle at 30% 30%, ${accent}66 0%, transparent 60%), radial-gradient(circle at 70% 70%, ${accent}44 0%, transparent 60%)`,
									}}
								/>
								<div
									aria-hidden
									className="absolute -top-8 -left-8 w-32 h-32 rounded-full pointer-events-none opacity-0 group-hover:opacity-100 transition-all duration-700 group-hover:scale-125"
									style={{
										background: `radial-gradient(circle, ${accent}55 0%, transparent 70%)`,
										filter: "blur(15px)",
									}}
								/>
								<div
									aria-hidden
									className="absolute -bottom-10 -right-10 w-40 h-40 rounded-full pointer-events-none opacity-0 group-hover:opacity-100 transition-all duration-700 group-hover:scale-125"
									style={{
										background: `radial-gradient(circle, ${accent}44 0%, transparent 70%)`,
										filter: "blur(20px)",
									}}
								/>
								<img
									alt="Mystery Team Jersey"
									className="relative w-full h-full p-3 object-cover transition-transform duration-500 group-hover:scale-110"
									src="/images/games/mistery-jersey.png"
								/>
							</div>
							<span
								className="text-[10px] font-black tracking-widest uppercase mb-2 block"
								style={{ color: accent }}
							>
								Top 1 Leaderboard
							</span>
							<h3
								className="text-xl font-black italic tracking-tight uppercase mb-1"
								style={{ color: isDark ? "#ffffff" : "#1a1a1a" }}
							>
								Champion Prize
							</h3>
							<p
								className="text-sm"
								style={{
									color: isDark
										? "rgba(255, 255, 255, 0.6)"
										: "rgba(26, 26, 26, 0.6)",
								}}
							>
								Mystery LaLiga Original Jersey
							</p>
						</div>

						{/* Runner-Up */}
						<div className="games-glass-card rounded-4xl p-6 flex flex-col items-center text-center group">
							<div className="relative mb-6 w-full aspect-square rounded-2xl overflow-hidden border border-white/10">
								<div
									aria-hidden
									className="absolute inset-0 pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-500"
									style={{
										background: `radial-gradient(circle at 70% 30%, ${accent}55 0%, transparent 60%), radial-gradient(circle at 30% 70%, ${accent}33 0%, transparent 60%)`,
									}}
								/>
								<div
									aria-hidden
									className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-48 h-48 rounded-full pointer-events-none opacity-0 group-hover:opacity-100 transition-all duration-700 group-hover:scale-125"
									style={{
										background: `radial-gradient(circle, ${accent}44 0%, transparent 70%)`,
										filter: "blur(20px)",
									}}
								/>
								<div
									aria-hidden
									className="absolute -bottom-8 left-1/2 -translate-x-1/2 w-56 h-20 rounded-full pointer-events-none opacity-0 group-hover:opacity-100 transition-all duration-700"
									style={{
										background: `radial-gradient(ellipse, ${accent}55 0%, transparent 70%)`,
										filter: "blur(15px)",
									}}
								/>
								<img
									alt="Official Match Ball"
									className="relative w-full h-full p-14 object-cover transition-transform duration-500 group-hover:scale-110"
									src="/images/games/ball.png"
								/>
							</div>
							<span
								className="text-[10px] font-black tracking-widest uppercase mb-2 block"
								style={{ color: accent }}
							>
								Peringkat 2
							</span>
							<h3
								className="text-xl font-black italic tracking-tight uppercase mb-1"
								style={{ color: isDark ? "#ffffff" : "#1a1a1a" }}
							>
								Pro Runner-Up
							</h3>
							<p
								className="text-sm"
								style={{
									color: isDark
										? "rgba(255, 255, 255, 0.6)"
										: "rgba(26, 26, 26, 0.6)",
								}}
							>
								Original Match Ball
							</p>
						</div>

						{/* Elite */}
						<div className="games-glass-card rounded-4xl p-6 flex flex-col items-center text-center group">
							<div className="relative mb-6 w-full aspect-square rounded-2xl overflow-hidden border border-white/10">
								<div
									aria-hidden
									className="absolute inset-0 pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-500"
									style={{
										background: `radial-gradient(circle at 50% 50%, ${accent}55 0%, transparent 65%)`,
									}}
								/>
								<div
									aria-hidden
									className="absolute -top-10 -right-10 w-44 h-44 rounded-full pointer-events-none opacity-0 group-hover:opacity-100 transition-all duration-700 group-hover:scale-125"
									style={{
										background: `radial-gradient(circle, ${accent}44 0%, transparent 70%)`,
										filter: "blur(20px)",
									}}
								/>
								<div
									aria-hidden
									className="absolute -bottom-10 -left-10 w-44 h-44 rounded-full pointer-events-none opacity-0 group-hover:opacity-100 transition-all duration-700 group-hover:scale-125"
									style={{
										background: `radial-gradient(circle, ${accent}33 0%, transparent 70%)`,
										filter: "blur(20px)",
									}}
								/>
								<img
									alt="Limited Edition Cap"
									className="relative w-full h-full  p-6 object-cover transition-transform duration-500 group-hover:scale-110"
									src="/images/games/bundes-cap.png"
								/>
							</div>
							<span
								className="text-[10px] font-black tracking-widest uppercase mb-2 block"
								style={{ color: accent }}
							>
								Peringkat 3
							</span>
							<h3
								className="text-xl font-black italic tracking-tight uppercase mb-1"
								style={{ color: isDark ? "#ffffff" : "#1a1a1a" }}
							>
								Elite Contender
							</h3>
							<p
								className="text-sm"
								style={{
									color: isDark
										? "rgba(255, 255, 255, 0.6)"
										: "rgba(26, 26, 26, 0.6)",
								}}
							>
								Limited Edition Bundesliga Cap
							</p>
						</div>
					</div>

					<div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:max-w-4xl mx-auto mt-8">
						{/* Rank 4 */}
						<div className="games-glass-card rounded-4xl p-6 flex flex-col items-center text-center group">
							<div className="relative mb-6 w-full aspect-square rounded-2xl overflow-hidden border border-white/10">
								<div
									aria-hidden
									className="absolute inset-0 pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-500"
									style={{
										background: `radial-gradient(circle at 50% 50%, ${accent}55 0%, transparent 65%)`,
									}}
								/>
								<div
									aria-hidden
									className="absolute -top-10 -right-10 w-44 h-44 rounded-full pointer-events-none opacity-0 group-hover:opacity-100 transition-all duration-700 group-hover:scale-125"
									style={{
										background: `radial-gradient(circle, ${accent}44 0%, transparent 70%)`,
										filter: "blur(20px)",
									}}
								/>
								<div
									aria-hidden
									className="absolute -bottom-10 -left-10 w-44 h-44 rounded-full pointer-events-none opacity-0 group-hover:opacity-100 transition-all duration-700 group-hover:scale-125"
									style={{
										background: `radial-gradient(circle, ${accent}33 0%, transparent 70%)`,
										filter: "blur(20px)",
									}}
								/>
								<img
									alt="Olahbola Tumbler"
									className="relative m-auto h-80 md:h-90 p-6 object-cover transition-transform duration-500 group-hover:scale-110"
									src="/images/games/Tumbler Olahbola.png"
								/>
							</div>
							<span
								className="text-[10px] font-black tracking-widest uppercase mb-2 block"
								style={{ color: accent }}
							>
								Peringkat 4
							</span>
							<h3
								className="text-xl font-black italic tracking-tight uppercase mb-1"
								style={{ color: isDark ? "#ffffff" : "#1a1a1a" }}
							>
								Wildcard Spot
							</h3>
							<p
								className="text-sm"
								style={{
									color: isDark
										? "rgba(255, 255, 255, 0.6)"
										: "rgba(26, 26, 26, 0.6)",
								}}
							>
								Olahbola Tumbler Eksklusif
							</p>
						</div>

						{/* Rank 5-10 */}
						<div className="games-glass-card rounded-4xl p-6 flex flex-col max-w-2xl items-center text-center group">
							<div className="relative mb-6 w-full aspect-square rounded-2xl overflow-hidden border border-white/10">
								<div
									aria-hidden
									className="absolute inset-0 pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-500"
									style={{
										background: `radial-gradient(circle at 50% 50%, ${accent}55 0%, transparent 65%)`,
									}}
								/>
								<div
									aria-hidden
									className="absolute -top-10 -right-10 w-44 h-44 rounded-full pointer-events-none opacity-0 group-hover:opacity-100 transition-all duration-700 group-hover:scale-125"
									style={{
										background: `radial-gradient(circle, ${accent}44 0%, transparent 70%)`,
										filter: "blur(20px)",
									}}
								/>
								<div
									aria-hidden
									className="absolute -bottom-10 -left-10 w-44 h-44 rounded-full pointer-events-none opacity-0 group-hover:opacity-100 transition-all duration-700 group-hover:scale-125"
									style={{
										background: `radial-gradient(circle, ${accent}33 0%, transparent 70%)`,
										filter: "blur(20px)",
									}}
								/>
								<img
									alt="Olahbola Sticker Pack"
									className="relative w-full h-full p-6 object-cover transition-transform duration-500 group-hover:scale-110"
									src="/images/games/mockupp Sticker.png"
								/>
							</div>
							<span
								className="text-[10px] font-black tracking-widest uppercase mb-2 block"
								style={{ color: accent }}
							>
								Peringkat 5 - 10
							</span>
							<h3
								className="text-xl font-black italic tracking-tight uppercase mb-1"
								style={{ color: isDark ? "#ffffff" : "#1a1a1a" }}
							>
								Top 10 Squad
							</h3>
							<p
								className="text-sm"
								style={{
									color: isDark
										? "rgba(255, 255, 255, 0.6)"
										: "rgba(26, 26, 26, 0.6)",
								}}
							>
								Olahbola Sticker Pack Eksklusif
							</p>
						</div>
					</div>
				</section>

				{/* Leaderboard Section - Bundesliga 2026/2027 */}
				<section className="mb-10" id="leaderboard">
					<div
						className="rounded-3xl md:rounded-[40px] p-6 md:p-8 relative overflow-hidden"
						style={{
							background: isDark
								? "rgba(255, 255, 255, 0.03)"
								: "rgba(255, 255, 255, 0.55)",
							backdropFilter: "blur(40px)",
							border: `1px solid ${isDark ? "rgba(255, 255, 255, 0.1)" : "rgba(0, 0, 0, 0.08)"}`,
						}}
					>
						<div className="mb-6 md:mb-8">
							<h2
								className="text-2xl md:text-3xl font-black italic tracking-tight uppercase mb-2"
								style={{ color: isDark ? "#ffffff" : "#1a1a1a" }}
							>
								Klasemen Bundesliga 2026/2027
							</h2>
							<p
								className="text-xs font-bold tracking-widest uppercase"
								style={{
									color: isDark
										? "rgba(255, 255, 255, 0.4)"
										: "rgba(26, 26, 26, 0.5)",
								}}
							>
								Live — Prediksi Skor Bundesliga Season 2026/2027
							</p>
						</div>
						<BundesligaLeaderboard isDark={isDark} accent={accent} />
					</div>
				</section>
			</div>
		</div>
	);
}

/* --- Bundesliga Leaderboard Sub-Components --- */
function BundesligaLeaderboard({
	isDark,
	accent,
}: {
	isDark: boolean;
	accent: string;
}) {
	const { data, isLoading, isError } = useBLLeaderboard();
	const raw = (data as any)?.data ?? [];
	const entries: BLLeaderboardEntry[] = Array.isArray(raw) ? raw : [];

	if (isLoading) {
		return (
			<div
				className="text-center py-12"
				style={{
					color: isDark ? "rgba(255,255,255,0.3)" : "rgba(26,26,26,0.3)",
				}}
			>
				Memuat klasemen...
			</div>
		);
	}
	if (isError) {
		return (
			<div
				className="text-center py-12"
				style={{
					color: isDark ? "rgba(255,255,255,0.5)" : "rgba(26,26,26,0.5)",
				}}
			>
				Gagal memuat klasemen
			</div>
		);
	}
	if (entries.length === 0) {
		return (
			<div
				className="text-center py-12"
				style={{
					color: isDark ? "rgba(255,255,255,0.4)" : "rgba(26,26,26,0.4)",
				}}
			>
				Belum ada data klasemen
			</div>
		);
	}

	const sorted = [...entries]
		.sort((a, b) => (a.rank ?? 0) - (b.rank ?? 0))
		.slice(0, 10);
	const top3 = sorted.slice(0, 3);
	const rest = sorted.slice(3, 10);

	return (
		<div className="space-y-4">
			<div className="grid grid-cols-1 md:grid-cols-3 gap-6">
				{top3[1] && (
					<div className="text-center">
						<BLPodiumCard
							entry={top3[1]}
							rank={2}
							isDark={isDark}
							accent={accent}
						/>
					</div>
				)}
				{top3[0] && (
					<div className="text-center transform md:scale-110">
						<BLPodiumCard
							entry={top3[0]}
							rank={1}
							isDark={isDark}
							accent={accent}
							isChampion
						/>
					</div>
				)}
				{top3[2] && (
					<div className="text-center">
						<BLPodiumCard
							entry={top3[2]}
							rank={3}
							isDark={isDark}
							accent={accent}
						/>
					</div>
				)}
			</div>
			{rest.map((entry) => (
				<BLRankRow
					key={entry.user_id}
					entry={entry}
					isDark={isDark}
					accent={accent}
				/>
			))}
		</div>
	);
}

function BLPodiumCard({
	entry,
	rank,
	isDark,
	accent,
	isChampion,
}: {
	entry: BLLeaderboardEntry;
	rank: number;
	isDark: boolean;
	accent: string;
	isChampion?: boolean;
}) {
	const medalColors: Record<number, { ring: string; fill: string }> = {
		1: { ring: accent, fill: "#00C2B1" },
		2: {
			ring: isDark ? "rgba(255,255,255,0.5)" : "rgba(26,26,26,0.3)",
			fill: "#C0C0C0",
		},
		3: {
			ring: isDark ? "rgba(255,255,255,0.5)" : "rgba(26,26,26,0.3)",
			fill: "#CD7F32",
		},
	};
	const medal = medalColors[rank];
	return (
		<div
			className="rounded-3xl p-6 relative"
			style={{
				background: isChampion
					? `linear-gradient(180deg, ${accent}1a 0%, transparent 100%)`
					: isDark
						? "rgba(255,255,255,0.02)"
						: "rgba(255,255,255,0.03)",
				border: `2px solid ${isChampion ? accent + "66" : (medal?.ring ?? "transparent")}`,
				boxShadow: isChampion ? `0 20px 50px ${accent}26` : "none",
			}}
		>
			{isChampion && (
				<div
					className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 rounded-full text-[10px] font-black uppercase"
					style={{ background: accent, color: isDark ? "#003732" : "#fff" }}
				>
					Champion
				</div>
			)}
			<div
				className="relative mx-auto w-20 h-20 rounded-2xl overflow-hidden mb-3"
				style={{
					border: `2px solid ${isChampion ? accent : (medal?.ring ?? "transparent")}`,
				}}
			>
				{entry.profile_picture ? (
					<Image
						src={entry.profile_picture}
						alt={entry.user_name}
						fill
						sizes="80px"
						style={{ objectFit: "cover" }}
					/>
				) : (
					<Image
						src="/icons/football-player.png"
						alt="Player"
						fill
						sizes="80px"
						style={{ objectFit: "cover" }}
					/>
				)}
				<div
					className="absolute -top-2 -right-2 w-6 h-6 rounded-full flex items-center justify-center font-black text-xs"
					style={{
						background: medal?.fill ?? "#888",
						boxShadow: `0 0 12px ${medal?.fill ?? "#888"}80`,
					}}
				>
					{rank}
				</div>
			</div>
			<p
				className="font-black truncate text-sm"
				style={{ color: isDark ? "#fff" : "#1a1a1a" }}
				title={entry.user_name}
			>
				{entry.user_name}
			</p>
			<p className="font-black text-lg" style={{ color: accent }}>
				{entry.total_points?.toLocaleString() ?? 0}{" "}
				<span className="text-[10px]">PTS</span>
			</p>
		</div>
	);
}

function BLRankRow({
	entry,
	isDark,
	accent,
}: {
	entry: BLLeaderboardEntry;
	isDark: boolean;
	accent: string;
}) {
	return (
		<div
			className="flex items-center justify-between p-4 rounded-2xl"
			style={{
				background: isDark ? "rgba(255,255,255,0.04)" : "rgba(0,0,0,0.02)",
				border: `1px solid ${isDark ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.05)"}`,
			}}
		>
			<div className="flex items-center gap-4">
				<span
					className="font-black italic text-lg w-6 shrink-0"
					style={{
						color: isDark ? "rgba(255,255,255,0.3)" : "rgba(26,26,26,0.4)",
					}}
				>
					#{entry.rank ?? 0}
				</span>
				<div className="relative w-10 h-10 rounded-lg overflow-hidden shrink-0">
					{entry.profile_picture ? (
						<Image
							src={entry.profile_picture}
							alt={entry.user_name}
							fill
							sizes="40px"
							style={{ objectFit: "cover" }}
						/>
					) : (
						<Image
							src="/icons/football-player.png"
							alt="Player"
							fill
							sizes="40px"
							style={{ objectFit: "cover" }}
						/>
					)}
				</div>
				<p
					className="font-black truncate text-sm"
					style={{ color: isDark ? "#fff" : "#1a1a1a" }}
					title={entry.user_name}
				>
					{entry.user_name}
				</p>
			</div>
			<div className="text-right shrink-0">
				<p className="font-black" style={{ color: accent }}>
					{entry.total_points?.toLocaleString() ?? 0}
				</p>
				<p
					className="text-[8px] font-black uppercase"
					style={{
						color: isDark ? "rgba(255,255,255,0.3)" : "rgba(26,26,26,0.4)",
					}}
				>
					Points
				</p>
			</div>
		</div>
	);
}
