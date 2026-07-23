"use client";

import { useUIStore } from "@/stores/uiStore";
import { GameCard } from "@/components/games/GameCard";
import { PublicLeaderboard } from "@/components/games/PublicLeaderboard";
import { QuizWorldCupLeaderboard } from "@/components/games/QuizWorldCupLeaderboard";
import { TeaterBolaAseanLeaderboard } from "@/components/games/TeaterBolaAseanLeaderboard";
import { EventEndedBanner } from "@/components/games/EventEndedBanner";
import { EVENT_STATUS } from "@/lib/games/eventStatus";
import { Play, Sparkles, Trophy, Zap } from "lucide-react";
import Link from "next/link";
import { useEffect, useRef } from "react";

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

			{/* Background effects - velocity mesh + blurred orbs (fixed di seluruh viewport) */}
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

				{/* Active Game Cards Grid - 1 kolom */}
				<section className="grid grid-cols-1 gap-4 md:gap-8 mb-6 md:mb-8">
					{/* Prediksi Skor - Score Predictor */}
					<GameCard
						title="Prediksi Skor"
						subtitle="Teater Bola Asean 2026"
						description="Tebak skor pertandingan Teater Bola Asean. Raih poin untuk setiap match dan jadilah si paling tau bola!"
						href="/teater-bola-asean-2026"
						isActive={true}
						bgImage="/images/games/teater-bola-asean-prediction-bg.webp"
						accentColor={accent}
						isDark={isDark}
					/>
				</section>

				{/* Inactive Game Cards Grid - 2 kolom */}
				<section className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-8 mb-6 md:mb-18">
					{/* Prediksi Skor - Score Predictor */}
					<GameCard
						title="Prediksi Skor"
						subtitle="Teater Bola Dunia"
						description="Tebak skor pertandingan Teater Bola Dunia. Raih poin untuk setiap match dan jadilah si paling tau bola!"
						href="/prediksi-skor"
						isActive={true}
						eventState={EVENT_STATUS.prediksiSkor.isEnded ? "ended" : "live"}
						bgImage="/images/games/prediction-bg.webp"
						accentColor={accent}
						isDark={isDark}
					/>

					{/* OlahBola Kuis - Pro Quiz  */}
					<GameCard
						title="OlahBola Kuis"
						subtitle="Teater Bola Dunia"
						description="Ikuti olahbola kuis, adu pengetahuan seputar sepak bola, dan buktikan kamu si paling jago bola!"
						href="/quiz"
						isActive={true}
						eventState={EVENT_STATUS.quiz.isEnded ? "ended" : "live"}
						bgImage="/images/games/quiz-bg.webp"
						accentColor={accent}
						isDark={isDark}
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
								{/* Hover background shapes behind image */}
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
								{/* Hover background shapes behind image */}
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
								{/* Hover background shapes behind image */}
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

				{/* Leaderboard Section - Teater Bola Asean | Prediksi Skor | Quiz World Cup */}
				<section
					className="grid grid-cols-1 md:grid-cols-1 mb-10"
					id="leaderboard"
				>
					{/* Teater Bola Asean Leaderboard */}
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
								Klasemen Teater Bola Asean
							</h2>
							<p
								className="text-xs font-bold tracking-widest uppercase"
								style={{
									color: isDark
										? "rgba(255, 255, 255, 0.4)"
										: "rgba(26, 26, 26, 0.5)",
								}}
							>
								Live sementara — Teater Bola Asean 2026 Prediksi Skor
							</p>
						</div>

						<TeaterBolaAseanLeaderboard isDark={isDark} />
					</div>
				</section>
			</div>
		</div>
	);
}
