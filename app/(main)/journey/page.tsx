"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import { useInView } from "react-intersection-observer";
import { Users, Globe, Heart, CheckCircle } from "lucide-react";
import { useUIStore } from "@/stores/uiStore";

const milestones = [
	{
		year: "2021",
		title: "Lahir di Tengah Pandemi",
		description:
			"OlahBola bersama ESPL Indonesia menghadirkan OlahBola Esports Series 2021.",
	},
	{
		year: "2022",
		title: "1 Juta Followers",
		description: "Pada tahun ini, kami mencapai 1 juta followers di TikTok.",
	},
	{
		year: "2023",
		title: "Satu-satunya Media Indonesia di Piala Dunia U-17",
		description:
			"Menjadi satu-satunya media Indonesia yang meliput langsung persiapan Training Camp Timnas Indonesia U-17 di Jerman menuju Piala Dunia U-17 2023.",
	},
	{
		year: "2024",
		title: "Mewakili media Asia",
		description:
			"Menjadi satu-satunya media dari Indonesia yang mewakili Asia dalam program media visit LaLiga di Spanyol.",
	},
	{
		year: "2025",
		title: "Media Pertama dari Indonesia di Bundesliga",
		description:
			"Menjadi media pertama dari Indonesia yang diundang langsung oleh Bundesliga untuk mewawancarai Kevin Diks di klub barunya, Borussia Mönchengladbach.",
	},
];

const team = [
	{
		name: "Nuky",
		role: "Country Manager",
		image: "/images/teams/Nuky.webp",
	},
	{
		name: "Roby",
		role: "Head Of Olahbola Division",
		image: "/images/teams/Roby.webp",
	},
	{
		name: "Gede",
		role: "Content Designer",
		image: "/images/teams/Gede.webp",
	},
	{
		name: "Rizky",
		role: "Host & Lead Personality",
		image: "/images/teams/Rizky.webp",
	},
	{
		name: "Ardian",
		role: "Video Producer",
		image: "/images/teams/Ardian.webp",
	},
	{
		name: "Indra",
		role: "CUI/UX Web Designer",
		image: "/images/teams/Indra.webp",
	},
	{
		name: "Andin",
		role: "Content Producer",
		image: "/images/teams/Andin.webp",
	},
	{
		name: "Ahlun",
		role: "Fullstack Developer",
		image: "/images/teams/Ahlun.webp",
	},
];

