"use client";

import { useEffect, useRef, useCallback, useMemo } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { formatDate } from "@/lib/utils";
import { PopularArticleCardSkeleton } from "@/components/article/PopularArticleCard";
import { RecentScoresSidebar } from "@/components/sidebar/RecentScores";
import {
	useArticleDetail,
	usePopularArticles,
	useRelatedArticles,
	useOtherCategories,
	useEntitySearch,
} from "@/hooks/queries/useArticles";
import type { RelatedArticleItem } from "@/hooks/queries/useArticles";
import { getRelatedArticles, extractEntities } from "@/lib/related";
import { useUIStore } from "@/stores/uiStore";
import ThemeToggle from "@/components/theme-toggle/ThemeToggle";
import { trackArticleView } from "@/lib/analytics";
import { notFound } from "next/navigation";
import {
	ArrowLeft,
	Calendar,
	Eye,
	User,
	Share2,
	Link2,
	Clock,
	TrendingUp,
	Zap,
} from "lucide-react";

export default function ArticleDetailPage() {
	const params = useParams();
	const slug = params.slug as string;
	const { theme } = useUIStore();
	const isDark = theme === "dark";
	const { data: article, isLoading, error } = useArticleDetail(slug);
	const { data: popularData, isLoading: popularLoading } = usePopularArticles();
	const contentRef = useRef<HTMLDivElement>(null);

	useEffect(() => {
		if (!article?.data) return;
		const d = article.data;
		trackArticleView(d.id?.toString() || slug, d.title || "", d.category_name || "");
	}, [article?.data, slug]);

	// Get related articles based on same category
	const categorySlug = article?.data?.category_slug;
	const { data: relatedData } = useRelatedArticles(categorySlug || "", slug, 4);

	// Entity-based search: extract top entity terms from the current article
	// title + content, then search API for articles matching those entities
	// to build a broader relevance pool beyond the same-category fallback.
	const entityProfile = useMemo(() => {
		if (!article?.data?.title) return null;
		const plainContent = (article.data.content || "").replace(/<[^>]*>/g, " ");
		return extractEntities(article.data.title, plainContent);
	}, [article?.data?.title, article?.data?.content]);

	// Pick the top 4 highest-weight terms for parallel search
	const entityTerms = useMemo(() => {
		if (!entityProfile) return [];
		return Array.from(entityProfile.terms.entries())
			.sort((a, b) => b[1] - a[1])
			.slice(0, 4)
			.map(([term]) => term);
	}, [entityProfile]);

	const { articles: entityArticles } = useEntitySearch(entityTerms);

	// Other categories (excluding current)
	const { groups: otherCatGroups, isLoading: otherCatsLoading } =
		useOtherCategories(categorySlug || "");

	// Build combined pool: same-category articles + entity-search articles.
	// MUST be called before any early return (Rules of Hooks).
	const combinedPool: RelatedArticleItem[] = useMemo(() => {
		const catArticles: RelatedArticleItem[] = (relatedData?.data || []).map(
			(a: any) => ({
				id: a.id,
				title: a.title,
				slug: a.slug,
				image: a.image,
				created_diff: a.created_diff,
				category_slug: a.category_slug,
			}),
		);
		const seen = new Set(catArticles.map((a) => a.slug));
		const uniqueEntity = entityArticles.filter((a) => !seen.has(a.slug));
		return [...catArticles, ...uniqueEntity];
	}, [relatedData?.data, entityArticles]);

	const relatedArticles = useMemo(
		() =>
			article?.data
				? getRelatedArticles(
						combinedPool,
						article.data.title || "",
						article.data.content || "",
						slug,
						article.data.category_slug,
						4,
					)
				: [],
		[
			combinedPool,
			article?.data?.title,
			article?.data?.content,
			article?.data?.category_slug,
			slug,
		],
	);

	// ============================================================
	// ULTIMATE FIX: Social Media Embeds – 100% works on reload
	// ============================================================
	useEffect(() => {
		if (!article?.data?.content || !contentRef.current) return;

		const container = contentRef.current;

		// ============================================================
		// DEDUPLICATE: Remove duplicate Instagram/Twitter/Facebook embeds
		// keeping only the first occurrence of each unique permalink/src
		// ============================================================
		const dedupeEmbeds = () => {
			// Helper: extract unique key from an embed container.
			// For Instagram blocks, prefer data-instgrm-permalink,
			// then fall back to the <a> href or <iframe> src.
			const getIgKey = (el: HTMLElement): string => {
				const bq = el.querySelector<HTMLElement>("blockquote.instagram-media");
				if (bq) {
					return (
						bq.dataset.instgrmPermalink ||
						bq.querySelector<HTMLAnchorElement>("a")?.href ||
						bq.querySelector<HTMLIFrameElement>("iframe")?.src ||
						""
					);
				}
				// Fallback: check the container itself
				return (
					el.dataset.instgrmPermalink ||
					el.querySelector<HTMLAnchorElement>("a")?.href ||
					el.querySelector<HTMLIFrameElement>("iframe")?.src ||
					""
				);
			};

			const getSrcKey = (el: HTMLElement): string => {
				return el.querySelector<HTMLIFrameElement>("iframe")?.src || "";
			};

			const getFbKey = (el: HTMLElement): string => {
				return (
					el.dataset.href ||
					el.querySelector<HTMLIFrameElement>("iframe")?.src ||
					""
				);
			};

			// Instagram: select TOP-LEVEL wrappers only (.social-embed.instagram-embed)
			const igWrappers = container.querySelectorAll<HTMLElement>(
				".social-embed.instagram-embed",
			);
			const seenIg = new Set<string>();
			igWrappers.forEach((wrapper) => {
				const key = getIgKey(wrapper);
				if (key && seenIg.has(key)) {
					wrapper.style.display = "none";
				} else if (key) {
					seenIg.add(key);
				}
			});

			// Twitter: select top-level containers
			const twitterWrappers = container.querySelectorAll<HTMLElement>(
				".social-embed.twitter-embed, .twitter-tweet",
			);
			const seenTw = new Set<string>();
			twitterWrappers.forEach((wrapper) => {
				const key = getSrcKey(wrapper);
				if (key && seenTw.has(key)) {
					wrapper.style.display = "none";
				} else if (key) {
					seenTw.add(key);
				}
			});

			// Facebook: select top-level containers
			const fbWrappers = container.querySelectorAll<HTMLElement>(
				".social-embed.facebook-embed, .facebook-embed-wrapper, .fb-post, .fb-video, .fb-page",
			);
			const seenFb = new Set<string>();
			fbWrappers.forEach((wrapper) => {
				const key = getFbKey(wrapper);
				if (key && seenFb.has(key)) {
					wrapper.style.display = "none";
				} else if (key) {
					seenFb.add(key);
				}
			});
		};

		dedupeEmbeds();

		// Force remove any existing Instagram script to ensure fresh load
		const existingScripts = document.querySelectorAll(
			'script[src*="instagram.com/embed.js"]',
		);
		existingScripts.forEach((script) => script.remove());

		// Function to process Instagram embeds
		const processInstagram = () => {
			const blocks = container.querySelectorAll(
				"blockquote.instagram-media, .instagram-embed",
			);
			if (blocks.length === 0) return;

			// If instgrm is available, process directly
			if (window.instgrm && window.instgrm.Embeds) {
				window.instgrm.Embeds.process();
				return;
			}

			// If not available, load script and process
			const script = document.createElement("script");
			script.src = "https://www.instagram.com/embed.js";
			script.async = true;
			script.onload = () => {
				// ✅ FIX: tambahkan optional chaining dan pengecekan
				if (window.instgrm?.Embeds) {
					window.instgrm.Embeds.process();
				}
			};
			script.onerror = () =>
				console.warn("[Embed] Instagram SDK failed to load");
			document.head.appendChild(script);
		};

		// Process Instagram immediately
		processInstagram();

		// Also process after a short delay to catch any late rendering
		const timeout1 = setTimeout(processInstagram, 500);
		const timeout2 = setTimeout(processInstagram, 1500);
		const timeout3 = setTimeout(processInstagram, 3000);

		// Use MutationObserver to catch any new embed elements added later
		const observer = new MutationObserver(() => {
			processInstagram();
		});
		observer.observe(container, { childList: true, subtree: true });

		return () => {
			clearTimeout(timeout1);
			clearTimeout(timeout2);
			clearTimeout(timeout3);
			observer.disconnect();
		};
	}, [article?.data?.content]);

	const handleShare = async () => {
		const shareData = {
			title: article?.data?.title || "Article",
			text: article?.data?.excerpt || "",
			url: window.location.href,
		};

		if (navigator.share) {
			try {
				await navigator.share(shareData);
			} catch (err) {
				console.log("Share cancelled");
			}
		} else {
			await navigator.clipboard.writeText(window.location.href);
			alert("Link copied to clipboard!");
		}
	};

	if (isLoading) {
		return (
			<div
				className={`min-h-screen flex items-center justify-center transition-colors duration-300 ${isDark ? "bg-[#0f1412]" : "bg-[#f5f5f5]"}`}
			>
				<div
					className={`w-10 h-10 rounded-full border-2 animate-spin ${isDark ? "border-primary/30 border-t-primary" : "border-[#0a7c6e]/30 border-t-[#0a7c6e]"}`}
				/>
			</div>
		);
	}

	if (error || !article?.data) {
		notFound();
		return null;
	}

	const articleData = article.data;
	const fullImageUrl = articleData.image
		? `${process.env.NEXT_PUBLIC_API_URL}/storage/${articleData.image}`
		: "/placeholder.png";

	// Define color variables based on theme
	const colors = isDark
		? {
				contentBg: "#1c211e",
				contentText: "#dfe4e0",
				contentTextSecondary: "#dfe4e0cc",
				primary: "#00c2b1",
				primaryLight: "#43decc",
				headingColor: "#00c2b1",
				linkColor: "#43decc",
				shadowColor: "rgba(0, 0, 0, 0.4)",
				borderColor: "rgba(255, 255, 255, 0.08)",
				tableHeaderBg: "linear-gradient(135deg, #00c2b1, #43decc)",
				tableHeaderText: "#003732",
				listBullet: "#00c2b1",
				codeBg: "rgba(0, 194, 177, 0.1)",
				codeBorder: "rgba(0, 194, 177, 0.2)",
				codeText: "#43decc",
				preBg: "#0a0f0d",
				hrColor: "rgba(0, 194, 177, 0.4)",
				overlay: "from-[#0f1412] to-transparent",
				cardBg: "rgba(255, 255, 255, 0.05)",
				cardBorder: "rgba(255, 255, 255, 0.1)",
			}
		: {
				contentBg: "#ffffff",
				contentText: "#1a1a1a",
				contentTextSecondary: "#5a5a5a",
				primary: "#0a7c6e",
				primaryLight: "#43decc",
				headingColor: "#0a7c6e",
				linkColor: "#0a7c6e",
				shadowColor: "rgba(0, 0, 0, 0.1)",
				borderColor: "rgba(0, 0, 0, 0.08)",
				tableHeaderBg: "linear-gradient(135deg, #0a7c6e, #43decc)",
				tableHeaderText: "#ffffff",
				listBullet: "#0a7c6e",
				codeBg: "rgba(10, 124, 110, 0.1)",
				codeBorder: "rgba(10, 124, 110, 0.2)",
				codeText: "#0a7c6e",
				preBg: "#f5f5f5",
				hrColor: "rgba(10, 124, 110, 0.4)",
				overlay: "from-[#f5f5f5] to-transparent",
				cardBg: "rgba(255, 255, 255, 0.9)",
				cardBorder: "rgba(0, 0, 0, 0.08)",
			};

	return (
		<div
			className={`min-h-screen relative transition-colors duration-300 ${isDark ? "bg-[#0f1412] text-white" : "bg-[#f5f5f5] text-[#1a1a1a]"}`}
		>
			{/* Theme Toggle */}
			<ThemeToggle />

			{/* Hero Banner - Image Only */}
			<section className={`relative w-full h-[55vh] overflow-hidden`}>
				<div
					className={`absolute inset-0 bg-cover bg-top ${isDark ? "grayscale-[0.2] brightness-75" : "grayscale-[0.1] brightness-90"}`}
					style={{ backgroundImage: `url(${fullImageUrl})` }}
				/>

				{/* Back Button */}
				<div className="absolute top-24 left-4 md:left-8 z-30">
					<Link
						href="/artikel"
						className={`flex items-center gap-2 px-4 py-2 backdrop-blur-sm rounded-lg transition-all text-sm font-bold uppercase tracking-widest ${isDark ? "bg-black/40 hover:bg-black/60 text-white/80 hover:text-white" : "bg-white/40 hover:bg-white/60 text-[#1a1a1a]/80 hover:text-[#1a1a1a]"}`}
					>
						<ArrowLeft className="size-4" />
						<span>Back</span>
					</Link>
				</div>

				{/* Decorative gradient overlay at bottom */}
				<div
					className={`absolute bottom-0 left-0 right-0 h-32 z-10 bg-linear-to-t ${colors.overlay}`}
				/>
			</section>

			{/* Content Layer */}
			<section
				className={`relative z-30 -mt-1 px-3 md:px-12 pb-24 max-w-screen-2xl mx-auto`}
			>
				<div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
					{/* Main Article Body */}
					<article className="lg:col-span-8">
						{/* Glass Article Header */}
						<div
							className={`p-8 md:p-10 rounded-xl mb-8 transition-all duration-300 ${isDark ? "glass-panel shadow-2xl" : "bg-white shadow-lg border border-gray-200"}`}
						>
							{/* Category Badge */}
							{articleData.category_name && (
								<Link
									href={`/artikel?kategori=${articleData.category_slug}`}
									className={`inline-flex items-center gap-2 px-4 py-1.5 font-bold text-xs rounded-full mb-6 uppercase tracking-widest hover:opacity-90 transition-opacity ${isDark ? "bg-[#E63946] text-white" : "bg-[#d32f3e] text-white"}`}
								>
									<span
										className={`w-2 h-2 rounded-full animate-pulse ${isDark ? "bg-white" : "bg-white"}`}
									/>
									{articleData.category_name}
								</Link>
							)}

							{/* Title */}
							<h1
								className={`text-2xl md:text-5xl font-black italic uppercase mb-6 leading-tight tracking-tight ${isDark ? "text-white" : "text-[#1a1a1a]"}`}
							>
								{articleData.title}
							</h1>

							{/* Meta Info */}
							<div
								className={`flex flex-wrap items-center gap-6 font-bold text-sm uppercase tracking-widest pb-6 border-b ${isDark ? "text-white/50 border-white/10" : "text-[#5a5a5a] border-gray-200"}`}
							>
								<span className="flex items-center gap-2">
									<Calendar
										className={`size-5 ${isDark ? "text-primary" : "text-[#0a7c6e]"}`}
									/>
									{articleData.published_at
										? formatDate(articleData.published_at)
										: articleData.created_diff}
								</span>
								<span className="flex items-center gap-2">
									<Eye
										className={`size-5 ${isDark ? "text-primary" : "text-[#0a7c6e]"}`}
									/>
									{articleData.views} Dibaca
								</span>
								<span className="flex items-center gap-2">
									<User
										className={`size-5 ${isDark ? "text-primary" : "text-[#0a7c6e]"}`}
									/>
									{articleData.author_name}
								</span>
							</div>

							{/* Share buttons inline with meta */}
							<div className="flex items-center gap-3 mt-4">
								<span
									className={`font-bold text-xs uppercase tracking-widest mr-2 ${isDark ? "text-white/30" : "text-gray-400"}`}
								>
									Share:
								</span>
								<button
									onClick={handleShare}
									className={`w-9 h-9 rounded-full flex items-center justify-center transition-all ${isDark ? "border border-white/10 hover:bg-primary hover:text-on-primary hover:border-primary" : "border border-gray-200 hover:bg-[#0a7c6e] hover:text-white hover:border-[#0a7c6e]"}`}
									title="Share"
								>
									<Share2 className="size-4" />
								</button>
								<button
									onClick={() => {
										navigator.clipboard.writeText(window.location.href);
										alert("Link copied!");
									}}
									className={`w-9 h-9 rounded-full flex items-center justify-center transition-all ${isDark ? "border border-white/10 hover:bg-primary hover:text-on-primary hover:border-primary" : "border border-gray-200 hover:bg-[#0a7c6e] hover:text-white hover:border-[#0a7c6e]"}`}
									title="Copy Link"
								>
									<Link2 className="size-4" />
								</button>
							</div>
						</div>

						{/* Article Content */}
						<div
							ref={contentRef}
							className={`article-content p-8 md:p-10 rounded-xl shadow-2xl ${isDark ? "glass-panel" : "bg-white shadow-lg border border-gray-200"}`}
							dangerouslySetInnerHTML={{
								__html: articleData.content,
							}}
						/>

						{/* Other Categories */}
						{(otherCatsLoading ||
							otherCatGroups.some((g) => g.articles.length > 0)) && (
							<div className="mt-12">
								<h2
									className={`text-2xl md:text-3xl font-black italic uppercase mb-8 tracking-tighter flex items-center gap-3 ${isDark ? "text-white" : "text-[#1a1a1a]"}`}
								>
									Kategori
									<span className={isDark ? "text-primary" : "text-[#0a7c6e]"}>
										Lain
									</span>
								</h2>
								<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
									{otherCatGroups.map(
										(group) =>
											group.category &&
											group.articles.length > 0 && (
												<div
													key={group.category.slug}
													className={`rounded-xl overflow-hidden ${isDark ? "glass-panel" : "bg-white shadow-lg border border-gray-200"}`}
												>
													<Link
														href={`/artikel?kategori=${group.category.slug}`}
														className={`flex items-center justify-between px-5 py-3 border-b text-xs font-black uppercase tracking-widest ${isDark ? "border-white/10 text-primary" : "border-gray-200 text-[#0a7c6e]"}`}
													>
														<span>{group.category.name}</span>
														<span
															className={
																isDark ? "text-white/40" : "text-[#5a5a5a]"
															}
														>
															Lihat Semua
														</span>
													</Link>
													{group.articles.slice(0, 3).map((item: any) => (
														<Link
															key={item.id}
															href={`/${item.slug}`}
															className="group flex gap-3 p-4 transition-colors"
														>
															<img
																src={`${process.env.NEXT_PUBLIC_API_URL}/storage/${item.image}`}
																alt={item.title}
																className="w-16 h-16 rounded-lg object-cover shrink-0"
															/>
															<div className="min-w-0">
																<h4
																	className={`text-sm font-bold line-clamp-2 leading-snug group-hover:${isDark ? "text-primary" : "text-[#0a7c6e]"} transition-colors ${isDark ? "text-white" : "text-[#1a1a1a]"}`}
																>
																	{item.title}
																</h4>
																<p
																	className={`text-xs mt-1 uppercase tracking-widest font-bold ${isDark ? "text-white/40" : "text-[#5a5a5a]"}`}
																>
																	{item.created_diff}
																</p>
															</div>
														</Link>
													))}
												</div>
											),
									)}
								</div>
							</div>
						)}

						{/* Follow Olahbola */}
						<div className="mt-12">
							<div
								className={`p-8 rounded-xl ${isDark ? "glass-panel" : "bg-white shadow-lg border border-gray-200"}`}
							>
								<h2
									className={`text-lg md:text-xl font-black italic uppercase mb-4 flex items-center gap-2 ${isDark ? "text-primary" : "text-[#1a1a1a]"}`}
								>
									Follow
								</h2>
								<p
									className={`text-sm mb-6 ${isDark ? "text-white/60" : "text-[#5a5a5a]"}`}
								>
									Gabung komunitas Olahbola. Dapatkan konten eksklusif seputar
									berita bola terbaru, dan informasi lainnya.
								</p>
								<div className="flex flex-wrap gap-3">
									<a
										href="https://www.tiktok.com/@olahbolacom"
										target="_blank"
										rel="noopener noreferrer"
										className="flex items-center gap-2 px-4 py-2.5 rounded-lg text-xs font-black uppercase tracking-widest transition-all bg-[#010101] text-white hover:bg-[#333]"
									>
										<svg
											className="size-4"
											viewBox="0 0 24 24"
											fill="currentColor"
										>
											<path d="M19.59 6.69a4.83 4.83 0 01-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 01-5.2 1.74 2.89 2.89 0 012.31-4.64 2.93 2.93 0 01.88.13V9.4a6.84 6.84 0 00-1-.05A6.33 6.33 0 005 20.1a6.34 6.34 0 0010.86-4.43v-7a8.16 8.16 0 004.77 1.52v-3.4a4.85 4.85 0 01-1-.1z" />
										</svg>
										TikTok
									</a>
									<a
										href="https://www.instagram.com/olahbolacom"
										target="_blank"
										rel="noopener noreferrer"
										className="flex items-center gap-2 px-4 py-2.5 rounded-lg text-xs font-black uppercase tracking-widest transition-all bg-linear-to-r from-[#833ab4] via-[#fd1e14] to-[#fcb045] text-white hover:opacity-80"
									>
										<svg
											className="size-4"
											viewBox="0 0 24 24"
											fill="currentColor"
										>
											<path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4z" />
										</svg>
										Instagram
									</a>
									<a
										href="https://www.youtube.com/@olahbolacom"
										target="_blank"
										rel="noopener noreferrer"
										className="flex items-center gap-2 px-4 py-2.5 rounded-lg text-xs font-black uppercase tracking-widest transition-all bg-[#ff0000] text-white hover:bg-[#cc0000]"
									>
										<svg
											className="size-4"
											viewBox="0 0 24 24"
											fill="currentColor"
										>
											<path d="M23.498 6.186a3.016 3.016 0 00-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 00.502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 002.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 002.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
										</svg>
										YouTube
									</a>
									<a
										href="https://www.facebook.com/olahbolacom"
										target="_blank"
										rel="noopener noreferrer"
										className="flex items-center gap-2 px-4 py-2.5 rounded-lg text-xs font-black uppercase tracking-widest transition-all bg-[#1877f2] text-white hover:bg-[#1565c0]"
									>
										<svg
											className="size-4"
											viewBox="0 0 24 24"
											fill="currentColor"
										>
											<path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
										</svg>
										Facebook
									</a>
								</div>
							</div>
						</div>
					</article>

					{/* Sidebar - Sticky/Float */}
					<aside className="lg:col-span-4 sticky top-5 self-start h-fit">
						<div className="space-y-4">
							{/* Related Articles (Inside Main Content) */}
							{relatedArticles.length > 0 && (
								<div
									className={`p-6 rounded-xl transition-all duration-300 ${isDark ? "glass-panel border border-white/5" : "bg-white shadow-lg border border-gray-200"}`}
								>
									<h3
										className={`text-lg font-black italic uppercase mb-4 flex items-center gap-2 ${isDark ? "text-white" : "text-[#1a1a1a]"}`}
									>
										Artikel Terkait
									</h3>
									{popularLoading ? (
										<div className="space-y-4">
											{[...Array(4)].map((_, i) => (
												<PopularArticleCardSkeleton key={i} />
											))}
										</div>
									) : (
										<div className="space-y-3">
											{relatedArticles
												?.slice(0, 5)
												.map((item: any, index: number) => (
													<Link
														key={item.id}
														href={`/${item.slug}`}
														className="group block"
													>
														<div className="flex gap-3 items-center">
															<img
																src={`${process.env.NEXT_PUBLIC_API_URL}/storage/${item.image}`}
																alt={item.title}
																className="w-20 h-20 rounded-lg object-cover shrink-0"
															/>
															<div className="min-w-0">
																<h4
																	className={`font-bold text-sm group-hover:${isDark ? "text-primary" : "text-[#0a7c6e]"} transition-colors line-clamp-2 leading-snug ${isDark ? "text-white" : "text-[#1a1a1a]"}`}
																>
																	{item.title}
																</h4>
																<p
																	className={`text-xs mt-1 uppercase tracking-widest font-bold ${isDark ? "text-white/40" : "text-[#5a5a5a]"}`}
																>
																	{item.created_diff}
																</p>
															</div>
														</div>
													</Link>
												))}
										</div>
									)}
								</div>
							)}

							<RecentScoresSidebar />
						</div>
					</aside>
				</div>
			</section>

			<style jsx global>{`
				/* ===== Enhanced Article Content Styles ===== */
				.article-content {
					font-size: 17px;
					line-height: 1.85;
					color: ${colors.contentText};
				}

				/* Paragraphs */
				.article-content p {
					margin-bottom: 1.5em;
					line-height: 1.9;
					color: ${colors.contentTextSecondary};
				}
				.article-content p:first-of-type:not(li > p)::first-letter {
					font-size: 4em;
					font-weight: 900;
					float: left;
					line-height: 0.8;
					margin-right: 0.15em;
					margin-top: 0.08em;
					color: ${colors.primary};
					text-shadow: 0 0 20px
						${isDark ? "rgba(0, 194, 177, 0.5)" : "rgba(10, 124, 110, 0.3)"};
				}
				.article-content p:empty,
				.article-content p:has(> br:first-child:last-child),
				.article-content p:has(> br:only-child) {
					display: none;
					margin: 0;
					padding: 0;
					height: 0;
					line-height: 0;
				}
				.article-content br {
					display: none;
				}

				/* Headings */
				.article-content h1,
				.article-content h2,
				.article-content h3,
				.article-content h4,
				.article-content h5,
				.article-content h6 {
					color: ${colors.headingColor};
					margin-top: 2.5em;
					margin-bottom: 1em;
					line-height: 1.25;
					font-weight: 800;
					text-transform: uppercase;
					letter-spacing: -0.01em;
				}
				.article-content h1,
				.article-content h2,
				.article-content h3,
				.article-content h4,
				.article-content h5,
				.article-content h6 {
					padding-bottom: 0.75em;
					border-bottom: 2px solid rgba(0, 194, 177, 0.2);
					position: relative;
				}
				.article-content h1::before,
				.article-content h2::before,
				.article-content h3::before,
				.article-content h4::before,
				.article-content h5::before,
				.article-content h6::before {
					content: "";
					position: absolute;
					bottom: -2px;
					left: 0;
					width: 60px;
					height: 2px;
					background: #00c2b1;
					box-shadow: 0 0 10px rgba(0, 194, 177, 0.5);
				}
				.article-content h2 {
					font-size: 1.6rem;
				}
				.article-content h3 {
					font-size: 1.25rem;
				}
				.article-content h4 {
					font-size: 1.1rem;
				}
				.article-content h5 {
					font-size: 1rem;
				}
				.article-content h6 {
					font-size: 0.95rem;
				}
				.article-content h1 {
					font-size: 2rem;
				}
				.article-content h1::before {
					content: "";
					position: absolute;
					bottom: -2px;
					left: 0;
					width: 60px;
					height: 2px;
					background: #00c2b1;
					box-shadow: 0 0 10px rgba(0, 194, 177, 0.5);
				}

				/* Links */
				.article-content a {
					color: ${colors.linkColor} !important;
					text-decoration: none;
					font-weight: 600;
					border-bottom: 1px solid
						${isDark ? "rgba(67, 222, 204, 0.3)" : "rgba(10, 124, 110, 0.3)"};
					transition: all 0.3s ease;
					padding-bottom: 1px;
				}
				.article-content a:hover {
					color: ${colors.primary} !important;
					border-bottom-color: ${colors.primary};
					text-shadow: 0 0 12px
						${isDark ? "rgba(0, 194, 177, 0.6)" : "rgba(10, 124, 110, 0.4)"};
				}

				/* Images */
				.article-content img {
					max-width: 100%;
					height: auto;
					margin: 2em 0;
					border-radius: 16px;
					display: block;
					box-shadow:
						0 8px 32px ${colors.shadowColor},
						0 0 0 1px ${colors.borderColor};
				}
				.article-content figure {
					margin: 2em 0;
				}
				.article-content figure img {
					margin: 0;
					border-radius: 16px;
				}
				.article-content figcaption {
					text-align: center;
					font-size: 0.8em;
					color: ${isDark ? "rgba(223, 228, 224, 0.5)" : "#888"};
					margin-top: 0.75em;
					font-style: italic;
				}

				/* Lists */
				.article-content ul,
				.article-content ol {
					margin: 1.5em 0;
					padding-left: 1.5em;
				}
				.article-content ul {
					list-style-type: none;
					padding-left: 0;
				}
				.article-content ul li {
					position: relative;
					margin-bottom: 0.75em;
					line-height: 1.7;
					padding-left: 1.75em;
					color: ${colors.contentTextSecondary};
				}
				.article-content ul li::before {
					content: "";
					position: absolute;
					left: 0;
					top: 0.6em;
					width: 8px;
					height: 8px;
					background: ${colors.listBullet};
					border-radius: 2px;
					box-shadow: 0 0 8px
						${isDark ? "rgba(0, 194, 177, 0.5)" : "rgba(10, 124, 110, 0.3)"};
				}
				.article-content ol {
					counter-reset: list-counter;
					list-style-type: none;
					padding-left: 0;
				}
				.article-content ol li {
					position: relative;
					margin-bottom: 0.75em;
					line-height: 1.7;
					padding-left: 2.75em;
					color: ${colors.contentTextSecondary};
					counter-increment: list-counter;
				}
				.article-content ol li::before {
					content: counter(list-counter);
					position: absolute;
					left: 0;
					top: 0;
					width: 32px;
					height: 32px;
					background: linear-gradient(
						135deg,
						${colors.primary},
						${colors.primaryLight}
					);
					color: ${isDark ? "#003732" : "#ffffff"};
					font-size: 0.8em;
					font-weight: 800;
					border-radius: 8px;
					display: flex;
					align-items: center;
					justify-content: center;
					line-height: 1;
					box-shadow: 0 4px 12px
						${isDark ? "rgba(0, 194, 177, 0.3)" : "rgba(10, 124, 110, 0.3)"};
				}

				/* Blockquote — exclude social media embeds (Instagram, Twitter, Facebook) */
				.article-content
					blockquote:not(.instagram-media):not(.twitter-tweet):not(
						.fb-post
					):not(.fb-video):not(.fb-page),
				.article-content
					blockquote:not(.instagram-embed):not(.twitter-embed):not(
						.fb-post
					):not(.fb-video):not(.fb-page) {
					margin: 2.5em 0;
					padding: 2em 2.5em;
					border-left: 0;
					border-top: 1px solid
						${isDark ? "rgba(0, 194, 177, 0.3)" : "rgba(10, 124, 110, 0.3)"};
					border-bottom: 1px solid
						${isDark ? "rgba(0, 194, 177, 0.3)" : "rgba(10, 124, 110, 0.3)"};
					background: linear-gradient(
						135deg,
						${isDark
							? "rgba(0, 194, 177, 0.05) 0%, rgba(67, 222, 204, 0.02) 100%"
							: "rgba(10, 124, 110, 0.05) 0%, rgba(10, 124, 110, 0.02) 100%"}
					);
					font-style: italic;
					color: ${isDark ? "#fff" : "#1a1a1a"};
					position: relative;
					text-align: center;
					border-radius: 0;
				}
				.article-content
					blockquote:not(.instagram-media):not(.twitter-tweet):not(
						.fb-post
					):not(.fb-video):not(.fb-page)::before {
					content: "" "";
					position: absolute;
					top: -20px;
					left: 50%;
					transform: translateX(-50%);
					font-size: 5rem;
					color: ${colors.primary};
					opacity: 0.15;
					font-family: Georgia, serif;
					line-height: 1;
				}
				.article-content
					blockquote:not(.instagram-media):not(.twitter-tweet):not(
						.fb-post
					):not(.fb-video):not(.fb-page)
					p {
					margin-bottom: 0;
					font-size: 1.15em;
					line-height: 1.7;
					color: ${colors.contentText};
				}
				.article-content
					blockquote:not(.instagram-media):not(.twitter-tweet):not(
						.fb-post
					):not(.fb-video):not(.fb-page)
					cite {
					display: block;
					margin-top: 1em;
					font-size: 0.85em;
					color: ${colors.primaryLight};
					font-style: normal;
					font-weight: 700;
					letter-spacing: 0.1em;
					text-transform: uppercase;
				}

				/* Instagram Embed — fully reset all inherited blockquote styles so the embed renders correctly */
				.article-content blockquote.instagram-media,
				.article-content blockquote.instagram-embed {
					all: unset !important;
					display: block !important;
					margin: 2em 0 !important;
					padding: 0 !important;
					border: none !important;
					background: transparent !important;
					text-align: left !important;
					font-style: normal !important;
					color: inherit !important;
					position: static !important;
					min-height: auto !important;
				}
				.article-content blockquote.instagram-media::before,
				.article-content blockquote.instagram-embed::before {
					display: none !important;
					content: none !important;
				}
				.article-content blockquote.instagram-media > div,
				.article-content blockquote.instagram-embed > div {
					margin: 0 !important;
					border: none !important;
					background: transparent !important;
					padding: 0 !important;
					min-height: auto !important;
					max-height: none !important;
					overflow: visible !important;
				}

				/* Strong / Bold */
				.article-content strong,
				.article-content b {
					font-weight: 700;
					color: ${isDark ? "#fff" : "#1a1a1a"};
				}
				.article-content em,
				.article-content i {
					font-style: italic;
					color: ${colors.contentTextSecondary};
				}

				/* Tables */
				.article-content table {
					width: 100%;
					border-collapse: collapse;
					margin: 2em 0;
					border-radius: 12px;
					overflow: hidden;
					box-shadow: 0 4px 24px ${colors.shadowColor};
					border: 1px solid ${colors.borderColor};
				}
				.article-content thead {
					background: ${colors.tableHeaderBg};
				}
				.article-content th {
					color: ${colors.tableHeaderText};
					font-weight: 800;
					padding: 1em 1.25em;
					text-align: left;
					text-transform: uppercase;
					font-size: 0.8em;
					letter-spacing: 0.5px;
				}
				.article-content td {
					border-bottom: 1px solid ${colors.borderColor};
					padding: 1em 1.25em;
					color: ${colors.contentTextSecondary};
					font-size: 0.95em;
				}
				.article-content tr:last-child td {
					border-bottom: none;
				}
				.article-content tr:nth-child(even) {
					background: ${isDark ? "rgba(255, 255, 255, 0.02)" : "#f9f9f9"};
				}
				.article-content tr:hover {
					background: ${isDark
						? "rgba(0, 194, 177, 0.05)"
						: "rgba(10, 124, 110, 0.05)"};
				}

				/* Code */
				.article-content code {
					background: ${colors.codeBg};
					border: 1px solid ${colors.codeBorder};
					color: ${colors.codeText};
					padding: 0.2em 0.5em;
					border-radius: 6px;
					font-size: 0.9em;
					font-family: var(--font-fira-code), monospace;
				}
				.article-content pre {
					background: ${colors.preBg};
					border: 1px solid ${isDark ? "rgba(0, 194, 177, 0.15)" : "#e5e5e5"};
					border-radius: 12px;
					padding: 1.5em;
					overflow-x: auto;
					margin: 1.5em 0;
					box-shadow: ${isDark
						? "inset 0 2px 8px rgba(0, 0, 0, 0.3)"
						: "inset 0 2px 8px rgba(0, 0, 0, 0.05)"};
				}
				.article-content pre code {
					background: none;
					border: none;
					padding: 0;
					color: ${colors.contentText};
				}

				/* Strip rich-text editor artifacts — background, font-family, font-size, text-align, color */
				.article-content span {
					background-color: transparent !important;
					font-family: inherit !important;
					font-size: inherit !important;
					text-align: inherit !important;
					color: inherit !important;
				}

				/* Iframes / Video */
				.article-content iframe {
					max-width: 100%;
					height: auto;
					margin: 2em 0;
					border-radius: 16px;
					display: block;
					box-shadow: 0 8px 32px ${colors.shadowColor};
					border: 1px solid ${colors.borderColor};
				}
				.article-content iframe[src*="youtube"],
				.article-content iframe[src*="youtu.be"] {
					aspect-ratio: 16 / 9;
					width: 100% !important;
				}
				/* Exclude social embed iframes from global iframe decoration styles */
				.article-content iframe[src*="instagram.com"],
				.article-content iframe[src*="facebook.com"],
				.article-content iframe[src*="twitter.com"] {
					border-radius: 0 !important;
					box-shadow: none !important;
					border: none !important;
					display: block !important;
				}

				/* Instagram Embed */
				.article-content .instagram-media,
				.article-content .instagram-embed {
					min-height: 320px !important; /* ← perbesar tinggi minimal */
					min-width: 250px !important; /* ← perbesar lebar minimal */
					max-height: none !important;
					overflow: visible !important;
					height: auto !important; /* biarkan fleksibel */
				}

				/* Tambahan untuk memastikan jikarame di dalamnya juga tidak terpotong */
				.article-content .instagram-media iframe,
				.article-content .instagram-embed iframe {
					height: auto !important;
					min-height: 550px !important; /* sesuaikan */
					max-height: none !important;
				}

				/* Facebook Embed */
				.article-content .fb-post,
				.article-content .fb-video,
				.article-content .fb-page {
					margin: 2em auto;
					display: block;
					max-width: 100% !important;
					width: 100% !important;
				}
				.article-content .facebook-embed-wrapper {
					margin: 2em 0;
					max-width: 100% !important;
					width: 100% !important;
				}
				.article-content .facebook-embed-wrapper iframe {
					max-width: 100% !important;
					width: 100% !important;
					border: none !important;
					border-radius: 16px;
					overflow: hidden;
					box-shadow: 0 8px 32px ${colors.shadowColor};
				}

				/* Twitter Embed */
				.article-content .twitter-tweet {
					margin: 2em auto !important;
					border-radius: 16px;
					overflow: hidden;
					box-shadow: 0 8px 32px ${colors.shadowColor};
				}
				.article-content .twitter-tweet iframe {
					margin: 0 !important;
					box-shadow: none !important;
					width: 100% !important;
				}

				/* Social Media Embeds */
				.article-content .social-embed {
					position: relative;
					z-index: 10;
					pointer-events: auto !important;
					text-align: left;
					display: block;
					margin: 2em 0;
				}
				.article-content .social-embed * {
					pointer-events: auto !important;
					z-index: 20 !important;
					position: relative !important;
				}
				.article-content .instagram-embed {
					display: block;
					min-height: 400px;
					background: transparent !important;
					text-align: left;
				}
				.article-content .instagram-media {
					background: transparent !important;
					pointer-events: auto !important;
					z-index: 30 !important;
					position: relative !important;
					margin-left: 0 !important;
					margin-right: auto !important;
					text-align: left !important;
				}
				.article-content iframe[src*="instagram.com"] {
					overflow: visible !important;
				}
				.article-content .twitter-embed {
					display: block !important;
					min-height: 300px;
					background: transparent !important;
					text-align: left;
				}
				.article-content .twitter-tweet {
					display: inline-block !important;
					background: transparent !important;
					pointer-events: auto !important;
					z-index: 30 !important;
					position: relative !important;
					margin-left: 0 !important;
					margin-right: auto !important;
					text-align: left !important;
					max-width: 100% !important;
				}
				.article-content iframe[src*="platform.twitter.com"] {
					display: block !important;
					max-width: 100% !important;
					border: none !important;
				}
				.article-content .facebook-embed-wrapper {
					max-width: 100% !important;
					width: 100% !important;
					background: transparent !important;
					text-align: left !important;
					margin-left: 0 !important;
					margin-right: auto !important;
					height: auto !important;
					min-height: auto !important;
					display: block !important;
					position: relative !important;
					overflow: visible !important;
				}
				.article-content .facebook-embed-wrapper .fb-post,
				.article-content .facebook-embed-wrapper .fb-video,
				.article-content .facebook-embed-wrapper .fb-page {
					display: block !important;
					width: 100% !important;
					height: auto !important;
					min-height: auto !important;
					position: relative !important;
					overflow: visible !important;
				}
				.article-content .facebook-embed-wrapper iframe {
					border: none !important;
					border-radius: 12px !important;
					box-shadow: 0 8px 32px ${colors.shadowColor} !important;
					background: transparent !important;
					pointer-events: auto !important;
					z-index: 30 !important;
					position: relative !important;
					display: block !important;
					margin-left: 0 !important;
					margin-right: auto !important;
					height: auto !important;
					min-height: auto !important;
					max-height: none !important;
					width: 100% !important;
				}
				.article-content .social-embed.facebook-embed {
					height: auto !important;
					min-height: auto !important;
					max-height: none !important;
					overflow: visible !important;
					display: block !important;
				}
				.article-content
					.facebook-embed-wrapper
					iframe[src*="facebook.com/plugins/video"],
				.article-content
					.facebook-embed-wrapper
					iframe[src*="facebook.com/plugins/post"],
				.article-content
					.facebook-embed-wrapper
					iframe[src*="facebook.com/plugins/page"] {
					height: 850px !important;
					min-height: 850px !important;
				}
				.article-content .fb-post,
				.article-content .fb-video,
				.article-content .fb-page {
					display: block !important;
					width: 100% !important;
					height: auto !important;
					min-height: auto !important;
					max-height: none !important;
					overflow: visible !important;
				}
				.article-content [class*="fb-"] {
					height: auto !important;
					min-height: auto !important;
					max-height: none !important;
					overflow: visible !important;
				}
				.article-content .multiple-embeds {
					display: flex;
					flex-wrap: wrap;
					justify-content: flex-start;
					align-items: flex-start;
					text-align: left;
					gap: 1rem;
				}
				.article-content .multiple-embeds .social-embed {
					margin: 0;
					min-height: 300px;
					flex: 1;
					min-width: 300px;
				}

				/* Read-also / "Baca juga" callout */
				.article-content .read-also,
				.article-content [data-read-also] {
					border-left: 0;
					border-top: 1px solid rgba(0, 194, 177, 0.3);
					border-bottom: 1px solid rgba(0, 194, 177, 0.3);
					background: linear-gradient(
						135deg,
						rgba(0, 194, 177, 0.05) 0%,
						rgba(67, 222, 204, 0.02) 100%
					);
					color: #fff;
					text-align: center;
					border-radius: 0;
					margin: 2.5em 0;
					padding: 2em 2.5em;
					font-style: italic;
					position: relative;
					text-transform: uppercase;
				}
				.article-content .read-also a,
				.article-content [data-read-also] a {
					display: inline-flex;
					align-items: center;
					gap: 0.35em;
					color: ${colors.linkColor} !important;
					font-weight: 700;
					text-transform: capitalize;
					text-decoration: underline;
					letter-spacing: 0.04em;
					font-size: 1.1rem;
					padding: 0.15em 0.35em;
					border-bottom: none;
					transition: all 0.3s ease;
					position: relative;
				}

				.article-content .read-also a:hover,
				.article-content [data-read-also] a:hover {
					color: ${colors.primary} !important;
					text-shadow: 0 0 12px
						${isDark ? "rgba(0, 194, 177, 0.6)" : "rgba(10, 124, 110, 0.4)"};
					transform: translateX(2px);
				}

				/* Horizontal Rule */
				.article-content hr {
					border: none;
					height: 1px;
					background: linear-gradient(
						to right,
						transparent,
						${colors.hrColor},
						transparent
					);
					margin: 3em 0;
				}

				/* Responsive */
				@media (max-width: 768px) {
					.article-content {
						font-size: 16px;
					}
					.article-content h1 {
						font-size: 1.625rem;
					}
					.article-content h2 {
						font-size: 1.375rem;
					}
					.article-content h3 {
						font-size: 1.15rem;
					}
					.article-content h4 {
						font-size: 1rem;
					}
					.article-content h5 {
						font-size: 0.95rem;
					}
					.article-content h6 {
						font-size: 0.9rem;
					}
					.article-content p:first-of-type:not(li > p)::first-letter {
						font-size: 3em;
					}
				}
			`}</style>
		</div>
	);
}
