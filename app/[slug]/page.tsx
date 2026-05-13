"use client";

import { useEffect, useRef } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { formatDate } from "@/lib/utils";
import { PopularArticleCardSkeleton } from "@/components/article/PopularArticleCard";
import {
	useArticleDetail,
	usePopularArticles,
	useRelatedArticles,
} from "@/hooks/queries/useArticles";

export default function ArticleDetailPage() {
	const params = useParams();
	const slug = params.slug as string;
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
			<div className="min-h-screen flex items-center justify-center bg-background">
				<div className="w-10 h-10 rounded-full border-2 border-primary-container border-t-transparent animate-spin" />
			</div>
		);
	}

	if (error || !article?.data) {
		return (
			<div className="min-h-screen flex items-center justify-center bg-background">
				<div className="text-center max-w-md mx-auto px-6">
					<h1 className="text-2xl font-bold text-on-background mb-4">
						Artikel Tidak Ditemukan
					</h1>
					<p className="text-on-background/60 mb-6">
						Artikel yang kamu cari mungkin sudah dipindahkan atau dihapus.
					</p>
					<Link
						href="/artikel"
						className="inline-flex items-center gap-2 px-6 py-3 bg-primary-container text-on-primary-container font-bold uppercase tracking-widest text-xs rounded-lg hover:bg-primary-container/80 transition-colors"
					>
						Kembali ke Artikel
					</Link>
				</div>
			</div>
		);
	}

	const articleData = article.data;
	const fullImageUrl = articleData.image
		? `${process.env.NEXT_PUBLIC_API_URL}/storage/${articleData.image}`
		: "/placeholder.png";

	const relatedArticles = relatedData?.data || [];

	return (
		<div className="min-h-screen bg-background text-on-background">
			{/* Hero Banner - Image Only */}
			<section className="relative w-full h-[55vh] overflow-hidden">
				<div
					className="absolute inset-0 bg-cover bg-top grayscale-[0.2] brightness-75 scale-105"
					style={{ backgroundImage: `url(${fullImageUrl})` }}
				/>

				{/* Back Button */}
				<div className="absolute top-24 left-4 md:left-8 z-30">
					<Link
						href="/artikel"
						className="flex items-center gap-2 px-4 py-2 bg-black/40 hover:bg-black/60 backdrop-blur-sm text-white/80 hover:text-white rounded-lg transition-all text-sm font-bold uppercase tracking-widest"
					>
						<span className="material-symbols-outlined text-base">
							arrow_back
						</span>
						<span>Back</span>
					</Link>
				</div>

				{/* Decorative gradient overlay at bottom */}
				<div className="absolute bottom-0 left-0 right-0 h-32 bg-linear-to-t from-background to-transparent z-10" />
			</section>

			{/* Content Layer */}
			<section className="relative z-30 -mt-1 px-6 md:px-12 pb-24 max-w-screen-2xl mx-auto">
				<div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
					{/* Main Article Body */}
					<article className="lg:col-span-8">
						{/* Glass Article Header */}
						<div className="glass-panel p-8 md:p-10 rounded-xl shadow-2xl mb-8">
							{/* Category Badge */}
							{articleData.category_name && (
								<Link
									href={`/artikel?kategori=${articleData.category_slug}`}
									className="inline-flex items-center gap-2 px-4 py-1.5 bg-secondary-container text-on-secondary-container font-bold text-xs rounded-full mb-6 uppercase tracking-widest hover:opacity-90 transition-opacity"
								>
									<span className="w-2 h-2 rounded-full bg-on-secondary-container animate-pulse" />
									{articleData.category_name}
								</Link>
							)}

							{/* Title */}
							<h1 className="text-2xl md:text-5xl font-black italic uppercase text-white mb-6 leading-tight tracking-tight">
								{articleData.title}
							</h1>

							{/* Meta Info */}
							<div className="flex flex-wrap items-center gap-6 text-white/50 font-bold text-sm uppercase tracking-widest pb-6 border-b border-white/10">
								<span className="flex items-center gap-2">
									<span className="material-symbols-outlined text-primary text-sm">
										calendar_today
									</span>
									{articleData.published_at
										? formatDate(articleData.published_at)
										: articleData.created_diff}
								</span>
								<span className="flex items-center gap-2">
									<span className="material-symbols-outlined text-primary text-sm">
										visibility
									</span>
									{articleData.views} Views
								</span>
								<span className="flex items-center gap-2">
									<span className="material-symbols-outlined text-primary text-sm">
										person
									</span>
									{articleData.author_name}
								</span>
							</div>

							{/* Share buttons inline with meta */}
							<div className="flex items-center gap-3 mt-4">
								<span className="text-white/30 font-bold text-xs uppercase tracking-widest mr-2">
									Share:
								</span>
								<button
									onClick={handleShare}
									className="w-9 h-9 rounded-full border border-white/10 flex items-center justify-center hover:bg-primary-container hover:text-on-primary-container hover:border-primary-container transition-all"
									title="Share"
								>
									<span className="material-symbols-outlined text-sm">
										share
									</span>
								</button>
								<button
									onClick={() => {
										navigator.clipboard.writeText(window.location.href);
										alert("Link copied!");
									}}
									className="w-9 h-9 rounded-full border border-white/10 flex items-center justify-center hover:bg-primary-container hover:text-on-primary-container hover:border-primary-container transition-all"
									title="Copy Link"
								>
									<span className="material-symbols-outlined text-sm">
										link
									</span>
								</button>
							</div>
						</div>

						{/* Article Content */}
						<div
							ref={contentRef}
							className="article-content glass-panel p-8 md:p-10 rounded-xl shadow-2xl"
							dangerouslySetInnerHTML={{
								__html: articleData.content,
							}}
						/>

						{/* Related Articles (Inside Main Content) */}
						{relatedArticles.length > 0 && (
							<div className="mt-12">
								<h2 className="text-2xl md:text-3xl font-black italic uppercase text-white mb-8 tracking-tighter flex items-center gap-3">
									Artikel
									<span className="text-primary-container">Terbaru</span>
								</h2>
								<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
									{relatedArticles.slice(0, 4).map((item: any) => (
										<Link
											key={item.id}
											href={`/${item.slug}`}
											className="glass-panel rounded-xl overflow-hidden group hover:neon-border-glow transition-all"
										>
											<div className="relative h-55 overflow-hidden">
												<img
													src={`${process.env.NEXT_PUBLIC_API_URL}/storage/${item.image}`}
													alt={item.title}
													className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
												/>
												{/* Perbaiki baris ini */}
												<div className="absolute inset-0 bg-linear-to-t from-black/60 to-transparent" />
											</div>
											<div className="p-5">
												<h4 className="text-base font-black text-white group-hover:text-primary-container transition-colors leading-snug line-clamp-2">
													{item.title}
												</h4>
												<div className="flex items-center gap-3 mt-3 text-white/40 text-xs font-bold uppercase tracking-widest">
													<span className="flex items-center gap-1">
														<span className="material-symbols-outlined text-xs">
															schedule
														</span>
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
							<div className="glass-panel p-6 rounded-xl border border-white/5">
								<h3 className="text-lg font-black italic uppercase mb-6 flex items-center gap-2 text-white">
									<span className="material-symbols-outlined text-primary">
										trending_up
									</span>
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
														<span className="text-3xl font-black italic text-transparent bg-clip-text bg-linear-to-b from-primary-container to-transparent opacity-40 group-hover:opacity-100 transition-opacity leading-none mt-1 shrink-0">
															{String(index + 1).padStart(2, "0")}
														</span>
														<div className="min-w-0">
															<h4 className="font-bold text-sm text-white group-hover:text-primary-container transition-colors line-clamp-2 leading-snug">
																{item.title}
															</h4>
															<p className="text-[10px] text-white/40 mt-1.5 uppercase tracking-widest font-bold flex items-center gap-1">
																<span className="material-symbols-outlined text-[10px]">
																	visibility
																</span>
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
							<div className="glass-panel rounded-xl overflow-hidden border border-primary-container/20">
								{/* Perbaiki baris ini */}
								<div className="relative aspect-4/3 overflow-hidden">
									<div className="absolute inset-0 bg-linear-to-br from-primary-container/30 to-secondary-container/20" />
									<div className="absolute inset-0 flex flex-col justify-center items-center text-center p-6">
										<span className="material-symbols-outlined text-primary-container text-5xl mb-4">
											bolt
										</span>
										<h3 className="text-xl font-black italic uppercase text-white mb-2">
											Stay Updated
										</h3>
										<p className="text-xs text-white/60 mb-4 leading-relaxed">
											Dapatkan artikel terbaru langsung ke inbox kamu.
										</p>
										<button className="w-full py-3 bg-primary-container text-on-primary-container font-black uppercase tracking-widest text-xs rounded-lg hover:bg-primary-container/80 transition-colors">
											Subscribe For Free
										</button>
									</div>
								</div>
							</div>

							{/* Promo Section */}
							<div className="h-fit rounded-2xl overflow-hidden group shadow-2xl">
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
					color: #dfe4e0;
				}

				/* Paragraphs */
				.article-content p {
					margin-bottom: 1.5em;
					line-height: 1.9;
					color: #dfe4e0cc;
				}
				.article-content p:first-of-type::first-letter {
					font-size: 4em;
					font-weight: 900;
					float: left;
					line-height: 0.8;
					margin-right: 0.15em;
					margin-top: 0.08em;
					color: #00c2b1;
					text-shadow: 0 0 20px rgba(0, 194, 177, 0.5);
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
					color: #00c2b1;
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
					border-bottom: 2px solid rgba(0, 194, 177, 0.2);
					position: relative;
				}
				.article-content h2::before {
					content: "";
					position: absolute;
					bottom: -2px;
					left: 0;
					width: 60px;
					height: 2px;
					background: #00c2b1;
					box-shadow: 0 0 10px rgba(0, 194, 177, 0.5);
				}
				.article-content h3 {
					font-size: 1.25rem;
					padding-left: 1rem;
					border-left: 3px solid #00c2b1;
				}
				.article-content h4 {
					font-size: 1.1rem;
					color: #43decc;
				}
				.article-content h1 {
					font-size: 2rem;
					color: #fff;
					text-shadow: 0 0 30px rgba(0, 194, 177, 0.3);
				}

				/* Links */
				.article-content a {
					color: #43decc !important;
					text-decoration: none;
					font-weight: 600;
					border-bottom: 1px solid rgba(67, 222, 204, 0.3);
					transition: all 0.3s ease;
					padding-bottom: 1px;
				}
				.article-content a:hover {
					color: #00c2b1 !important;
					border-bottom-color: #00c2b1;
					text-shadow: 0 0 12px rgba(0, 194, 177, 0.6);
				}

				/* Images */
				.article-content img {
					max-width: 100%;
					height: auto;
					margin: 2em 0;
					border-radius: 16px;
					display: block;
					box-shadow: 0 8px 32px rgba(0, 0, 0, 0.4), 0 0 0 1px rgba(255, 255, 255, 0.05);
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
					color: rgba(223, 228, 224, 0.5);
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
					color: #dfe4e0cc;
				}
				.article-content ul li::before {
					content: "";
					position: absolute;
					left: 0;
					top: 0.6em;
					width: 8px;
					height: 8px;
					background: #00c2b1;
					border-radius: 2px;
					box-shadow: 0 0 8px rgba(0, 194, 177, 0.5);
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
					color: #dfe4e0cc;
					counter-increment: list-counter;
				}
				.article-content ol li::before {
					content: counter(list-counter);
					position: absolute;
					left: 0;
					top: 0;
					width: 32px;
					height: 32px;
					background: linear-gradient(135deg, #00c2b1, #43decc);
					color: #003732;
					font-size: 0.8em;
					font-weight: 800;
					border-radius: 8px;
					display: flex;
					align-items: center;
					justify-content: center;
					line-height: 1;
					box-shadow: 0 4px 12px rgba(0, 194, 177, 0.3);
				}

				/* Blockquote */
				.article-content blockquote {
					margin: 2.5em 0;
					padding: 2em 2.5em;
					border-left: 0;
					border-top: 1px solid rgba(0, 194, 177, 0.3);
					border-bottom: 1px solid rgba(0, 194, 177, 0.3);
					background: linear-gradient(
						135deg,
						rgba(0, 194, 177, 0.05) 0%,
						rgba(67, 222, 204, 0.02) 100%
					);
					font-style: italic;
					color: #fff;
					position: relative;
					text-align: center;
					border-radius: 0;
				}
				.article-content blockquote::before {
					content: """;
					position: absolute;
					top: -20px;
					left: 50%;
					transform: translateX(-50%);
					font-size: 5rem;
					color: #00c2b1;
					opacity: 0.15;
					font-family: Georgia, serif;
					line-height: 1;
				}
				.article-content blockquote p {
					margin-bottom: 0;
					font-size: 1.15em;
					line-height: 1.7;
					color: #dfe4e0;
				}
				.article-content blockquote cite {
					display: block;
					margin-top: 1em;
					font-size: 0.85em;
					color: #43decc;
					font-style: normal;
					font-weight: 700;
					letter-spacing: 0.1em;
					text-transform: uppercase;
				}

				/* Strong / Bold */
				.article-content strong,
				.article-content b {
					font-weight: 700;
					color: #fff;
				}
				.article-content em,
				.article-content i {
					font-style: italic;
					color: #dfe4e0cc;
				}

				/* Tables */
				.article-content table {
					width: 100%;
					border-collapse: collapse;
					margin: 2em 0;
					border-radius: 12px;
					overflow: hidden;
					box-shadow: 0 4px 24px rgba(0, 0, 0, 0.3);
					border: 1px solid rgba(255, 255, 255, 0.08);
				}
				.article-content thead {
					background: linear-gradient(135deg, #00c2b1, #43decc);
				}
				.article-content th {
					color: #003732;
					font-weight: 800;
					padding: 1em 1.25em;
					text-align: left;
					text-transform: uppercase;
					font-size: 0.8em;
					letter-spacing: 0.5px;
				}
				.article-content td {
					border-bottom: 1px solid rgba(255, 255, 255, 0.06);
					padding: 1em 1.25em;
					color: #dfe4e0cc;
					font-size: 0.95em;
				}
				.article-content tr:last-child td {
					border-bottom: none;
				}
				.article-content tr:nth-child(even) {
					background: rgba(255, 255, 255, 0.02);
				}
				.article-content tr:hover {
					background: rgba(0, 194, 177, 0.05);
				}

				/* Code */
				.article-content code {
					background: rgba(0, 194, 177, 0.1);
					border: 1px solid rgba(0, 194, 177, 0.2);
					color: #43decc;
					padding: 0.2em 0.5em;
					border-radius: 6px;
					font-size: 0.9em;
					font-family: var(--font-fira-code), monospace;
				}
				.article-content pre {
					background: #0a0f0d;
					border: 1px solid rgba(0, 194, 177, 0.15);
					border-radius: 12px;
					padding: 1.5em;
					overflow-x: auto;
					margin: 1.5em 0;
					box-shadow: inset 0 2px 8px rgba(0, 0, 0, 0.3);
				}
				.article-content pre code {
					background: none;
					border: none;
					padding: 0;
					color: #dfe4e0;
				}

				/* Iframes / Video */
				.article-content iframe {
					max-width: 100%;
					height: auto;
					margin: 2em 0;
					border-radius: 16px;
					display: block;
					box-shadow: 0 8px 32px rgba(0, 0, 0, 0.4);
					border: 1px solid rgba(255, 255, 255, 0.05);
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
					box-shadow: 0 8px 32px rgba(0, 0, 0, 0.4);
				}

				/* Twitter Embed */
				.article-content .twitter-tweet {
					margin: 2em auto !important;
					border-radius: 16px;
					overflow: hidden;
					box-shadow: 0 8px 32px rgba(0, 0, 0, 0.4);
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
					box-shadow: 0 8px 32px rgba(0, 0, 0, 0.4) !important;
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
						rgba(0, 194, 177, 0.4),
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
					.article-content p:first-of-type::first-letter {
						font-size: 3em;
					}
				}
			`}</style>
		</div>
	);
}

