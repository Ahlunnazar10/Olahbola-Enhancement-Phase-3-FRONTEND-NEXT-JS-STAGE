"use client";

import { useEffect, useRef } from "react";
import { Icon } from "@/components/ui/Icon";
import Link from "next/link";
import { useParams } from "next/navigation";
import { formatDate } from "@/lib/utils";
import { PopularArticleCardSkeleton } from "@/components/article/PopularArticleCard";
import {
	useArticleDetail,
	usePopularArticles,
	useRelatedArticles,
} from "@/hooks/queries/useArticles";
import { useUIStore } from "@/stores/uiStore";
import ThemeToggle from "@/components/theme-toggle/ThemeToggle";
import { notFound } from "next/navigation";

export default function ArticleDetailPage() {
	const params = useParams();
	const slug = params.slug as string;
	const { theme } = useUIStore();
	const isDark = theme === "dark";
	const { data: article, isLoading, error } = useArticleDetail(slug);
	const { data: popularData, isLoading: popularLoading } = usePopularArticles();
	const contentRef = useRef<HTMLDivElement>(null);

	// Get related articles based on same category
	const categorySlug = article?.data?.category_slug;
	const { data: relatedData } = useRelatedArticles(categorySlug || "", slug, 4);

	// Load social media embeds after content is rendered
	useEffect(() => {
		if (!article?.data?.content || !contentRef.current) return;

		const container = contentRef.current;

		const loadInstagramEmbeds = (retryCount = 0) => {
			const maxRetries = 5;
			const delays = [500, 1000, 2000, 3000, 4000];

			if (window.instgrm) {
				window.instgrm?.Embeds?.process();
				fixInstagramIframeHeight();
				return true;
			}

			if (!document.querySelector('script[src*="instagram.com/embed.js"]')) {
				const instagramScript = document.createElement("script");
				instagramScript.src = "https://www.instagram.com/embed.js";
				instagramScript.async = true;
				instagramScript.onload = () => {
					if (window.instgrm) {
						window.instgrm?.Embeds?.process();
						fixInstagramIframeHeight();
					}
				};
				document.head.appendChild(instagramScript);
			}

			if (retryCount < maxRetries) {
				setTimeout(() => {
					if (window.instgrm) {
						window.instgrm?.Embeds?.process();
						fixInstagramIframeHeight();
					} else {
						loadInstagramEmbeds(retryCount + 1);
					}
				}, delays[retryCount]);
			}
			return false;
		};

		const fixInstagramIframeHeight = () => {
			if (!container) return;
			const instagrams = container.querySelectorAll(
				"blockquote.instagram-media, .instagram-media, iframe[src*='instagram.com']",
			);
			instagrams.forEach((el) => {
				const iframe = el as HTMLIFrameElement;
				iframe.style.setProperty("height", "auto", "important");
				iframe.style.minHeight = "100%";
				iframe.style.maxHeight = "none";
				iframe.removeAttribute("height");
				try {
					const doc = iframe.contentDocument;
					if (doc && doc.body) {
						doc.body.style.height = "auto";
					}
				} catch (e) {
					// cross-origin, can't access
				}
			});
		};

		const loadFacebookEmbeds = (retryCount = 0) => {
			const maxRetries = 5;
			const delays = [500, 1000, 2000, 3000, 4000];

			if (window.FB) {
				window.FB?.XFBML?.parse();
				return true;
			}

			(window as any).fbAsyncInit = function () {
				if (window.FB) {
					window.FB?.init?.({
						xfbml: true,
						version: "v17.0",
					});
					window.FB?.XFBML?.parse();
				}
			};

			if (!document.querySelector('script[src*="connect.facebook.net"]')) {
				const facebookScript = document.createElement("script");
				facebookScript.src =
					"https://connect.facebook.net/en_US/sdk.js#xfbml=1&version=v17.0";
				facebookScript.async = true;
				facebookScript.defer = true;
				facebookScript.crossOrigin = "anonymous";
				document.head.appendChild(facebookScript);
			}

			if (retryCount < maxRetries) {
				setTimeout(() => {
					if (window.FB) {
						window.FB?.XFBML?.parse();
					} else {
						loadFacebookEmbeds(retryCount + 1);
					}
				}, delays[retryCount]);
			}
			return false;
		};

		const loadTwitterEmbeds = (retryCount = 0) => {
			const maxRetries = 5;
			const delays = [500, 1000, 2000, 3000, 4000];

			if (window.twttr) {
				window.twttr?.widgets?.load();
				return true;
			}

			if (!document.querySelector('script[src*="platform.twitter.com"]')) {
				const twitterScript = document.createElement("script");
				twitterScript.src = "https://platform.twitter.com/widgets.js";
				twitterScript.async = true;
				twitterScript.onload = () => {
					if (window.twttr) {
						window.twttr?.widgets?.load();
					}
				};
				document.head.appendChild(twitterScript);
			}

			if (retryCount < maxRetries) {
				setTimeout(() => {
					if (window.twttr) {
						window.twttr?.widgets?.load();
					} else {
						loadTwitterEmbeds(retryCount + 1);
					}
				}, delays[retryCount]);
			}
			return false;
		};

		loadInstagramEmbeds();
		loadFacebookEmbeds();
		loadTwitterEmbeds();

		[1000, 2000, 3000, 4000, 5000].forEach((delay) => {
			setTimeout(() => {
				loadInstagramEmbeds();
				loadTwitterEmbeds();
			}, delay);
		});

		setTimeout(() => {
			loadFacebookEmbeds();
		}, 1500);

		const observer = new MutationObserver(() => {
			if (container.querySelector(".instagram-embed, .instagram-media")) {
				loadInstagramEmbeds();
			}
			if (container.querySelector(".twitter-embed, .twitter-tweet")) {
				loadTwitterEmbeds();
			}
			if (container.querySelector(".fb-post, .fb-video, .fb-page")) {
				loadFacebookEmbeds();
			}
		});

		observer.observe(container, { childList: true, subtree: true });

		return () => observer.disconnect();
	}, [article?.data?.content]);

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
			await navigator.clipboard.writeText(window.location.href);
			alert("Link copied to clipboard!");
		}
	};

	if (isLoading) {
		return (
			<div className={`min-h-screen flex items-center justify-center transition-colors duration-300 ${isDark ? "bg-[#0f1412]" : "bg-[#f5f5f5]"}`}>
				<div className={`w-10 h-10 rounded-full border-2 animate-spin ${isDark ? "border-primary/30 border-t-primary" : "border-[#0a7c6e]/30 border-t-[#0a7c6e]"}`} />
			</div>
		);
	}

	if (error || !article?.data) {
		notFound();
		return null;
	}

	const articleData = article.data;
	const fullImageUrl = articleData.image
		? `${process.env.NEXT_PUBLIC_API_URL}/storage/${articleData.image}`
		: "/placeholder.png";

	const relatedArticles = relatedData?.data || [];

	// Define color variables based on theme
	const colors = isDark ? {
		contentBg: "#1c211e",
		contentText: "#dfe4e0",
		contentTextSecondary: "#dfe4e0cc",
		primary: "#00c2b1",
		primaryLight: "#43decc",
		headingColor: "#00c2b1",
		linkColor: "#43decc",
		shadowColor: "rgba(0, 0, 0, 0.4)",
		borderColor: "rgba(255, 255, 255, 0.08)",
		tableHeaderBg: "linear-gradient(135deg, #00c2b1, #43decc)",
		tableHeaderText: "#003732",
		listBullet: "#00c2b1",
		codeBg: "rgba(0, 194, 177, 0.1)",
		codeBorder: "rgba(0, 194, 177, 0.2)",
		codeText: "#43decc",
		preBg: "#0a0f0d",
		hrColor: "rgba(0, 194, 177, 0.4)",
		overlay: "from-[#0f1412] to-transparent",
		cardBg: "rgba(255, 255, 255, 0.05)",
		cardBorder: "rgba(255, 255, 255, 0.1)",
	} : {
		contentBg: "#ffffff",
		contentText: "#1a1a1a",
		contentTextSecondary: "#5a5a5a",
		primary: "#0a7c6e",
		primaryLight: "#43decc",
		headingColor: "#0a7c6e",
		linkColor: "#0a7c6e",
		shadowColor: "rgba(0, 0, 0, 0.1)",
		borderColor: "rgba(0, 0, 0, 0.08)",
		tableHeaderBg: "linear-gradient(135deg, #0a7c6e, #43decc)",
		tableHeaderText: "#ffffff",
		listBullet: "#0a7c6e",
		codeBg: "rgba(10, 124, 110, 0.1)",
		codeBorder: "rgba(10, 124, 110, 0.2)",
		codeText: "#0a7c6e",
		preBg: "#f5f5f5",
		hrColor: "rgba(10, 124, 110, 0.4)",
		overlay: "from-[#f5f5f5] to-transparent",
		cardBg: "rgba(255, 255, 255, 0.9)",
		cardBorder: "rgba(0, 0, 0, 0.08)",
	};

	return (
		<div className={`min-h-screen relative overflow-hidden transition-colors duration-300 ${isDark ? "bg-[#0f1412] text-white" : "bg-[#f5f5f5] text-[#1a1a1a]"}`}>
			{/* Theme Toggle */}
			<ThemeToggle />

			{/* Hero Banner - Image Only */}
			<section className={`relative w-full h-[55vh] overflow-hidden`}>
				<div
					className={`absolute inset-0 bg-cover bg-top ${isDark ? "grayscale-[0.2] brightness-75" : "grayscale-[0.1] brightness-90"}`}
					style={{ backgroundImage: `url(${fullImageUrl})` }}
				/>

				{/* Back Button */}
				<div className="absolute top-24 left-4 md:left-8 z-30">
					<Link
						href="/artikel"
						className={`flex items-center gap-2 px-4 py-2 backdrop-blur-sm rounded-lg transition-all text-sm font-bold uppercase tracking-widest ${isDark ? "bg-black/40 hover:bg-black/60 text-white/80 hover:text-white" : "bg-white/40 hover:bg-white/60 text-[#1a1a1a]/80 hover:text-[#1a1a1a]"}`}
					>
						<Icon name="arrow_back" />
						<span>Back</span>
					</Link>
				</div>

				{/* Decorative gradient overlay at bottom */}
				<div className={`absolute bottom-0 left-0 right-0 h-32 z-10 bg-linear-to-t ${colors.overlay}`} />
			</section>

			{/* Content Layer */}
			<section className={`relative z-30 -mt-1 px-6 md:px-12 pb-24 max-w-screen-2xl mx-auto`}>
				<div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
					{/* Main Article Body */}
					<article className="lg:col-span-8">
						{/* Glass Article Header */}
						<div className={`p-8 md:p-10 rounded-xl mb-8 transition-all duration-300 ${isDark ? "glass-panel shadow-2xl" : "bg-white shadow-lg border border-gray-200"}`}>
							{/* Category Badge */}
							{articleData.category_name && (
								<Link
									href={`/artikel?kategori=${articleData.category_slug}`}
									className={`inline-flex items-center gap-2 px-4 py-1.5 font-bold text-xs rounded-full mb-6 uppercase tracking-widest hover:opacity-90 transition-opacity ${isDark ? "bg-[#E63946] text-white" : "bg-[#d32f3e] text-white"}`}
								>
									<span className={`w-2 h-2 rounded-full animate-pulse ${isDark ? "bg-white" : "bg-white"}`} />
									{articleData.category_name}
								</Link>
							)}

							{/* Title */}
							<h1 className={`text-2xl md:text-5xl font-black italic uppercase mb-6 leading-tight tracking-tight ${isDark ? "text-white" : "text-[#1a1a1a]"}`}>
								{articleData.title}
							</h1>

							{/* Meta Info */}
							<div className={`flex flex-wrap items-center gap-6 font-bold text-sm uppercase tracking-widest pb-6 border-b ${isDark ? "text-white/50 border-white/10" : "text-[#5a5a5a] border-gray-200"}`}>
								<span className="flex items-center gap-2">
									<Icon name="calendar_today" size={20} />
									{articleData.published_at
										? formatDate(articleData.published_at)
										: articleData.created_diff}
								</span>
								<span className="flex items-center gap-2">
									<Icon name="visibility" size={20} />
									{articleData.views} Views
								</span>
								<span className="flex items-center gap-2">
									<Icon name="person" size={20} />
									{articleData.author_name}
								</span>
							</div>

							{/* Share buttons inline with meta */}
							<div className="flex items-center gap-3 mt-4">
								<span className={`font-bold text-xs uppercase tracking-widest mr-2 ${isDark ? "text-white/30" : "text-gray-400"}`}>
									Share:
								</span>
								<button
									onClick={handleShare}
									className={`w-9 h-9 rounded-full flex items-center justify-center transition-all ${isDark ? "border border-white/10 hover:bg-primary hover:text-on-primary hover:border-primary" : "border border-gray-200 hover:bg-[#0a7c6e] hover:text-white hover:border-[#0a7c6e]"}`}
									title="Share"
								>
									<Icon name="share" size={18} />
								</button>
								<button
									onClick={() => {
										navigator.clipboard.writeText(window.location.href);
										alert("Link copied!");
									}}
									className={`w-9 h-9 rounded-full flex items-center justify-center transition-all ${isDark ? "border border-white/10 hover:bg-primary hover:text-on-primary hover:border-primary" : "border border-gray-200 hover:bg-[#0a7c6e] hover:text-white hover:border-[#0a7c6e]"}`}
									title="Copy Link"
								>
									<Icon name="link" size={18} />
								</button>
							</div>
						</div>

						{/* Article Content */}
						<div
							ref={contentRef}
							className={`article-content p-8 md:p-10 rounded-xl shadow-2xl ${isDark ? "glass-panel" : "bg-white shadow-lg border border-gray-200"}`}
							dangerouslySetInnerHTML={{
								__html: articleData.content,
							}}
						/>

						{/* Related Articles (Inside Main Content) */}
						{relatedArticles.length > 0 && (
							<div className="mt-12">
								<h2 className={`text-2xl md:text-3xl font-black italic uppercase mb-8 tracking-tighter flex items-center gap-3 ${isDark ? "text-white" : "text-[#1a1a1a]"}`}>
									Artikel
									<span className={isDark ? "text-primary" : "text-[#0a7c6e]"}>Terbaru</span>
								</h2>
								<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
									{relatedArticles.slice(0, 4).map((item: any) => (
										<Link
											key={item.id}
											href={`/${item.slug}`}
											className={`rounded-xl overflow-hidden group transition-all ${isDark ? "glass-panel hover:neon-border-glow" : "bg-white shadow-lg border border-gray-200 hover:shadow-xl hover:border-[#0a7c6e]/30"}`}
										>
											<div className="relative h-55 overflow-hidden">
												<img
													src={`${process.env.NEXT_PUBLIC_API_URL}/storage/${item.image}`}
													alt={item.title}
													className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
												/>
												<div className="absolute inset-0 bg-linear-to-t from-black/60 to-transparent" />
											</div>
											<div className="p-5">
												<h4 className={`text-base font-bold group-hover:${isDark ? "text-primary" : "text-[#0a7c6e]"} transition-colors leading-snug line-clamp-2 ${isDark ? "text-white" : "text-[#1a1a1a]"}`}>
													{item.title}
												</h4>
												<div className={`flex items-center gap-3 text-xs font-bold uppercase tracking-widest mt-3 ${isDark ? "text-white/40" : "text-[#5a5a5a]"}`}>
													<span className="flex items-center gap-1">
														<Icon name="schedule" />
														{item.created_diff}
													</span>
												</div>
											</div>
										</Link>
									))}
								</div>
							</div>
						)}
					</article>

					{/* Sidebar - Sticky/Float */}
					<aside className="lg:col-span-4">
						<div className="sticky top-5 space-y-6">
							{/* Popular Articles */}
							<div className={`p-6 rounded-xl transition-all duration-300 ${isDark ? "glass-panel border border-white/5" : "bg-white shadow-lg border border-gray-200"}`}>
								<h3 className={`text-lg font-black italic uppercase mb-6 flex items-center gap-2 ${isDark ? "text-white" : "text-[#1a1a1a]"}`}>
									<Icon name="trending_up" />
									Artikel Populer
								</h3>
								{popularLoading ? (
									<div className="space-y-4">
										{[...Array(4)].map((_, i) => (
											<PopularArticleCardSkeleton key={i} />
										))}
									</div>
								) : (
									<div className="space-y-5">
										{popularData?.data
											?.slice(0, 5)
											.map((item: any, index: number) => (
												<Link
													key={item.id}
													href={`/${item.slug}`}
													className="group block"
												>
													<div className="flex gap-4">
														<span className={`text-3xl font-black italic opacity-40 group-hover:opacity-100 transition-opacity leading-none mt-1 shrink-0 ${isDark ? "bg-clip-text bg-linear-to-b from-primary to-transparent text-transparent" : "bg-clip-text bg-linear-to-b from-[#0a7c6e] to-transparent text-transparent"}`}>
															{String(index + 1).padStart(2, "0")}
														</span>
														<div className="min-w-0">
															<h4 className={`font-bold text-sm group-hover:${isDark ? "text-primary" : "text-[#0a7c6e]"} transition-colors line-clamp-2 leading-snug ${isDark ? "text-white" : "text-[#1a1a1a]"}`}>
																{item.title}
															</h4>
															<p className={`text-[10px] mt-1.5 uppercase tracking-widest font-bold flex items-center gap-1 ${isDark ? "text-white/40" : "text-[#5a5a5a]"}`}>
																<Icon name="visibility" />
																{item.views} Views
															</p>
														</div>
													</div>
												</Link>
											))}
									</div>
								)}
							</div>

							{/* Newsletter / CTA Card */}
							<div className={`rounded-xl overflow-hidden transition-all ${isDark ? "glass-panel border border-primary/20" : "bg-white shadow-lg border border-[#0a7c6e]/20"}`}>
								<div className="relative aspect-4/3 overflow-hidden">
									<div className={`absolute inset-0 ${isDark ? "bg-linear-to-br from-primary/30 to-[#E63946]/20" : "bg-linear-to-br from-[#0a7c6e]/20 to-[#d32f3e]/10"}`} />
									<div className={`absolute inset-0 flex flex-col justify-center items-center text-center p-6 ${isDark ? "" : "bg-linear-to-br from-white to-gray-50"}`}>
										<Icon name="bolt" size={40} />
										<h3 className={`text-xl font-black italic uppercase mb-2 ${isDark ? "text-white" : "text-[#1a1a1a]"}`}>
											Stay Updated
										</h3>
										<p className={`text-xs mb-4 leading-relaxed ${isDark ? "text-white/60" : "text-[#5a5a5a]"}`}>
											Dapatkan artikel terbaru langsung ke inbox kamu.
										</p>
										<button className={`w-full py-3 font-black uppercase tracking-widest text-xs rounded-lg transition-colors ${isDark ? "bg-primary text-on-primary hover:bg-primary/80" : "bg-[#0a7c6e] text-white hover:bg-[#095a50]"}`}>
											Subscribe For Free
										</button>
									</div>
								</div>
							</div>

							{/* Promo Section */}
							<div className={`h-fit rounded-2xl overflow-hidden group shadow-2xl ${isDark ? "" : "shadow-lg"}`}>
								<a href="https://www.igvault.id/home">
									<img
										className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-[2s]"
										src="/images/article/ads-sidebar.webp"
										alt="Promo"
									/>
								</a>
							</div>
						</div>
					</aside>
				</div>
			</section>

			<style jsx global>{`
				/* ===== Enhanced Article Content Styles ===== */
				.article-content {
					font-size: 17px;
					line-height: 1.85;
					color: ${colors.contentText};
				}

				/* Paragraphs */
				.article-content p {
					margin-bottom: 1.5em;
					line-height: 1.9;
					color: ${colors.contentTextSecondary};
				}
				.article-content p:first-of-type:not(li > p)::first-letter {
					font-size: 4em;
					font-weight: 900;
					float: left;
					line-height: 0.8;
					margin-right: 0.15em;
					margin-top: 0.08em;
					color: ${colors.primary};
					text-shadow: 0 0 20px ${isDark ? "rgba(0, 194, 177, 0.5)" : "rgba(10, 124, 110, 0.3)"};
				}
				.article-content p:empty,
				.article-content p:has(> br:first-child:last-child),
				.article-content p:has(> br:only-child) {
					display: none;
					margin: 0;
					padding: 0;
					height: 0;
					line-height: 0;
				}
				.article-content br {
					display: none;
				}

				/* Headings */
				.article-content h1,
				.article-content h2,
				.article-content h3,
				.article-content h4,
				.article-content h5,
				.article-content h6 {
					color: ${colors.headingColor};
					margin-top: 2.5em;
					margin-bottom: 1em;
					line-height: 1.25;
					font-weight: 800;
					text-transform: uppercase;
					letter-spacing: -0.01em;
				}
				.article-content h2 {
					font-size: 1.6rem;
					padding-bottom: 0.75em;
					border-bottom: 2px solid ${isDark ? "rgba(0, 194, 177, 0.2)" : "rgba(10, 124, 110, 0.2)"};
					position: relative;
				}
				.article-content h2::before {
					content: "";
					position: absolute;
					bottom: -2px;
					left: 0;
					width: 60px;
					height: 2px;
					background: ${colors.primary};
					box-shadow: 0 0 10px ${isDark ? "rgba(0, 194, 177, 0.5)" : "rgba(10, 124, 110, 0.3)"};
				}
				.article-content h3 {
					font-size: 1.25rem;
					padding-left: 1rem;
					border-left: 3px solid ${colors.primary};
				}
				.article-content h4 {
					font-size: 1.1rem;
					color: ${colors.primaryLight};
				}
				.article-content h1 {
					font-size: 2rem;
					color: ${isDark ? "#fff" : "#1a1a1a"};
					text-shadow: 0 0 30px ${isDark ? "rgba(0, 194, 177, 0.3)" : "rgba(10, 124, 110, 0.2)"};
				}

				/* Links */
				.article-content a {
					color: ${colors.linkColor} !important;
					text-decoration: none;
					font-weight: 600;
					border-bottom: 1px solid ${isDark ? "rgba(67, 222, 204, 0.3)" : "rgba(10, 124, 110, 0.3)"};
					transition: all 0.3s ease;
					padding-bottom: 1px;
				}
				.article-content a:hover {
					color: ${colors.primary} !important;
					border-bottom-color: ${colors.primary};
					text-shadow: 0 0 12px ${isDark ? "rgba(0, 194, 177, 0.6)" : "rgba(10, 124, 110, 0.4)"};
				}

				/* Images */
				.article-content img {
					max-width: 100%;
					height: auto;
					margin: 2em 0;
					border-radius: 16px;
					display: block;
					box-shadow: 0 8px 32px ${colors.shadowColor}, 0 0 0 1px ${colors.borderColor};
				}
				.article-content figure {
					margin: 2em 0;
				}
				.article-content figure img {
					margin: 0;
					border-radius: 16px;
				}
				.article-content figcaption {
					text-align: center;
					font-size: 0.8em;
					color: ${isDark ? "rgba(223, 228, 224, 0.5)" : "#888"};
					margin-top: 0.75em;
					font-style: italic;
				}

				/* Lists */
				.article-content ul,
				.article-content ol {
					margin: 1.5em 0;
					padding-left: 1.5em;
				}
				.article-content ul {
					list-style-type: none;
					padding-left: 0;
				}
				.article-content ul li {
					position: relative;
					margin-bottom: 0.75em;
					line-height: 1.7;
					padding-left: 1.75em;
					color: ${colors.contentTextSecondary};
				}
				.article-content ul li::before {
					content: "";
					position: absolute;
					left: 0;
					top: 0.6em;
					width: 8px;
					height: 8px;
					background: ${colors.listBullet};
					border-radius: 2px;
					box-shadow: 0 0 8px ${isDark ? "rgba(0, 194, 177, 0.5)" : "rgba(10, 124, 110, 0.3)"};
				}
				.article-content ol {
					counter-reset: list-counter;
					list-style-type: none;
					padding-left: 0;
				}
				.article-content ol li {
					position: relative;
					margin-bottom: 0.75em;
					line-height: 1.7;
					padding-left: 2.75em;
					color: ${colors.contentTextSecondary};
					counter-increment: list-counter;
				}
				.article-content ol li::before {
					content: counter(list-counter);
					position: absolute;
					left: 0;
					top: 0;
					width: 32px;
					height: 32px;
					background: linear-gradient(135deg, ${colors.primary}, ${colors.primaryLight});
					color: ${isDark ? "#003732" : "#ffffff"};
					font-size: 0.8em;
					font-weight: 800;
					border-radius: 8px;
					display: flex;
					align-items: center;
					justify-content: center;
					line-height: 1;
					box-shadow: 0 4px 12px ${isDark ? "rgba(0, 194, 177, 0.3)" : "rgba(10, 124, 110, 0.3)"};
				}

				/* Blockquote */
				.article-content blockquote {
					margin: 2.5em 0;
					padding: 2em 2.5em;
					border-left: 0;
					border-top: 1px solid ${isDark ? "rgba(0, 194, 177, 0.3)" : "rgba(10, 124, 110, 0.3)"};
					border-bottom: 1px solid ${isDark ? "rgba(0, 194, 177, 0.3)" : "rgba(10, 124, 110, 0.3)"};
					background: linear-gradient(
						135deg,
						${isDark ? "rgba(0, 194, 177, 0.05) 0%, rgba(67, 222, 204, 0.02) 100%" : "rgba(10, 124, 110, 0.05) 0%, rgba(10, 124, 110, 0.02) 100%"}
					);
					font-style: italic;
					color: ${isDark ? "#fff" : "#1a1a1a"};
					position: relative;
					text-align: center;
					border-radius: 0;
				}
				.article-content blockquote::before {
					content: """";
					position: absolute;
					top: -20px;
					left: 50%;
					transform: translateX(-50%);
					font-size: 5rem;
					color: ${colors.primary};
					opacity: 0.15;
					font-family: Georgia, serif;
					line-height: 1;
				}
				.article-content blockquote p {
					margin-bottom: 0;
					font-size: 1.15em;
					line-height: 1.7;
					color: ${colors.contentText};
				}
				.article-content blockquote cite {
					display: block;
					margin-top: 1em;
					font-size: 0.85em;
					color: ${colors.primaryLight};
					font-style: normal;
					font-weight: 700;
					letter-spacing: 0.1em;
					text-transform: uppercase;
				}

				/* Strong / Bold */
				.article-content strong,
				.article-content b {
					font-weight: 700;
					color: ${isDark ? "#fff" : "#1a1a1a"};
				}
				.article-content em,
				.article-content i {
					font-style: italic;
					color: ${colors.contentTextSecondary};
				}

				/* Tables */
				.article-content table {
					width: 100%;
					border-collapse: collapse;
					margin: 2em 0;
					border-radius: 12px;
					overflow: hidden;
					box-shadow: 0 4px 24px ${colors.shadowColor};
					border: 1px solid ${colors.borderColor};
				}
				.article-content thead {
					background: ${colors.tableHeaderBg};
				}
				.article-content th {
					color: ${colors.tableHeaderText};
					font-weight: 800;
					padding: 1em 1.25em;
					text-align: left;
					text-transform: uppercase;
					font-size: 0.8em;
					letter-spacing: 0.5px;
				}
				.article-content td {
					border-bottom: 1px solid ${colors.borderColor};
					padding: 1em 1.25em;
					color: ${colors.contentTextSecondary};
					font-size: 0.95em;
				}
				.article-content tr:last-child td {
					border-bottom: none;
				}
				.article-content tr:nth-child(even) {
					background: ${isDark ? "rgba(255, 255, 255, 0.02)" : "#f9f9f9"};
				}
				.article-content tr:hover {
					background: ${isDark ? "rgba(0, 194, 177, 0.05)" : "rgba(10, 124, 110, 0.05)"};
				}

				/* Code */
				.article-content code {
					background: ${colors.codeBg};
					border: 1px solid ${colors.codeBorder};
					color: ${colors.codeText};
					padding: 0.2em 0.5em;
					border-radius: 6px;
					font-size: 0.9em;
					font-family: var(--font-fira-code), monospace;
				}
				.article-content pre {
					background: ${colors.preBg};
					border: 1px solid ${isDark ? "rgba(0, 194, 177, 0.15)" : "#e5e5e5"};
					border-radius: 12px;
					padding: 1.5em;
					overflow-x: auto;
					margin: 1.5em 0;
					box-shadow: ${isDark ? "inset 0 2px 8px rgba(0, 0, 0, 0.3)" : "inset 0 2px 8px rgba(0, 0, 0, 0.05)"};
				}
				.article-content pre code {
					background: none;
					border: none;
					padding: 0;
					color: ${colors.contentText};
				}

				/* Iframes / Video */
				.article-content iframe {
					max-width: 100%;
					height: auto;
					margin: 2em 0;
					border-radius: 16px;
					display: block;
					box-shadow: 0 8px 32px ${colors.shadowColor};
					border: 1px solid ${colors.borderColor};
				}
				.article-content iframe[src*="youtube"],
				.article-content iframe[src*="youtu.be"] {
					aspect-ratio: 16 / 9;
					width: 100% !important;
				}

				/* Instagram Embed */
				.article-content .instagram-media,
				.article-content .instagram-embed {
					height: 815px;
					overflow: hidden;
				}

				/* Facebook Embed */
				.article-content .fb-post,
				.article-content .fb-video,
				.article-content .fb-page {
					margin: 2em auto;
					display: block;
					max-width: 100% !important;
					width: 100% !important;
				}
				.article-content .facebook-embed-wrapper {
					margin: 2em 0;
					max-width: 100% !important;
					width: 100% !important;
				}
				.article-content .facebook-embed-wrapper iframe {
					max-width: 100% !important;
					width: 100% !important;
					border: none !important;
					border-radius: 16px;
					overflow: hidden;
					box-shadow: 0 8px 32px ${colors.shadowColor};
				}

				/* Twitter Embed */
				.article-content .twitter-tweet {
					margin: 2em auto !important;
					border-radius: 16px;
					overflow: hidden;
					box-shadow: 0 8px 32px ${colors.shadowColor};
				}
				.article-content .twitter-tweet iframe {
					margin: 0 !important;
					box-shadow: none !important;
					width: 100% !important;
				}

				/* Social Media Embeds */
				.article-content .social-embed {
					position: relative;
					z-index: 10;
					pointer-events: auto !important;
					text-align: left;
					display: block;
					margin: 2em 0;
				}
				.article-content .social-embed * {
					pointer-events: auto !important;
					z-index: 20 !important;
					position: relative !important;
				}
				.article-content .instagram-embed {
					display: block;
					min-height: 400px;
					background: transparent !important;
					text-align: left;
				}
				.article-content .instagram-media {
					background: transparent !important;
					pointer-events: auto !important;
					z-index: 30 !important;
					position: relative !important;
					margin-left: 0 !important;
					margin-right: auto !important;
					text-align: left !important;
				}
				.article-content iframe[src*="instagram.com"] {
					overflow: visible !important;
				}
				.article-content .twitter-embed {
					display: block !important;
					min-height: 300px;
					background: transparent !important;
					text-align: left;
				}
				.article-content .twitter-tweet {
					display: inline-block !important;
					background: transparent !important;
					pointer-events: auto !important;
					z-index: 30 !important;
					position: relative !important;
					margin-left: 0 !important;
					margin-right: auto !important;
					text-align: left !important;
					max-width: 100% !important;
				}
				.article-content iframe[src*="platform.twitter.com"] {
					display: block !important;
					max-width: 100% !important;
					border: none !important;
				}
				.article-content .facebook-embed-wrapper {
					max-width: 100% !important;
					width: 100% !important;
					background: transparent !important;
					text-align: left !important;
					margin-left: 0 !important;
					margin-right: auto !important;
					height: auto !important;
					min-height: auto !important;
					display: block !important;
					position: relative !important;
					overflow: visible !important;
				}
				.article-content .facebook-embed-wrapper .fb-post,
				.article-content .facebook-embed-wrapper .fb-video,
				.article-content .facebook-embed-wrapper .fb-page {
					display: block !important;
					width: 100% !important;
					height: auto !important;
					min-height: auto !important;
					position: relative !important;
					overflow: visible !important;
				}
				.article-content .facebook-embed-wrapper iframe {
					border: none !important;
					border-radius: 12px !important;
					box-shadow: 0 8px 32px ${colors.shadowColor} !important;
					background: transparent !important;
					pointer-events: auto !important;
					z-index: 30 !important;
					position: relative !important;
					display: block !important;
					margin-left: 0 !important;
					margin-right: auto !important;
					height: auto !important;
					min-height: auto !important;
					max-height: none !important;
					width: 100% !important;
				}
				.article-content .social-embed.facebook-embed {
					height: auto !important;
					min-height: auto !important;
					max-height: none !important;
					overflow: visible !important;
					display: block !important;
				}
				.article-content
					.facebook-embed-wrapper
					iframe[src*="facebook.com/plugins/video"],
				.article-content
					.facebook-embed-wrapper
					iframe[src*="facebook.com/plugins/post"],
				.article-content
					.facebook-embed-wrapper
					iframe[src*="facebook.com/plugins/page"] {
					height: 850px !important;
					min-height: 850px !important;
				}
				.article-content .fb-post,
				.article-content .fb-video,
				.article-content .fb-page {
					display: block !important;
					width: 100% !important;
					height: auto !important;
					min-height: auto !important;
					max-height: none !important;
					overflow: visible !important;
				}
				.article-content [class*="fb-"] {
					height: auto !important;
					min-height: auto !important;
					max-height: none !important;
					overflow: visible !important;
				}
				.article-content .multiple-embeds {
					display: flex;
					flex-wrap: wrap;
					justify-content: flex-start;
					align-items: flex-start;
					text-align: left;
					gap: 1rem;
				}
				.article-content .multiple-embeds .social-embed {
					margin: 0;
					min-height: 300px;
					flex: 1;
					min-width: 300px;
				}

				/* Horizontal Rule */
				.article-content hr {
					border: none;
					height: 1px;
					background: linear-gradient(
						to right,
						transparent,
						${colors.hrColor},
						transparent
					);
					margin: 3em 0;
				}

				/* Responsive */
				@media (max-width: 768px) {
					.article-content {
						font-size: 16px;
					}
					.article-content h1 {
						font-size: 1.625rem;
					}
					.article-content h2 {
						font-size: 1.375rem;
					}
					.article-content h3 {
						font-size: 1.15rem;
					}
					.article-content p:first-of-type:not(li > p)::first-letter {
						font-size: 3em;
					}
				}
			`}</style>
		</div>
	);
}