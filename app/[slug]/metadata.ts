import type { Metadata } from "next";
import { apiClient } from "@/lib/api/client";

interface Props {
	params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
	const { slug } = await params;

	try {
		const response = await apiClient.get(`/api/v1/article/${slug}`);

		if (response.data?.status === "success" && response.data?.data) {
			const article = response.data.data;
			const fullImageUrl = article.featured_image
				? `${process.env.NEXT_PUBLIC_API_URL}/storage/${article.featured_image}`
				: null;

			return {
				title: article.title || "Artikel",
				description:
					article.excerpt ||
					"Baca artikel dan berita sepak bola terbaru dari liga-liga top dunia di Olahbola.",
				keywords: [
					article.category_name || "artikel sepak bola",
					article.title,
					"olahbola",
					"berita bola",
				],
				alternates: {
					canonical: `/${slug}`,
				},
				openGraph: {
					title: article.title || "Artikel Olahbola",
					description:
						article.excerpt ||
						"Baca artikel dan berita sepak bola terbaru dari liga-liga top dunia di Olahbola.",
					url: `https://olahbola.com/${slug}`,
					type: "article",
					locale: "id_ID",
					siteName: "Olahbolacom",
					publishedTime: article.published_at || article.created_at,
					authors: [article.author_name || "Olahbola"],
					images: fullImageUrl
						? [
								{
									url: fullImageUrl,
									width: 1200,
									height: 630,
									alt: article.title,
								},
							]
						: [
								{
									url: "/og-image.png",
									width: 1200,
									height: 630,
									alt: article.title || "Olahbola",
								},
							],
				},
				twitter: {
					card: "summary_large_image",
					title: article.title || "Artikel Olahbola",
					description:
						article.excerpt ||
						"Baca artikel dan berita sepak bola terbaru dari liga-liga topunia di Olahbola.",
					images: fullImageUrl ? [fullImageUrl] : ["/og-image.png"],
				},
			};
		}
	} catch (error) {
		console.error("[metadata artikel root] Error:", error);
	}

	// Fallback metadata
	return {
		title: "Artikel Tidak Ditemukan",
		description:
			"Artikel yang kamu cari mungkin sudah dipindahkan atau dihapus.",
		alternates: {
			canonical: `/${slug}`,
		},
		openGraph: {
			title: "Artikel Tidak Ditemukan | Olahbola",
			description:
				"Artikel yang kamu cari mungkin sudah dipindahkan atau dihapus.",
			url: `https://olahbola.com/${slug}`,
			type: "website",
			locale: "id_ID",
			siteName: "Olahbolacom",
		},
		twitter: {
			card: "summary_large_image",
			title: "Artikel Tidak Ditemukan | Olahbola",
			description:
				"Artikel yang kamu cari mungkin sudah dipindahkan atau dihapus.",
		},
	};
}
