"use client";

import { useEffect } from "react";

/**
 * SEO Head Component
 * Handles meta tags, structured data, and SEO optimizations
 */
interface SeoHeadProps {
	title?: string;
	description?: string;
	keywords?: string[];
	image?: string;
	url?: string;
	type?: "website" | "article";
	publishedTime?: string;
	author?: string;
	category?: string;
	noIndex?: boolean;
}

export default function SeoHead({
	title,
	description,
	keywords = [],
	image,
	url,
	type = "website",
	publishedTime,
	author,
	category,
	noIndex = false,
}: SeoHeadProps) {
	const baseUrl = "https://www.olahbola.com";
	const defaultImage = "/og-image.svg";
	const fullImage = image?.startsWith("http")
		? image
		: image
			? `${baseUrl}${image}`
			: `${baseUrl}${defaultImage}`;
	const fullUrl = url ? `${baseUrl}${url}` : baseUrl;
	const siteName = "Olahbolacom";

	return (
		<>
			{/* Primary Meta Tags */}
			<meta name="title" content={title || "Olahbola | Tempatnya Penggila Bola!"} />
			<meta
				name="description"
				content={
					description ||
					"Olahbola adalah platform terbaik untuk penggemar sepak bola Indonesia. Dapatkan artikel terbaru, highlight, quiz sepak bola dan game seru lainnya."
				}
			/>
			{keywords.length > 0 && (
				<meta name="keywords" content={keywords.join(", ")} />
			)}

			{/* Open Graph / Facebook */}
			<meta property="og:type" content={type} />
			<meta property="og:url" content={fullUrl} />
			<meta
				property="og:title"
				content={title || "Olahbola | Tempatnya Penggila Bola!"}
			/>
			<meta
				property="og:description"
				content={
					description ||
					"Olahbola adalah platform terbaik untuk penggemar sepak bola Indonesia."
				}
			/>
			<meta property="og:image" content={fullImage} />
			<meta property="og:image:width" content="1200" />
			<meta property="og:image:height" content="630" />
			<meta property="og:image:alt" content={title || "Olahbola"} />
			<meta property="og:site_name" content={siteName} />
			<meta property="og:locale" content="id_ID" />

			{/* Article specific Open Graph */}
			{type === "article" && publishedTime && (
				<>
					<meta property="article:published_time" content={publishedTime} />
					{author && <meta property="article:author" content={author} />}
					{category && <meta property="article:section" content={category} />}
					{keywords.map((keyword, i) => (
						<meta key={i} property="article:tag" content={keyword} />
					))}
				</>
			)}

			{/* Twitter */}
			<meta name="twitter:card" content="summary_large_image" />
			<meta
				name="twitter:title"
				content={title || "Olahbola | Tempatnya Penggila Bola!"}
			/>
			<meta
				name="twitter:description"
				content={
					description ||
					"Olahbola adalah platform terbaik untuk penggemar sepak bola Indonesia."
				}
			/>
			<meta name="twitter:image" content={fullImage} />
			<meta name="twitter:site" content="@Olahbolacom" />
			<meta name="twitter:creator" content="@Olahbolacom" />

			{/* Canonical URL */}
			<link rel="canonical" href={fullUrl} />

			{/* Language */}
			<meta name="language" content="Indonesian" />
			<meta name="geo.region" content="ID" />
			<meta name="geo.placename" content="Indonesia" />

			{/* Robots */}
			{noIndex ? (
				<meta name="robots" content="noindex, nofollow" />
			) : (
				<meta
					name="robots"
					content="index, follow, max-snippet:-1, max-image-preview:large, max-video-preview:-1"
				/>
			)}

			{/* Additional SEO */}
			<meta name="author" content={author || "Olahbola"} />
			<meta name="publisher" content="Olahbola" />
			<meta name="revisit-after" content="7 days" />

			{/* Mobile */}
			<meta name="format-detection" content="telephone=no" />
			<meta name="mobile-web-app-capable" content="yes" />
			<meta name="apple-mobile-web-app-capable" content="yes" />
			<meta name="apple-mobile-web-app-status-bar-style" content="default" />
		</>
	);
}

/**
 * Google Search Console Verification Meta Tag
 * Add this to your page head to verify ownership
 */
export function GoogleSearchConsoleVerification() {
	return (
		<meta
			name="google-site-verification"
			content="YOUR_VERIFICATION_CODE_HERE" // Replace with your actual verification code
		/>
	);
}

/**
 * Bing Webmaster Verification Meta Tag
 */
export function BingVerification() {
	return (
		<meta name="msvalidate.01" content="YOUR_BING_VERIFICATION_CODE" />
	);
}

/**
 * Yandex Verification Meta Tag
 */
export function YandexVerification() {
	return <meta name="yandex-verification" content="YOUR_YANDEX_CODE" />;
}

/**
 * Track page view for Google Analytics
 * Call this on route changes
 */
export function trackPageViewGA(pagePath: string) {
	if (typeof window !== "undefined" && (window as any).gtag) {
		(window as any).gtag("config", process.env.NEXT_PUBLIC_GA_ID, {
			page_path: pagePath,
		});
	}
}

/**
 * SEO Performance Monitor
 * Helps track Core Web Vitals
 */
export function useSeoPerformance() {
	useEffect(() => {
		// Report Core Web Vitals to GA4
		if (typeof window !== "undefined") {
			const reportWebVitals = ({ name, delta, id }: any) => {
				if ((window as any).gtag) {
					(window as any).gtag("event", name, {
						event_category: "Web Vitals",
						event_label: id,
						value: Math.round(name === "CLS" ? delta * 1000 : delta),
						non_interaction: true,
					});
				}
			};

			// Listen for Web Vitals
			const observer = new PerformanceObserver((list) => {
				list.getEntries().forEach((entry: any) => {
					if (entry.entryType === "navigation") {
						// Page load metrics
						const loadTime = entry.responseStart - entry.requestStart;
						const ttfb = entry.responseStart - entry.requestStart;

						if ((window as any).gtag && loadTime > 0) {
							(window as any).gtag("event", "page_load", {
								event_category: "Performance",
								event_label: "TTFB",
								value: Math.round(ttfb),
								non_interaction: true,
							});
						}
					}
				});
			});

			try {
				observer.observe({ type: "navigation", buffered: true });
			} catch (e) {
				// Observer not supported
			}
		}
	}, []);
}