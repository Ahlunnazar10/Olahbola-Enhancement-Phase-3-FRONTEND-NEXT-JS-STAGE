"use client";

import { useState, useEffect, useMemo, useRef } from "react";
import AOS from "aos";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useInView } from "react-intersection-observer";
import { apiClient } from "@/lib/api/client";
import { useUIStore } from "@/stores/uiStore";
import { useAuthStore } from "@/stores/authStore";
import type { Article, Interview } from "@/types";
import { useLeaderboard as useBLLeaderboard } from "@/hooks/queries/useBundesliga";
import { ArrowRight, Play, Circle, X } from "lucide-react";
import type { BannerSlide } from "@/components/banner-slider/BannerSlider";
import { BannerSlider } from "@/components/banner-slider/BannerSlider";

interface LeaderboardRow {
	rank: number;
	userId: string;
	name: string;
	profilePicture: string | null;
	subtitle?: string;
	score: number;
}

function useSectionInView(threshold = 0.1) {
	const { ref, inView } = useInView({ threshold, triggerOnce: true });
	return { ref, inView };
}

const brandLogos = [
	"/images/brand-logo/Bundesliga.png",
	"/images/brand-logo/laliga.png",
	"/images/brand-logo/Eredivisie.png",
	"/images/brand-logo/Mandiri.png",
	"/images/brand-logo/Amartha.png",
	"/images/brand-logo/Indomilk.png",
	"/images/brand-logo/Aqua.png",
	"/images/brand-logo/Lifeboy.png",
	"/images/brand-logo/Oppo.png",
	"/images/brand-logo/Shopee.png",
	"/images/brand-logo/maxstream.png",
	"/images/brand-logo/mizone.png",
	"/images/brand-logo/djarum-super.png",
	"/images/brand-logo/Rcti.png",
	"/images/brand-logo/Eafc.png",
	"/images/brand-logo/Vidio.png",
	"/images/brand-logo/Traveloka.png",
];

