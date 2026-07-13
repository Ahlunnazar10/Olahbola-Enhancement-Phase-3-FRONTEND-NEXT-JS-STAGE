"use client";

import { useUIStore } from "@/stores/uiStore";
import { ArrowRight, Mail, Handshake, ExternalLink } from "lucide-react";
import Link from "next/link";
import { mediaHighlights, getAllHighlights } from "@/src/data/mediaHighlights";
import ThemeToggle from "@/components/theme-toggle/ThemeToggle";

export default function MediaSpotlightPage() {
	const { theme } = useUIStore();
	const isDark = theme === "dark";
	const allHighlights = getAllHighlights();
	const featuredArticle = allHighlights[0];
	const remainingArticles = allHighlights.slice(1);

	const colors = isDark
		? {
				bg: "#050505",
				bgPattern: "rgba(64, 220, 202, 0.05)",
				gradient: "#050505",
				glassBg: "rgba(10, 15, 13, 0.6)",
				glassBorder: "rgba(255, 255, 255, 0.1)",
				glassBorderHover: "#00c2b1",
				glassShadowHover: "rgba(0, 194, 177, 0.15)",
				primary: "#00c2b1",
				primaryGlow: "rgba(67, 222, 204, 0.5)",
				primaryAlpha: "rgba(0, 194, 177, 0.3)",
				text: "#ffffff",
				textSecondary: "rgba(255, 255, 255, 0.7)",
				textMuted: "rgba(255, 255, 255, 0.4)",
				featuredContentBg: "rgba(28, 27, 27, 0.4)",
				surfaceVariant: "rgba(255, 255, 255, 0.6)",
				outline: "rgba(255, 255, 255, 0.12)",
				heroOverlay: "from-[#050505]",
			}
		: {
				bg: "#f5f5f5",
				bgPattern: "rgba(10, 124, 110, 0.04)",
				gradient: "#f5f5f5",
				glassBg: "rgba(255, 255, 255, 0.8)",
				glassBorder: "rgba(0, 0, 0, 0.08)",
				glassBorderHover: "#0a7c6e",
				glassShadowHover: "rgba(10, 124, 110, 0.15)",
				primary: "#0a7c6e",
				primaryGlow: "rgba(10, 124, 110, 0.4)",
				primaryAlpha: "rgba(10, 124, 110, 0.2)",
				text: "#1a1a1a",
				textSecondary: "rgba(26, 26, 26, 0.75)",
				textMuted: "rgba(26, 26, 26, 0.5)",
				featuredContentBg: "rgba(255, 255, 255, 0.6)",
				surfaceVariant: "rgba(26, 26, 26, 0.6)",
				outline: "rgba(0, 0, 0, 0.12)",
				heroOverlay: "from-[#f5f5f5]",
			};

	return (
		<div
			className="min-h-screen relative overflow-hidden transition-colors duration-300"
			style={{ backgroundColor: colors.bg }}
		>
			{/* Velocity Mesh Background */}
			<div
				className="fixed inset-0 pointer-events-none transition-colors duration-300"
				style={{ backgroundColor: colors.bg }}
			/>
			<div
				className="fixed inset-0 pointer-events-none opacity-100 transition-colors duration-300"
				style={{
					backgroundImage: `radial-gradient(circle at 2px 2px, ${colors.bgPattern} 1px, transparent 0)`,
					backgroundSize: "40px 40px",
				}}
			/>

			{/* Theme Toggle */}
			<ThemeToggle />

			<main>
				{/* Hero Section */}
				<section className="relative min-h-179 flex flex-col items-center justify-center text-center px-6 md:px-8 lg:px-16 overflow-hidden">
					{/* Hero Background */}
					<div className="absolute inset-0 z-0">
						<img
							className="w-full h-full object-cover opacity-20"
							src="https://lh3.googleusercontent.com/aida-public/AB6AXuBkcq_wCudPTzL6KYV8DujiLVpZfjnIxnLJlUKaP_kVYjzR8VJZlasAbeZWZ0RZtavK2jgTsLLJdJnGixRdtODZUZdudPfL_MJQTx8k48A3vEj-dJam8C3qbQUDHiw6hbLhLy5wFq5lSzbqAqL1uw721PrYD3jm3Qe9CafFEpK_3nR2swmV8UOMD-5WgXQXuMV6cGmZESXUEpkpisM65ncH4AE_-aEwVJpzGKL41NS5ydj25H5D2XnM05fMa-EhKXXiiXkY6TIozSU"
							alt="Stadium"
						/>
						<div
							className="absolute inset-0 bg-linear-to-t"
							style={{
								backgroundImage: `linear-gradient(to top, ${colors.gradient}, transparent 40%, ${colors.gradient})`,
							}}
						/>
					</div>

					{/* Hero Content */}
					<div className="relative z-10 max-w-4xl">
						{/* Live Badge */}
						<div className="inline-flex items-center gap-2 px-4 py-1 glass-card rounded-full mb-8">
							<span className="w-2 h-2 bg-primary rounded-full live-pulse" />
							<span className="font-label-bold text-[12px] tracking-widest text-primary">
								MEDIA SPOTLIGHT
							</span>
						</div>

						{/* Title */}
						<h1
							className="text-4xl md:text-6xl lg:text-7xl font-bold italic mb-6 leading-none"
							style={{ color: colors.text }}
						>
							Mari Ceritakan <br />
							<span
								className="neon-glow"
								style={{
									color: colors.primary,
									textShadow: `0 0 15px ${colors.primaryGlow}`,
								}}
							>
								Sepak Bola
							</span>{" "}
							Bersama
						</h1>

						{/* Description */}
						<p
							className="text-lg md:text-xl max-w-2xl mx-auto"
							style={{ color: colors.textSecondary }}
						>
							Kami terbuka untuk media coverage, press release, hingga
							kolaborasi kreatif bersama media, brand dan komunitas sepak bola.
						</p>
					</div>
				</section>

				{/* Featured Spotlight */}
				<section className="px-6 md:px-8 lg:px-16 max-w-7xl mx-auto">
					<div className="glass-card overflow-hidden rounded-xl flex flex-col md:flex-row group">
						{/* Image */}
						<div className="md:w-3/5 overflow-hidden">
							<img
								className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
								src={
									featuredArticle.image || "/images/sorotan-media/featured.webp"
								}
								alt={featuredArticle.title}
							/>
						</div>

						{/* Content */}
						<div
							className="md:w-2/5 p-8 md:p-12 flex flex-col justify-center"
							style={{ backgroundColor: colors.featuredContentBg }}
						>
							{/* Meta */}
							<div className="flex items-center gap-3 mb-6">
								<span
									className="px-3 py-1 rounded-full text-[10px] font-bold"
									style={{
										backgroundColor: `${colors.primary}20`,
										color: colors.primary,
									}}
								>
									{featuredArticle.source}
								</span>
								<span
									className="text-[12px]"
									style={{ color: colors.textMuted }}
								>
									{featuredArticle.date}
								</span>
							</div>

							{/* Title */}
							<h2
								className="text-xl md:text-2xl font-bold mb-6 leading-tight"
								style={{ color: colors.text }}
							>
								{featuredArticle.title}
							</h2>

							{/* Excerpt */}
							<p
								className="mb-8 line-clamp-3"
								style={{ color: colors.textSecondary }}
							>
								{featuredArticle.excerpt}
							</p>

							{/* CTA Link */}
							<a
								href={featuredArticle.url}
								target="_blank"
								rel="noopener noreferrer"
								className="inline-flex items-center gap-3 font-label-bold group/link"
								style={{ color: colors.primary }}
							>
								Baca Selengkapnya
								<ArrowRight className="size-5 transition-transform group-hover/link:translate-x-2" />
							</a>
						</div>
					</div>
				</section>

				{/* Seluruh Liputan Media Grid */}
				<section className="px-6 md:px-8 lg:px-16 pb-20 max-w-7xl mx-auto">
					{/* Section Header */}
					<div
						className="flex justify-between items-end mb-12 pb-6"
						style={{ borderBottom: `1px solid ${colors.outline}` }}
					>
						<h3
							className="text-xl md:text-2xl font-bold tracking-widest"
							style={{ color: colors.textSecondary }}
						>
							SELURUH LIPUTAN MEDIA
						</h3>
						<span className="font-label-bold" style={{ color: colors.primary }}>
							{remainingArticles.length} TOTAL ARTICLES
						</span>
					</div>

					{/* Media Grid */}
					<div className="grid grid-cols-1 md:grid-cols-3 gap-6">
						{remainingArticles.map((article, index) => (
							<a
								key={index}
								href={article.url}
								target="_blank"
								rel="noopener noreferrer"
								className="glass-card rounded-xl group flex flex-col h-full"
							>
								{/* Image */}
								<div className="aspect-video relative overflow-hidden rounded-t-xl">
									<img
										className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
										src={
											article.image ||
											"https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQE3CETL_OertJKScoHfblxs6CBrKGVCmVESw&s"
										}
										alt={article.title}
									/>
								</div>

								{/* Content */}
								<div className="p-6 md:p-8 flex flex-col grow">
									{/* Meta */}
									<div className="flex items-center justify-between mb-4">
										<span
											className="text-[10px] font-bold tracking-widest"
											style={{ color: colors.primary }}
										>
											{article.source}
										</span>
										<span
											className="text-[10px]"
											style={{ color: colors.textMuted }}
										>
											{article.date}
										</span>
									</div>

									{/* Title */}
									<h4
										className="text-lg md:text-xl font-bold mb-4 transition-colors"
										style={{ color: colors.text }}
									>
										{article.title}
									</h4>

									{/* Excerpt */}
									<p
										className="line-clamp-3 mb-6 grow"
										style={{ color: colors.textSecondary }}
									>
										{article.excerpt}
									</p>

									{/* External Link */}
									<div
										className="inline-flex items-center gap-2 font-label-bold text-sm"
										style={{ color: colors.primary }}
									>
										<ExternalLink className="size-3.5" />
										Kunjungi
									</div>
								</div>
							</a>
						))}
					</div>
				</section>

				{/* Collaboration CTA */}
				<section className="px-6 md:px-8 lg:px-16 py-32">
					<div className="max-w-4xl mx-auto glass-card rounded-2xl p-12 md:p-16 text-center relative overflow-hidden">
						{/* Blur Effects */}
						<div
							className="absolute -top-24 -left-24 w-64 h-64 rounded-full blur-[80px]"
							style={{ backgroundColor: colors.primaryAlpha }}
						/>
						<div
							className="absolute -bottom-24 -right-24 w-64 h-64 rounded-full blur-[80px]"
							style={{ backgroundColor: colors.primaryAlpha }}
						/>

						<div className="relative z-10">
							{/* Icon */}
							<Handshake
								className="size-10 mb-6 mx-auto"
								style={{
									color: colors.primary,
								}}
								fill="currentColor"
							/>

							{/* Title */}
							<h2
								className="text-2xl md:text-4xl font-bold mb-4"
								style={{ color: colors.text }}
							>
								Ingin Liputan tentang Olahbola?
							</h2>

							{/* Description */}
							<p
								className="text-lg md:text-xl mb-12 max-w-xl mx-auto"
								style={{ color: colors.textSecondary }}
							>
								Jika Anda media yang tertarik memberitakan Olahbola, silakan
								hubungi kami untuk informasi lebih lanjut dan press kit lengkap.
							</p>

							{/* CTA Button */}
							<button
								className="font-label-bold px-10 py-5 rounded-lg flex items-center gap-3 mx-auto hover:scale-105 active:scale-95 transition-all duration-300 group"
								style={{
									backgroundColor: colors.primary,
									color: isDark ? "#003732" : "#ffffff",
									boxShadow: `0 0 30px ${colors.primaryAlpha}`,
								}}
							>
								<Mail className="size-5" />
								Let&apos;s Collaborate
								<ArrowRight className="size-5 transition-transform group-hover:translate-x-1" />
							</button>
						</div>
					</div>
				</section>
			</main>

			{/* Global Styles */}
			<style jsx global>{`
				.glass-card {
					background: ${colors.glassBg};
					backdrop-filter: blur(40px);
					border: 1px solid ${colors.glassBorder};
					transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
				}

				.glass-card:hover {
					border-color: ${colors.glassBorderHover};
					box-shadow: 0 0 30px ${colors.glassShadowHover};
				}

				.neon-glow {
					text-shadow: 0 0 15px ${colors.primaryGlow};
				}

				.live-pulse {
					animation: pulse 2s infinite;
				}

				@keyframes pulse {
					0% {
						transform: scale(0.95);
						box-shadow: 0 0 0 0 ${colors.primaryAlpha};
					}
					70% {
						transform: scale(1);
						box-shadow: 0 0 0 10px transparent;
					}
					100% {
						transform: scale(0.95);
						box-shadow: 0 0 0 0 transparent;
					}
				}
			`}</style>
		</div>
	);
}
