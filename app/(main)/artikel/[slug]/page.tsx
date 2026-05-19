"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { Calendar, User, Eye, ArrowLeft, Share2, Loader2 } from "lucide-react";
import {
	useArticleDetail,
	usePopularArticles,
} from "@/hooks/queries/useArticles";
import { formatDate } from "@/lib/utils";
import {
	PopularArticleCard,
	PopularArticleCardSkeleton,
} from "@/components/article/PopularArticleCard";
import { useUIStore } from "@/stores/uiStore";
import ThemeToggle from "@/components/theme-toggle/ThemeToggle";
import { notFound } from "next/navigation";
import SeoHead from "@/components/seo/SeoHead";

export default function ArticleDetailPage() {
	const params = useParams();
	const slug = params.slug as string;
	const { theme } = useUIStore();
	const isDark = theme === "dark";
	const { data: article, isLoading, error } = useArticleDetail(slug);
	const { data: popularData, isLoading: popularLoading } = usePopularArticles();

	const [showShareMenu, setShowShareMenu] = useState(false);

	const handleShare = async () => {
		const shareData = {
			title: article?.data?.title || "Article",
			text: article?.data?.excerpt || "",
			url: window.location.href,
		};

		if (navigator.share) {
			try {
				await navigator.share(shareData);
			} catch (err) {
				console.log("Share cancelled");
			}
		} else {
			// Fallback: copy to clipboard
			await navigator.clipboard.writeText(window.location.href);
			alert("Link copied to clipboard!");
		}
		setShowShareMenu(false);
	};

	if (isLoading) {
		return (
			<div className={`min-h-screen flex items-center justify-center transition-colors duration-300 ${isDark ? "bg-[#0f1412]" : "bg-[#f5f5f5]"}`}>
				<Loader2 className={`size-10 animate-spin ${isDark ? "text-green" : "text-[#0a7c6e]"}`} />
			</div>
		);
	}

	if (error || !article?.data) {
		notFound();
		return null;
	}

	const articleData = article.data;
	const fullImageUrl = articleData.featured_image
		? `${process.env.NEXT_PUBLIC_API_URL}/storage/${articleData.featured_image}`
		: "/placeholder.png";

	return (
		<div className={`min-h-screen relative overflow-hidden transition-colors duration-300 ${isDark ? "bg-[#0f1412]" : "bg-[#f5f5f5]"}`}>
			{/* SEO Head */}
			<SeoHead
				title={articleData.title}
				description={articleData.excerpt || articleData.meta_description || ""}
				image={fullImageUrl}
				url={`/artikel/${slug}`}
				type="article"
				publishedTime={articleData.published_at || articleData.created_at}
				author={articleData.author_name}
				category={articleData.category_name}
				keywords={articleData.tags}
			/>

			{/* JSON-LD Structured Data - Inline for SSR */}
			<script
				type="application/ld+json"
				dangerouslySetInnerHTML={{
					__html: JSON.stringify({
						"@context": "https://schema.org",
						"@type": "Article",
						headline: articleData.title,
						description: articleData.excerpt || articleData.meta_description || "",
						url: `https://www.olahbola.com/artikel/${slug}`,
						datePublished: articleData.published_at || articleData.created_at,
						dateModified: articleData.published_at || articleData.created_at,
						author: {
							"@type": "Person",
							name: articleData.author_name || "Olahbola",
						},
						publisher: {
							"@type": "Organization",
							name: "Olahbola",
							logo: {
								"@type": "ImageObject",
								url: "https://www.olahbola.com/favicon.png",
							},
						},
						...(fullImageUrl && fullImageUrl !== "/placeholder.png" && {
							image: {
								"@type": "ImageObject",
								url: fullImageUrl,
								width: 1200,
								height: 630,
							},
						}),
						...(articleData.category_name && { articleSection: articleData.category_name }),
						inLanguage: "id-ID",
						mainEntityOfPage: {
							"@type": "WebPage",
							"@id": `https://www.olahbola.com/artikel/${slug}`,
						},
					}),
				}}
			/>

			{/* Theme Toggle */}
			<ThemeToggle />
			{/* Hero Banner */}
			<div className={`relative h-64 sm:h-80 md:h-[400px] lg:h-[450px] bg-cover bg-center`}>
				<div
					className="absolute inset-0 bg-cover bg-center"
					style={{ backgroundImage: `url(${fullImageUrl})` }}
				/>
				<div className={`absolute inset-0 ${isDark ? "bg-linear-to-t from-black/80 via-black/40 to-transparent" : "bg-linear-to-t from-black/60 via-black/30 to-transparent"}`} />

				{/* Back Button */}
				<Link
					href="/artikel"
					className={`absolute top-24 left-4 md:left-8 flex items-center gap-2 transition-colors z-10 ${isDark ? "text-white/80 hover:text-white" : "text-white/90 hover:text-white bg-black/20 hover:bg-black/30 rounded-lg px-2 py-1"}`}
				>
					<ArrowLeft className="size-5" />
					<span>Kembali</span>
				</Link>
			</div>

			{/* Article Content */}
			<div className="container-custom -mt-20 relative z-10">
				<div className="flex flex-col lg:flex-row gap-8">
					{/* Main Content */}
					<article className={`flex-1 rounded-xl shadow-lg p-6 md:p-10 ${isDark ? "bg-[#1c211e]" : "bg-white border border-gray-200"}`}>
						{/* Category Badge */}
						{articleData.category_name && (
							<Link
								href={`/artikel/kategori/${articleData.category_slug}`}
								className={`inline-block px-4 py-1.5 text-white text-sm font-medium rounded-full mb-4 transition-colors ${isDark ? "bg-[#E63946] hover:bg-[#d32f3e]" : "bg-[#d32f3e] hover:bg-[#c62828]"}`}
							>
								{articleData.category_name}
							</Link>
						)}

						{/* Title */}
						<h1 className={`text-2xl md:text-4xl font-bold leading-tight mb-6 notranslate ${isDark ? "text-white" : "text-[#1a1a1a]"}`}>
							{articleData.title}
						</h1>

						{/* Meta Info */}
						<div className={`flex flex-wrap items-center gap-4 md:gap-6 mb-8 pb-8 border-b ${isDark ? "text-white/60 border-white/10" : "text-[#5a5a5a] border-gray-200"}`}>
							<div className="flex items-center gap-2">
								<Calendar className={`size-4 ${isDark ? "text-[#E63946]" : "text-[#d32f3e]"}`} />
								<span className="text-sm">
									{articleData.published_at
										? formatDate(articleData.published_at)
										: articleData.created_diff}
								</span>
							</div>
							<div className="flex items-center gap-2">
								<User className={`size-4 ${isDark ? "text-[#E63946]" : "text-[#d32f3e]"}`} />
								<span className="text-sm notranslate">
									{articleData.author_name}
								</span>
							</div>
							<div className="flex items-center gap-2">
								<Eye className={`size-4 ${isDark ? "text-[#E63946]" : "text-[#d32f3e]"}`} />
								<span className="text-sm">{articleData.views} Dibaca</span>
							</div>

							{/* Share Button */}
							<div className="relative ml-auto">
								<button
									onClick={() => setShowShareMenu(!showShareMenu)}
									className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${isDark ? "bg-white/10 hover:bg-white/20 text-white" : "bg-gray-100 hover:bg-gray-200 text-gray-800"}`}
								>
									<Share2 className="size-4" />
									<span className="text-sm">Bagikan</span>
								</button>
								{showShareMenu && (
									<div className={`absolute right-0 top-full mt-2 rounded-lg shadow-lg border p-2 z-20 ${isDark ? "bg-[#1c211e] border-white/10" : "bg-white border-gray-200"}`}>
										<button
											onClick={handleShare}
											className={`flex items-center gap-2 px-4 py-2 rounded-lg w-full text-sm ${isDark ? "hover:bg-white/10 text-white" : "hover:bg-gray-100 text-gray-800"}`}
										>
											Bagikan ke...
										</button>
										<button
											onClick={() => {
												navigator.clipboard.writeText(window.location.href);
												setShowShareMenu(false);
												alert("Link copied!");
											}}
											className={`flex items-center gap-2 px-4 py-2 rounded-lg w-full text-sm ${isDark ? "hover:bg-white/10 text-white" : "hover:bg-gray-100 text-gray-800"}`}
										>
											Copy Link
										</button>
									</div>
								)}
							</div>
						</div>

						{/* Featured Image */}
						<div className={`relative w-full h-[300px] md:h-[450px] mb-8 rounded-lg overflow-hidden ${isDark ? "" : "shadow-lg"}`}>
							<img
								src={fullImageUrl}
								alt={articleData.title}
								className="w-full h-full object-cover"
							/>
						</div>

						{/* Article Body */}
						<div
							className={`max-w-none ${
								isDark
									? "text-white/80 [&_h2]:text-white [&_h3]:text-white [&_p]:text-white/80 [&_a]:text-primary [&_a]:underline hover:[&_a]:text-primary/70 [&_ul_li]:text-white/80 [&_ol_li]:text-white/80 [&_strong]:text-white [&_img]:rounded-lg [&_blockquote]:border-l-4 [&_blockquote]:border-primary/50 [&_blockquote]:pl-4 [&_blockquote]:italic"
									: "text-[#1a1a1a] [&_h2]:text-[#1a1a1a] [&_h3]:text-[#1a1a1a] [&_p]:text-[#5a5a5a] [&_a]:text-[#0a7c6e] [&_a]:underline hover:[&_a]:text-[#0a7c6e]/70 [&_ul_li]:text-[#5a5a5a] [&_ol_li]:text-[#5a5a5a] [&_strong]:text-[#1a1a1a] [&_img]:rounded-lg [&_blockquote]:border-l-4 [&_blockquote]:border-[#0a7c6e]/50 [&_blockquote]:pl-4 [&_blockquote]:italic"
							}`}
							dangerouslySetInnerHTML={{ __html: articleData.content }}
						/>
						<style jsx>{`
							.prose ul li p:first-letter {
								font-size: inherit !important;
								font-weight: inherit !important;
								float: none !important;
								color: inherit !important;
								text-shadow: none !important;
							}
						`}</style>

						{/* Article Footer */}
						<div className={`mt-10 pt-8 border-t ${isDark ? "border-white/10" : "border-gray-200"}`}>
							<div className="flex items-center justify-between">
								<div className="flex items-center gap-4">
									<img
										src={articleData.author_avatar || "/default-avatar.png"}
										alt={articleData.author_name}
										className={`w-12 h-12 rounded-full object-cover ${isDark ? "" : "border-2 border-gray-200"}`}
									/>
									<div>
										<p className={`font-medium notranslate ${isDark ? "text-white" : "text-gray-900"}`}>
											{articleData.author_name}
										</p>
										<p className={`text-sm ${isDark ? "text-white/60" : "text-gray-500"}`}>Author</p>
									</div>
								</div>
								<Link
									href="/artikel"
									className={`inline-block px-6 py-2 rounded-lg font-medium ${isDark ? "bg-[#0D645F] hover:bg-[#0a514d] text-white" : "bg-[#0a7c6e] hover:bg-[#095a50] text-white"}`}
								>
									Baca Artikel Lainnya
								</Link>
							</div>
						</div>
					</article>

					{/* Sidebar */}
					<aside className="w-full lg:w-[350px]">
						{/* Popular Articles */}
						<div className={`rounded-xl shadow-lg p-6 sticky top-[100px] ${isDark ? "bg-[#1c211e]" : "bg-white border border-gray-200"}`}>
							<h2 className={`text-lg font-bold mb-6 ${isDark ? "text-white" : "text-[#1a1a1a]"}`}>
								Artikel Populer
							</h2>
							{popularLoading ? (
								<div className="space-y-4">
									{[...Array(4)].map((_, i) => (
										<PopularArticleCardSkeleton key={i} />
									))}
								</div>
							) : (
								<div className="space-y-4">
									{popularData?.data
										?.slice(0, 5)
										.map((article: any, index: number) => (
											<PopularArticleCard
												key={article.id}
												data={article}
												index={index}
											/>
										))}
								</div>
							)}
						</div>
					</aside>
				</div>
			</div>
		</div>
	);
}
