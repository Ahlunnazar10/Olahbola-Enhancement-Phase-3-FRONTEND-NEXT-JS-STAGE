"use client";

import { useState, useEffect, useRef, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { Loader2, ChevronRight, ExternalLink } from "lucide-react";
import { useUIStore } from "@/stores/uiStore";
import { getAllHighlights } from "@/src/data/mediaHighlights";
import { useKolaborasis } from "@/hooks/queries/useContent";
import Link from "next/link";

/* ------------------------------------------------------------------ */
/*  Page background — matches the dark glassmorphism sample            */
/* ------------------------------------------------------------------ */
function PageBackground({ isDark }: { isDark: boolean }) {
	return (
		<>
			<div
				className="fixed inset-0 pointer-events-none transition-colors duration-300"
				style={{
					backgroundColor: isDark ? "#0f1412" : "#f5f5f5",
				}}
			/>
			<div
				className="fixed inset-0 pointer-events-none transition-colors duration-300"
				style={{
					backgroundImage: `radial-gradient(circle at 2px 2px, ${
						isDark ? "rgba(64, 220, 202, 0.05)" : "rgba(10, 124, 110, 0.04)"
					} 1px, transparent 0)`,
					backgroundSize: "40px 40px",
				}}
			/>
			<div className="fixed top-0 right-0 w-100 h-100 pointer-events-none">
				<div
					className="w-full h-full rounded-full blur-[120px]"
					style={{
						backgroundColor: isDark
							? "rgba(13, 100, 95, 0.2)"
							: "rgba(13, 100, 95, 0.1)",
					}}
				/>
			</div>
			<div className="fixed bottom-0 left-0 w-100 h-100 pointer-events-none">
				<div
					className="w-full h-full rounded-full blur-[120px]"
					style={{
						backgroundColor: isDark
							? "rgba(216, 83, 26, 0.1)"
							: "rgba(216, 83, 26, 0.05)",
					}}
				/>
			</div>
		</>
	);
}

/* ------------------------------------------------------------------ */
/*  Tab Switcher                                                       */
/* ------------------------------------------------------------------ */
function TabSwitcher({
	activeTab,
	onTabChange,
	isDark,
}: {
	activeTab: "media" | "kolaborasi";
	onTabChange: (tab: "media" | "kolaborasi") => void;
	isDark: boolean;
}) {
	const primary = isDark ? "#00c2b1" : "#0a7c6e";
	const text = isDark ? "rgba(255,255,255,0.7)" : "rgba(26,26,26,0.75)";

	const tabButton = (label: string, tabValue: "media" | "kolaborasi") => {
		const isActive = activeTab === tabValue;
		return (
			<button
				onClick={() => onTabChange(tabValue)}
				className="relative py-4 px-6 cursor-pointer font-bold uppercase tracking-[0.15em] transition-colors"
				style={{
					fontFamily: "var(--font-plus-jakarta), sans-serif",
					fontSize: "14px",
					color: isActive ? primary : text,
				}}
			>
				{label}
				{/* Underline active indicator */}
				<span
					className="absolute bottom-0 left-0 right-0 h-0.75 rounded-full transition-all duration-300"
					style={{
						background: isActive ? primary : "transparent",
					}}
				/>
			</button>
		);
	};

	return (
		<div
			className="flex justify-center"
			style={{
				borderColor: isDark ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.08)",
			}}
		>
			{tabButton("Media Spotlight", "media")}
			{tabButton("Our Network", "kolaborasi")}
		</div>
	);
}

