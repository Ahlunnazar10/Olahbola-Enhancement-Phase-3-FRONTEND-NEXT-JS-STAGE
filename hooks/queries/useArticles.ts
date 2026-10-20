"use client";

import { useQuery, useQueries } from "@tanstack/react-query";
import { apiClient } from "@/lib/api/client";

interface Article {
	id: string;
	title: string;
	slug: string;
	content: string;
	excerpt: string;
	image: string;
	featured_image: string;
	author_name: string;
	category_name: string;
	views: number;
	created_diff: string;
	published_at: string;
}

interface ArticlesResponse {
	status: string;
	data: Article[];
	metadata: {
		page: number;
		per_page: number;
		total: number;
		total_pages: number;
	};
}

interface CategoriesResponse {
	status: string;
	data: Category[];
}

interface Category {
	id: string;
	name: string;
	slug: string;
	description: string | null;
	article_count: number;
}

interface PopularArticlesResponse {
	status: string;
	data: Article[];
}

export function useArticles(page: number = 1, perPage: number = 9) {
	return useQuery({
		queryKey: ["articles", page, perPage],
		queryFn: async () => {
			const response = await apiClient.get<ArticlesResponse>(
				"/api/v1/article",
				{
					params: { page, per_page: perPage },
				},
			);
			return response.data;
		},
		staleTime: 5 * 60 * 1000,
	});
}

export function useArticleDetail(slug: string) {
	return useQuery({
		queryKey: ["article", slug],
		queryFn: async () => {
			const response = await apiClient.get("/api/v1/article/" + slug);
			return response.data;
		},
		enabled: !!slug,
	});
}

export function useArticleCategories() {
	return useQuery({
		queryKey: ["article-categories"],
		queryFn: async () => {
			const response = await apiClient.get<CategoriesResponse>(
				"/api/v1/article/categories",
			);
			return response.data;
		},
		staleTime: 10 * 60 * 1000,
	});
}

export function usePopularArticles() {
	return useQuery({
		queryKey: ["popular-articles"],
		queryFn: async () => {
			const response = await apiClient.get<PopularArticlesResponse>(
				"/api/v1/article/popular",
			);
			return response.data;
		},
		staleTime: 10 * 60 * 1000,
	});
}

export function useArticleSearch(query: string) {
	return useQuery({
		queryKey: ["article-search", query],
		queryFn: async () => {
			const response = await apiClient.get("/api/v1/article/search", {
				params: { q: query },
			});
			return response.data;
		},
		enabled: query.length > 0,
	});
}

// Hook untuk mengambil artikel berdasarkan kategori dengan pagination
// Endpoint: GET /api/v1/article/categories/{slug}?page=1&per_page=9
export function useArticleByCategory(slug: string, page: number = 1, perPage: number = 9) {
	return useQuery({
		queryKey: ["article-category", slug, page, perPage],
		queryFn: async () => {
			const response = await apiClient.get(
				`/api/v1/article/categories/${slug}`,
				{
					params: { page, per_page: perPage },
				},
			);
			return response.data;
		},
		enabled: !!slug,
		staleTime: 5 * 60 * 1000,
	});
}

// Hook untuk mengambil artikel terkait berdasarkan kategori (limit untuk related articles)
export function useRelatedArticles(categorySlug: string, currentSlug: string, limit: number = 4) {
	return useQuery({
		queryKey: ["related-articles", categorySlug, limit],
		queryFn: async () => {
			const response = await apiClient.get(
				`/api/v1/article/categories/${categorySlug}`,
				{
					params: { page: 1, per_page: 50 }, // Get more to filter
				},
			);
			// Filter out current article and return limited results
			const allArticles = response.data?.data || [];
			const filtered = allArticles
				.filter((article: Article) => article.slug !== currentSlug)
				.slice(0, limit);
			return { ...response.data, data: filtered };
		},
		enabled: !!categorySlug && !!currentSlug,
		staleTime: 5 * 60 * 1000,
	});
}

// ---------------------------------------------------------------------------
// Entity search: paralel search per top entity
// Dipakai untuk memperluas pool artikel terkait melampaui kategori tunggal.
// Max 4 entitas di-search paralel agar tidak spam endpoint.
// ---------------------------------------------------------------------------

const SEARCH_SLOTS = 4;

export function useEntitySearch(terms: string[]) {
	// Fixed-slot pattern (Rules of Hooks safe):
	// slot 0–3 selalu di-declare, hanya enabled saat ada term di index tsb.
	const slots: Array<string | null> = [
		terms[0] || null,
		terms[1] || null,
		terms[2] || null,
		terms[3] || null,
	];

	const queries = useQueries({
		queries: slots.map((term, i) => ({
			queryKey: [
				"related-entity-search",
				term || `slot-${i}`,
			] as [string, string],
			queryFn: async (): Promise<RelatedArticleItem[]> => {
				if (!term) return [];
				const response = await apiClient.get("/api/v1/article/search", {
					params: { q: term, per_page: 10 },
				});
				const items: RelatedArticleItem[] = (
					response.data?.data || []
				).map((a: any) => ({
					id: a.id,
					title: a.title,
					slug: a.slug,
					image: a.image,
					created_diff: a.created_diff,
					category_slug: a.category_slug,
				}));
				return items;
			},
			enabled: !!term,
			staleTime: 10 * 60 * 1000,
		})),
	});

	// Gabungkan semua hasil, dedup by slug
	const seen = new Set<string>();
	const merged: RelatedArticleItem[] = [];
	for (const q of queries) {
		for (const item of q.data || []) {
			if (!seen.has(item.slug)) {
				seen.add(item.slug);
				merged.push(item);
			}
		}
	}
	const isLoading = queries.some((q) => q.isLoading);

	return { articles: merged, isLoading };
}