export default function HomePage() {
	const { theme } = useUIStore();
	const isDark = theme === "dark";

	const [featuredArticle, setFeaturedArticle] = useState<Article | null>(null);
	const [featuredLoading, setFeaturedLoading] = useState(true);

	const [articles, setArticles] = useState<Article[]>([]);
	const [articlesLoading, setArticlesLoading] = useState(true);

	const [interviews, setInterviews] = useState<Interview[]>([]);
	const [interviewsLoading, setInterviewsLoading] = useState(true);
	const [interviewDisplayCount, setInterviewDisplayCount] = useState(5);
	const [isMobileView, setIsMobileView] = useState(false);

	const [heroPlayBgLoaded, setHeroPlayBgLoaded] = useState(false);
	const [activeBannerIndex, setActiveBannerIndex] = useState(0);
	const heroSectionRef = useRef<HTMLElement>(null);

	const { ref: articleRef, inView: articleVisible } = useSectionInView(0.1);
	const { ref: socmedRef, inView: socmedVisible } = useSectionInView(0.1);
	const { ref: interviewRef, inView: interviewVisible } = useSectionInView(0.1);
	const { ref: partnerRef, inView: partnerVisible } = useSectionInView(0.1);
	const { ref: youtubeRef, inView: youtubeVisible } = useSectionInView(0.1);
	const heroPlayRef = useRef<HTMLElement>(null);
	const { ref: heroPlayInViewRef, inView: heroPlayVisible } =
		useSectionInView(0.1);

	// Bundesliga Live Leaderboard
	const leaderboardData = useBLLeaderboard();

	useEffect(() => {
		const img = new window.Image();
		img.src = "/images/home/leaderboard-bg.webp";
		img.onload = () => setHeroPlayBgLoaded(true);
	}, []);

	// Fetch Bundesliga leaderboard when section is visible
	useEffect(() => {
		if (heroPlayVisible) {
			// query is auto-fetched by react-query; nothing extra needed
		}
	}, [heroPlayVisible]);

	const formatScore = (score: number) => {
		return Number(score).toLocaleString("id-ID");
	};

	const normalizeRows = (
		raw: ReturnType<typeof useBLLeaderboard> extends { data: infer D }
			? D
			: never,
	): LeaderboardRow[] => {
		if (!raw || !Array.isArray(raw)) return [];
		return [...raw]
			.sort((a, b) => (a.rank ?? 0) - (b.rank ?? 0))
			.slice(0, 10)
			.map((p, i) => ({
				rank: i + 1,
				userId: String(p.user_id ?? p.rank),
				name: p.user_name,
				profilePicture: p.profile_picture,
				subtitle: `Prediksi: ${p.total_predictions ?? 0} · Tepat: ${p.exact_scores ?? 0}`,
				score: p.total_points ?? p.points ?? 0,
			}));
	};

	const leaderboardRows: LeaderboardRow[] = useMemo(() => {
		const raw: any = Array.isArray(leaderboardData.data)
			? leaderboardData.data
			: [];
		return normalizeRows(raw);
	}, [leaderboardData.data]);

	// HeroPlay colors - matching site theme
	const heroPlayColors = {
		accent: isDark ? "#43decc" : "#0a7c6e",
		accentGlow: isDark ? "rgba(67, 222, 204, 0.3)" : "rgba(10, 124, 110, 0.2)",
		accentLight: isDark ? "#43decc" : "#0a7c6e",
		gold: "#FFD700",
		silver: "#C0C0C0",
		bronze: "#CD7F32",
		cardBg: isDark ? "rgba(255, 255, 255, 0.05)" : "rgba(255, 255, 255, 0.6)",
		cardBorder: isDark ? "rgba(255, 255, 255, 0.08)" : "rgba(0, 0, 0, 0.08)",
		text: isDark ? "#ffffff" : "#1a1a1a",
		textSecondary: isDark
			? "rgba(255, 255, 255, 0.7)"
			: "rgba(26, 26, 26, 0.7)",
		textMuted: isDark ? "rgba(255, 255, 255, 0.5)" : "rgba(26, 26, 26, 0.5)",
		bg: isDark ? "#0f1412" : "#f5f5f5",
		bgSecondary: isDark ? "#141a17" : "#e8e8e8",
		gradientBadge: `linear-gradient(135deg, ${isDark ? "#43decc" : "#0a7c6e"} 0%, ${isDark ? "#6ee7df" : "#15a896"} 100%)`,
		gradientCTA: `linear-gradient(135deg, ${isDark ? "#43decc" : "#0a7c6e"} 0%, ${isDark ? "#6ee7df" : "#15a896"} 100%)`,
		darkBgOverlay: isDark
			? "rgba(15, 20, 18, 0.95)"
			: "rgba(245, 245, 245, 0.95)",
	};

	// Banner Slides Data - constructed after state declarations
	const bannerSlides: BannerSlide[] = useMemo(() => {
		const slides: BannerSlide[] = [];

		// Slide 1: HeroPlay Game Pass Video Banner
		slides.push({
			id: "hero-play-game-pass",
			type: "cta" as const,
			videoSrc: "/images/home/penalti-rivals.mp4",
			ctaTitle: "OLAHBOLA\nGAME PASS",
			ctaSubtitle:
				"Nikmati akses tak terbatas ke lebih dari 30 game sepak bola eksklusif yang bisa Kamu mainkan kapan saja, di mana saja.",
			ctaCtaText: "Main Sekarang",
			ctaCtaHref: "https://heroplay.igvault.id/subscription",
			ctaAlignment: "right",
		});

		// Slide 2: Event Banner - Bundesliga 2026/2027
		slides.push({
			id: "event-bundesliga",
			type: "event" as const,
			imageFallback: "/images/home/bundesliga-bg.webp",
			// Reuse desktop background for mobile until a dedicated mobile asset is available.
			// BannerSlider renders the mobile <img> only when imageMobileFallback is set.
			imageMobileFallback: "/images/home/bundesliga-bg.webp",
			eventBadge: "Prediksi Skor",
			eventTitle: {
				parts: [{ text: "BUNDESLIGA 2026/2027", color: "white" as const }],
			},
			eventDescription:
				"Bundesliga prediksi skor telah dimulai! Uji akurasi pemahaman bola kamu dan dapatkan hadiah ekslusif bundesliga limited edition.",
			eventPrimaryCta: {
				text: "Prediksi Sekarang!",
				href: "/games",
			},
			eventRewardImage: "/images/home/home-prize.png",
			eventRewardImageAlt: "Mystery World Cup Jersey",
		});

		// Slide 3: HeroPlay Kickoff Banner
		slides.push({
			id: "hero-play-kickoff",
			type: "cta" as const,
			imageFallback: "/images/heroplay-banner/banner-tetris.webp",
			imageMobileFallback: "/images/heroplay-banner/banner-tetris-mobile.webp",
			heroPlayLayout: {
				highlightedWord: "Pertarungan",
				titleLines: ["Pertarungan", "Belum Selesai!"],
				highlightedLineIndex: 0,
				description: "Terus bermain, karena setiap skor menentukan kemenangan!",
				descriptionMobile:
					"Terus bermain, karena setiap skor menentukan kemenangan",
				buttonText: "Main Sekarang",
				buttonHref: "https://www.mainhero.id",
			},
		});

		// Slide 4: Article banner (if available)
		if (featuredArticle) {
			slides.push({
				id: `article-${featuredArticle.id}`,
				type: "article" as const,
				label: "Breaking",
				labelColor: "breaking" as const,
				title: {
					parts: [
						featuredArticle.title.split(" ").slice(0, 2).join(" "),
						featuredArticle.title.split(" ").slice(2).join(" "),
					],
					colors: ["primary", "white"] as ("primary" | "white" | "accent")[],
				},
				excerpt: featuredArticle.excerpt,
				image: featuredArticle.image,
				ctaButtons: {
					primary: {
						text: "Baca Sekarang",
						href: `/${featuredArticle.slug}`,
						icon: "arrow_forward",
					},
				},
			});
		}

		return slides;
	}, [featuredArticle]);

	const fetchFeaturedArticle = async () => {
		setFeaturedLoading(true);
		try {
			const response = await apiClient.get(
				"/api/v1/article/siapa-rui-pinto-rahasia-man-city",
			);
			if (response.data.status === "success") {
				setFeaturedArticle(response.data.data);
			}
		} catch (error) {
			console.error("Error fetching featured article:", error);
		} finally {
			setFeaturedLoading(false);
		}
	};

	const fetchArticles = async () => {
		if (!articleVisible) return;
		setArticlesLoading(true);
		try {
			const response = await apiClient.get("/api/v1/article", {
				params: { per_page: 4 },
			});
			if (response.data.status === "success") {
				setArticles(response.data.data);
			}
		} catch (error) {
			console.error("Error fetching articles:", error);
		} finally {
			setArticlesLoading(false);
		}
	};

	const fetchInterviews = async () => {
		if (!interviewVisible) return;
		setInterviewsLoading(true);
		try {
			const response = await apiClient.get("/api/v1/interview", {
				params: { per_page: 6 },
			});
			if (response.data.status === "success") {
				setInterviews(response.data.data);
			}
		} catch (error) {
			console.error("Error fetching interviews:", error);
		} finally {
			setInterviewsLoading(false);
		}
	};

	useEffect(() => {
		AOS.init({
			duration: 800,
			once: true,
			easing: "ease-out-quart",
			offset: 80,
		});
		// eslint-disable-next-line react-hooks/set-state-in-effect
		fetchFeaturedArticle();
	}, []);

	useEffect(() => {
		if (articleVisible) {
			// eslint-disable-next-line react-hooks/set-state-in-effect
			fetchArticles();
		}
	}, [articleVisible]);

	useEffect(() => {
		if (interviewVisible) {
			fetchInterviews();
		}
	}, [interviewVisible]);

	useEffect(() => {
		const updateDisplayCount = () => {
			const width = window.innerWidth;
			if (width < 768) {
				setInterviewDisplayCount(6);
				setIsMobileView(true);
			} else {
				setInterviewDisplayCount(5);
				setIsMobileView(false);
			}
		};

		if (typeof window !== "undefined") {
			updateDisplayCount();
			window.addEventListener("resize", updateDisplayCount);
		}
		return () => {
			if (typeof window !== "undefined") {
				window.removeEventListener("resize", updateDisplayCount);
			}
		};
	}, []);

	return (
		<div
			className={`min-h-screen transition-colors duration-300 ${isDark ? "bg-[#0f1412] text-[#dfe4e0]" : "bg-[#f5f5f5] text-[#1a1a1a]"}`}
		>
			{/* Background Pattern */}
			<div
				className="fixed inset-0 pointer-events-none"
				style={{
					backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23${isDark ? "ffffff" : "000000"}' fill-opacity='${isDark ? "0.03" : "0.05"}'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
					backgroundSize: "30px 30px",
					zIndex: 0,
				}}
			/>

			<main className="relative z-10">
				{/* Hero Section with Banner Slider */}
				<section className="relative h-screen flex items-center overflow-hidden">
					<BannerSlider
						slides={bannerSlides}
						autoPlay={true}
						autoPlayInterval={3000}
						showNavigation={bannerSlides.length > 1}
						isDark={isDark}
						isMobile={isMobileView}
					/>
				</section>

				{/*  LIVE LEADERBOARD  */}
				<section
					ref={(node) => {
						heroPlayRef.current = node;
						heroPlayInViewRef(node);
					}}
					className="relative w-full overflow-hidden"
					style={{
						background: heroPlayBgLoaded
							? "transparent"
							: `linear-gradient(135deg, ${heroPlayColors.bg} 0%, ${heroPlayColors.bgSecondary} 50%, ${heroPlayColors.bgSecondary} 100%)`,
					}}
				>
					{/* Parallax Background Image */}
					{heroPlayBgLoaded && (
						<div
							className="absolute inset-0 bg-cover bg-center bg-fixed"
							style={{
								backgroundImage: "url(/images/home/leaderboard-bg.webp)",
								zIndex: 0,
							}}
						/>
					)}

					{/* Dark Gradient Overlay */}
					<div
						className="absolute inset-0 z-10"
						style={{
							background: `linear-gradient(180deg, ${heroPlayColors.darkBgOverlay} 0%, ${heroPlayColors.bg}dd 50%, ${heroPlayColors.darkBgOverlay} 100%)`,
						}}
					/>

					{/* Animated Background Effects - Gen-Z Style */}
					<div className="absolute inset-0 z-20 overflow-hidden pointer-events-none">
						{/* Floating orbs with accent color */}
						<div
							className="absolute w-96 h-96 rounded-full"
							style={{
								background: `radial-gradient(circle, ${heroPlayColors.accentGlow} 0%, transparent 70%)`,
								filter: "blur(80px)",
								top: "10%",
								left: "10%",
								animation: "float 12s ease-in-out infinite",
							}}
						/>
						<div
							className="absolute w-80 h-80 rounded-full"
							style={{
								background: `radial-gradient(circle, ${heroPlayColors.accentGlow} 0%, transparent 70%)`,
								filter: "blur(100px)",
								bottom: "15%",
								right: "10%",
								animation: "float 15s ease-in-out infinite reverse",
							}}
						/>
						<div
							className="absolute w-64 h-64 rounded-full"
							style={{
								background: `radial-gradient(circle, ${heroPlayColors.gold}30 0%, transparent 70%)`,
								filter: "blur(90px)",
								top: "50%",
								left: "50%",
								transform: "translate(-50%, -50%)",
								animation: "float 10s ease-in-out infinite",
							}}
						/>
						{/* Subtle grid pattern */}
						<div
							className="absolute inset-0 opacity-5"
							style={{
								backgroundImage: `linear-gradient(${isDark ? "rgba(255, 255, 255, 0.05)" : "rgba(0, 0, 0, 0.05)"} 1px, transparent 1px), linear-gradient(90deg, ${isDark ? "rgba(255, 255, 255, 0.05)" : "rgba(0, 0, 0, 0.05)"} 1px, transparent 1px)`,
								backgroundSize: "50px 50px",
							}}
						/>
					</div>

					{/* Main Content */}
					<div
						className="relative z-30 py-14 md:py-20 px-4 md:px-8 lg:px-16 max-w-screen-2xl mx-auto"
						data-aos="fade-up"
					>
						{/* Header */}
						<div className="text-center mb-10">
							{/* Title */}
							<h2
								className="text-3xl md:text-5xl font-black uppercase mb-3"
								style={{
									color: heroPlayColors.accent,
								}}
							>
								BUNDESLIGA 2026/2027
							</h2>
							<p
								className="text-base md:text-lg"
								style={{ color: heroPlayColors.textSecondary }}
							>
								Klasemen Sementara Berdasarkan Performa Prediksi Skor Bundesliga
								Season 2026/2027
							</p>
						</div>

						{/* Loading State */}
						{leaderboardData.isLoading ? (
							<div className="max-w-4xl mx-auto">
								<div
									className="flex items-center gap-4 p-4 mb-6 rounded-2xl animate-pulse"
									style={{
										background: heroPlayColors.cardBg,
										backdropFilter: "blur(20px)",
										border: `1px solid ${heroPlayColors.cardBorder}`,
									}}
								>
									<div
										className="w-14 h-14 rounded-full"
										style={{ background: `${heroPlayColors.accent}30` }}
									/>
									<div className="flex-1 space-y-2">
										<div
											className="h-5 rounded w-3/4"
											style={{ background: `${heroPlayColors.accent}20` }}
										/>
										<div
											className="h-4 rounded w-1/2"
											style={{ background: `${heroPlayColors.accent}10` }}
										/>
									</div>
									<div
										className="h-8 rounded-lg w-24"
										style={{ background: `${heroPlayColors.accent}20` }}
									/>
								</div>
								<div className="grid grid-cols-1 md:grid-cols-3 gap-4">
									{[1, 2, 3].map((i) => (
										<div
											key={i}
											className="h-24 rounded-2xl animate-pulse"
											style={{
												background: heroPlayColors.cardBg,
												backdropFilter: "blur(20px)",
												border: `1px solid ${heroPlayColors.cardBorder}`,
											}}
										/>
									))}
								</div>
							</div>
						) : leaderboardData.isError ? (
							<div className="text-center py-12 max-w-md mx-auto">
								<div
									className="w-20 h-20 mx-auto mb-4 rounded-full flex items-center justify-center"
									style={{ background: `${heroPlayColors.accent}15` }}
								>
									<Circle className="size-10" fill="currentColor" />
								</div>
								<p
									className="text-lg mb-4"
									style={{ color: heroPlayColors.text }}
								>
									Gagal memuat klasemen Bundesliga.
								</p>
								<button
									onClick={() => leaderboardData.refetch()}
									className="px-6 py-3 font-bold rounded-full transition-all duration-300 hover:scale-105 active:scale-95"
									style={{
										background: heroPlayColors.gradientBadge,
										color: isDark ? "#003732" : "#ffffff",
									}}
								>
									Coba Lagi
								</button>
							</div>
						) : leaderboardRows.length > 0 ? (
							<div className="max-w-5xl mx-auto">
								{/* Top 3 Podium Cards - Desktop - Gen-Z Style */}
								<div
									className="hidden md:grid gap-4 mb-8 items-end"
									style={{ gridTemplateColumns: "repeat(3, 1fr)" }}
								>
									{/* Rank 2 */}
									{leaderboardRows[1] && (
										<div
											className="relative p-5 rounded-3xl text-center order-1 transition-all duration-300 hover:scale-[1.02]"
											style={{
												background: `linear-gradient(135deg, ${heroPlayColors.cardBg} 0%, ${heroPlayColors.silver}15 100%)`,
												backdropFilter: "blur(20px)",
												border: `1px solid ${heroPlayColors.cardBorder}`,
												marginBottom: "10px",
											}}
										>
											<div
												className="absolute -top-5 left-1/2 -translate-x-1/2 w-12 h-12 rounded-full flex items-center justify-center font-black text-xl shadow-lg"
												style={{
													background: `linear-gradient(135deg, ${heroPlayColors.silver} 0%, #A0A0A0 100%)`,
													color: isDark ? "#1a1a1a" : "#1a1a1a",
													boxShadow: `0 0 20px ${heroPlayColors.silver}50`,
												}}
											>
												2
											</div>
											<div className="pt-5">
												{leaderboardRows[1].profilePicture ? (
													<div className="relative w-16 h-16 mx-auto rounded-2xl overflow-hidden mb-3">
														<Image
															src={leaderboardRows[1].profilePicture}
															alt={leaderboardRows[1].name}
															fill
															sizes="64px"
															style={{
																objectFit: "cover",
																borderColor: heroPlayColors.silver,
															}}
														/>
													</div>
												) : (
													<div className="relative w-16 h-16 mx-auto rounded-2xl overflow-hidden mb-3">
														<Image
															src="/icons/football-player.png"
															alt="Player Icon"
															fill
															sizes="64px"
															style={{ objectFit: "cover" }}
														/>
													</div>
												)}
												<h3
													className="font-bold text-lg truncate"
													style={{ color: heroPlayColors.text }}
												>
													{leaderboardRows[1].name}
												</h3>
												<p
													className="text-sm mb-3"
													style={{ color: heroPlayColors.textMuted }}
												>
													{leaderboardRows[1].subtitle || "-"}
												</p>
												<div
													className="inline-flex items-center gap-2 px-4 py-2 rounded-full"
													style={{ background: `${heroPlayColors.silver}20` }}
												>
													<Circle className="size-3.5" fill="currentColor" />
													<span
														className="font-bold text-lg"
														style={{ color: heroPlayColors.text }}
													>
														{formatScore(leaderboardRows[1].score)}
													</span>
												</div>
											</div>
										</div>
									)}

									{/* Rank 1 - Featured - Champion */}
									{leaderboardRows[0] && (
										<div
											className="relative p-6 rounded-3xl text-center order-2 transition-all duration-300 hover:scale-[1.03]"
											style={{
												background: `linear-gradient(135deg, ${heroPlayColors.cardBg} 0%, ${heroPlayColors.gold}25 100%)`,
												backdropFilter: "blur(20px)",
												border: `2px solid ${heroPlayColors.gold}50`,
												boxShadow: `0 0 40px ${heroPlayColors.gold}30`,
												marginBottom: "20px",
											}}
										>
											<div
												className="absolute -top-6 left-1/2 -translate-x-1/2 w-14 h-14 rounded-full flex items-center justify-center shadow-xl"
												style={{
													background: `linear-gradient(135deg, ${heroPlayColors.gold} 0%, #FFA500 100%)`,
													boxShadow: `0 0 30px ${heroPlayColors.gold}60`,
												}}
											>
												<span
													className="text-2xl font-black"
													style={{ color: isDark ? "#003732" : "#1a1a1a" }}
												>
													1
												</span>
											</div>
											<div
												className="absolute top-3 right-3 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider"
												style={{
													background: `linear-gradient(135deg, ${heroPlayColors.gold} 0%, #FFA500 100%)`,
													color: isDark ? "#003732" : "#1a1a1a",
												}}
											>
												Champion
											</div>
											<div className="pt-5">
												{leaderboardRows[0].profilePicture ? (
													<div className="relative w-20 h-20 mx-auto rounded-2xl overflow-hidden mb-4">
														<Image
															src={leaderboardRows[0].profilePicture}
															alt={leaderboardRows[0].name}
															fill
															sizes="80px"
															style={{
																objectFit: "cover",
																borderColor: heroPlayColors.gold,
															}}
														/>
													</div>
												) : (
													<div className="relative w-20 h-20 mx-auto rounded-2xl overflow-hidden mb-4">
														<Image
															src="/icons/football-player.png"
															alt="Player Icon"
															fill
															sizes="80px"
															style={{ objectFit: "cover" }}
														/>
													</div>
												)}
												<h3
													className="font-black text-xl mb-1"
													style={{ color: heroPlayColors.text }}
												>
													{leaderboardRows[0].name}
												</h3>
												<p
													className="text-sm mb-4"
													style={{ color: heroPlayColors.textMuted }}
												>
													{leaderboardRows[0].subtitle || "-"}
												</p>
												<div
													className="inline-flex items-center gap-2 px-5 py-3 rounded-full"
													style={{
														background: `${heroPlayColors.gold}25`,
														border: `1px solid ${heroPlayColors.gold}40`,
													}}
												>
													<Circle className="size-5" fill="currentColor" />
													<span
														className="font-black text-2xl"
														style={{ color: heroPlayColors.text }}
													>
														{formatScore(leaderboardRows[0].score)}
													</span>
												</div>
											</div>
										</div>
									)}

									{/* Rank 3 */}
									{leaderboardRows[2] && (
										<div
											className="relative p-5 rounded-3xl text-center order-3 transition-all duration-300 hover:scale-[1.02]"
											style={{
												background: `linear-gradient(135deg, ${heroPlayColors.cardBg} 0%, ${heroPlayColors.bronze}15 100%)`,
												backdropFilter: "blur(20px)",
												border: `1px solid ${heroPlayColors.cardBorder}`,
												marginBottom: "10px",
											}}
										>
											<div
												className="absolute -top-5 left-1/2 -translate-x-1/2 w-12 h-12 rounded-full flex items-center justify-center shadow-lg"
												style={{
													background: `linear-gradient(135deg, ${heroPlayColors.bronze} 0%, #A0522D 100%)`,
													boxShadow: `0 0 15px ${heroPlayColors.bronze}40`,
												}}
											>
												<span
													className="text-xl font-black"
													style={{ color: isDark ? "#ffffff" : "#ffffff" }}
												>
													3
												</span>
											</div>
											<div className="pt-5">
												{leaderboardRows[2].profilePicture ? (
													<div className="relative w-16 h-16 mx-auto rounded-2xl overflow-hidden mb-3">
														<Image
															src={leaderboardRows[2].profilePicture}
															alt={leaderboardRows[2].name}
															fill
															sizes="64px"
															style={{
																objectFit: "cover",
																borderColor: heroPlayColors.bronze,
															}}
														/>
													</div>
												) : (
													<div className="relative w-16 h-16 mx-auto rounded-2xl overflow-hidden mb-3">
														<Image
															src="/icons/football-player.png"
															alt="Player Icon"
															fill
															sizes="64px"
															style={{ objectFit: "cover" }}
														/>
													</div>
												)}
												<h3
													className="font-bold text-lg truncate"
													style={{ color: heroPlayColors.text }}
												>
													{leaderboardRows[2].name}
												</h3>
												<p
													className="text-sm mb-3"
													style={{ color: heroPlayColors.textMuted }}
												>
													{leaderboardRows[2].subtitle || "-"}
												</p>
												<div
													className="inline-flex items-center gap-2 px-4 py-2 rounded-full"
													style={{ background: `${heroPlayColors.bronze}20` }}
												>
													<Circle className="size-3.5" fill="currentColor" />
													<span
														className="font-bold text-lg"
														style={{ color: heroPlayColors.text }}
													>
														{formatScore(leaderboardRows[2].score)}
													</span>
												</div>
											</div>
										</div>
									)}
								</div>

								{/* Top 3 Mobile Card View - Gen-Z Style */}
								<div className="md:hidden space-y-4 mb-6">
									{leaderboardRows.slice(0, 3).map((player, index) => (
										<div
											key={player.userId}
											className="relative flex items-center gap-4 p-4 rounded-2xl backdrop-blur-xl border transition-all duration-300"
											style={{
												background:
													index === 0
														? `linear-gradient(135deg, ${heroPlayColors.cardBg} 0%, ${heroPlayColors.gold}20 100%)`
														: index === 1
															? `linear-gradient(135deg, ${heroPlayColors.cardBg} 0%, ${heroPlayColors.silver}15 100%)`
															: `linear-gradient(135deg, ${heroPlayColors.cardBg} 0%, ${heroPlayColors.bronze}15 100%)`,
												borderColor:
													index === 0
														? `${heroPlayColors.gold}40`
														: index === 1
															? `${heroPlayColors.silver}30`
															: `${heroPlayColors.bronze}30`,
											}}
										>
											<div
												className="w-12 h-12 rounded-xl flex items-center justify-center font-black text-xl shadow-lg"
												style={{
													background:
														index === 0
															? `linear-gradient(135deg, ${heroPlayColors.gold} 0%, #FFA500 100%)`
															: index === 1
																? `linear-gradient(135deg, ${heroPlayColors.silver} 0%, #A0A0A0 100%)`
																: `linear-gradient(135deg, ${heroPlayColors.bronze} 0%, #A0522D 100%)`,
													color: isDark ? "#003732" : "#1a1a1a",
												}}
											>
												{index + 1}
											</div>
											{player.profilePicture ? (
												<div className="relative w-12 h-12 rounded-xl overflow-hidden border">
													<Image
														src={player.profilePicture}
														alt={player.name}
														fill
														sizes="48px"
														style={{
															objectFit: "cover",
															borderColor:
																index === 0
																	? heroPlayColors.gold
																	: index === 1
																		? heroPlayColors.silver
																		: heroPlayColors.bronze,
														}}
													/>
												</div>
											) : (
												<div className="relative w-12 h-12 rounded-xl overflow-hidden">
													<Image
														src="/icons/football-player.png"
														alt="Player Icon"
														fill
														sizes="48px"
														style={{ objectFit: "cover" }}
													/>
												</div>
											)}
											<div className="flex-1 min-w-0">
												<h3
													className="font-bold truncate"
													style={{ color: heroPlayColors.text }}
												>
													{player.name}
												</h3>
												<p
													className="text-sm"
													style={{ color: heroPlayColors.textMuted }}
												>
													{player.subtitle || "-"}
												</p>
											</div>
											<div
												className="flex items-center gap-2 px-3 py-2 rounded-full"
												style={{
													background: `${heroPlayColors.accent}10`,
													border: `1px solid ${heroPlayColors.accent}30`,
												}}
											>
												<Circle className="size-3.5" fill="currentColor" />
												<span
													className="font-bold"
													style={{ color: heroPlayColors.text }}
												>
													{formatScore(player.score)}
												</span>
											</div>
										</div>
									))}
								</div>

								{/* Rest of Leaderboard (Rank 4+) - Gen-Z Style */}
								{leaderboardRows.length > 3 && (
									<div className="space-y-3">
										{/* Section Header */}
										<div className=" items-center gap-3 mb-4 hidden md:flex">
											<div
												className="h-px flex-1"
												style={{ background: heroPlayColors.cardBorder }}
											/>
											<span
												className="text-xs font-bold uppercase tracking-widest"
												style={{ color: heroPlayColors.textMuted }}
											>
												Peringkat Berikutnya
											</span>
											<div
												className="h-px flex-1"
												style={{ background: heroPlayColors.cardBorder }}
											/>
										</div>
										{leaderboardRows.slice(3, 10).map((player, index) => (
											<div
												key={player.userId}
												className="flex items-center justify-between px-5 py-4 rounded-2xl backdrop-blur-xl border transition-all duration-300 cursor-pointer group"
												style={{
													background: heroPlayColors.cardBg,
													borderColor: heroPlayColors.cardBorder,
												}}
												onMouseEnter={(e) => {
													(
														e.currentTarget as HTMLDivElement
													).style.borderColor = `${heroPlayColors.accent}50`;
													(e.currentTarget as HTMLDivElement).style.transform =
														"translateX(4px)";
												}}
												onMouseLeave={(e) => {
													(
														e.currentTarget as HTMLDivElement
													).style.borderColor = heroPlayColors.cardBorder;
													(e.currentTarget as HTMLDivElement).style.transform =
														"translateX(0)";
												}}
											>
												<div className="flex items-center gap-4">
													<div
														className="w-10 h-10 rounded-xl flex items-center justify-center font-bold"
														style={{
															background: `${heroPlayColors.accent}15`,
															color: heroPlayColors.accent,
														}}
													>
														{index + 4}
													</div>
													{player.profilePicture ? (
														<div className="relative w-10 h-10 rounded-xl overflow-hidden">
															<Image
																src={player.profilePicture}
																alt={player.name}
																fill
																sizes="40px"
																style={{ objectFit: "cover" }}
															/>
														</div>
													) : (
														<div className="relative w-10 h-10 rounded-xl overflow-hidden">
															<Image
																src="/icons/football-player.png"
																alt="Player Icon"
																fill
																sizes="40px"
																style={{ objectFit: "cover" }}
															/>
														</div>
													)}
													<div>
														<h4
															className="font-semibold"
															style={{ color: heroPlayColors.text }}
														>
															{player.name}
														</h4>
														<p
															className="text-sm"
															style={{ color: heroPlayColors.textMuted }}
														>
															{player.subtitle || "-"}
														</p>
													</div>
												</div>
												<div
													className="flex items-center gap-2 px-4 py-2 rounded-full transition-all duration-300"
													style={{
														background: `${heroPlayColors.accent}10`,
														border: `1px solid ${heroPlayColors.accent}30`,
													}}
												>
													<Circle className="size-3.5" fill="currentColor" />
													<span
														className="font-bold"
														style={{ color: heroPlayColors.text }}
													>
														{formatScore(player.score)}
													</span>
												</div>
											</div>
										))}
									</div>
								)}

								{/* CTA Button */}
								<div className="text-center mt-10">
									<Link
										href="/games"
										className="inline-flex items-center gap-2 px-8 py-4 rounded-full font-bold text-sm md:text-lg hover:scale-105 transition-all duration-300 shadow-lg"
										style={{
											background: heroPlayColors.gradientCTA,
											color: isDark ? "#003732" : "#ffffff",
											boxShadow: `0 0 30px ${heroPlayColors.accentGlow}`,
										}}
									>
										Prediksi Skor Sekarang
										<ArrowRight className="size-5" />
									</Link>
								</div>
							</div>
						) : (
							<div className="text-center py-12">
								<div
									className="w-24 h-24 mx-auto mb-4 rounded-full flex items-center justify-center"
									style={{ background: heroPlayColors.cardBg }}
								>
									<Circle className="size-10" fill="currentColor" />
								</div>
								<p
									className="text-lg"
									style={{ color: heroPlayColors.textMuted }}
								>
									Belum ada data papan skor
								</p>
							</div>
						)}
					</div>
				</section>

				{/* ===== GOOGLE ADS SECTION ===== */}
				{/* <section className="py-6 px-4 md:px-8 lg:px-16 max-w-screen-2xl mx-auto">
					<div className="max-w-4xl mx-auto">
						<div className="text-center">
							<AdSlot
								slot="5851008301"
								format="auto"
								responsive={true}
								label="ADVERTISMENT"
								className="mx-auto"
								minHeight={120}
								lazyLoad={false}
							/>
						</div>
					</div>
				</section> */}

				{/* Article Section - Bento Grid */}
				<section
					ref={articleRef}
					className="py-16 md:py-24 px-6 md:px-16 max-w-480 mx-auto"
				>
					<div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-12">
						<div>
							<h2
								className={`text-3xl md:text-5xl font-bold uppercase italic ${isDark ? "text-primary" : "text-[#0a7c6e]"}`}
								data-aos="fade-up"
							>
								Fresh Off the Pitch
							</h2>
							<p
								className={`uppercase tracking-widest mt-2 ${isDark ? "text-on-surface-variant" : "text-[#5a5a5a]"}`}
								data-aos="fade-up"
								data-aos-delay="100"
							>
								The latest from the arena
							</p>

							{/* Link pindah ke sini untuk mobile */}
							<Link
								href="/artikel"
								className={`font-semibold flex items-center gap-2 hover:gap-4 transition-all uppercase tracking-widest text-sm mt-4 md:hidden ${isDark ? "text-primary" : "text-[#0a7c6e]"}`}
								data-aos="fade-up"
								data-aos-delay="200"
							>
								VIEW ALL{" "}
								<ArrowRight
									className={`size-5 mt-1 ${isDark ? "text-primary" : "text-[#0a7c6e]"}`}
								/>
							</Link>
						</div>

						{/* Link untuk desktop */}
						<Link
							href="/artikel"
							className={`font-semibold items-center gap-2 hover:gap-4 transition-all uppercase tracking-widest text-sm hidden md:flex ${isDark ? "text-primary" : "text-[#0a7c6e]"}`}
						>
							VIEW ALL{" "}
							<ArrowRight
								className={`size-5 mt-1 ${isDark ? "text-primary" : "text-[#0a7c6e]"}`}
							/>
						</Link>
					</div>
					{articlesLoading ? (
						<div className="grid grid-cols-1 md:grid-cols-4 grid-rows-2 gap-6 h-auto md:h-200">
							{[1, 2, 3, 4].map((i) => (
								<div
									key={i}
									className={`glass-panel animate-pulse rounded-xl ${i === 1 ? "md:col-span-2 md:row-span-2" : ""}`}
								>
									<div className="h-full bg-surface-container" />
								</div>
							))}
						</div>
					) : articles.length > 0 ? (
						<div className="grid grid-cols-1 md:grid-cols-4 grid-rows-2 gap-6 h-320 md:h-200">
							{/* Featured Article */}
							<Link
								href={`/${articles[0]?.slug}`}
								className="md:col-span-2 md:row-span-2 glass-panel relative group overflow-hidden rounded-xl cursor-pointer"
							>
								<div className="absolute inset-0">
									<Image
										src={`${process.env.NEXT_PUBLIC_API_URL}/storage/${articles[0]?.image}`}
										alt={articles[0]?.title || "Featured article"}
										fill
										sizes="(max-width: 768px) 100vw, 50vw"
										quality={75}
										style={{ objectFit: "cover" }}
										className="transition-transform duration-700 group-hover:scale-110"
									/>
								</div>
								<div
									className={`absolute inset-0 bg-linear-to-t ${isDark ? "from-[#0f1412]" : "from-[#f5f5f5]"} to-transparent`}
								/>
								<div className="absolute bottom-0 p-8">
									<h3
										className={`text-lg md:text-3xl font-bold uppercase mb-2 md:mb-4 ${isDark ? "text-white" : "text-[#1a1a1a]"}`}
									>
										{articles[0]?.title}
									</h3>
									<p
										className={`mb-2 md:mb-6 line-clamp-2 ${isDark ? "text-on-surface-variant" : "text-[#4a4a4a]"}`}
									>
										{articles[0]?.excerpt}
									</p>
									<button
										className={`font-black uppercase tracking-widest text-sm flex items-center gap-2 group-hover:gap-4 transition-all ${isDark ? "text-primary" : "text-[#0a7c6e]"}`}
									>
										Read More{" "}
										<ArrowRight
											className={`size-5 mt-1 ${isDark ? "text-primary" : "text-[#0a7c6e]"}`}
										/>
									</button>
								</div>
							</Link>

							{/* Secondary Article */}
							{articles[1] && (
								<Link
									href={`/${articles[1]?.slug}`}
									className="md:col-span-2 glass-panel relative group overflow-hidden rounded-xl cursor-pointer"
								>
									<div className="flex h-full">
										<div className="w-1/2 p-6 flex flex-col justify-center">
											<h3 className="text-base md:text-2xl font-bold uppercase mb-2">
												{articles[1]?.title}
											</h3>
											<button
												className={`${isDark ? "text-primary" : "text-[#0a7c6e]"} font-black uppercase tracking-widest text-xs mt-4`}
											>
												Read More{" "}
												<ArrowRight className="size-4 inline-block ml-1" />
											</button>
										</div>
										<div className="w-1/2 relative overflow-hidden rounded-r-xl">
											<Image
												src={`${process.env.NEXT_PUBLIC_API_URL}/storage/${articles[1]?.image}`}
												alt={articles[1]?.title || "Article image"}
												fill
												sizes="(max-width: 768px) 50vw, 25vw"
												style={{ objectFit: "cover" }}
												className="transition-transform duration-700 group-hover:scale-110"
											/>
										</div>
									</div>
								</Link>
							)}

							{/* Small Article Cards with Images */}
							{articles[2] && (
								<Link
									href={`/${articles[2]?.slug}`}
									className="glass-panel relative group h-60 md:h-full overflow-hidden rounded-xl cursor-pointer hover:border-primary/50 transition-all"
								>
									<div className="absolute inset-0">
										<Image
											src={`${process.env.NEXT_PUBLIC_API_URL}/storage/${articles[2]?.image}`}
											alt={articles[2]?.title || "Article image"}
											fill
											sizes="(max-width: 768px) 100vw, 25vw"
											style={{ objectFit: "cover" }}
											className="transition-transform duration-700 group-hover:scale-110"
										/>
									</div>
									<div
										className={`absolute inset-0 bg-linear-to-t ${isDark ? "from-[#0f1412]" : "from-[#f5f5f5]"} to-transparent`}
									/>
									<div className="relative p-6 flex flex-col justify-end h-full">
										<h3 className="font-semibold text-base uppercase leading-tight line-clamp-2">
											{articles[2]?.title}
										</h3>
										<p
											className={`text-xs ${isDark ? "text-on-surface-variant" : "text-[#4a4a4a]"} mt-2 uppercase tracking-tighter`}
										>
											Latest News
										</p>
									</div>
								</Link>
							)}

							{articles[3] && (
								<Link
									href={`/${articles[3]?.slug}`}
									className="glass-panel relative group  h-60 md:h-full overflow-hidden rounded-xl cursor-pointer hover:border-primary/50 transition-all"
								>
									<div className="absolute inset-0">
										<Image
											src={`${process.env.NEXT_PUBLIC_API_URL}/storage/${articles[3]?.image}`}
											alt={articles[3]?.title || "Article image"}
											fill
											sizes="(max-width: 768px) 100vw, 25vw"
											style={{ objectFit: "cover" }}
											className="transition-transform duration-700 group-hover:scale-110"
										/>
									</div>
									<div
										className={`absolute inset-0 bg-linear-to-t ${isDark ? "from-[#0f1412]" : "from-[#f5f5f5]"} to-transparent`}
									/>
									<div className="relative p-6 flex flex-col justify-end h-full">
										<h3 className="font-semibold text-base uppercase leading-tight line-clamp-2">
											{articles[3]?.title}
										</h3>
										<p
											className={`text-xs ${isDark ? "text-on-surface-variant" : "text-[#4a4a4a]"} mt-2 uppercase tracking-tighter`}
										>
											Latest News
										</p>
									</div>
								</Link>
							)}
						</div>
					) : (
						<p className="text-on-surface-variant text-center mt-10">
							Tidak ada artikel
						</p>
					)}
				</section>

				{/* Ads Banner */}
				{/* <section className="w-full py-4 px-6 md:px-16">
					<a
						href="https://heroplay.igvault.id/"
						target="_blank"
						rel="noopener noreferrer"
						className="block max-w-480 mx-auto relative h-50"
					>
						<Image
							src="/images/home/ads-hz-1.webp"
							alt="Banner Ads"
							fill
							sizes="(max-width: 1920px) 100vw, 1920px"
							style={{ objectFit: "contain" }}
							className="rounded-xl"
						/>
					</a>
				</section> */}

				{/* Social Media Section */}
				<section
					ref={socmedRef}
					className={`py-16 md:py-24 px-6 md:px-16 transition-opacity duration-500 ${socmedVisible ? "opacity-100" : "opacity-0"}`}
				>
					<div className="max-w-480 mx-auto">
						<h2
							className={`text-3xl md:text-5xl font-bold uppercase italic  mb-10 text-center ${isDark ? "text-primary" : "text-[#0a7c6e]"}`}
							data-aos="fade-up"
						>
							Yuk, Temui OlahBola di Sini!
						</h2>

						{socmedVisible && (
							<div className="grid grid-cols-3 md:grid-cols-6 gap-3 md:gap-6 max-w-4xl mx-auto">
								{/* TikTok */}
								<a
									href="https://www.tiktok.com/@olahbolacom"
									target="_blank"
									rel="noopener noreferrer"
									aria-label="Kunjungi OlahBola di TikTok"
									className="bg-surface-container p-4 md:p-6 rounded-xl flex items-center justify-center text-white transition-colors hover:bg-primary hover:text-on-primary border border-white/10"
								>
									<svg
										className="size-8 md:size-14 "
										viewBox="0 0 24 24"
										fill="currentColor"
									>
										<path d="M19.59 6.69a4.83 4.83 0 01-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 01-5.2 1.74 2.89 2.89 0 012.31-4.64 2.93 2.93 0 01.88.13V9.4a6.84 6.84 0 00-1-.05A6.33 6.33 0 005 20.1a6.34 6.34 0 0010.86-4.43v-7a8.16 8.16 0 004.77 1.52v-3.4a4.85 4.85 0 01-1-.1z" />
									</svg>
								</a>

								{/* Instagram */}
								<a
									href="https://www.instagram.com/olahbolacom"
									target="_blank"
									rel="noopener noreferrer"
									aria-label="Kunjungi OlahBola di Instagram"
									className="bg-surface-container p-4 md:p-6 rounded-xl flex items-center justify-center text-white transition-colors hover:bg-primary hover:text-on-primary border border-white/10"
								>
									<svg
										className="size-8 md:size-14 "
										viewBox="0 0 24 24"
										fill="currentColor"
									>
										<path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
									</svg>
								</a>

								{/* Facebook */}
								<a
									href="https://www.facebook.com/olahbolacom"
									target="_blank"
									rel="noopener noreferrer"
									aria-label="Kunjungi OlahBola di Facebook"
									className="bg-surface-container p-4 md:p-6 rounded-xl flex items-center justify-center text-white transition-colors hover:bg-primary hover:text-on-primary border border-white/10"
								>
									<svg
										className="size-8 md:size-14 "
										viewBox="0 0 24 24"
										fill="currentColor"
									>
										<path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.443 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
									</svg>
								</a>

								{/* YouTube */}
								<a
									href="https://www.youtube.com/@olahbolacom"
									target="_blank"
									rel="noopener noreferrer"
									aria-label="Kunjungi OlahBola di YouTube"
									className="bg-surface-container p-4 md:p-6 rounded-xl flex items-center justify-center text-white transition-colors hover:bg-primary hover:text-on-primary border border-white/10"
								>
									<svg
										className="size-8 md:size-14 "
										viewBox="0 0 24 24"
										fill="currentColor"
									>
										<path d="M23.498 6.186a3.016 3.016 0 00-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 00.502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 002.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 002.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
									</svg>
								</a>
							</div>
						)}
					</div>
				</section>

				{/* YouTube Embed Section */}
				<section ref={youtubeRef} className="py-16 md:py-24 px-6 md:px-16">
					<div className="max-w-480 mx-auto" data-aos="fade-up">
						{youtubeVisible && (
							<div className="max-w-4xl mx-auto">
								<iframe
									className="w-full aspect-video rounded-xl"
									src="https://www.youtube.com/embed/Sh616w1CtjE"
									title="OlahBola Video"
									allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share;"
									referrerPolicy="strict-origin-when-cross-origin"
									allowFullScreen
								/>
							</div>
						)}
					</div>
				</section>

				{/* Interview Slider Section - Vertical Reels */}
				<section ref={interviewRef} className="py-16 md:py-24 px-6 md:px-16">
					<div className="max-w-480 mx-auto" data-aos="fade-up">
						<div className="mb-12">
							<h2
								className={`text-3xl md:text-5xl font-bold uppercase italic ${isDark ? "text-primary" : "text-[#0a7c6e]"}`}
							>
								Voices of the Game
							</h2>
							<div className="flex items-center gap-4 mt-4">
								<span
									className={`h-px grow ${isDark ? " bg-white/10" : "bg-on-surface-variant"}`}
								/>
								<p className="text-on-surface-variant uppercase tracking-widest text-sm">
									Inside the mind of the Legends
								</p>
								<span
									className={`h-px grow ${isDark ? "bg-white/10" : "bg-on-surface-variant"}`}
								/>
							</div>
						</div>

						{interviewsLoading ? (
							<div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-6">
								{[1, 2, 3, 4, 5].map((i) => (
									<div
										key={i}
										className="aspect-9/16 bg-surface-container rounded-xl animate-pulse"
									/>
								))}
							</div>
						) : (
							<div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-6">
								{interviews.slice(0, interviewDisplayCount).map((interview) => (
									<a
										key={interview.id}
										href={interview.post_url}
										target="_blank"
										rel="noopener noreferrer"
										className="aspect-9/16 glass-panel relative group overflow-hidden rounded-xl cursor-pointer"
									>
										<Image
											src={`${process.env.NEXT_PUBLIC_API_URL}/storage/${interview.image}`}
											alt={interview.title || "Interview thumbnail"}
											fill
											sizes="(max-width: 768px) 50vw, (max-width: 1200px) 25vw, 20vw"
											style={{ objectFit: "cover" }}
											className="transition-transform duration-700 group-hover:scale-110 opacity-80"
										/>
										<div className="absolute inset-0 bg-linear-to-t from-black/80 via-transparent to-transparent" />

										<div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
											<div className="w-10 h-10 md:w-16 md:h-16 rounded-full bg-primary/80 flex items-center justify-center text-on-primary shadow-xl">
												<Play className="size-4 md:size-7" />
											</div>
										</div>

										<div className="absolute bottom-4 left-4 right-4">
											<h4 className="font-semibold text-sm leading-tight uppercase">
												{interview.title}
											</h4>
											<p className="text-xs text-primary mt-1 font-bold">
												@OlahBola
											</p>
										</div>
									</a>
								))}
							</div>
						)}

						<div className="mt-10 flex justify-center">
							<Link
								href="/interview"
								className={`inline-flex items-center gap-3 px-8 py-4 glass-panel ${isDark ? "text-primary" : "text-[#0a7c6e]"}  font-bold uppercase tracking-widest text-sm rounded-full hover:bg-primary/10 transition-all group`}
							>
								VIEW ALL{" "}
								<ArrowRight className="size-4 group-hover:translate-x-1 transition-transform" />
							</Link>
						</div>
					</div>
				</section>

				{/* Partner Logos Section - Brand Showcase */}
				<section
					ref={partnerRef}
					className={`py-20 border-y ${isDark ? "border-white/5 bg-[#141a17]" : "border-black/10 bg-[#e8e8e8]"}`}
				>
					<div className="max-w-480 mx-auto px-6 md:px-16" data-aos="fade-up">
						<div className="mb-12 flex flex-col md:flex-row justify-between items-start md:items-end">
							<p className="text-zinc-400 font-semibold text-xs uppercase tracking-[0.3em]">
								The Brands Who Kick with Us
							</p>
							<Link
								href="/kolaborasi"
								className={`${isDark ? "text-primary" : "text-[#0a7c6e]"} font-semibold flex items-center gap-2 hover:gap-4 transition-all uppercase tracking-widest text-xs mt-3 md:mt-0`}
							>
								VIEW ALL{" "}
								<ArrowRight
									className={`size-5 mt-1 ${isDark ? "text-primary" : "text-[#0a7c6e]"}`}
								/>
							</Link>
						</div>

						{partnerVisible && (
							<div className="relative overflow-hidden">
								<div className="flex gap-6 md:gap-8 animate-scroll-left">
									{[...brandLogos, ...brandLogos].map((logo, index) => (
										<div
											key={index}
											className="flex justify-center shrink-0 relative w-16 h-16 md:w-20 md:h-20 lg:w-24 lg:h-24"
										>
											<Image
												src={logo}
												alt="Partner Logo"
												fill
												sizes="96px"
												style={{ objectFit: "contain" }}
												className="hover:scale-110 transition-transform"
											/>
										</div>
									))}
								</div>
							</div>
						)}
					</div>
				</section>
			</main>
		</div>
	);
}