/* ------------------------------------------------------------------ */
/*  Media Tab — follows the glassmorphism sample precisely             */
/* ------------------------------------------------------------------ */
function MediaContent() {
	const { theme } = useUIStore();
	const isDark = theme === "dark";
	const allHighlights = getAllHighlights();

	const primary = isDark ? "#00c2b1" : "#0a7c6e";
	const glassBg = isDark ? "rgba(10, 15, 13, 0.6)" : "rgba(255, 255, 255, 0.8)";
	const glassBorder = isDark
		? "rgba(255, 255, 255, 0.1)"
		: "rgba(0, 0, 0, 0.08)";
	const text = isDark ? "#ffffff" : "#1a1a1a";
	const textSecondary = isDark
		? "rgba(255,255,255,0.7)"
		: "rgba(26,26,26,0.75)";
	const textMuted = isDark ? "rgba(255,255,255,0.4)" : "rgba(26,26,26,0.5)";
	const outline = isDark ? "rgba(255,255,255,0.12)" : "rgba(0,0,0,0.12)";

	return (
		<div className="relative z-10">
			{/* Hero area */}
			<section className="relative flex flex-col items-center justify-center text-center px-6 md:px-8 lg:px-16 py-10 md:py-14">
				<div className="relative z-10 max-w-3xl">
					{/* Heading — two lines, matching sample */}
					<h1
						className="font-bold uppercase leading-none mb-6"
						style={{
							fontFamily: "var(--font-plus-jakarta), sans-serif",
							fontWeight: 700,
							fontSize: "clamp(28px, 5vw, 60px)",
							lineHeight: "1.1",
							color: text,
						}}
					>
						Mari Ceritakan <br />
						<span
							style={{
								color: primary,
								textShadow: `0 0 10px ${isDark ? "rgba(13,100,95,0.5)" : "rgba(10,124,110,0.3)"}`,
							}}
						>
							Sepak Bola
						</span>{" "}
						Bersama
					</h1>

					{/* Description */}
					<p
						className="mx-auto text-base md:text-lg"
						style={{
							fontFamily: "var(--font-plus-jakarta), sans-serif",
							fontWeight: 400,
							lineHeight: "1.6",
							color: textSecondary,
						}}
					>
						Kami terbuka untuk media coverage, press release, hingga kolaborasi
						kreatif bersama media, brand dan komunitas sepak bola.
					</p>
				</div>
			</section>

			{/* Media Grid Header */}
			<section className="px-6 md:px-8 lg:px-16 max-w-7xl mx-auto">
				<div
					className="flex justify-between items-end mb-6 pb-3 "
					style={{ borderBottom: `1px solid ${outline}` }}
				>
					<h3
						className="text-sm md:text-2xl font-bold tracking-[0.15em]"
						style={{
							fontFamily: "var(--font-plus-jakarta), sans-serif",
							fontWeight: 700,
							color: textSecondary,
						}}
					>
						SELURUH LIPUTAN MEDIA
					</h3>
					<span
						className="text-xs md:text-lg tracking-[0.05em]"
						style={{
							fontFamily: "var(--font-lexend), sans-serif",
							fontWeight: 600,
							letterSpacing: "0.05em",
							color: primary,
						}}
					>
						{allHighlights.length} TOTAL ARTICLES
					</span>
				</div>

				{/* Media Grid */}
				<div className="grid grid-cols-1 md:grid-cols-3 gap-6 pb-20">
					{allHighlights.map((article, index) => (
						<a
							key={index}
							href={article.url}
							target="_blank"
							rel="noopener noreferrer"
							className="media-card rounded-xl group flex flex-col h-full overflow-hidden relative"
							style={{
								background: glassBg,
								backdropFilter: "blur(20px)",
								border: `1px solid ${glassBorder}`,
								boxShadow: `inset 0 0 32px 1px ${
									isDark ? "rgba(67,222,204,0.05)" : "rgba(10,124,110,0.05)"
								}, 0 8px 32px ${isDark ? "rgba(0,0,0,0.8)" : "rgba(0,0,0,0.1)"}`,
							}}
						>
							{/* Card Image */}
							<div className="aspect-video relative overflow-hidden">
								<img
									className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
									src={
										article.image ||
										"https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQE3CETL_OertJKScoHfblxs6CBrKGVCmVESw&s"
									}
									alt={article.title}
								/>
								{/* Subtle gradient overlay on image */}
								<div
									className="absolute inset-0"
									style={{
										background: `linear-gradient(to top, ${
											isDark ? "rgba(10,15,13,0.5)" : "rgba(255,255,255,0.2)"
										}, transparent 50%)`,
									}}
								/>
							</div>

							{/* Card Content */}
							<div className="p-6 md:p-8 flex flex-col grow">
								<div className="flex items-center justify-between mb-4">
									<span
										className="text-[10px] font-bold tracking-widest uppercase"
										style={{
											fontFamily: "var(--font-plus-jakarta), sans-serif",
											fontWeight: 700,
											color: primary,
										}}
									>
										{article.source}
									</span>
									<span
										className="text-[10px]"
										style={{
											fontFamily: "var(--font-plus-jakarta), sans-serif",
											color: textMuted,
										}}
									>
										{article.date}
									</span>
								</div>

								<h4
									className="text-lg md:text-xl font-bold mb-4 leading-tight"
									style={{
										fontFamily: "var(--font-plus-jakarta), sans-serif",
										fontWeight: 700,
										color: text,
									}}
								>
									{article.title}
								</h4>

								<p
									className="line-clamp-3 mb-6 grow"
									style={{
										fontFamily: "var(--font-plus-jakarta), sans-serif",
										fontWeight: 400,
										fontSize: "14px",
										lineHeight: "1.6",
										color: textSecondary,
									}}
								>
									{article.excerpt}
								</p>

								<div
									className="inline-flex items-center gap-2"
									style={{
										fontFamily: "var(--font-lexend), sans-serif",
										fontWeight: 600,
										fontSize: "14px",
										letterSpacing: "0.05em",
										color: primary,
									}}
								>
									<ExternalLink className="size-3.5" />
									Kunjungi
								</div>
							</div>
						</a>
					))}
				</div>
			</section>

			{/* CSS animations */}
			<style jsx global>{`
				@keyframes ms-pulse {
					0%,
					100% {
						opacity: 1;
						box-shadow: 0 0 0 0
							${isDark ? "rgba(0,194,177,0.4)" : "rgba(10,124,110,0.4)"};
					}
					50% {
						opacity: 0.5;
						box-shadow: 0 0 0 6px transparent;
					}
				}
				.media-card:hover {
					border-color: ${isDark
						? "rgba(0,194,177,0.4)"
						: "rgba(10,124,110,0.4)"};
					box-shadow:
						inset 0 0 32px 1px
							${isDark ? "rgba(67,222,204,0.08)" : "rgba(10,124,110,0.08)"},
						0 8px 32px ${isDark ? "rgba(0,0,0,0.8)" : "rgba(0,0,0,0.1)"};
				}
			`}</style>
		</div>
	);
}

