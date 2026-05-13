"use client";

import { useQuery } from "@tanstack/react-query";
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
