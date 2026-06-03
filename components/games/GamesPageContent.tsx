"use client";

import { useUIStore } from "@/stores/uiStore";
import { GameCard } from "@/components/games/GameCard";
import { PublicLeaderboard } from "@/components/games/PublicLeaderboard";
import { Play, Sparkles, Trophy, Zap } from "lucide-react";
import Link from "next/link";
import { useEffect, useRef } from "react";

export function GamesPageContent() {
	const { theme } = useUIStore();
	const isDark = theme === "dark";

	const accent = isDark ? "#00C2B1" : "#0a7c6e";
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
			className="relative min-h-screen pt-8 md:pt-12 pb-24 overflow-hidden"
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
				<section className="text-center mb-24 space-y-6">
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
					<h1 className="text-6xl md:text-[84px] font-black italic tracking-tighter leading-none">
						<span style={{ color: isDark ? "#ffffff" : "#1a1a1a" }}>
							PLAY THE GAME
						</span>
						<br />
						<span
							className="italic games-glow-text"
							style={{
								background: `linear-gradient(90deg, ${accent} 0%, ${isDark ? "#ffffff" : "#1a1a1a"} 100%)`,
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
						This is your pitch. Your moment. Compete against the world's best,
						showcase your football mastery, and carve your name into legend.
					</p>
				</section>

				{/* Game Cards Grid - 2 kolom */}
				<section className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-24">
					{/* Prediksi Skor - Score Predictor (Active) */}
					<GameCard
						title="Prediksi Skor"
						subtitle="Olahbola"
						description="Tebak skor pertandingan World Cup 2026. Raih poin untuk setiap match dan jadilah si paling tau bola!"
						href="/prediksi-skor"
						isActive={true}
						bgImage="https://lh3.googleusercontent.com/aida-public/AB6AXuB5HI0Ic9TTLFLPzKLZkiDC7j96nX26StXZbDRonjaCHXwtxjc83Z6qh24Jp_KAyPlscOAc-zt9movr_lsoI71-ZrdklVfCTyVVnZKUXdSq910PBwQzcdYGHyKxfmSiOrrmsW1ZxQqxIxYqP61lXz1ATWdXduJCqpRWzTp8yNZrca_o1oxCAFaSsQ4vSm_t8C5BbF-aztQICu0iD_4EcLS2NLgQmZH-x0n8qv_-NY3ZdmLJsSZNlxHBWEVGhvNifBew4-ZEw-6UymA"
						accentColor={accent}
						isDark={isDark}
					/>

					{/* OlahBola Quiz - Pro Quiz (Coming Soon) */}
					<GameCard
						title="OlahBola Quiz"
						subtitle="Si Paling Jago Bola"
						description="Ikuti olahbola quiz, adu pengetahuan seputar sepak bola, dan buktikan kamu si paling jago bola!"
						href="/quiz"
						isActive={false}
						bgImage="https://fistf.com/wp-content/uploads/2017/08/cropped-UEFA-Champions-League-Stadium-Wallpaper.jpg"
						accentColor={
							isDark ? "rgba(255, 255, 255, 0.3)" : "rgba(26, 26, 26, 0.35)"
						}
						isDark={isDark}
					/>
				</section>

				{/* Leaderboard Section - Global Top 10 (tanpa hover, hanya static glass card) */}
				<section
					className="rounded-3xl md:rounded-[40px] p-6 md:p-10 relative overflow-hidden"
					style={{
						background: isDark
							? "rgba(255, 255, 255, 0.03)"
							: "rgba(255, 255, 255, 0.55)",
						backdropFilter: "blur(40px)",
						border: `1px solid ${isDark ? "rgba(255, 255, 255, 0.1)" : "rgba(0, 0, 0, 0.08)"}`,
					}}
				>
					<div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-10 md:mb-12 gap-6">
						<div>
							<div className="flex items-center gap-3 mb-2">
								<h2
									className="text-3xl font-black italic tracking-tight uppercase"
									style={{ color: isDark ? "#ffffff" : "#1a1a1a" }}
								>
									Klasemen Prediksi Skor
								</h2>
							</div>
							<p
								className="text-xs font-bold tracking-widest uppercase"
								style={{
									color: isDark
										? "rgba(255, 255, 255, 0.4)"
										: "rgba(26, 26, 26, 0.5)",
								}}
							>
								Live sementara — World Cup Season 1
							</p>
						</div>
					</div>

					{/* Leaderboard Content */}
					<PublicLeaderboard isDark={isDark} />

					{/* CTA */}
					<div className="mt-10 text-center">
						<Link
							href="/prediksi-skor"
							className="inline-flex items-center gap-2 px-10 py-3 rounded-full font-black italic tracking-widest text-xs uppercase transition-all hover:scale-105"
							style={{
								background: `${accent}1a`,
								border: `1px solid ${accent}66`,
								color: accent,
							}}
						>
							<Trophy className="w-3.5 h-3.5" />
							<span>View Full Leaderboard</span>
						</Link>
					</div>
				</section>
			</div>
		</div>
	);
}