export interface RelatedArticleItem {
	id: string;
	title: string;
	slug: string;
	image?: string;
	created_diff?: string;
	category_slug?: string;
}

// Ambil kategori lain (selain yang sedang dibuka) + 4 artikel terbaru per kategori
// Slot query tetap 4 (placeholder) agar Rules of Hooks tidak terlanggar saat
// daftar kategori masih loading (panjang array berubah 0 → N).
export function useOtherCategories(
	excludeSlug: string,
	perCategory: number = 4
) {
	const { data: categories, isLoading: catsLoading } = useArticleCategories();
	const allCats: Array<{ name: string; slug: string }> =
		categories?.data || [];
	const otherCats = allCats.filter((c) => c.slug !== excludeSlug).slice(0, 4);
	// Slot tetap 4 — placeholder saat kategori belum load
	const slots: Array<{ name: string; slug: string } | null> = [
		otherCats[0] || null,
		otherCats[1] || null,
		otherCats[2] || null,
		otherCats[3] || null,
	];

	const queries = useQueries({
		queries: slots.map((cat, i) => ({
			queryKey: [
				"article-category-other",
				cat?.slug || `slot-${i}`,
				perCategory,
			] as unknown as [string, string | undefined, number],
			queryFn: async () => {
				if (!cat) return { category: cat, articles: [] };
				const response = await apiClient.get(
					`/api/v1/article/categories/${cat.slug}`,
					{ params: { page: 1, per_page: perCategory } }
				);
				return {
					category: cat,
					articles: response.data?.data || [],
				};
			},
			enabled: !!cat,
			staleTime: 5 * 60 * 1000,
		})),
	});

	const groups = queries
		.map((q, i) => ({
			category: slots[i]!,
			articles: q.data?.articles || [],
			isLoading: slots[i] ? q.isLoading : false,
		}))
		.filter((g) => g.category !== null);
	const isLoading = catsLoading || queries.some((q) => q.isLoading);

	return { groups, isLoading };
}

// Ranking terkait berbasis skor keyword, bukan urutan kategori
// Akar: ranking kategori asli hanya urut waktu publish (terbaru dulu), artikel
// yang relevan secara topikal bisa tenggelam di bawah yang cuma sekategori.
// Perbaikan: ambil banyak artikel kategori sama, skore kecocokan keyword judul
// dengan artikel saat ini, sort descending, ambil top N. Jika tidak ada artikel
// dengan skor > 0, fallback natural ke urutan asli (terbaru dulu).
export function rankRelatedArticles(
	articles: Array<{ title: string; slug: string }>,
	currentTitle: string,
	limit: number,
	excludeSlug: string
) {
	// Keyword = kata > 3 karakter dari judul, strip kata fungsi umum
	const currentWords = currentTitle
		.toLowerCase()
		.replace(/[^a-z0-9\s]/g, " ")
		.split(/\s+/)
		.filter((w) => w.length > 3);
	const keywordSet = new Set(
		currentWords.filter(
			(w) => !STOP_WORDS.has(w)
		)
	);
	if (keywordSet.size === 0) {
		return articles.filter((a) => a.slug !== excludeSlug).slice(0, limit);
	}

	const scored = articles
		.filter((a) => a.slug !== excludeSlug)
		.map((a) => {
			const words = a.title
				.toLowerCase()
				.replace(/[^a-z0-9\s]/g, " ")
				.split(/\s+/);
			const wordSet = new Set(words);
			const score = Array.from(keywordSet).reduce((acc, kw) => {
				return acc + (wordSet.has(kw) ? 1 : 0);
			}, 0);
			return { ...a, score };
		})
		.sort((a, b) => b.score - a.score);

	const top = scored.slice(0, limit);
	// Jika semua skor 0 (keyword tak cocok), pakai 4 terbaru dari kategori
	// (urutan response API = terbaru dulu) sebagai fallback natural
	if (top[0]?.score === 0) {
		return scored.slice(0, limit);
	}
	return top;
}

const STOP_WORDS = new Set([
	"yang", "dan", "ini", "itu", "adalah", "dari", "untuk", "dengan",
	"pada", "atau", "tapi", "namun", "karena", "jika", "akan", "sudah",
	"telah", "bisa", "punya", "ada", "akan", "para", "semua", "kalian",
	"kami", "mereka", "the", "and", "for", "with", "from", "this", "that",
	"ini", "the",
]);
