"use client";

import { useEffect } from "react";

/**
 * SEO Utility Functions
 * Helps with page tracking, structured data, and SEO optimizations
 */

// Track custom events
export function trackEvent(
	eventName: string,
	params?: Record<string, string | number | boolean>,
) {
	if (typeof window !== "undefined" && (window as any).gtag) {
		(window as any).gtag("event", eventName, {
			...params,
		});
	}
}

// Track search events
export function trackSearch(searchTerm: string, resultCount?: number) {
	trackEvent("search", {
		search_term: searchTerm,
		number_of_results: resultCount || 0,
	});
}

// Track content engagement
export function trackEngagement(
	contentType: "article" | "video" | "quiz" | "interview",
	contentId: string,
	action: "view" | "share" | "bookmark" | "comment",
) {
	trackEvent("content_engagement", {
		content_type: contentType,
		content_id: contentId,
		action: action,
	});
}

// Track game/quiz interactions
export function trackGameInteraction(
	gameName: string,
	action: "start" | "complete" | "score",
	value?: number,
) {
	trackEvent("game_interaction", {
		game_name: gameName,
		action: action,
		value: value || 0,
	});
}

export function useTimeOnPage(onLeave?: (timeSpent: number) => void) {
	useEffect(() => {
		const startTime = Date.now();

		const handleVisibilityChange = () => {
			if (document.visibilityState === "hidden") {
				const timeSpent = Math.round((Date.now() - startTime) / 1000);
				if (onLeave) {
					onLeave(timeSpent);
				}
				trackEvent("time_on_page", {
					time_seconds: timeSpent,
					time_formatted: formatTime(timeSpent),
				});
			}
		};

		document.addEventListener("visibilitychange", handleVisibilityChange);
		return () => {
			document.removeEventListener("visibilitychange", handleVisibilityChange);
		};
	}, [onLeave]);
}

// Helper function to format time
function formatTime(seconds: number): string {
	const minutes = Math.floor(seconds / 60);
	const secs = seconds % 60;
	if (minutes > 0) {
		return `${minutes}m ${secs}s`;
	}
	return `${secs}s`;
}

/**
 * SEO Helper Functions
 */

// Generate meta description from content
export function generateMetaDescription(content: string, maxLength = 160): string {
	// Remove HTML tags
	const plainText = content.replace(/<[^>]*>/g, "").trim();

	// Truncate to max length
	if (plainText.length <= maxLength) {
		return plainText;
	}

	// Cut at word boundary
	const truncated = plainText.substring(0, maxLength);
	const lastSpace = truncated.lastIndexOf(" ");

	return (lastSpace > 0 ? truncated.substring(0, lastSpace) : truncated) + "...";
}

// Generate slug from title
export function generateSlug(title: string): string {
	return title
		.toLowerCase()
		.replace(/[^a-z0-9]+/g, "-")
		.replace(/^-|-$/g, "");
}

// Calculate reading time
export function calculateReadingTime(content: string): number {
	const wordsPerMinute = 200;
	const plainText = content.replace(/<[^>]*>/g, "").trim();
	const wordCount = plainText.split(/\s+/).length;
	return Math.ceil(wordCount / wordsPerMinute);
}

/**
 * Structured Data Helpers
 */

// Create Article structured data
export function createArticleSchema(params: {
	title: string;
	description: string;
	slug: string;
	author: string;
	publishedAt: string;
	updatedAt?: string;
	image?: string;
	category?: string;
}) {
	return {
		"@context": "https://schema.org",
		"@type": "Article",
		headline: params.title,
		description: params.description,
		url: `https://www.olahbola.com/artikel/${params.slug}`,
		datePublished: params.publishedAt,
		dateModified: params.updatedAt || params.publishedAt,
		author: {
			"@type": "Person",
			name: params.author,
		},
		publisher: {
			"@type": "Organization",
			name: "Olahbola",
			logo: {
				"@type": "ImageObject",
				url: "https://www.olahbola.com/favicon.png",
			},
		},
		image: params.image
			? {
					"@type": "ImageObject",
					url: params.image,
					width: 1200,
					height: 630,
				}
			: undefined,
		articleSection: params.category,
		inLanguage: "id-ID",
		mainEntityOfPage: {
			"@type": "WebPage",
			"@id": `https://www.olahbola.com/artikel/${params.slug}`,
		},
	};
}

// Create Breadcrumb structured data
export function createBreadcrumbSchema(items: Array<{ name: string; url: string }>) {
	return {
		"@context": "https://schema.org",
		"@type": "BreadcrumbList",
		itemListElement: items.map((item, index) => ({
			"@type": "ListItem",
			position: index + 1,
			name: item.name,
			item: item.url,
		})),
	};
}

// Create FAQ structured data
export function createFaqSchema(faqs: Array<{ question: string; answer: string }>) {
	return {
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
}

/**
 * Open Graph Image Helper
 */
export function getOgImage(imageUrl?: string): string {
	const baseUrl = "https://www.olahbola.com";
	const defaultImage = "/og-image.svg";

	if (!imageUrl) return `${baseUrl}${defaultImage}`;
	if (imageUrl.startsWith("http")) return imageUrl;
	return `${baseUrl}${imageUrl}`;
}

/**
 * hreflang Helper
 */
export function getHreflangLinks(locales: string[]) {
	return locales.map((locale) => ({
		rel: "alternate",
		hreflang: locale,
		href: `https://www.olahbola.com${locale === "id" ? "" : `/${locale}`}`,
	}));
}