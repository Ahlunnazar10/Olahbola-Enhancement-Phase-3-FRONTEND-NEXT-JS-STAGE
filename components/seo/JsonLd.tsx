"use client";

import { useEffect, useState } from "react";

interface JsonLdProps {
	data: object;
}

export default function JsonLd({ data }: JsonLdProps) {
	const [mounted, setMounted] = useState(false);

	useEffect(() => {
		setMounted(true);
	}, []);

	if (!mounted) {
		return null;
	}

	return (
		<script
			type="application/ld+json"
			dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
		/>
	);
}

// Organization Schema
export function OrganizationSchema() {
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

	return <JsonLd data={schema} />;
}

// Website Schema
export function WebsiteSchema() {
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
					"https://www.olahbola.com/search?q={search_term_string}",
			},
			"query-input": "required name=search_term_string",
		},
	};

	return <JsonLd data={schema} />;
}

// Article Schema for Blog Posts
export function ArticleSchema({
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
		image: image
			? {
					"@type": "ImageObject",
					url: image,
					width: 1200,
					height: 630,
				}
			: undefined,
		articleSection: category,
		keywords: [category, "sepak bola", "bola", "berita bola", "artikel bola"],
		inLanguage: "id-ID",
		mainEntityOfPage: {
			"@type": "WebPage",
			"@id": `https://www.olahbola.com/artikel/${slug}`,
		},
	};

	return <JsonLd data={schema} />;
}

// Breadcrumb Schema
export function BreadcrumbSchema({
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

	return <JsonLd data={schema} />;
}

// FAQ Schema
export function FAQSchema({ faqs }: { faqs: Array<{ question: string; answer: string }> }) {
	const schema = {
		"@context": "https://schema.org",
		"@type": "FAQPage",
		mainEntity: faqs.map((faq) => ({
			"@type": "Question",
			name: faq.question,
			acceptedAnswer: {
				"@type": "Answer",
				text: faq.answer,
			},
		})),
	};

	return <JsonLd data={schema} />;
}

// Local Business Schema (for Indonesian audience)
export function LocalBusinessSchema() {
	const schema = {
		"@context": "https://schema.org",
		"@type": "LocalBusiness",
		"@id": "https://www.olahbola.com/#localbusiness",
		name: "Olahbola",
		description:
			"Platform konten sepak bola untuk penggemar bola Indonesia",
		url: "https://www.olahbola.com",
		telephone: "+62-21-1234-5678",
		email: "hello@olahbola.com",
		address: {
			"@type": "PostalAddress",
			addressLocality: "Jakarta",
			addressRegion: "DKI Jakarta",
			addressCountry: "ID",
		},
		geo: {
			"@type": "GeoCoordinates",
			latitude: "-6.2088",
			longitude: "106.8456",
		},
		openingHoursSpecification: {
			"@type": "OpeningHoursSpecification",
			dayOfWeek: [
				"Monday",
				"Tuesday",
				"Wednesday",
				"Thursday",
				"Friday",
				"Saturday",
				"Sunday",
			],
			opens: "00:00",
			closes: "23:59",
		},
		sameAs: [
			"https://www.instagram.com/olahbolacom",
			"https://www.tiktok.com/@olahbolacom",
			"https://twitter.com/Olahbolacom",
		],
	};

	return <JsonLd data={schema} />;
}

// Video Schema for Interview/Highlight content
export function VideoSchema({
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
		duration: duration,
		publisher: {
			"@id": "https://www.olahbola.com/#organization",
		},
	};

	return <JsonLd data={schema} />;
}

// Sports Event Schema (for quiz/games)
export function SportsEventSchema({
	name,
	description,
	startDate,
	endDate,
	location,
	organizer,
}: {
	name: string;
	description: string;
	startDate: string;
	endDate?: string;
	location?: string;
	organizer?: string;
}) {
	const schema = {
		"@context": "https://schema.org",
		"@type": "SportsEvent",
		name: name,
		description: description,
		startDate: startDate,
		endDate: endDate,
		location: location
			? {
					"@type": "Place",
					name: location,
				}
			: undefined,
		organizer: organizer
			? {
					"@type": "Organization",
					name: organizer,
				}
			: undefined,
	};

	return <JsonLd data={schema} />;
}