/* ------------------------------------------------------------------ */
/*  Kolaborasi Tab — partner grid + pagination                         */
/* ------------------------------------------------------------------ */
function KolaborasiTab() {
	const { theme } = useUIStore();
	const isDark = theme === "dark";

	const [page, setPage] = useState(1);
	const [displayedKolaborasis, setDisplayedKolaborasis] = useState<any[]>([]);
	const [isLoadingMore, setIsLoadingMore] = useState(false);
	const [hasMore, setHasMore] = useState(false);
	const [isInitialized, setIsInitialized] = useState(false);
	const dataSectionRef = useRef<HTMLDivElement>(null);

	const { data, isLoading, isFetching } = useKolaborasis(page, 10);
	const kolaborasis = data?.data || [];
	const totalPages = data?.metadata?.total_pages || 1;

	useEffect(() => {
		if (isInitialized) return;
		if (kolaborasis.length > 0) {
			setDisplayedKolaborasis(kolaborasis);
			setHasMore(page < totalPages);
			setIsInitialized(true);
		}
	}, [kolaborasis, page, totalPages, isInitialized]);

	useEffect(() => {
		if (!isInitialized) return;
		if (page === 1) return;
		if (kolaborasis.length > 0) {
			setDisplayedKolaborasis((prev) => {
				const existingIds = new Set(prev.map((item: any) => item.id));
				const uniqueNew = kolaborasis.filter(
					(item: any) => !existingIds.has(item.id),
				);
				if (uniqueNew.length === 0) return prev;
				return [...prev, ...uniqueNew];
			});
		}
	}, [kolaborasis, page, isInitialized]);

	useEffect(() => {
		setHasMore(page < totalPages);
	}, [page, totalPages]);

	const handleNextPage = () => {
		if (!hasMore || isLoadingMore) return;
		setIsLoadingMore(true);
		setPage((p) => p + 1);
	};

	useEffect(() => {
		if (!isLoadingMore) return;
		const timer = setTimeout(() => {
			if (dataSectionRef.current) {
				dataSectionRef.current.scrollIntoView({
					behavior: "smooth",
					block: "start",
				});
			}
		}, 300);
		return () => clearTimeout(timer);
	}, [isLoadingMore]);

	useEffect(() => {
		if (!isFetching && isLoadingMore) {
			setIsLoadingMore(false);
		}
	}, [isFetching, isLoadingMore]);

	const primary = isDark ? "#00c2b1" : "#0a7c6e";
	const glassBg = isDark ? "rgba(10, 15, 13, 0.6)" : "rgba(255, 255, 255, 0.8)";
	const glassBorder = isDark
		? "rgba(255, 255, 255, 0.1)"
		: "rgba(0, 0, 0, 0.08)";
	const text = isDark ? "#ffffff" : "#1a1a1a";
	const textSecondary = isDark
		? "rgba(255,255,255,0.6)"
		: "rgba(26,26,26,0.75)";
	const textMuted = isDark ? "rgba(255,255,255,0.4)" : "rgba(26,26,26,0.5)";

	return (
		<div className="relative z-10 px-6 md:px-8 lg:px-16 pb-20 pt-14 max-w-7xl mx-auto">
			{/* Hero text */}
			<div className="text-center md:text-left flex flex-col md:flex-row items-center gap-12 mb-16">
				<div className="flex-1 space-y-6">
					<h1
						className="text-3xl md:text-5xl lg:text-6xl font-bold uppercase leading-none"
						style={{
							fontFamily: "var(--font-plus-jakarta), sans-serif",
							fontWeight: 700,
							color: text,
						}}
					>
						They Scored Big with{" "}
						<span
							style={{
								color: primary,
								textShadow: `0 0 10px ${isDark ? "rgba(13,100,95,0.5)" : "rgba(10,124,110,0.3)"}`,
							}}
						>
							OlahBola
						</span>
					</h1>
					<p
						className="text-base md:text-lg max-w-xl"
						style={{
							fontFamily: "var(--font-plus-jakarta), sans-serif",
							fontWeight: 400,
							color: textSecondary,
						}}
					>
						Di balik tiap logo, ada cerita kolaborasi yang bikin sepak bola
						makin seru. Klik dan temukan kisahnya!
					</p>
				</div>
				<div className="flex-1 w-full max-w-md">
					<div
						className="p-8 rounded-3xl relative overflow-hidden"
						style={{
							background: glassBg,
							backdropFilter: "blur(20px)",
							border: `1px solid ${glassBorder}`,
							boxShadow: `inset 0 0 32px 1px ${
								isDark ? "rgba(67,222,204,0.05)" : "rgba(10,124,110,0.05)"
							}, 0 8px 32px ${isDark ? "rgba(0,0,0,0.8)" : "rgba(0,0,0,0.1)"}`,
						}}
					>
						<div
							className="absolute -top-24 -right-24 w-64 h-64 rounded-full blur-[80px]"
							style={{
								backgroundColor: isDark
									? "rgba(13,100,95,0.2)"
									: "rgba(13,100,95,0.1)",
							}}
						/>
						<div className="relative z-10 space-y-2">
							<div
								className="font-bold text-3xl"
								style={{
									fontFamily: "var(--font-plus-jakarta), sans-serif",
									fontWeight: 700,
									color: primary,
								}}
							>
								30+
							</div>
							<div
								className="font-bold uppercase tracking-widest text-sm"
								style={{
									fontFamily: "var(--font-plus-jakarta), sans-serif",
									fontWeight: 700,
									color: textMuted,
								}}
							>
								Brand Partners
							</div>
							<p
								className="text-xs italic"
								style={{
									fontFamily: "var(--font-plus-jakarta), sans-serif",
									fontWeight: 400,
									color: textMuted,
								}}
							>
								Brand-brand terkemuka telah bergabung. Sekarang giliran Kamu!
							</p>
						</div>
					</div>
				</div>
			</div>

			{/* Partner Grid */}
			{isLoading && displayedKolaborasis.length === 0 ? (
				<div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6 mb-16">
					{[...Array(10)].map((_, i) => (
						<div
							key={i}
							className="animate-pulse rounded-2xl flex items-center justify-center h-40"
							style={{
								background: glassBg,
								backdropFilter: "blur(20px)",
								border: `1px solid ${glassBorder}`,
							}}
						>
							<div
								className="w-20 h-20 rounded-xl"
								style={{
									background: isDark
										? "rgba(255,255,255,0.1)"
										: "rgba(0,0,0,0.1)",
								}}
							/>
						</div>
					))}
				</div>
			) : displayedKolaborasis.length === 0 ? (
				<div
					className="text-center py-20"
					style={{
						color: textMuted,
						fontFamily: "var(--font-plus-jakarta), sans-serif",
					}}
				>
					<p>Belum ada kolaborasi</p>
				</div>
			) : (
				<>
					<div
						ref={dataSectionRef}
						className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6 mb-16"
					>
						{displayedKolaborasis.map((kolaborasi: any) => (
							<Link
								key={kolaborasi.id}
								href={`/media-spotlight/kolaborasi/${kolaborasi.slug}`}
								className="partner-card group p-8 rounded-2xl flex items-center justify-center h-40 transition-all duration-300 cursor-pointer"
							>
								<div className="text-center">
									<img
										src={`${process.env.NEXT_PUBLIC_API_URL}/storage/${kolaborasi.sponsor_image}`}
										alt={kolaborasi.slug || "Partner"}
										className="w-full h-16 object-contain transition-all duration-300 group-hover:scale-125"
									/>
								</div>
							</Link>
						))}
					</div>

					{hasMore && (
						<div className="flex justify-center py-4">
							<button
								onClick={handleNextPage}
								disabled={isLoadingMore}
								className="px-12 py-4 border-2 font-semibold uppercase tracking-widest transition-all duration-300 rounded-sm flex items-center gap-2 cursor-pointer"
								style={{
									backgroundColor: "transparent",
									borderColor: primary,
									color: primary,
									fontFamily: "var(--font-plus-jakarta), sans-serif",
									fontWeight: 700,
								}}
							>
								{isLoadingMore ? (
									<>
										<Loader2 className="size-5 animate-spin" />
										Memuat...
									</>
								) : (
									<>
										Selanjutnya
										<ChevronRight className="size-5" />
									</>
								)}
							</button>
						</div>
					)}

					{!hasMore && displayedKolaborasis.length > 0 && (
						<div
							className="text-center py-8"
							style={{
								color: textMuted,
								fontFamily: "var(--font-plus-jakarta), sans-serif",
							}}
						>
							<p>Anda telah melihat semua partner</p>
						</div>
					)}
				</>
			)}

			{/* CTA */}
			<div
				className="p-12 rounded-4xl text-center relative overflow-hidden mt-16"
				style={{
					background: glassBg,
					backdropFilter: "blur(20px)",
					border: `1px solid ${isDark ? "rgba(13,100,95,0.2)" : "rgba(10,124,110,0.2)"}`,
					boxShadow: `inset 0 0 32px 1px ${
						isDark ? "rgba(67,222,204,0.05)" : "rgba(10,124,110,0.05)"
					}, 0 8px 32px ${isDark ? "rgba(0,0,0,0.8)" : "rgba(0,0,0,0.1)"}`,
				}}
			>
				<div
					className="absolute inset-0"
					style={{
						background: isDark
							? "linear-gradient(to top right, rgba(13,100,95,0.1), transparent)"
							: "linear-gradient(to top right, rgba(10,124,110,0.1), transparent)",
					}}
				/>
				<div className="relative z-10 space-y-8">
					<h2
						className="text-3xl md:text-4xl font-bold uppercase italic"
						style={{
							fontFamily: "var(--font-plus-jakarta), sans-serif",
							fontWeight: 700,
							color: text,
						}}
					>
						Jadi Bagian dari Kami?
					</h2>
					<p
						className="text-sm md:text-lg max-w-xl mx-auto"
						style={{
							fontFamily: "var(--font-plus-jakarta), sans-serif",
							fontWeight: 400,
							color: textSecondary,
						}}
					>
						Bergabung dengan kami! Jangkau jutaan fans, creators, dan penggemar
						bola di seluruh dunia.
					</p>
					<div className="flex justify-center">
						<Link
							href="/sapa"
							className="px-12 py-5 rounded-full font-bold text-xs md:text-lg uppercase tracking-[0.2em] transition-all hover:scale-105"
							style={{
								backgroundColor: isDark ? "#0D645F" : "#0a7c6e",
								color: "#ffffff",
								fontFamily: "var(--font-plus-jakarta), sans-serif",
								fontWeight: 700,
								boxShadow: isDark
									? "0 0 30px rgba(13,100,95,0.5)"
									: "0 0 30px rgba(10,124,110,0.4)",
							}}
						>
							HUBUNGI KAMI
						</Link>
					</div>
				</div>
			</div>

			{/* Partner card styles */}
			<style jsx global>{`
				.partner-card {
					background: ${glassBg};
					backdrop-filter: blur(20px);
					border: 1px solid ${glassBorder};
					box-shadow:
						inset 0 0 32px 1px
							${isDark ? "rgba(67,222,204,0.05)" : "rgba(10,124,110,0.05)"},
						0 8px 32px ${isDark ? "rgba(0,0,0,0.8)" : "rgba(0,0,0,0.1)"};
				}
				.partner-card:hover {
					border-color: ${isDark
						? "rgba(13,100,95,0.4)"
						: "rgba(10,124,110,0.4)"};
					box-shadow: 0 0 30px
						${isDark ? "rgba(13,100,95,0.3)" : "rgba(10,124,110,0.3)"};
				}
			`}</style>
		</div>
	);
}

