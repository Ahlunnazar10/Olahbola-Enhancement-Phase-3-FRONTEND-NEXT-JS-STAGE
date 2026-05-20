"use client";

import { Suspense, useState, useEffect, useMemo } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import Link from "next/link";
import { ArticleCardSkeleton } from "@/components/article/ArticleCard";
import { PopularArticleCardSkeleton } from "@/components/article/PopularArticleCard";
import {
	useArticles,
	useArticleCategories,
	useArticleByCategory,
	usePopularArticles,
	useArticleSearch,
} from "@/hooks/queries/useArticles";

const ITEMS_PER_PAGE = 9;

function ArtikelContent() {
	const router = useRouter();
	const searchParams = useSearchParams();
	const categorySlug = searchParams.get("kategori") || "";
	const searchQuery = searchParams.get("q") || "";

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
		<main className="pt-6 pb-20 px-4 md:px-16 max-w-screen-2xl mx-auto custom-scrollbar">
			{/* Hero Article - Featured */}
			{!searchQuery && !categorySlug && featuredArticle && (
				<section className="mb-0 -mt-6 w-screen left-1/2 -translate-x-1/2 relative">
					<div className="relative w-full h-179 rounded-2xl overflow-hidden group border border-white/10">
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
						<div className="absolute inset-0 bg-linear-to-t from-black/90 via-black/70 to-transparent"></div>
						<div className="absolute bottom-20 left-0 p-8 md:p-12 w-full md:w-3/4">
							<h1 className="font-display-xl text-6xl md:text-6xl uppercase tracking-tighter mb-6 neon-glow leading-[0.9] text-white">
								{featuredArticle.title}
							</h1>
							<p className="text-lg max-w-2xl mb-8 text-white/90">
								{featuredArticle.excerpt}
							</p>
							<Link
								href={`/${featuredArticle.slug}`}
								className="flex items-center gap-3 bg-primary text-on-primary px-8 py-4 rounded-full font-bold text-sm uppercase tracking-widest hover:scale-105 transition-transform shadow-[0_0_20px_rgba(67,222,204,0.3)] w-fit"
							>
								Selengkapnya{" "}
								<span className="material-symbols-outlined">arrow_forward</span>
							</Link>
						</div>
					</div>
				</section>
			)}

			{/* Search & Categories Bar with Glassmorphism */}
			<section className="flex flex-col md:flex-row gap-6 mt-4 mb-8 items-center bg-white/5 backdrop-blur-xl p-4 rounded-2xl border border-white/5 ">
				<div className="relative w-full md:w-1/3 group">
					<span className="absolute left-4 top-1/2 -translate-y-1/2 material-symbols-outlined text-outline">
						search
					</span>
					<input
						className="w-full bg-surface-container-highest/20 border border-outline-variant/30 rounded-xl py-4 pl-12 pr-4 font-bold text-sm tracking-widest placeholder:text-outline focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all backdrop-blur-md"
						placeholder="SEARCH ARCHIVE..."
						type="text"
						value={localSearchInput}
						onChange={handleSearchChange}
					/>
				</div>
				<div className="flex gap-3 overflow-x-auto pb-2 w-full md:w-2/3 custom-scrollbar">
					<button
						onClick={() => handleCategoryClick("")}
						className={`px-6 py-3 rounded-xl border border-primary bg-primary/10 text-primary font-bold text-sm whitespace-nowrap uppercase tracking-widest ${
							!categorySlug ? "bg-primary text-on-primary" : ""
						}`}
					>
						LATEST
					</button>
					{categories?.data?.map((cat: any) => (
						<button
							key={cat.id}
							onClick={() => handleCategoryClick(cat.slug)}
							className={`px-6 py-3 rounded-xl border border-outline-variant/30 bg-surface-container-low/40 backdrop-blur-sm text-on-surface-variant font-bold text-sm whitespace-nowrap uppercase tracking-widest hover:border-primary/50 transition-colors ${
								categorySlug === cat.slug
									? "border-primary bg-primary/10 text-primary"
									: ""
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
						<h2 className="text-2xl font-bold text-white">
							Hasil pencarian untuk "{searchQuery}"
						</h2>
						<p className="text-outline text-sm">
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
							<h3 className="text-xl font-semibold text-gray-400 mb-2">
								Tidak ada artikel
							</h3>
							<p className="text-gray-500">
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
									<div className="md:col-span-2 glass-card rounded-2xl overflow-hidden group min-h-125">
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
												<span className="text-primary font-bold text-xs uppercase tracking-[0.2em] mb-3 block">
													Article
												</span>
												<h3 className="text-3xl uppercase leading-tight mb-4">
													{remainingArticles[0].title}
												</h3>
												<p className="text-on-surface-variant line-clamp-2">
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
										className="glass-card rounded-2xl overflow-hidden group flex flex-col"
									>
										<div className="h-48 overflow-hidden relative">
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
												<h3 className="font-bold text-lg uppercase tracking-tighter leading-tight group-hover:text-primary transition-colors">
													{article.title}
												</h3>
											</div>
											<div className="flex justify-between items-center mt-6">
												<span className="text-on-surface-variant text-xs font-bold">
													{article.created_diff}
												</span>
												<span className="material-symbols-outlined text-primary text-sm">
													article
												</span>
											</div>
										</div>
									</Link>
								))}
						</>
					)}

					{/* Next Page Button */}
					{hasMore && (
						<div className="col-span-full flex justify-center py-8 mt-4">
							<button
								onClick={handleNextPage}
								disabled={isLoadingMore}
								className="group relative px-16 py-6 overflow-hidden rounded-2xl"
							>
								<div className="absolute inset-0 border border-primary/20 bg-primary/5 backdrop-blur-md group-hover:border-primary/50 transition-all"></div>
								<div className="absolute inset-0 bg-primary/10 translate-y-full group-hover:translate-y-0 transition-transform"></div>
								<span className="relative font-bold text-sm text-primary tracking-[0.5em] uppercase">
									{isLoadingMore ? "Loading..." : "Load More"}
								</span>
							</button>
						</div>
					)}

					{/* End of content */}
					{!hasMore && displayedArticles.length > 0 && (
						<div className="col-span-full text-center py-8 text-outline">
							<p>Anda telah melihat semua artikel</p>
						</div>
					)}
				</div>

				{/* Trending Sidebar with Enhanced Glassmorphism */}
				<aside className="lg:col-span-4 space-y-8">
					<div className="glass-panel p-8 rounded-2xl border-l-[6px] border-l-primary relative overflow-hidden group/sidebar">
						<div className="absolute -right-20 -top-20 w-64 h-64 bg-primary/5 blur-[80px] rounded-full group-hover/sidebar:bg-primary/10 transition-all duration-700"></div>
						<h2 className="text-3xl uppercase tracking-tighter mb-10 flex items-center gap-3 relative z-10">
							<span
								className="material-symbols-outlined text-primary float-anim"
								style={{ fontVariationSettings: "'FILL' 1;" }}
							>
								bolt
							</span>
							TRENDING NOW
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
											<span className="text-5xl font-display-xl text-white/10 group-hover:text-primary/40 transition-colors leading-none italic">
												{String(index + 1).padStart(2, "0")}
											</span>
											<div>
												<span className="text-xs font-black text-primary uppercase tracking-[0.3em]">
													TRENDING
												</span>
												<h4 className="font-bold text-md uppercase tracking-tight leading-tight mt-1 group-hover:text-primary transition-colors">
													{article.title}
												</h4>
												<div className="flex items-center gap-4 mt-3 text-xs text-outline font-bold">
													<span className="flex items-center gap-1">
														<span className="material-symbols-outlined text-xs">
															visibility
														</span>{" "}
														{article.views}
													</span>
													<span>{article.created_diff}</span>
												</div>
											</div>
										</div>
									))
							)}
						</div>
						<button className="w-full mt-12 py-5 border-y border-white/5 text-on-surface-variant font-bold text-sm uppercase tracking-widest hover:text-white hover:bg-white/5 transition-all flex justify-between items-center group">
							SEE FULL RANKINGS
							<span className="material-symbols-outlined text-sm group-hover:translate-x-1 transition-transform">
								chevron_right
							</span>
						</button>
					</div>

					{/* Promo Section */}
					<div className="relative h-72 rounded-2xl overflow-hidden group shadow-2xl">
						<img
							className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-[2s]"
							src="https://lh3.googleusercontent.com/aida-public/AB6AXuAd31Wri8pof4-mRsEt4Yz7iCfrj5GDH_-qylX2tts-fmjBpHIAYmDSkM39fOcWvK8xkzrVZZ04yf8khZlMtuWq0tkDc2rGIrMAPMU7gUzkhzWccjgMEl7cE5lk6OJJB19V1bo8t-xOVxpyzBub_CKuXyeI0enmC_MtSbuOrPjL37s4rtTUoEly_ynGzy5RUKIl13uHw1QRR9RJCCQMOW-npeX59Z9LB8teamoAmxZA_2yd0xyk63MZLnauGbWDkqw01VO_6i8rCS4"
							alt="Promo"
						/>
						<div className="absolute inset-0 bg-primary/20 mix-blend-overlay"></div>
						<div className="absolute inset-0 flex flex-col items-center justify-center text-center p-8 bg-zinc-950/60 backdrop-blur-md">
							<div className="mb-4">
								<span className="text-primary font-black text-xs tracking-[0.8em] block animate-pulse">
									ARENA PLUS
								</span>
							</div>
							<h3 className="text-3xl text-white mb-6 uppercase tracking-tight">
								UNLOCK THE VAULT
							</h3>
							<button className="bg-primary text-on-primary px-10 py-3 rounded-full font-black text-xs uppercase hover:scale-105 transition-transform shadow-[0_0_15px_rgba(67,222,204,0.4)]">
								JOIN NOW
							</button>
						</div>
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
	return (
		<div className="min-h-screen bg-background text-on-background font-sans custom-scrollbar">
			<Suspense fallback={<ArtikelLoading />}>
				<ArtikelContent />
			</Suspense>
		</div>
	);
}
