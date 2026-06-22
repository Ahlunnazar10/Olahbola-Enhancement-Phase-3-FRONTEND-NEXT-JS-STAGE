import type { Metadata } from "next";

interface ArticleResponse {
	status: string;
	data?: {
		title: string;
		slug: string;
		excerpt: string;
		featured_image?: string;
		image?: string;
		author_name: string;
		category_name?: string;
		published_at?: string;
		created_at?: string;
		updated_at?: string;
		tags?: string[];
	};
}

const SITE_URL = "https://www.olahbola.com";
const API_BASE_URL =
	process.env.NEXT_PUBLIC_API_URL || "https://cms.olahbola.com";

export async function generateMetadata({
	params,
}: {
	params: Promise<{ slug: string }>;
}): Promise<Metadata> {
	const { slug } = await params;

	// Skip non-article slugs — if URL doesn't match known article slug patterns
	// We can't reliably know if a slug is an article without fetching, so we
	// always fetch. If it's not an article, fallback metadata will be used.

	try {
		const res = await fetch(`${API_BASE_URL}/api/v1/article/${slug}`, {
			headers: { Accept: "application/json" },
			signal: AbortSignal.timeout(5000),
			next: { revalidate: 600 },
		});

		if (!res.ok) {
			throw new Error(`Article fetch failed: ${res.status}`);
		}

		const json: ArticleResponse = await res.json();
		const article = json.data;

		if (json.status === "success" && article) {
			const title = article.title || "Artikel";
			const description =
				article.excerpt ||
				"Baca artikel dan berita sepak bola terbaru dari liga-liga top dunia di Olahbola.";

			const imagePath = article.featured_image || article.image;
			const fullImageUrl = imagePath
				? `${API_BASE_URL}/storage/${imagePath}`
				: null;

			const articleUrl = `${SITE_URL}/${slug}`;
			const ogImages = fullImageUrl
				? [
						{
							url: fullImageUrl,
							width: 1200,
							height: 630,
							alt: title,
						},
					]
				: [
						{
							url: `${SITE_URL}/og-image.png`,
							width: 1200,
							height: 630,
							alt: title,
						},
					];

			return {
				title,
				description,
				keywords: [
					article.category_name || "artikel sepak bola",
					title,
					"olahbola",
					"berita bola",
					"sepak bola indonesia",
				],
				authors: [{ name: article.author_name || "Olahbola" }],
				alternates: {
					canonical: `/${slug}`,
				},
				openGraph: {
					type: "article",
					locale: "id_ID",
					url: articleUrl,
					siteName: "Olahbolacom",
					title,
					description,
					images: ogImages,
					publishedTime: article.published_at || article.created_at,
					modifiedTime: article.updated_at,
					authors: [article.author_name || "Olahbola"],
					tags: article.tags,
				},
				twitter: {
					card: "summary_large_image",
					title,
					description,
					images: fullImageUrl
						? [fullImageUrl]
						: [`${SITE_URL}/og-image.png`],
				},
			};
		}
	} catch (error) {
		console.error("[layout metadata slug] Error:", error);
	}

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
			url: `${SITE_URL}/${slug}`,
			type: "website",
			locale: "id_ID",
			siteName: "Olahbolacom",
			images: [
				{
					url: `${SITE_URL}/og-image.png`,
					width: 1200,
					height: 630,
					alt: "Olahbola",
				},
			],
		},
		twitter: {
			card: "summary_large_image",
			title: "Artikel Tidak Ditemukan | Olahbola",
			description:
				"Artikel yang kamu cari mungkin sudah dipindahkan atau dihapus.",
			images: [`${SITE_URL}/og-image.png`],
		},
	};
}

export default function SlugLayout({ children }: { children: React.ReactNode }) {
	return children;
}
