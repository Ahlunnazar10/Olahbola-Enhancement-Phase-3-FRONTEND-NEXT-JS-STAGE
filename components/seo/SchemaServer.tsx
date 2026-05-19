import { JsonLdServer } from "./JsonLdServer";

/**
 * Organization Schema - Server Component
 */
export function OrganizationSchemaServer() {
	const schema = {
		"@context": "https://schema.org",
		"@type": "Organization",
		"@id": "https://www.olahbola.com/#organization",
		name: "Olahbola",
		description:
			"Olahbola adalah platform terbaik untuk penggemar sepak bola Indonesia. Dapatkan artikel terbaru, highlight, quiz sepak bola dan game seru lainnya.",
		url: "https://www.olahbola.com",
		logo: {
			"@type": "ImageObject",
			url: "https://www.olahbola.com/favicon.png",
			width: 512,
			height: 512,
		},
		sameAs: [
			"https://www.instagram.com/olahbolacom",
			"https://www.tiktok.com/@olahbolacom",
			"https://twitter.com/Olahbolacom",
			"https://www.youtube.com/@olahbola",
			"https://www.facebook.com/olahbolacom",
		],
		contactPoint: {
			"@type": "ContactPoint",
			contactType: "customer service",
			availableLanguage: ["Indonesian", "English"],
			url: "https://www.olahbola.com/kontak",
		},
		address: {
			"@type": "PostalAddress",
			addressCountry: "ID",
			addressLocality: "Jakarta",
			addressRegion: "DKI Jakarta",
		},
	};

	return <JsonLdServer data={schema} />;
}

/**
 * Website Schema with SearchAction - Server Component
 */
export function WebsiteSchemaServer() {
	const schema = {
		"@context": "https://schema.org",
		"@type": "WebSite",
		"@id": "https://www.olahbola.com/#website",
		url: "https://www.olahbola.com",
		name: "Olahbola | Tempatnya Penggila Bola!",
		description:
			"Platform terbaik untuk penggemar sepak bola Indonesia. Artikel terbaru, highlight, quiz, dan game seru.",
		publisher: {
			"@id": "https://www.olahbola.com/#organization",
		},
		potentialAction: {
			"@type": "SearchAction",
			target: {
				"@type": "EntryPoint",
				urlTemplate:
					"https://www.olahbola.com/artikel?q={search_term_string}",
			},
			"query-input": "required name=search_term_string",
		},
	};

	return <JsonLdServer data={schema} />;
}

/**
 * Article Schema - Server Component
 */
export function ArticleSchemaServer({
	title,
	description,
	slug,
	author,
	publishedAt,
	image,
	category,
}: {
	title: string;
	description: string;
	slug: string;
	author: string;
	publishedAt: string;
	image?: string;
	category?: string;
}) {
	const schema = {
		"@context": "https://schema.org",
		"@type": "Article",
		headline: title,
		description: description,
		url: `https://www.olahbola.com/artikel/${slug}`,
		datePublished: publishedAt,
		dateModified: publishedAt,
		author: {
			"@type": "Person",
			name: author,
			url: "https://www.olahbola.com",
		},
		publisher: {
			"@id": "https://www.olahbola.com/#organization",
		},
		...(image && {
			image: {
				"@type": "ImageObject",
				url: image,
				width: 1200,
				height: 630,
			},
		}),
		...(category && { articleSection: category }),
		keywords: [category, "sepak bola", "bola", "berita bola", "artikel bola"].filter(Boolean),
		inLanguage: "id-ID",
		mainEntityOfPage: {
			"@type": "WebPage",
			"@id": `https://www.olahbola.com/artikel/${slug}`,
		},
	};

	return <JsonLdServer data={schema} />;
}

/**
 * Breadcrumb Schema - Server Component
 */
export function BreadcrumbSchemaServer({
	items,
}: {
	items: Array<{ name: string; url: string }>;
}) {
	const schema = {
		"@context": "https://schema.org",
		"@type": "BreadcrumbList",
		itemListElement: items.map((item, index) => ({
			"@type": "ListItem",
			position: index + 1,
			name: item.name,
			item: item.url,
		})),
	};

	return <JsonLdServer data={schema} />;
}

/**
 * Video Schema - Server Component
 */
export function VideoSchemaServer({
	title,
	description,
	thumbnailUrl,
	uploadDate,
	duration,
}: {
	title: string;
	description: string;
	thumbnailUrl: string;
	uploadDate: string;
	duration?: string;
}) {
	const schema = {
		"@context": "https://schema.org",
		"@type": "VideoObject",
		name: title,
		description: description,
		thumbnailUrl: thumbnailUrl,
		uploadDate: uploadDate,
		contentUrl: "https://www.olahbola.com",
		embedUrl: "https://www.olahbola.com",
		...(duration && { duration: duration }),
		publisher: {
			"@type": "Organization",
			name: "Olahbola",
			logo: {
				"@type": "ImageObject",
				url: "https://www.olahbola.com/favicon.png",
			},
		},
	};

	return <JsonLdServer data={schema} />;
}