export default function JourneyPage() {
	const { theme } = useUIStore();
	const isDark = theme === "dark";

	const [backgroundLoaded, setBackgroundLoaded] = useState(false);
	const journeySectionRef = useRef<HTMLDivElement>(null);
	const { ref: journeyRef, inView: journeyVisible } = useInView({
		threshold: 0.1,
		triggerOnce: true,
	});
	const { ref: statsRef, inView: statsVisible } = useInView({
		threshold: 0.3,
		triggerOnce: true,
	});

	useEffect(() => {
		const img = new window.Image();
		img.src = "/images/about-img/IMG-1.webp";
		img.onload = () => setBackgroundLoaded(true);
	}, []);

	return (
		<div
			className={`min-h-screen transition-colors duration-300 ${isDark ? "bg-[#0f1412]" : "bg-[#f5f5f5]"}`}
		>
			{/* Bullet Neon Effects */}
			<div className="fixed top-0 left-0 w-100 h-100 z-0 pointer-events-none">
				<div
					className={`absolute top-0 left-0 w-full h-full rounded-full blur-[120px] ${isDark ? "bg-[#0D645F]/15" : "bg-[#0D645F]/10"}`}
				></div>
			</div>
			<div className="fixed bottom-0 right-0 w-100 h-100 z-0 pointer-events-none">
				<div
					className={`absolute bottom-0 right-0 w-full h-full rounded-full blur-[120px] ${isDark ? "bg-[#d8531a]/15" : "bg-[#d8531a]/10"}`}
				></div>
			</div>

			{/* Hero Section */}
			<section className="relative min-h-screen md:min-h-204.75 flex items-center justify-center overflow-hidden">
				<div className="absolute inset-0 z-0">
					<div
						className={`absolute inset-0 z-10 ${isDark ? "bg-black/60" : "bg-black/20"} ${isDark ? "bg-linear-to-b from-black/40 to-[#0f1412]" : "bg-linear-to-b from-white/60 to-[#f5f5f5]"}`}
					></div>
					<img
						className="w-full h-full object-cover"
						src="/images/about-img/IMG-2.webp"
						alt="Journey"
					/>
				</div>
				<div className="relative z-20 text-center px-4 max-w-5xl">
					<div className="mb-6">
						<span
							className={`inline-block px-4 py-1 text-xs font-bold uppercase tracking-widest mb-4 rounded-full ${isDark ? "text-[#d8531a]" : "text-[#0a7c6e]"}`}
							style={{
								background: isDark
									? "rgba(216,83,26,0.3)"
									: "rgba(10,124,110,0.2)",
								border: isDark
									? "1px solid rgba(216,83,26,0.4)"
									: "1px solid rgba(10,124,110,0.4)",
							}}
						>
							Established 2020
						</span>
					</div>
					<h1
						className={`text-4xl md:text-6xl lg:text-7xl font-bold uppercase italic tracking-tighter ${isDark ? "text-white" : "text-[#1a1a1a]"}`}
						style={{
							textShadow: isDark
								? "0 0 20px rgba(13,100,95,0.5)"
								: "0 0 10px rgba(10,124,110,0.3)",
						}}
					>
						OUR{" "}
						<span
							className={`${isDark ? "text-[#1fe6da] " : "text-[#0a7c6e]"} `}
						>
							JOURNEY
						</span>
					</h1>
					<p
						className={`mt-8 text-lg max-w-2xl mx-auto ${isDark ? "text-white/60" : "text-[#4a4a4a]"}`}
					>
						Mengubah cinta pada sepak bola menjadi konten yang hidup, relevan
						dan dekat dengan fans. Dari underground hingga ke panggung global.
					</p>
					<div className="mt-12 flex items-center justify-center gap-4">
						<div
							className={`h-px w-12 ${isDark ? "bg-green" : "bg-[#0a7c6e]"}`}
						></div>
						<span
							className={`text-3xl ${isDark ? "text-green" : "text-[#0a7c6e]"}`}
						>
							↓
						</span>
						<div
							className={`h-px w-12 ${isDark ? "bg-green" : "bg-[#0a7c6e]"}`}
						></div>
					</div>
				</div>
			</section>

			{/* About Section - Asymmetric Layout */}
			<section className="py-24 px-8 max-w-7xl mx-auto">
				<div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
					{/* Image Side */}
					<div className="lg:col-span-7 relative group">
						<div
							className="absolute -top-6 -left-6 w-32 h-32 rounded-full blur-3xl"
							style={{
								background: isDark
									? "rgba(13,100,95,0.2)"
									: "rgba(10,124,110,0.15)",
							}}
						></div>
						<div
							className="relative z-10 overflow-hidden rounded-2xl"
							style={{
								border: isDark
									? "1px solid rgba(255,255,255,0.1)"
									: "1px solid rgba(0,0,0,0.1)",
							}}
						>
							<img
								src="/images/about-img/IMG-1.webp"
								alt="About OlahBola"
								className={`w-full h-125 md:h-200 object-cover transition-transform duration-700 group-hover:scale-105 ${isDark ? "" : "grayscale-[0.1]"}`}
							/>
							{/* Glass Overlay */}
							<div
								className="absolute bottom-8 left-5 right-5 md:left-8 md:right-8 p-6 rounded-xl transform translate-y-4 group-hover:translate-y-0 transition-transform duration-500"
								style={{
									background: isDark
										? "rgb(0 0 0 / 38%)"
										: "rgba(255,255,255,0.8)",
									backdropFilter: "blur(20px)",
									border: isDark
										? "1px solid rgba(255,255,255,0.1)"
										: "1px solid rgba(0,0,0,0.1)",
								}}
							>
								<h3
									className={`text-xl md:text-2xl font-bold italic mb-2 ${isDark ? "text-white" : "text-[#1a1a1a]"}`}
								>
									PHASE 01: ORIGINS
								</h3>
								<p
									className={`italic ${isDark ? "text-white/60" : "text-[#5a5a5a]"}`}
								>
									OlahBola memulai perjalanan pada Agustus 2020, dengan visi
									sederhana untuk mengubah kecintaan terhadap sepak bola menjadi
									konten yang menarik.
								</p>
							</div>
						</div>
					</div>

					{/* Text Side */}
					<div className="lg:col-span-5 space-y-8">
						<h2
							className={`text-3xl md:text-4xl lg:text-5xl font-bold uppercase leading-none ${isDark ? "text-white" : "text-[#1a1a1a]"}`}
						>
							From Zero to <br />
							<span
								className={`italic ${isDark ? "text-green" : "text-[#0a7c6e]"}`}
							>
								Kickoff Hero
							</span>
						</h2>
						<div
							className={`space-y-6 text-lg ${isDark ? "text-white/60" : "text-[#5a5a5a]"}`}
						>
							<p>
								Dalam lima tahun, kami telah mengalami perkembangan yang pesat
								dan kini menjadi salah satu kreator konten sepak bola terbesar
								di Indonesia, dengan jutaan pengikut yang aktif mengikuti setiap
								konten yang kami buat.
							</p>
							<ul className="space-y-4">
								<li className="flex items-start gap-3">
									<CheckCircle
										className={`size-5 mt-1 ${isDark ? "text-green" : "text-[#0a7c6e]"}`}
									/>
									<span>Konten kreator sepak bola terbesar di Indonesia</span>
								</li>
								<li className="flex items-start gap-3">
									<CheckCircle
										className={`size-5 mt-1 ${isDark ? "text-green" : "text-[#0a7c6e]"}`}
									/>
									<span>
										Partner brand-brand besar nasional dan internasional
									</span>
								</li>
								<li className="flex items-start gap-3">
									<CheckCircle
										className={`size-5 mt-1 ${isDark ? "text-green" : "text-[#0a7c6e]"}`}
									/>
									<span>Jangkauan global ke Eropa dan berbagai kompetisi</span>
								</li>
							</ul>
						</div>
						<div className="pt-4">
							<button
								onClick={() =>
									journeySectionRef.current?.scrollIntoView({
										behavior: "smooth",
									})
								}
								className={`px-8 py-3 rounded-full font-bold uppercase tracking-widest transition-all ${isDark ? "hover:bg-green/10" : "hover:bg-[#0a7c6e]/10"}`}
								style={{
									border: isDark
										? "1px solid rgba(13,100,95,0.4)"
										: "1px solid rgba(10,124,110,0.4)",
									color: isDark ? "#1fe6da" : "#0a7c6e",
								}}
							>
								Lihat Perjalanan
							</button>
						</div>
					</div>
				</div>
			</section>

			{/* Stats Section */}
			<section
				ref={statsRef}
				className="py-24"
				style={{
					background: isDark ? "rgba(255,255,255,0.02)" : "rgba(0,0,0,0.02)",
				}}
			>
				<div className="max-w-7xl mx-auto px-8">
					{statsVisible && (
						<div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
							<div
								className="p-8 rounded-2xl"
								style={{
									background: isDark
										? "rgba(255,255,255,0.05)"
										: "rgba(255,255,255,0.8)",
									backdropFilter: "blur(20px)",
									border: isDark
										? "1px solid rgba(255,255,255,0.1)"
										: "1px solid rgba(0,0,0,0.1)",
								}}
							>
								<div className="flex justify-center mb-3">
									<Users className="size-10 text-[#58ecc8]" />
								</div>
								<p
									className={`text-2xl md:text-4xl font-bold ${isDark ? "text-white" : "text-[#1a1a1a]"}`}
								>
									1.7M+
								</p>
								<p className={`${isDark ? "text-white/50" : "text-[#5a5a5a]"}`}>
									TikTok Followers
								</p>
							</div>
							<div
								className="p-8 rounded-2xl"
								style={{
									background: isDark
										? "rgba(255,255,255,0.05)"
										: "rgba(255,255,255,0.8)",
									backdropFilter: "blur(20px)",
									border: isDark
										? "1px solid rgba(255,255,255,0.1)"
										: "1px solid rgba(0,0,0,0.1)",
								}}
							>
								<div className="flex justify-center mb-3">
									<Users className="size-10 text-[#b3077d]" />
								</div>
								<p
									className={`text-2xl md:text-4xl font-bold ${isDark ? "text-white" : "text-[#1a1a1a]"}`}
								>
									236K+
								</p>
								<p className={`${isDark ? "text-white/50" : "text-[#5a5a5a]"}`}>
									Instagram Followers
								</p>
							</div>
							<div
								className="p-8 rounded-2xl"
								style={{
									background: isDark
										? "rgba(255,255,255,0.05)"
										: "rgba(255,255,255,0.8)",
									backdropFilter: "blur(20px)",
									border: isDark
										? "1px solid rgba(255,255,255,0.1)"
										: "1px solid rgba(0,0,0,0.1)",
								}}
							>
								<div className="flex justify-center mb-3">
									<Globe className="size-10 text-[#5d91e3]" />
								</div>
								<p
									className={`text-2xl md:text-4xl font-bold ${isDark ? "text-white" : "text-[#1a1a1a]"}`}
								>
									5+
								</p>
								<p className={`${isDark ? "text-white/50" : "text-[#5a5a5a]"}`}>
									Tahun Berkarya
								</p>
							</div>
							<div
								className="p-8 rounded-2xl"
								style={{
									background: isDark
										? "rgba(255,255,255,0.05)"
										: "rgba(255,255,255,0.8)",
									backdropFilter: "blur(20px)",
									border: isDark
										? "1px solid rgba(255,255,255,0.1)"
										: "1px solid rgba(0,0,0,0.1)",
								}}
							>
								<div className="flex justify-center mb-3">
									<Heart className="size-10 text-[#d8531a]" />
								</div>
								<p
									className={`text-2xl md:text-4xl font-bold ${isDark ? "text-white" : "text-[#1a1a1a]"}`}
								>
									10M+
								</p>
								<p className={`${isDark ? "text-white/50" : "text-[#5a5a5a]"}`}>
									Monthly Views
								</p>
							</div>
						</div>
					)}
				</div>
			</section>

			{/* Milestones Section */}
			<div ref={journeySectionRef}>
				<section
					ref={journeyRef}
					className="py-24"
					style={{
						background: isDark ? "rgba(24,29,26,1)" : "rgba(232,232,232,1)",
					}}
				>
					<div className="max-w-7xl mx-auto px-8">
						<h2
							className={`text-3xl md:text-5xl font-bold text-center mb-16 italic uppercase ${isDark ? "text-white" : "text-[#1a1a1a]"}`}
						>
							Perjalanan{" "}
							<span className={`${isDark ? "text-green" : "text-[#0a7c6e]"}`}>
								Kami
							</span>
						</h2>
						{journeyVisible && (
							<div className="relative">
								{/* Vertical Line */}
								<div
									className="absolute left-8 md:left-1/2 top-0 bottom-0 w-px"
									style={{
										background:
											"linear-gradient(to bottom, rgba(13,100,95,0.8), rgba(13,100,95,0.2))",
									}}
								></div>

								<div className="space-y-12">
									{milestones.map((milestone, index) => (
										<div
											key={milestone.year}
											className={`relative flex flex-col md:flex-row gap-10 md:gap-20 items-start ${
												index % 2 === 1 ? "md:flex-row-reverse" : ""
											}`}
										>
											{/* Year on left/right */}
											<div
												className={`flex-1 md:${index % 2 === 0 ? "text-right" : "text-left"} pl-20 md:pl-0 `}
											>
												<span
													className={`text-3xl md:text-4xl font-bold ${isDark ? "text-[#d8531a]" : "text-[#b3461a]"}`}
												>
													{milestone.year}
												</span>
												<h3
													className={`text-lg md:text-xl font-bold mt-2 ${isDark ? "text-white" : "text-[#1a1a1a]"}`}
												>
													{milestone.title}
												</h3>
												<p
													className={`mt-2 text-sm md:text-base ${isDark ? "text-white/60" : "text-[#5a5a5a]"}`}
												>
													{milestone.description}
												</p>
											</div>

											{/* Circle indicator with number */}
											<div className="absolute left-8 md:left-1/2 -translate-x-1/2 flex items-center justify-center">
												<div
													className="w-10 h-10 rounded-full flex items-center justify-center text-[#d8531a] font-bold text-sm z-10"
													style={{
														background: "rgb(55,32,19)",
														boxShadow: "0 0 15px rgb(216 83 26)",
													}}
												>
													{index + 1}
												</div>
											</div>

											{/* Empty space for alignment */}
											<div
												className={`flex-1 md:${index % 2 === 0 ? "pl-8" : "pr-8"}`}
											></div>
										</div>
									))}
								</div>
							</div>
						)}
					</div>
				</section>
			</div>

			{/* Team Section - The Squad */}
			<section
				className="py-24"
				style={{
					background: isDark ? "rgba(10,15,13,1)" : "rgba(245,245,245,1)",
				}}
			>
				<div className="max-w-7xl mx-auto px-8">
					<div className="flex flex-col md:flex-row justify-between items-end mb-16 gap-6">
						<div>
							<h2
								className={`text-3xl md:text-5xl font-bold italic uppercase ${isDark ? "text-white" : "text-[#1a1a1a]"}`}
							>
								OlahBola{" "}
								<span className={`${isDark ? "text-green" : "text-[#0a7c6e]"}`}>
									Starting Line-Up
								</span>
							</h2>
							<p
								className={`mt-4 ${isDark ? "text-white/50" : "text-[#5a5a5a]"}`}
							>
								Tim di balik OlahBola. Perpaduan kreator konten, desainer, dan
								teknologi yang passionate tentang sepak bola.
							</p>
						</div>
					</div>

					{/* Team Grid */}
					<div className="grid grid-cols-1 md:grid-cols-4 gap-6">
						{team.map((member, index) => (
							<div
								key={member.name}
								className="group p-8 rounded-3xl text-center transition-all duration-300 hover:border-green/50"
								style={{
									background: isDark
										? "rgba(255,255,255,0.05)"
										: "rgba(255,255,255,0.8)",
									backdropFilter: "blur(20px)",
									border: isDark
										? "1px solid rgba(255,255,255,0.1)"
										: "1px solid rgba(0,0,0,0.1)",
								}}
							>
								{/* Image */}
								<div className="relative inline-block mb-6">
									<div
										className="absolute inset-0 rounded-full blur-md opacity-20 group-hover:opacity-90 transition-opacity"
										style={{ background: "#0D645F" }}
									></div>
									<div className="relative z-10 w-44 h-44 mx-auto">
										<Image
											src={member.image}
											alt={member.name}
											width={128}
											height={128}
											className="w-full h-full object-cover rounded-full border-2 p-1"
											style={{ borderColor: "#0D645F" }}
										/>
									</div>
								</div>
								<h4
									className={`text-xl font-bold ${isDark ? "text-white" : "text-[#1a1a1a]"}`}
								>
									{member.name}
								</h4>
								<p
									className={`font-bold uppercase tracking-tighter text-sm mt-1 ${isDark ? "text-green" : "text-[#0a7c6e]"}`}
								>
									{member.role}
								</p>
							</div>
						))}
					</div>
				</div>
			</section>

			{/* CTA Section */}
			<section className="py-32 relative overflow-hidden">
				<div className="absolute inset-0 z-0">
					<div
						className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-200 h-100 rounded-full blur-[120px]"
						style={{ background: "rgba(13,100,95,0.2)" }}
					></div>
				</div>
				<div className="relative z-10 max-w-4xl mx-auto px-8 text-center">
					<h2
						className={`text-4xl md:text-5xl lg:text-6xl font-bold uppercase italic tracking-tighter mb-12 ${isDark ? "text-white" : "text-[#1a1a1a]"}`}
					>
						Siap{" "}
						<span className={`${isDark ? "text-green" : "text-[#0a7c6e]"}`}>
							Mencetak Goal
						</span>{" "}
						Bersama Kami?
					</h2>
					<div className="flex flex-col sm:flex-row items-center justify-center gap-6">
						<Link
							href="/quiz"
							className="w-full sm:w-auto px-10 py-5 rounded-full font-bold uppercase tracking-tighter transition-all hover:scale-105 active:scale-95"
							style={{
								background: "#0D645F",
								color: "white",
								boxShadow: "0 0 30px rgba(13,100,95,0.4)",
							}}
						>
							Main Quiz
						</Link>
						<Link
							href="/artikel"
							className="w-full sm:w-auto px-10 py-5 rounded-full font-bold uppercase tracking-tighter transition-all hover:scale-105 active:scale-95 hover:bg-white/10"
							style={{
								background: isDark
									? "rgba(255,255,255,0.05)"
									: "rgba(255,255,255,0.8)",
								border: "1px solid rgba(13,100,95,0.4)",
								color: isDark ? "#1fe6da" : "#0a7c6e",
							}}
						>
							Baca Artikel
						</Link>
					</div>
					<p
						className={`mt-12 font-bold uppercase tracking-[0.3em] text-xs ${isDark ? "text-white/40" : "text-[#4a4a4a]"}`}
					>
						Jadilah Bagian dari Cerita Kami_
					</p>
				</div>
			</section>
		</div>
	);
}
