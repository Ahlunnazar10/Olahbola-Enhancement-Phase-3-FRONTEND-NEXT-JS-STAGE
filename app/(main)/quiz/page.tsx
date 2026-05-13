"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
	Trophy,
	Star,
	Bell,
	User,
	Search,
	Award,
	Clock,
	Users,
	CircleDot,
} from "lucide-react";
import { useAuthStore } from "@/stores/authStore";
import { useQuizSummary } from "@/hooks/queries/useQuiz";
import { useUIStore } from "@/stores/uiStore";

export default function QuizPage() {
	const router = useRouter();
	const { theme } = useUIStore();
	const isDark = theme === "dark";
	const { user, isAuthenticated } = useAuthStore();
	const { data: summary, isLoading: summaryLoading } = useQuizSummary();

	const handlePlayQuiz = (quizType: string) => {
		if (!isAuthenticated) {
			router.push("/login");
			return;
		}
		// Navigate to quiz or show available levels
		router.push("/quiz/1");
	};

	return (
		<div className={`min-h-screen velocity-mesh transition-colors duration-300 ${isDark ? "bg-[#050505]" : "bg-[#f5f5f5]"}`}>
			{/* Background Blobs */}
			<div className={`vibrant-blob top-[10%] -left-40 ${isDark ? "bg-primary" : "bg-[#0a7c6e]"}`} />
			<div className={`vibrant-blob top-[40%] -right-40 ${isDark ? "bg-tertiary-container" : "bg-[#b3461a]/30"}`} />
			<div className={`vibrant-blob bottom-[10%] left-1/2 -translate-x-1/2 ${isDark ? "bg-primary-container" : "bg-[#0a7c6e]/30"}`} />

			{/* Hero Section */}
			<section className="relative w-full h-125 overflow-hidden mb-12 group shadow-[0_0_50px_rgba(0,0,0,0.5)]">
				<div className="absolute inset-0 z-0">
					<img
						alt="Football Stadium"
						src="https://images.unsplash.com/photo-1574629810360-7efbbe195018?w=1920&q=80"
						className="w-full h-full object-cover grayscale brightness-50 contrast-125 transition-transform duration-1000 group-hover:scale-105"
					/>
				</div>
				<div className="absolute inset-0 bg-linear-to-t from-surface via-transparent to-transparent z-10" />
				<div className="relative z-20 flex flex-col items-center justify-center h-full text-center p-6">
					<h1 className="font-display-xl text-display-xl italic-bold text-white mb-4 leading-none tracking-tight neon-text">
						KUIS SPESIAL
						<br />
						<span className="text-primary-fixed-dim">HARI RAYA</span>
					</h1>
					<p className="font-body-lg text-body-lg text-on-surface-variant max-w-2xl mb-8">
						Uji pengetahuan sepak bola kamu dan Buktikan Kamu adalah si-paling
						tau bola dan menangkan hadiah jersey original!
					</p>
					<button
						onClick={() => handlePlayQuiz("special")}
						className="bg-primary-container text-on-primary-container px-12 py-4 rounded-full font-headline-md italic-bold neon-glow-btn animate-float active:scale-95 transition-all hover:scale-105 hover:brightness-110"
					>
						CEK SEKARANG!
					</button>
				</div>
			</section>

			<main className="relative pt-12 pb-12 px-4 md:px-8 max-w-7xl mx-auto z-10">
				<div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
					{/* Main Content Area (8 Columns) */}
					<div className="lg:col-span-8 space-y-8">
						{/* Featured Section: Bento Grid */}
						<div className="grid grid-cols-1 md:grid-cols-2 gap-8">
							{/* Featured Quiz Card */}
							<div className="glass-card rounded-xl p-8 flex flex-col justify-between min-h-80 relative overflow-hidden group border-primary/30">
								<div className="absolute top-0 right-0 p-4">
									<span className="flex items-center gap-2 text-primary font-label-bold bg-primary/20 px-3 py-1 rounded-full border border-primary/40 shadow-[0_0_15px_rgba(0,194,177,0.3)] animate-pulse">
										<span className="w-2 h-2 rounded-full bg-primary shadow-[0_0_8px_#00C2B1]" />
										LIVE NOW
									</span>
								</div>
								<div className="mt-5">
									<span className="font-label-bold text-primary/80 uppercase tracking-widest">
										EPL SPECIAL EDITION
									</span>
									<h3 className="font-headline-lg text-headline-lg italic-bold text-white mt-2 neon-text">
										THE NORTH LONDON DERBY
									</h3>
									<p className="text-on-surface-variant mt-3 text-sm">
										Uji pengetahuanmu tentang rivalitas Arsenal vs Tottenham!
									</p>
								</div>
								<div className="mt-8">
									<div className="flex items-center gap-4 mb-4">
										<Clock className="text-primary neon-text size-5" />
										<span className="text-on-surface">Ends in: 04:22:15</span>
									</div>
									<button
										onClick={() => handlePlayQuiz("epl")}
										className="w-full bg-transparent border-2 border-primary text-primary px-6 py-3 rounded-lg font-label-bold italic-bold hover:bg-primary hover:text-black transition-all hover:shadow-[0_0_20px_rgba(0,194,177,0.4)]"
									>
										PLAY QUIZ
									</button>
								</div>
							</div>

							{/* Friendly Match Quiz Card */}
							<div className="glass-card rounded-xl p-8 flex flex-col justify-between min-h-80 relative overflow-hidden group border-tertiary/30">
								<div className="absolute top-0 right-0 p-4">
									<span className="flex items-center gap-2 text-tertiary font-label-bold bg-tertiary/20 px-3 py-1 rounded-full border border-tertiary/40 shadow-[0_0_15px_rgba(255,184,158,0.3)]">
										<span className="w-2 h-2 rounded-full bg-tertiary shadow-[0_0_8px_#ffb89e]" />
										FRIENDLY MATCH
									</span>
								</div>
								<div className="mt-5">
									<span className="font-label-bold text-tertiary/80 uppercase tracking-widest">
										WEEKEND SPECIAL
									</span>
									<h3 className="font-headline-lg text-headline-lg italic-bold text-white mt-2 neon-text">
										FRIENDLY MATCH CHALLENGE
									</h3>
									<p className="text-on-surface-variant mt-3 text-sm">
										Challenge temanmu dan lihat siapa yang lebih jago!
									</p>
								</div>
								<div className="mt-8">
									<div className="flex items-center gap-4 mb-4">
										<Clock className="text-tertiary size-5" />
										<span className="text-on-surface">
											Win 2.5k Velocity Coins
										</span>
									</div>
									<button
										onClick={() => handlePlayQuiz("friendly")}
										className="w-full bg-transparent border-2 border-tertiary text-tertiary px-6 py-3 rounded-lg font-label-bold italic-bold hover:bg-tertiary hover:text-black transition-all hover:shadow-[0_0_20px_rgba(255,184,158,0.4)]"
									>
										JOIN MATCH
									</button>
								</div>
							</div>
						</div>

						{/* Coming Soon Card */}
						<div className="glass-card rounded-xl overflow-hidden min-h-80 relative group">
							<img
								alt="Champions League"
								src="https://i.pinimg.com/736x/fd/68/af/fd68afdacedca5b690e7957bf9bd43e9.jpg"
								className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
							/>
							<div className="absolute inset-0 bg-linear-to-tr from-black via-black/40 to-transparent flex flex-col justify-end p-8">
								<span className="font-label-bold text-primary mb-2 neon-text">
									UPCOMING CHALLENGE
								</span>
								<h3 className="font-headline-lg text-headline-lg italic-bold text-white">
									COMING SOON
								</h3>
								<p className="text-on-surface-variant font-body-md mt-2">
									The Ultimate World Cup 2026 Quiz
								</p>
							</div>
						</div>

						{/* Trending Quizzes */}
						<div className="space-y-6">
							<div className="flex justify-between items-end">
								<h2 className="font-headline-md text-headline-md italic-bold text-white neon-text">
									TRENDING CHALLENGES
								</h2>
								<Link
									href="#"
									className="text-primary font-label-bold hover:underline hover:text-primary-fixed-dim transition-colors"
								>
									LIHAT SEMUA
								</Link>
							</div>

							<div className="grid grid-cols-1 md:grid-cols-3 gap-4">
								{/* Card 1 */}
								<div className="glass-card rounded-xl overflow-hidden transition-all cursor-pointer group hover:shadow-[0_0_20px_rgba(67,222,204,0.2)]">
									<div className="h-40 relative overflow-hidden">
										<img
											alt="Player Celebration"
											src="https://images.unsplash.com/photo-1560272564-c83b66b1ad12?w=600&q=80"
											className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
										/>
									</div>
									<div className="p-4">
										<h4 className="font-label-bold text-white text-base group-hover:text-primary transition-colors mb-2">
											LEGENDARY FINISHERS
										</h4>
										<div className="flex justify-between items-center text-on-surface-variant text-xs">
											<span className="flex items-center gap-1">
												<Clock className="size-3" /> 15 Questions
											</span>
											<span className="flex items-center gap-1">
												<Users className="size-3" /> 12.5k Played
											</span>
										</div>
									</div>
								</div>

								{/* Card 2 */}
								<div className="glass-card rounded-xl overflow-hidden transition-all cursor-pointer group hover:shadow-[0_0_20px_rgba(67,222,204,0.2)]">
									<div className="h-40 relative overflow-hidden">
										<img
											alt="Tactics Board"
											src="https://images.unsplash.com/photo-1517466787929-bc90951d0974?w=600&q=80"
											className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
										/>
									</div>
									<div className="p-4">
										<h4 className="font-label-bold text-white text-base group-hover:text-primary transition-colors mb-2">
											THE TACTICIAN'S HUB
										</h4>
										<div className="flex justify-between items-center text-on-surface-variant text-xs">
											<span className="flex items-center gap-1">
												<Clock className="size-3" /> 10 Questions
											</span>
											<span className="flex items-center gap-1">
												<Users className="size-3" /> 8.2k Played
											</span>
										</div>
									</div>
								</div>

								{/* Card 3 */}
								<div className="glass-card rounded-xl overflow-hidden transition-all cursor-pointer group hover:shadow-[0_0_20px_rgba(67,222,204,0.2)]">
									<div className="h-40 relative overflow-hidden">
										<img
											alt="World Cup"
											src="https://images.unsplash.com/photo-1551958219-acbc608c6377?w=600&q=80"
											className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
										/>
									</div>
									<div className="p-4">
										<h4 className="font-label-bold text-white text-base group-hover:text-primary transition-colors mb-2">
											WORLD CUP HISTORY
										</h4>
										<div className="flex justify-between items-center text-on-surface-variant text-xs">
											<span className="flex items-center gap-1">
												<Clock className="size-3" /> 20 Questions
											</span>
											<span className="flex items-center gap-1">
												<Users className="size-3" /> 25.1k Played
											</span>
										</div>
									</div>
								</div>
							</div>
						</div>

						{/* How to Play Section */}
						<div className="glass-card rounded-xl p-8">
							<h2 className="font-headline-md text-headline-md italic-bold text-white mb-6 neon-text">
								CARA BERMAIN
							</h2>
							<div className="grid grid-cols-1 md:grid-cols-3 gap-6">
								<div className="text-center">
									<div className="w-16 h-16 rounded-full bg-primary/20 border-2 border-primary flex items-center justify-center mx-auto mb-4 shadow-[0_0_20px_rgba(0,194,177,0.3)]">
										<span className="text-3xl font-extrabold text-primary neon-text">
											1
										</span>
									</div>
									<h3 className="font-label-bold text-white mb-2">
										PILIH QUIZ
									</h3>
									<p className="text-on-surface-variant text-sm">
										Pilih quiz yang tersedia sesuai level dan tema yang kamu
										suka
									</p>
								</div>
								<div className="text-center">
									<div className="w-16 h-16 rounded-full bg-primary/20 border-2 border-primary flex items-center justify-center mx-auto mb-4 shadow-[0_0_20px_rgba(0,194,177,0.3)]">
										<span className="text-3xl font-extrabold text-primary neon-text">
											2
										</span>
									</div>
									<h3 className="font-label-bold text-white mb-2">
										JAWAB SOAL
									</h3>
									<p className="text-on-surface-variant text-sm">
										Jawab 10 pertanyaan pilihan ganda dalam waktu yang
										ditentukan
									</p>
								</div>
								<div className="text-center">
									<div className="w-16 h-16 rounded-full bg-primary/20 border-2 border-primary flex items-center justify-center mx-auto mb-4 shadow-[0_0_20px_rgba(0,194,177,0.3)]">
										<span className="text-3xl font-extrabold text-primary neon-text">
											3
										</span>
									</div>
									<h3 className="font-label-bold text-white mb-2">
										KUMPUL POIN
									</h3>
									<p className="text-on-surface-variant text-sm">
										Kumpulkan poin dan naik di leaderboard untuk menang hadiah!
									</p>
								</div>
							</div>
						</div>
					</div>

					{/* Sidebar (4 Columns) */}
					<aside className="lg:col-span-4 space-y-8">
						{/* Leaderboard */}
						<div className="glass-card rounded-xl p-6 neon-border bg-black/60">
							<h2 className="font-headline-md text-headline-md italic-bold text-white mb-6 flex items-center gap-3 neon-text">
								<Award className="text-primary size-6" />
								LEADERBOARD HARI RAYA
							</h2>
							<div className="space-y-4">
								{/* Top 1 */}
								<div className="flex items-center gap-4 bg-primary/20 p-3 rounded-lg border-2 border-primary shadow-[0_0_25px_rgba(0,194,177,0.4)] relative overflow-hidden group">
									<div className="absolute inset-0 bg-primary/10 -translate-x-full group-hover:translate-x-0 transition-transform duration-500" />
									<div className="font-display-xl text-3xl italic-bold text-primary opacity-80 w-8 relative z-10">
										01
									</div>
									<div className="flex-1 relative z-10 text-end">
										<div className="font-label-bold text-white">
											VALKYRIE_07
										</div>
										<div className="text-xs text-primary font-bold uppercase">
											3,240 POINTS
										</div>
									</div>
									<Star className="size-5 text-primary fill-primary relative z-10" />
								</div>

								{/* Top 2 */}
								<div className="flex items-center gap-4 hover:bg-white/5 p-3 rounded-lg transition-all cursor-pointer text-end">
									<div className="font-display-xl text-3xl italic-bold text-on-surface-variant opacity-30 w-8">
										02
									</div>
									<div className="flex-1">
										<div className="font-label-bold text-white">
											STRIKER_RIZA
										</div>
										<div className="text-xs text-on-surface-variant uppercase">
											3,115 POINTS
										</div>
									</div>
								</div>

								{/* Top 3 */}
								<div className="flex items-center gap-4 hover:bg-white/5 p-3 rounded-lg transition-all cursor-pointer text-end">
									<div className="font-display-xl text-3xl italic-bold text-on-surface-variant opacity-30 w-8">
										03
									</div>
									<div className="flex-1">
										<div className="font-label-bold text-white">
											JEREMY_DONE
										</div>
										<div className="text-xs text-on-surface-variant uppercase">
											2,980 POINTS
										</div>
									</div>
								</div>

								{/* User Position */}
								{isAuthenticated && user && summary && (
									<div className="mt-6 pt-4 border-t border-outline-variant">
										<div className="flex items-center gap-4 bg-tertiary-container/30 p-3 rounded-lg border border-tertiary/60 shadow-[0_0_20px_rgba(255,143,99,0.3)] text-end">
											<div className="font-display-xl text-3xl italic-bold text-white opacity-50 w-8">
												42
											</div>
											<div className="flex-1">
												<div className="font-label-bold text-white">
													{user.name}
												</div>
												<div className="text-xs text-tertiary-fixed-dim font-bold uppercase">
													{summary.total_points_earned?.toLocaleString() || 0}{" "}
													POINTS
												</div>
											</div>
										</div>
									</div>
								)}

								{!isAuthenticated && (
									<div className="mt-6 pt-4 border-t border-outline-variant text-center">
										<p className="text-on-surface-variant text-sm mb-4">
											Login untuk melihat posisi kamu
										</p>
										<Link
											href="/login"
											className="inline-block w-full bg-primary-container text-on-primary-container py-3 rounded-lg font-label-bold neon-glow-btn transition-all hover:scale-105"
										>
											LOGIN SEKARANG
										</Link>
									</div>
								)}
							</div>

							<Link
								href="/leaderboard"
								className="block w-full mt-6 py-3 rounded-lg font-label-bold text-center border border-primary/40 text-primary hover:bg-primary/10 transition-all"
							>
								LIHAT LEADERBOARD LENGKAP
							</Link>
						</div>

						{/* Active Events */}
						<div className="glass-card rounded-xl p-6 relative overflow-hidden">
							<div className="absolute top-0 right-0 w-32 h-32 bg-primary/20 blur-[60px] rounded-full" />
							<div className="absolute bottom-0 left-0 w-24 h-24 bg-tertiary-container/10 blur-2xl rounded-full" />
							<h3 className="font-headline-md text-headline-md italic-bold text-white mb-4 neon-text">
								EVENT AKTIF
							</h3>
							<ul className="space-y-4">
								<li className="flex items-start gap-3 group cursor-pointer">
									<div className="w-2 h-2 rounded-full bg-primary mt-2 shadow-[0_0_8px_#00C2B1] group-hover:scale-150 transition-transform" />
									<div>
										<p className="text-on-surface font-label-bold group-hover:text-primary transition-colors">
											Weekly Sprint: Goal Rush
										</p>
										<p className="text-xs text-primary-fixed-dim font-bold">
											Hadiah: 5,000 Velocity Coins
										</p>
									</div>
								</li>
								<li className="flex items-start gap-3 group cursor-pointer">
									<div className="w-2 h-2 rounded-full bg-primary mt-2 shadow-[0_0_8px_#00C2B1] group-hover:scale-150 transition-transform" />
									<div>
										<p className="text-on-surface font-label-bold group-hover:text-primary transition-colors">
											Hari Raya Mega Tournament
										</p>
										<p className="text-xs text-primary-fixed-dim font-bold">
											Hadiah: Special Edition Jersey
										</p>
									</div>
								</li>
								<li className="flex items-start gap-3 group cursor-pointer">
									<div className="w-2 h-2 rounded-full bg-tertiary mt-2 shadow-[0_0_8px_#ffb89e] group-hover:scale-150 transition-transform" />
									<div>
										<p className="text-on-surface font-label-bold group-hover:text-primary transition-colors">
											Friendly Weekend Challenge
										</p>
										<p className="text-xs text-tertiary-fixed-dim font-bold">
											Hadiah: 2,500 Velocity Coins
										</p>
									</div>
								</li>
							</ul>
						</div>

						{/* Prize Pool */}
						<div className="glass-card rounded-xl p-6">
							<h3 className="font-headline-md text-headline-md italic-bold text-white mb-4 neon-text">
								PRIZE POOL
							</h3>
							<div className="space-y-4">
								<div className="flex items-center gap-4 p-3 bg-primary/10 rounded-lg border border-primary/30">
									<Trophy className="text-primary neon-text size-8" />
									<div className="flex-1">
										<p className="font-label-bold text-white">
											Total Prize Pool
										</p>
										<p className="text-xs text-primary">
											Berbagai hadiah menarik menunggumu!
										</p>
									</div>
								</div>
								<div className="grid grid-cols-2 gap-3">
									<div className="text-center p-3 bg-surface-container-low rounded-lg">
										<p className="text-2xl font-bold text-primary neon-text">
											Rp 5Jt
										</p>
										<p className="text-xs text-on-surface-variant">
											Cash Prize
										</p>
									</div>
									<div className="text-center p-3 bg-surface-container-low rounded-lg">
										<p className="text-2xl font-bold text-tertiary">Jersey</p>
										<p className="text-xs text-on-surface-variant">
											Special Edition
										</p>
									</div>
									<div className="text-center p-3 bg-surface-container-low rounded-lg">
										<p className="text-2xl font-bold text-secondary">50K+</p>
										<p className="text-xs text-on-surface-variant">
											Velocity Coins
										</p>
									</div>
									<div className="text-center p-3 bg-surface-container-low rounded-lg">
										<p className="text-2xl font-bold text-on-surface">VIP</p>
										<p className="text-xs text-on-surface-variant">
											Content Access
										</p>
									</div>
								</div>
							</div>
						</div>
					</aside>
				</div>
			</main>

			<style jsx global>{`
				.velocity-mesh {
					background-color: ${isDark ? "#050505" : "#f5f5f5"};
					background-image: radial-gradient(
						circle at 2px 2px,
						${isDark ? "rgba(0, 194, 177, 0.05) 1px" : "rgba(10, 124, 110, 0.05) 1px"},
						transparent 0
					);
					background-size: 40px 40px;
				}

				.glass-card {
					background: ${isDark ? "rgba(10, 15, 13, 0.7)" : "rgba(255, 255, 255, 0.8)"};
					backdrop-filter: blur(40px);
					border: 1px solid ${isDark ? "rgba(0, 194, 177, 0.2)" : "rgba(10, 124, 110, 0.2)"};
					transition: all 0.3s ease;
				}

				.glass-card:hover {
					border-color: ${isDark ? "rgba(0, 194, 177, 0.5)" : "rgba(10, 124, 110, 0.5)"};
					box-shadow: 0 0 30px ${isDark ? "rgba(0, 194, 177, 0.15)" : "rgba(10, 124, 110, 0.15)"};
				}

				.neon-border {
					border: 2px solid ${isDark ? "#00c2b1" : "#0a7c6e"};
					box-shadow: 0 0 25px ${isDark ? "rgba(0, 194, 177, 0.5)" : "rgba(10, 124, 110, 0.4)"};
				}

				.glass-card .neon-text,
				.neon-text {
					text-shadow:
						0 0 10px ${isDark ? "rgba(64, 220, 202, 0.5)" : "rgba(10, 124, 110, 0.4)"},
						0 0 20px ${isDark ? "rgba(64, 220, 202, 0.3)" : "rgba(10, 124, 110, 0.2)"};
				}

				.neon-glow-btn {
					box-shadow: 0 0 25px ${isDark ? "rgba(0, 194, 177, 0.5)" : "rgba(10, 124, 110, 0.4)"};
				}

				.italic-bold {
					font-style: italic;
					text-transform: uppercase;
				}

				@keyframes float {
					0%,
					100% {
						transform: translateY(0);
					}
					50% {
						transform: translateY(-10px);
					}
				}

				.animate-float {
					animation: float 4s ease-in-out infinite;
				}

				.vibrant-blob {
					position: absolute;
					width: 400px;
					height: 400px;
					filter: blur(100px);
					opacity: 0.15;
					border-radius: 50%;
					z-index: 0;
					pointer-events: none;
				}
			`}</style>
		</div>
	);
}