/* ------------------------------------------------------------------ */
/*  Main Page — wrapper + tab switcher                                 */
/* ------------------------------------------------------------------ */
function MediaSpotlightContent() {
	const { theme } = useUIStore();
	const isDark = theme === "dark";
	const searchParams = useSearchParams();
	const router = useRouter();
	const activeTab =
		searchParams.get("tab") === "kolaborasi"
			? ("kolaborasi" as const)
			: ("media" as const);

	const handleTabChange = (tab: "media" | "kolaborasi") => {
		if (tab === "media") {
			router.replace("/media-spotlight");
		} else {
			router.replace("/media-spotlight?tab=kolaborasi");
		}
	};

	return (
		<div
			className="relative min-h-screen transition-colors duration-300"
			style={{
				backgroundColor: isDark ? "#0f1412" : "#f5f5f5",
			}}
		>
			<PageBackground isDark={isDark} />

			{/* Tab Switcher — di atas content */}
			<div className="relative z-20 mt-4">
				<TabSwitcher
					activeTab={activeTab}
					onTabChange={handleTabChange}
					isDark={isDark}
				/>
			</div>

			{/* Content */}
			{activeTab === "media" ? <MediaContent /> : <KolaborasiTab />}
		</div>
	);
}

export default function MediaSpotlightPage() {
	return (
		<Suspense
			fallback={
				<div
					className="min-h-screen flex items-center justify-center"
					style={{ backgroundColor: "#0f1412" }}
				>
					<Loader2 className="size-10 animate-spin text-[#0D645F]" />
				</div>
			}
		>
			<MediaSpotlightContent />
		</Suspense>
	);
}
