"use client";

import { Suspense, useState, useEffect, useMemo } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { Loader2, ArrowRight, Search, Eye, Zap } from "lucide-react";
import Link from "next/link";
import { ArticleCardSkeleton } from "@/components/article/ArticleCard";
import { PopularArticleCardSkeleton } from "@/components/article/PopularArticleCard";
import AdSlot from "@/components/ads/AdSlot";
import {
	useArticles,
	useArticleCategories,
	useArticleByCategory,
	usePopularArticles,
	useArticleSearch,
} from "@/hooks/queries/useArticles";
import { useUIStore } from "@/stores/uiStore";

const ITEMS_PER_PAGE = 9;

function ArtikelContent() {
	const router = useRouter();
	const searchParams = useSearchParams();
	const categorySlug = searchParams.get("kategori") || "";
	const searchQuery = searchParams.get("q") || "";
	const { theme } = useUIStore();
	const isDark = theme === "dark";

	const [page, setPage] = useState(1);
	const [displayedArticles, setDisplayedArticles] = useState<any[]>([]);
	const [isLoadingMore, setIsLoadingMore] = useState(false);
	const [hasMore, setHasMore] = useState(false);
	const [isInitialized, setIsInitialized] = useState(false);
	const [localSearchInput, setLocalSearchInput] = useState(searchQuery);
	const [searchQueryActive, setSearchQueryActive] = useState(searchQuery);

	// Fetch categories
	const { data: categories } = useArticleCategories();

	// Fetch popular articles for sidebar
	const { data: popularData, isLoading: popularLoading } = usePopularArticles();

	// For "Semua" articles - paginated from API
	const {
		data: articlesData,
		isLoading: isArticlesLoading,
		isFetching,
	} = useArticles(page, ITEMS_PER_PAGE);

	// For category articles - get all data
	const { data: categoryData, isLoading: isCategoryLoading } =
		useArticleByCategory(categorySlug, 1, 999);

	// For search - fetch all results at once
	const { data: searchData, isLoading: isSearchLoading } =
		useArticleSearch(searchQuery);

	// Determine loading state
	const isLoading = searchQuery
		? isSearchLoading
		: categorySlug
			? isCategoryLoading
			: isArticlesLoading;

	// Memoize arrays to prevent infinite loops
	const categoryAllArticles = useMemo(
		() => categoryData?.data || [],
		[categoryData?.data],
	);

	const apiArticles = useMemo(
		() => articlesData?.data || [],
		[articlesData?.data],
	);

	const searchArticles = useMemo(
		() => searchData?.data || [],
		[searchData?.data],
	);

	const categoryTotalPages = useMemo(
		() => Math.max(1, Math.ceil(categoryAllArticles.length / ITEMS_PER_PAGE)),
		[categoryAllArticles.length],
	);

	const apiTotalPages = articlesData?.metadata?.total_pages || 1;
	const totalPages = searchQuery
		? 1 // Search results don't paginate
		: categorySlug
			? categoryTotalPages
			: apiTotalPages;
	const totalItems = searchQuery
		? searchArticles.length
		: categorySlug
			? categoryAllArticles.length
			: articlesData?.metadata?.total || 0;

	// Reset when category/search changes
	useEffect(() => {
		setPage(1);
		setDisplayedArticles([]);
		setHasMore(false);
		setIsInitialized(false);
	}, [categorySlug, searchQueryActive]);

	// Sync localSearchInput when URL searchQuery changes (after debounce)
	useEffect(() => {
		setLocalSearchInput(searchQuery);
		setSearchQueryActive(searchQuery);
	}, [searchQuery]);

	// Initialize page 1 data
	useEffect(() => {
		if (isInitialized) return;

		// For search, only show results if searchArticles matches the active search
		if (searchQueryActive) {
			if (searchArticles.length > 0 && searchData?.data) {
				// Only accept results that match current active search
				const isResultForCurrentSearch = searchData.data.some(
					(article: any) =>
						article.title
							.toLowerCase()
							.includes(searchQueryActive.toLowerCase()) ||
						article.content
							?.toLowerCase()
							.includes(searchQueryActive.toLowerCase()),
				);
				if (isResultForCurrentSearch || searchArticles.length > 0) {
					setDisplayedArticles(searchArticles);
					setHasMore(false);
					setIsInitialized(true);
				}
			} else if (!isSearchLoading) {
				// Only set empty if search is complete
				setDisplayedArticles([]);
				setHasMore(false);
				setIsInitialized(true);
			}
		} else if (categorySlug) {
			if (categoryAllArticles.length > 0) {
				setDisplayedArticles(categoryAllArticles.slice(0, ITEMS_PER_PAGE));
				setHasMore(categoryTotalPages > 1);
				setIsInitialized(true);
			}
		} else {
			if (apiArticles.length > 0) {
				setDisplayedArticles(apiArticles);
				setHasMore(page < apiTotalPages);
				setIsInitialized(true);
			}
		}
	}, [
		categorySlug,
		searchQuery,
		searchQueryActive,
		categoryAllArticles,
		apiArticles,
		searchArticles,
		searchData,
		categoryTotalPages,
		apiTotalPages,
		isInitialized,
		page,
		isSearchLoading,
	]);

	// Handle API pagination for "Semua" (page > 1)
	useEffect(() => {
		if (categorySlug || searchQueryActive) return;
		if (!isInitialized) return;
		if (page === 1) return;

		if (apiArticles.length > 0) {
			setDisplayedArticles((prev) => {
				const existingIds = new Set(prev.map((a: any) => a.id));
				const uniqueNew = apiArticles.filter(
					(a: any) => !existingIds.has(a.id),
				);
				if (uniqueNew.length === 0) return prev;
				return [...prev, ...uniqueNew];
			});
		}
	}, [categorySlug, searchQuery, page, apiArticles, isInitialized]);

	// Handle category pagination (page > 1) - client side
	useEffect(() => {
		if (!categorySlug) return;
		if (!isInitialized) return;
		if (page === 1) return;

		const start = (page - 1) * ITEMS_PER_PAGE;
		const end = start + ITEMS_PER_PAGE;
		const newPageArticles = categoryAllArticles.slice(start, end);

		if (newPageArticles.length > 0) {
			setDisplayedArticles((prev) => {
				const existingIds = new Set(prev.map((a: any) => a.id));
				const uniqueNew = newPageArticles.filter(
					(a: any) => !existingIds.has(a.id),
				);
				if (uniqueNew.length === 0) return prev;
				return [...prev, ...uniqueNew];
			});
		}
	}, [categorySlug, page, categoryAllArticles, isInitialized]);

	// Sync hasMore
	useEffect(() => {
		setHasMore(page < totalPages);
	}, [page, totalPages]);

	const handleNextPage = () => {
		if (!hasMore || isLoadingMore) return;
		setIsLoadingMore(true);
		setPage((p) => p + 1);
	};

	// Reset loading state
	useEffect(() => {
		if (!isFetching && isLoadingMore) {
			setIsLoadingMore(false);
		}
	}, [isFetching, isLoadingMore]);

	const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		const value = e.target.value;
		setLocalSearchInput(value);
		// Navigate immediately without debounce
		if (value) {
			router.push(`/artikel?q=${encodeURIComponent(value)}`);
		} else {
			router.push("/artikel");
		}
	};

	const handleCategoryClick = (slug: string) => {
		if (slug) {
			router.push(`/artikel?kategori=${slug}`);
		} else {
			router.push("/artikel");
		}
	};

	// Get featured article (first one)
	const featuredArticle = displayedArticles[0];
	const remainingArticles = displayedArticles.slice(1);

	return (
		<main
			className={`pt-6 pb-20 px-4 md:px-16 max-w-screen-2xl mx-auto custom-scrollbar transition-colors duration-300 ${isDark ? "bg-[#0f1412] text-white" : "bg-[#f5f5f5] text-[#1a1a1a]"}`}
		>
			{/* Hero Article - Featured */}
			{!searchQuery && !categorySlug && featuredArticle && (
				<section className="mb-0 -mt-6 w-screen left-1/2 -translate-x-1/2 relative">
					<div
						className={`relative w-full h-100 sm:h-120 md:h-150 lg:h-179 overflow-hidden group border ${isDark ? "border-white/10" : "border-[#0a7c6e]/20"}`}
					>
						<img
							className="w-full h-full object-cover transition-all duration-1000 scale-105 group-hover:scale-100"
							src={
								featuredArticle.image
									? `${process.env.NEXT_PUBLIC_API_URL}/storage/${featuredArticle.image}`
									: featuredArticle.featured_image
										? `${process.env.NEXT_PUBLIC_API_URL}/storage/${featuredArticle.featured_image}`
										: "/placeholder.png"
							}
							alt={featuredArticle.title}
						/>
						<div
							className={`absolute inset-0 ${isDark ? "bg-linear-to-t from-black/90 via-black/60 to-transparent" : "bg-linear-to-t from-black/80 via-black/50 to-transparent"}`}
						></div>
						<div className="absolute bottom-24 left-0 p-6 sm:p-8 md:p-12 w-full md:w-4/5 lg:w-3/4">
							<div className="flex items-center gap-3 mb-3 sm:mb-4">
								<span
									className={`px-2 sm:px-3 py-1 rounded-full text-[10px] sm:text-xs font-bold uppercase tracking-wider ${isDark ? "bg-primary/20 border border-primary/40 text-primary" : "bg-[#0a7c6e]/20 border border-primary/40 text-primary"}`}
								>
									{featuredArticle.category?.name || "Article"}
								</span>
							</div>
							<h1
								className={`text-xl sm:text-2xl md:text-4xl lg:text-5xl uppercase font-bold tracking-tighter mb-2 sm:mb-3 md:mb-4 leading-tight ${isDark ? "text-white neon-glow" : "text-white"}`}
							>
								{featuredArticle.title}
							</h1>
							<p
								className={`text-sm sm:text-base md:text-lg max-w-xl sm:max-w-2xl mb-4 sm:mb-6 line-clamp-2 ${isDark ? "text-white/90" : "text-white/80"}`}
							>
								{featuredArticle.excerpt}
							</p>
							<Link
								href={`/${featuredArticle.slug}`}
								className={`inline-flex items-center gap-2 sm:gap-3 px-5 sm:px-8 py-2.5 sm:py-4 rounded-full font-bold text-xs sm:text-sm uppercase tracking-widest hover:scale-105 transition-transform ${isDark ? "bg-primary text-on-primary shadow-[0_0_20px_rgba(67,222,204,0.3)]" : "bg-[#0a7c6e] text-white hover:bg-[#095a50] shadow-[0_0_20px_rgba(10,124,110,0.3)]"}`}
							>
								Selengkapnya
								<ArrowRight className="size-5" />
							</Link>
						</div>
					</div>
				</section>
			)}

			{/* Search & Categories Bar with Glassmorphism */}
			<section
				className={`flex flex-col md:flex-row gap-6 mt-4 mb-8 items-center p-4 rounded-2xl border ${isDark ? "bg-white/5 backdrop-blur-xl border-white/5" : "bg-white/90 backdrop-blur-md border-[#0a7c6e]/20"}`}
			>
				<div className="relative w-full md:w-1/3 group">
					<Search
						className={`absolute left-4 top-1/2 -translate-y-1/2 size-5 ${isDark ? "text-outline" : "text-[#5a5a5a]"}`}
					/>
					<input
						className={`w-full border rounded-xl py-4 pl-12 pr-4 font-bold text-sm tracking-widest outline-none transition-all backdrop-blur-md ${isDark ? "bg-surface-container-highest/20 border-outline-variant/30 text-white placeholder:text-outline focus:border-primary focus:ring-1 focus:ring-primary" : "bg-gray-100 border-gray-300 text-[#1a1a1a] placeholder:text-gray-400 focus:border-[#0a7c6e] focus:ring-1 focus:ring-[#0a7c6e]"}`}
						placeholder="CARI ARTIKEL..."
						type="text"
						value={localSearchInput}
						onChange={handleSearchChange}
					/>
				</div>
				<div className="flex gap-3 overflow-x-auto pb-2 w-full md:w-2/3 custom-scrollbar">
					<button
						onClick={() => handleCategoryClick("")}
						className={`px-6 py-3 rounded-xl border font-bold text-sm whitespace-nowrap uppercase tracking-widest transition-colors ${
							!categorySlug
								? isDark
									? "border-primary bg-primary text-on-primary"
									: "border-[#0a7c6e] bg-[#0a7c6e] text-white"
								: isDark
									? "border-primary bg-primary/10 text-primary hover:border-primary/50"
									: "border-[#0a7c6e]/30 bg-[#0a7c6e]/10 text-[#0a7c6e] hover:border-[#0a7c6e]/50"
						}`}
					>
						TERBARU
					</button>
					{categories?.data?.map((cat: any) => (
						<button
							key={cat.id}
							onClick={() => handleCategoryClick(cat.slug)}
							className={`px-6 py-3 rounded-xl border font-bold text-sm whitespace-nowrap uppercase tracking-widest transition-colors ${
								categorySlug === cat.slug
									? isDark
										? "border-primary bg-primary/10 text-primary"
										: "border-[#0a7c6e] bg-[#0a7c6e]/10 text-[#0a7c6e]"
									: isDark
										? "border-outline-variant/30 bg-surface-container-low/40 text-on-surface-variant hover:border-primary/50"
										: "border-gray-300 bg-gray-100 text-[#5a5a5a] hover:border-[#0a7c6e]/50"
							}`}
						>
							{cat.name}
						</button>
					))}
				</div>
			</section>

			{/* Main Content Layout */}
			<div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
				{/* Search Results Header */}
				{searchQuery && (
					<div className="lg:col-span-8 mb-6">
						<h2
							className={`text-2xl font-bold ${isDark ? "text-white" : "text-[#1a1a1a]"}`}
						>
							Hasil pencarian untuk "{searchQuery}"
						</h2>
						<p
							className={`text-sm ${isDark ? "text-outline" : "text-[#5a5a5a]"}`}
						>
							{displayedArticles.length} artikel ditemukan
						</p>
					</div>
				)}

				{/* Velocity Article Grid */}
				<div className="lg:col-span-8 grid grid-cols-1 md:grid-cols-2 gap-6">
					{isLoading && displayedArticles.length === 0 ? (
						<>
							{[...Array(6)].map((_, i) => (
								<ArticleCardSkeleton key={i} />
							))}
						</>
					) : displayedArticles.length === 0 ? (
						<div className="col-span-full text-center py-20">
							<h3
								className={`text-xl font-semibold mb-2 ${isDark ? "text-gray-400" : "text-gray-500"}`}
							>
								Tidak ada artikel
							</h3>
							<p className={isDark ? "text-gray-500" : "text-gray-400"}>
								{searchQuery
									? `Tidak ada hasil untuk "${searchQuery}"`
									: categorySlug
										? "Kategori ini belum memiliki artikel"
										: "Pilih kategori lain atau coba nanti"}
							</p>
						</div>
					) : (
						<>
							{/* Large Card - First article if no hero */}
							{(!featuredArticle || searchQuery || categorySlug) &&
								remainingArticles[0] && (
									<div
										className={`md:col-span-2 rounded-2xl overflow-hidden group min-h-125 transition-all duration-300 ${isDark ? "glass-card hover:shadow-[0_0_30px_rgba(67,222,204,0.15)] hover:border-primary/30" : "bg-white shadow-lg border border-gray-200 hover:shadow-xl hover:border-[#0a7c6e]/30"}`}
									>
										<Link
											href={`/${remainingArticles[0].slug}`}
											className="block"
										>
											<div className="relative h-87.5 overflow-hidden">
												<img
													className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
													src={
														remainingArticles[0].image
															? `${process.env.NEXT_PUBLIC_API_URL}/storage/${remainingArticles[0].image}`
															: remainingArticles[0].featured_image
																? `${process.env.NEXT_PUBLIC_API_URL}/storage/${remainingArticles[0].featured_image}`
																: "/placeholder.png"
													}
													alt={remainingArticles[0].title}
												/>
											</div>
											<div className="p-8">
												<span
													className={`font-bold text-xs uppercase tracking-[0.2em] mb-3 block ${isDark ? "text-primary" : "text-[#0a7c6e]"}`}
												>
													Article
												</span>
												<h3
													className={`text-3xl uppercase leading-tight mb-4 group-hover:${isDark ? "text-primary" : "text-[#0a7c6e]"} transition-colors ${isDark ? "text-white" : "text-[#1a1a1a]"}`}
												>
													{remainingArticles[0].title}
												</h3>
												<p
													className={`line-clamp-2 ${isDark ? "text-on-surface-variant" : "text-[#5a5a5a]"}`}
												>
													{remainingArticles[0].excerpt}
												</p>
											</div>
										</Link>
									</div>
								)}

							{/* Medium Cards - Remaining articles */}
							{remainingArticles
								.slice(featuredArticle || searchQuery || categorySlug ? 0 : 1)
								.map((article: any) => (
									<Link
										key={article.id}
										href={`/${article.slug}`}
										className={`rounded-2xl overflow-hidden group flex flex-col transition-all duration-300 ${isDark ? "glass-card hover:shadow-[0_0_25px_rgba(67,222,204,0.15)] hover:border-primary/30" : "bg-white shadow-lg border border-gray-200 hover:shadow-xl hover:border-[#0a7c6e]/30"}`}
									>
										<div className="h-48 overflow-hidden">
											<img
												className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
												src={
													article.image
														? `${process.env.NEXT_PUBLIC_API_URL}/storage/${article.image}`
														: article.featured_image
															? `${process.env.NEXT_PUBLIC_API_URL}/storage/${article.featured_image}`
															: "/placeholder.png"
												}
												alt={article.title}
											/>
										</div>
										<div className="p-6 flex-1 flex flex-col justify-between">
											<div>
												<h3
													className={`font-bold text-lg uppercase tracking-tighter leading-tight group-hover:${isDark ? "text-primary" : "text-primary"} transition-colors ${isDark ? "text-white" : "text-[#1a1a1a]"}`}
												>
													{article.title}
												</h3>
												{/* Author Info */}
												{article.author && (
													<div className="flex items-center gap-2 mt-3">
														<div
															className={`w-6 h-6 rounded-full flex items-center justify-center overflow-hidden ${isDark ? "bg-primary/20" : "bg-[#0a7c6e]/20"}`}
														>
															{article.author.avatar ? (
																<img
																	src={`${process.env.NEXT_PUBLIC_API_URL}/storage/${article.author.avatar}`}
																	alt={article.author.name}
																	className="w-full h-full object-cover"
																/>
															) : (
																<span
																	className={`text-[10px] font-bold ${isDark ? "text-primary" : "text-[#0a7c6e]"}`}
																>
																	{article.author.name
																		?.charAt(0)
																		?.toUpperCase() || "A"}
																</span>
															)}
														</div>
														<span
															className={`text-[11px] font-bold uppercase tracking-wide ${isDark ? "text-on-surface-variant" : "text-[#5a5a5a]"}`}
														>
															{article.author.name || "Author"}
														</span>
													</div>
												)}
											</div>
											<div className="flex justify-between items-center mt-4">
												<span
													className={`text-xs font-bold ${isDark ? "text-on-surface-variant" : "text-[#5a5a5a]"}`}
												>
													{article.created_diff}
												</span>
												<div
													className={`flex items-center gap-1 text-[11px] font-bold ${isDark ? "text-on-surface-variant" : "text-[#5a5a5a]"}`}
												>
													<Eye className="size-4" />
													<span>{article.views || 0}</span>
													<span>Dibaca</span>
												</div>
											</div>
										</div>
									</Link>
								))}
						</>
					)}

					{/* Next Page Button */}
					{hasMore && (
						<div className="col-span-full flex justify-center py-8 mt-0 md:mt-4">
							<button
								onClick={handleNextPage}
								disabled={isLoadingMore}
								className="group relative px-16 py-6 overflow-hidden rounded-2xl"
							>
								<div
									className={`absolute inset-0 border rounded-2xl backdrop-blur-md group-hover:border-primary/50 transition-all ${isDark ? "border-primary/20 bg-primary/5" : "border-[#0a7c6e]/20 bg-[#0a7c6e]/5"}`}
								></div>
								<div
									className={`absolute inset-0 translate-y-full group-hover:translate-y-0 transition-transform ${isDark ? "bg-primary/10" : "bg-[#0a7c6e]/10"}`}
								></div>
								<span
									className={`relative font-bold text-sm tracking-[0.5em] uppercase ${isDark ? "text-primary" : "text-[#0a7c6e]"}`}
								>
									{isLoadingMore ? "Loading..." : "Lebih Banyak"}
								</span>
							</button>
						</div>
					)}

					{/* End of content */}
					{!hasMore && displayedArticles.length > 0 && (
						<div
							className={`col-span-full text-center py-8 ${isDark ? "text-outline" : "text-[#5a5a5a]"}`}
						>
							<p>Anda telah melihat semua artikel</p>
						</div>
					)}

					{/* Games Unit Ad — Article Feed Footer */}
					{/* <div className="md:col-span-2 my-6">
						<AdSlot
							client="ca-pub-8005120082355722"
							slot="5316243141"
							format="auto"
						/>
					</div> */}
				</div>

				{/* Trending Sidebar with Enhanced Glassmorphism */}
				<aside className="lg:col-span-4">
					<div className="sticky top-26 space-y-8">
						<div
							className={`p-8 rounded-2xl border-l-[6px] relative overflow-hidden group/sidebar transition-all duration-300 ${isDark ? "glass-panel" : "bg-white shadow-lg border-l-[#0a7c6e] hover:shadow-xl"}`}
						>
							<div
								className={`absolute -right-20 -top-20 w-64 h-64 rounded-full blur-[80px] group-hover/sidebar:opacity-100 transition-all duration-700 ${isDark ? "bg-primary/5 group-hover/sidebar:bg-primary/10" : "bg-[#0a7c6e]/5 group-hover/sidebar:bg-[#0a7c6e]/10"}`}
							></div>
							<h2
								className={`text-3xl uppercase tracking-tighter mb-10 flex items-center gap-3 relative z-10 ${isDark ? "text-white" : "text-[#1a1a1a]"}`}
							>
								<Zap
									className={`float-anim size-7 ${isDark ? "text-primary" : "text-[#0a7c6e]"}`}
									fill="currentColor"
								/>
								ARTIKEL POPULER
							</h2>
							<div className="space-y-10 relative z-10">
								{popularLoading ? (
									<>
										{[...Array(4)].map((_, i) => (
											<PopularArticleCardSkeleton key={i} />
										))}
									</>
								) : (
									popularData?.data
										?.slice(0, 4)
										.map((article: any, index: number) => (
											<div
												key={article.id}
												className="flex gap-6 group cursor-pointer"
											>
												<span
													className={`text-5xl font-display-xl transition-colors leading-none italic ${isDark ? "text-white/10 group-hover:text-primary/40" : "text-gray-300 group-hover:text-[#0a7c6e]/40"}`}
												>
													{String(index + 1).padStart(2, "0")}
												</span>
												<div>
													<span
														className={`text-xs font-black uppercase tracking-[0.3em] ${isDark ? "text-primary" : "text-[#0a7c6e]"}`}
													>
														VIRAL
													</span>
													<h4
														className={`font-bold text-md uppercase tracking-tight leading-tight mt-1 group-hover:${isDark ? "text-primary" : "text-[#0a7c6e]"} transition-colors ${isDark ? "text-white" : "text-[#1a1a1a]"}`}
													>
														{article.title}
													</h4>
													<div
														className={`flex items-center gap-4 mt-3 text-xs font-bold ${isDark ? "text-outline" : "text-[#5a5a5a]"}`}
													>
														<span className="flex items-center gap-1">
															<Eye className="size-4" /> {article.views}
															<span className="hidden md:flex">Dibaca</span>
														</span>
													</div>
												</div>
											</div>
										))
								)}
							</div>
						</div>

						{/* Promo Section */}
						{/* <div
							className={`h-fit rounded-2xl overflow-hidden group ${isDark ? "" : "shadow-lg"}`}
						>
							<a href="https://www.igvault.id/home">
								<img
									className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-[2s]"
									src="/images/article/ads-sidebar.webp"
									alt="Promo"
								/>
							</a>
						</div> */}
					</div>
				</aside>
			</div>
		</main>
	);
}

function ArtikelLoading() {
	return (
		<div className="flex items-center justify-center min-h-100">
			<Loader2 className="size-10 animate-spin text-primary" />
		</div>
	);
}

export default function ArtikelPage() {
	const { theme } = useUIStore();
	const isDark = theme === "dark";
	return (
		<div
			className={`min-h-screen font-sans custom-scrollbar transition-colors duration-300 ${isDark ? "bg-[#0f1412] text-white" : "bg-[#f5f5f5] text-[#1a1a1a]"}`}
		>
			<Suspense fallback={<ArtikelLoading />}>
				<ArtikelContent />
			</Suspense>
		</div>
	);
}
