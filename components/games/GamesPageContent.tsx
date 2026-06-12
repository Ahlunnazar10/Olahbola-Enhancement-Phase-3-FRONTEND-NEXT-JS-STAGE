"use client";

import { useUIStore } from "@/stores/uiStore";
import { GameCard } from "@/components/games/GameCard";
import { PublicLeaderboard } from "@/components/games/PublicLeaderboard";
import { QuizWorldCupLeaderboard } from "@/components/games/QuizWorldCupLeaderboard";
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
				<section className="text-center mb-10 md:mb-24 space-y-6">
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

				{/* Game Cards Grid - 2 kolom */}
				<section className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-8 mb-10 md:mb-24">
					{/* Prediksi Skor - Score Predictor (Active) */}
					<GameCard
						title="Prediksi Skor"
						subtitle="Teater Bola Dunia"
						description="Tebak skor pertandingan Teater Bola Dunia. Raih poin untuk setiap match dan jadilah si paling tau bola!"
						href="/prediksi-skor"
						isActive={true}
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
						bgImage="/images/games/quiz-bg.webp"
						accentColor={accent}
						isDark={isDark}
					/>
				</section>

				{/* Leaderboard Section - Side by side: Prediksi Skor | Quiz World Cup */}
				<section className="grid grid-cols-1 md:grid-cols-2 gap-6">
					{/* Prediksi Skor Leaderboard */}
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
								Klasemen Prediksi Skor
							</h2>
							<p
								className="text-xs font-bold tracking-widest uppercase"
								style={{
									color: isDark
										? "rgba(255, 255, 255, 0.4)"
										: "rgba(26, 26, 26, 0.5)",
								}}
							>
								Live sementara — Olahbola Teater Bola Dunia Season 1
							</p>
						</div>

						<PublicLeaderboard isDark={isDark} />

						<div className="mt-8 text-center">
							<Link
								href="/prediksi-skor"
								className="inline-flex items-center gap-2 px-8 py-2.5 rounded-full font-black italic tracking-widest text-xs uppercase transition-all hover:scale-105"
								style={{
									background: `${accent}1a`,
									border: `1px solid ${accent}66`,
									color: accent,
								}}
							>
								<Zap className="w-3.5 h-3.5" />
								<span>Main Prediksi Skor</span>
							</Link>
						</div>
					</div>

					{/* Quiz World Cup Leaderboard */}
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
								Klasemen Kuis
							</h2>
							<p
								className="text-xs font-bold tracking-widest uppercase"
								style={{
									color: isDark
										? "rgba(255, 255, 255, 0.4)"
										: "rgba(26, 26, 26, 0.5)",
								}}
							>
								Live sementara — Olahbola Teater Bola Dunia Season 1
							</p>
						</div>

						<QuizWorldCupLeaderboard isDark={isDark} />

						<div className="mt-8 text-center">
							<Link
								href="/quiz"
								className="inline-flex items-center gap-2 px-8 py-2.5 rounded-full font-black italic tracking-widest text-xs uppercase transition-all hover:scale-105"
								style={{
									background: `${accent}1a`,
									border: `1px solid ${accent}66`,
									color: accent,
								}}
							>
								<Zap className="w-3.5 h-3.5" />
								<span>Main Kuis</span>
							</Link>
						</div>
					</div>
				</section>
			</div>
		</div>
	);
}
