"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

export default function NotFound() {
	const [isDark, setIsDark] = useState(true);

	useEffect(() => {
		// Check theme from localStorage or system preference
		const savedTheme = localStorage.getItem("theme");
		if (savedTheme) {
			setIsDark(savedTheme === "dark");
		} else {
			const prefersDark = window.matchMedia(
				"(prefers-color-scheme: dark)",
			).matches;
			setIsDark(prefersDark);
		}

		// Listen for theme changes
		const handleThemeChange = () => {
			const savedTheme = localStorage.getItem("theme");
			setIsDark(savedTheme === "dark");
		};
		window.addEventListener("themeChange", handleThemeChange);
		return () => window.removeEventListener("themeChange", handleThemeChange);
	}, []);

	const colors = {
		bg: isDark ? "#0f1412" : "#f5f5f5",
		bgSecondary: isDark ? "#141a17" : "#e8e8e8",
		text: isDark ? "#ffffff" : "#1a1a1a",
		textSecondary: isDark ? "#bbcac6" : "#5a5a5a",
		accent: isDark ? "#43decc" : "#0a7c6e",
		accentGlow: isDark ? "rgba(67, 222, 204, 0.3)" : "rgba(10, 124, 110, 0.2)",
		gradientText: isDark
			? "linear-gradient(135deg, #43decc 0%, #6ee7df 50%, #43decc 100%)"
			: "linear-gradient(135deg, #0a7c6e 0%, #15a896 50%, #0a7c6e 100%)",
	};

	return (
		<>
			<style jsx global>{`
				@import url("https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@300..700&family=Lexend:wght@300..800&display=swap");

				body {
					font-family: "Lexend", sans-serif;
				}

				@keyframes float {
					0%,
					100% {
						transform: translateY(0px);
					}
					50% {
						transform: translateY(-20px);
					}
				}

				@keyframes pulse-glow {
					0%,
					100% {
						filter: drop-shadow(0 0 20px ${colors.accentGlow});
					}
					50% {
						filter: drop-shadow(0 0 40px ${colors.accentGlow});
					}
				}

				@keyframes bounce-subtle {
					0%,
					100% {
						transform: translateY(0);
					}
					50% {
						transform: translateY(-10px);
					}
				}

				@keyframes slide-up {
					0% {
						opacity: 0;
						transform: translateY(30px);
					}
					100% {
						opacity: 1;
						transform: translateY(0);
					}
				}

				@keyframes wiggle {
					0%,
					100% {
						transform: rotate(-3deg);
					}
					50% {
						transform: rotate(3deg);
					}
				}

				@keyframes gradient-shift {
					0% {
						background-position: 0% 50%;
					}
					50% {
						background-position: 100% 50%;
					}
					100% {
						background-position: 0% 50%;
					}
				}

				.animate-float {
					animation: float 6s ease-in-out infinite;
				}

				.animate-pulse-glow {
					animation: pulse-glow 3s ease-in-out infinite;
				}

				.animate-bounce-subtle {
					animation: bounce-subtle 2s ease-in-out infinite;
				}

				.animate-slide-up {
					animation: slide-up 0.8s ease-out forwards;
				}

				.animate-wiggle {
					animation: wiggle 1s ease-in-out infinite;
				}

				.animate-gradient {
					background-size: 200% 200%;
					animation: gradient-shift 4s ease infinite;
				}

				.material-symbols-outlined {
					font-variation-settings:
						"FILL" 0,
						"wght" 400,
						"GRAD" 0,
						"opsz" 24;
				}
			`}</style>

			<div
				className="min-h-screen flex flex-col items-center justify-center relative overflow-hidden px-4"
				style={{ background: colors.bg }}
			>
				{/* Animated Background Elements */}
				<div className="absolute inset-0 overflow-hidden pointer-events-none">
					{/* Floating Orbs */}
					<div
						className="absolute w-96 h-96 rounded-full animate-float"
						style={{
							background: `radial-gradient(circle, ${colors.accentGlow} 0%, transparent 70%)`,
							filter: "blur(80px)",
							top: "10%",
							left: "10%",
						}}
					/>
					<div
						className="absolute w-80 h-80 rounded-full"
						style={{
							background: `radial-gradient(circle, ${colors.accentGlow} 0%, transparent 70%)`,
							filter: "blur(100px)",
							bottom: "15%",
							right: "10%",
							animation: "float 8s ease-in-out infinite reverse",
						}}
					/>

					{/* Grid Pattern */}
					<div
						className="absolute inset-0 opacity-5"
						style={{
							backgroundImage: `linear-gradient(${isDark ? "rgba(255, 255, 255, 0.1)" : "rgba(0, 0, 0, 0.1)"} 1px, transparent 1px), linear-gradient(90deg, ${isDark ? "rgba(255, 255, 255, 0.1)" : "rgba(0, 0, 0, 0.1)"} 1px, transparent 1px)`,
							backgroundSize: "60px 60px",
						}}
					/>

					{/* Floating Football Icons */}
					<div
						className="absolute top-20 left-[15%] animate-bounce-subtle"
						style={{ animationDelay: "0s" }}
					>
						<span
							className="material-symbols-outlined text-4xl opacity-20"
							style={{ color: colors.accent }}
						>
							sports_soccer
						</span>
					</div>
					<div
						className="absolute top-40 right-[20%] animate-bounce-subtle"
						style={{ animationDelay: "0.5s" }}
					>
						<span
							className="material-symbols-outlined text-3xl opacity-15"
							style={{ color: colors.accent }}
						>
							sports_soccer
						</span>
					</div>
					<div
						className="absolute bottom-32 left-[25%] animate-bounce-subtle"
						style={{ animationDelay: "1s" }}
					>
						<span
							className="material-symbols-outlined text-5xl opacity-10"
							style={{ color: colors.accent }}
						>
							sports_soccer
						</span>
					</div>
				</div>

				{/* Main Content */}
				<div className="relative z-10 text-center max-w-4xl mx-auto">
					{/* 404 Number with Animation */}
					<div className="mb-6 animate-slide-up">
						<div
							className="inline-block animate-pulse-glow rounded-3xl p-8"
							style={{
								background: `${colors.accent}15`,
								border: `2px solid ${colors.accent}30`,
							}}
						>
							<h1
								className="text-[120px] md:text-[180px] font-black leading-none animate-gradient"
								style={{
									background: colors.gradientText,
									WebkitBackgroundClip: "text",
									WebkitTextFillColor: "transparent",
									backgroundClip: "text",
								}}
							>
								404
							</h1>
						</div>
					</div>

					{/* Error Message */}
					<div className="animate-slide-up" style={{ animationDelay: "0.4s" }}>
						<h2
							className="text-3xl md:text-5xl font-bold mb-4"
							style={{ color: colors.text }}
						>
							Pritt! Kamu Offside!
						</h2>
						<p
							className="text-lg md:text-xl mb-8 max-w-2xl mx-auto leading-relaxed"
							style={{ color: colors.textSecondary }}
						>
							Halaman yang kamu cari sepertinya sudah dipindahkan atau tidak ada
							di website ini. Yuk, balik ke kickoff page!
						</p>
					</div>

					{/* Action Buttons */}
					<div
						className="flex flex-col sm:flex-row gap-4 justify-center items-center animate-slide-up"
						style={{ animationDelay: "0.6s" }}
					>
						<Link
							href="/"
							className="inline-flex items-center gap-3 px-8 py-4 rounded-full font-bold text-lg transition-all duration-300 hover:scale-105 active:scale-95 shadow-lg"
							style={{
								background: colors.accent,
								color: isDark ? "#003732" : "#ffffff",
								boxShadow: `0 0 30px ${colors.accentGlow}`,
							}}
						>
							<span
								className="material-symbols-outlined text-2xl"
								style={{ fontVariationSettings: "'FILL' 1" }}
							>
								home
							</span>
							Back to Kickoff
						</Link>
					</div>
				</div>

				{/* Decorative Football Field Lines */}
				<div
					className="absolute bottom-0 left-0 right-0 h-32 opacity-10"
					style={{
						background: `linear-gradient(to top, ${colors.accent}, transparent)`,
					}}
				/>
			</div>
		</>
	);
}
