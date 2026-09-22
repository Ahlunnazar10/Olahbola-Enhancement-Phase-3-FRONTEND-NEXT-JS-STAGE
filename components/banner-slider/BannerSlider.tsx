"use client";

import Link from "next/link";

import { Swiper, SwiperSlide } from "swiper/react";

import { Navigation, EffectFade } from "swiper/modules";

import { ChevronRight, ChevronLeft, ArrowRight, Award } from "lucide-react";

import { useRef, useEffect } from "react";

// Import Swiper styles - use string path to avoid type resolution issues

// @ts-ignore

import "swiper/css";

// @ts-ignore

import "swiper/css/effect-fade";

export interface BannerSlide {
	id: string;

	type: "article" | "static" | "cta" | "event";

	label?: string;

	labelColor?: "breaking" | "season" | "default";

	title?: {
		parts: string[];

		colors?: ("primary" | "white" | "accent")[];
	};

	staticTitle?: {
		parts: { text: string; color: "primary" | "white" | "accent" }[];
	};

	description?: string;

	excerpt?: string;

	image?: string;

	imageFallback?: string;

	imageMobileFallback?: string;

	ctaButtons?: {
		primary?: { text: string; href?: string; icon?: string };

		secondary?: { text: string; href?: string; icon?: string };
	};

	ctaTitle?: string;

	ctaSubtitle?: string;

	ctaCtaText?: string;

	ctaCtaHref?: string;

	ctaAlignment?: "left" | "right";

	ctaTerms?: string;

	// Event-specific (type === "event")

	eventBadge?: string;

	eventTitle?: {
		parts: { text: string; color: "primary" | "white" }[];
	};

	eventDescription?: string;

	eventPrimaryCta?: { text: string; href: string };

	eventSecondaryCta?: { text: string; href: string };

	eventHudStats?: { label: string; value: string; suffix?: string }[];

	eventRewardImage?: string;

	eventRewardImageAlt?: string;

	eventFloatingCards?: {
		position: "top-right" | "bottom-left";

		icon: string;

		iconFilled?: boolean;

		label: string;

		title: string;
	}[];

	// Video background (used by Game Pass / HeroPlay video slides)
	videoSrc?: string;

	// HeroPlay custom slide — used by kickoff right-aligned banners (e.g. Football City Battle).
	// Distinct from generic cta/event because layout/text/button styling come from design spec,
	// not the existing cta/event branches.
	heroPlayLayout?: {
		highlightedWord?: string; // word inside the title to wrap with a shadowed span
		titleLines: string[]; // lines for the heading, rendered top->bottom
		highlightedLineIndex?: number; // which line contains the highlighted word
		description: string;
		descriptionMobile?: string; // alternate description for mobile view
		buttonText: string;
		buttonHref: string;
	};
}

interface BannerSliderProps {
	slides: BannerSlide[];

	autoPlay?: boolean;

	autoPlayInterval?: number;

	showNavigation?: boolean;

	className?: string;

	isDark?: boolean;

	isMobile?: boolean;
}

export function BannerSlider({
	slides,

	autoPlay = true,

	autoPlayInterval = 2000,

	showNavigation = true,

	className = "",

	isDark = true,

	isMobile = false,
}: BannerSliderProps) {
	const swiperRef = useRef<any>(null);
	const manualTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

	const totalSlides = slides.length;
	const showControls = totalSlides > 1;
	const isManualAutoPlay = showControls && autoPlay;

	const getActiveSlideId = (): string | null => {
		const swiper = swiperRef.current?.swiper;
		if (!swiper) return null;
		const activeEl = swiper.slides[swiper.activeIndex];
		return activeEl?.getAttribute("data-swiper-slide-index") ?? null;
	};

	const autoAdvance = () => {
		if (!isManualAutoPlay) return;
		const swiper = swiperRef.current?.swiper;
		if (!swiper || swiper.destroyed) return;
		const slideIndex = getActiveSlideId();
		if (slideIndex === null) return;
		const slide = slides[Number(slideIndex)];
		const delay = slide?.videoSrc ? 10000 : autoPlayInterval;
		manualTimer.current = setTimeout(() => {
			swiper.slideNext();
		}, delay);
	};

	useEffect(() => {
		if (!isManualAutoPlay) return;
		const swiper = swiperRef.current?.swiper;
		if (swiper) {
			autoAdvance();
		} else {
			const checkReady = () => {
				const s = swiperRef.current?.swiper;
				if (s) {
					autoAdvance();
				} else {
					requestAnimationFrame(checkReady);
				}
			};
			checkReady();
		}
		return () => {
			if (manualTimer.current) clearTimeout(manualTimer.current);
		};
	}, [isManualAutoPlay, slides]);

	const swiperProps = {
		modules: [Navigation, EffectFade],
		slidesPerView: 1,
		spaceBetween: 0,
		effect: "fade" as const,
		fadeEffect: { crossFade: true },
		navigation: showControls,
		className: "banner-slider w-full! h-full!",
		speed: 1000,
		loop: showControls,
		watchOverflow: true,
		onSlideChange: () => {
			if (manualTimer.current) clearTimeout(manualTimer.current);
			autoAdvance();
		},
	} as Parameters<typeof Swiper>[0];

	return (
		<div className={`relative w-full h-full ${className}`}>
			<Swiper ref={swiperRef} {...swiperProps}>
				{slides.map((slide, index) => (
					<SwiperSlide key={slide.id} className="w-full! h-full! list-none!">
						{/* Background - First slide loads eagerly, others lazy */}

						<div className="absolute inset-0 w-full h-full">
							{(() => {
								const articleImageUrl =
									slide.type === "article" && slide.image
										? `${process.env.NEXT_PUBLIC_API_URL}/storage/${slide.image}`
										: null;

								const desktopSrc =
									slide.type === "article"
										? articleImageUrl
										: slide.imageFallback;

								const mobileSrc =
									slide.type === "article"
										? articleImageUrl || slide.imageMobileFallback
										: slide.imageMobileFallback;

								if (!desktopSrc && !mobileSrc && !slide.videoSrc) {
									return (
										<div className="w-full h-full bg-linear-to-br from-[#0f1412] via-[#141a17] to-[#0f1412]" />
									);
								}

								return (
									<>
										{slide.videoSrc && (
											<video
												src={slide.videoSrc}
												autoPlay
												muted
												loop
												playsInline
												className="w-full h-full object-cover"
											/>
										)}
										{desktopSrc && (
											<img
												src={desktopSrc}
												alt={
													slide.ctaTitle ||
													slide.title?.parts?.join(" ") ||
													"Banner"
												}
												width={1920}
												height={1080}
												className={`w-full h-full object-cover object-center ${
													slide.type === "event"
														? ""
														: isDark
															? "grayscale-[0.2] contrast-125"
															: "grayscale-[0.1] contrast-105"
												} hidden md:block`}
												fetchPriority={index === 0 ? "high" : "low"}
												decoding="async"
												loading={index === 0 ? "eager" : "lazy"}
											/>
										)}

										{mobileSrc && (
											<img
												src={mobileSrc}
												alt={
													slide.ctaTitle ||
													slide.title?.parts?.join(" ") ||
													"Banner"
												}
												width={750}
												height={1334}
												className={`w-full h-full object-cover object-center ${
													slide.type === "event"
														? ""
														: isDark
															? "grayscale-[0.2] contrast-125"
															: "grayscale-[0.1] contrast-105"
												} md:hidden`}
												fetchPriority={index === 0 ? "high" : "low"}
												decoding="async"
												loading={index === 0 ? "eager" : "lazy"}
											/>
										)}
									</>
								);
							})()}
						</div>

						{/* Overlays */}

						<div
							className={`absolute inset-0 ${
								slide.type === "cta" && slide.videoSrc
									? isMobile
										? "bg-linear-to-t from-black/95 via-black/80 to-transparent"
										: "bg-linear-to-r from-black/95 via-black/70 to-transparent"
									: slide.type === "cta"
										? isMobile
											? "bg-linear-to-t from-black via-black/60 to-transparent"
											: "bg-linear-to-l from-black via-transparent to-transparent"
										: slide.type === "article"
											? isMobile
												? isDark
													? "bg-linear-to-t from-black via-black/60 to-transparent"
													: "bg-linear-to-t from-black/80 via-black/50 to-transparent"
												: isDark
													? "bg-linear-to-r from-black via-[#0f1412]/60 to-transparent"
													: "bg-linear-to-r from-[#f5f5f5]/95 via-[#f5f5f5]/20 to-transparent"
											: slide.type === "event"
												? "bg-linear-to-t from-[#050505]/10 via-transparent to-[#050505]/10"
												: slide.heroPlayLayout
													? "bg-linear-to-r from-transparent via-transparent to-black/40"
													: `bg-linear-to-r ${
															isDark
																? "from-black via-[#0f1412]/20 to-transparent"
																: "from-[#f5f5f5]/95 via-[#f5f5f5]/20 to-transparent"
														}`
							}`}
						/>

						{/* Event Type — overlay tuned per theme for text legibility */}

						{slide.type === "event" && (
							<>
								{isDark ? (
									<>
										<div className="absolute inset-0 bg-linear-to-r from-[#050505] via-[#050505]/40 to-[#050505] pointer-events-none" />

										<div className="absolute inset-0 bg-[#050505]/40 pointer-events-none" />
									</>
								) : (
									<>
										<div className="absolute inset-0 bg-linear-to-r from-[#ffffff]/85 via-[#ffffff]/40 to-[#ffffff]/85 pointer-events-none" />

										<div className="absolute inset-0 bg-[#ffffff]/30 pointer-events-none" />
									</>
								)}
							</>
						)}

						{/* Static Type */}

						{slide.type === "static" ? (
							<div className="relative z-10 w-full h-full flex flex-col md:flex-row items-center md:items-center justify-center md:justify-between gap-8 md:gap-4 px-8 sm:px-12 md:px-16 lg:px-24 xl:px-32">
								<div className="flex flex-col justify-center w-full md:w-1/2 md:max-w-xl lg:max-w-2xl text-center md:text-left order-2 md:order-1">
									{slide.staticTitle && (
										<h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-[56px] xl:text-[72px] font-bold uppercase italic leading-tight md:leading-none mb-4 md:mb-6">
											{slide.staticTitle.parts.map((part, i) => (
												<span
													key={i}
													className={
														part.color === "primary"
															? `${
																	isDark ? "text-primary" : "text-[#0a7c6e]"
																} text-glow block`
															: part.color === "accent"
																? "text-secondary-container"
																: isDark
																	? "text-white"
																	: "text-[#1a1a1a]"
													}
												>
													{part.text}

													{i < slide.staticTitle!.parts.length - 1 && " "}
												</span>
											))}
										</h1>
									)}

									<p
										className={`text-sm sm:text-base md:text-lg max-w-sm sm:max-w-md md:max-w-md lg:max-w-xl mx-auto md:mx-0 ${
											isDark ? "text-on-surface-variant" : "text-[#5a5a5a]"
										}`}
									>
										{slide.description}
									</p>
								</div>

								<div className="flex items-center justify-center order-1 md:order-2 w-full md:w-5/12 lg:w-1/2 md:justify-end">
									<div className="relative w-70 h-70 md:w-56 md:h-56 lg:w-110 lg:h-110">
										<div className="absolute inset-0 bg-linear-to-br from-primary/20 to-secondary-container/20 rounded-full blur-3xl" />

										<div className="relative w-full h-full rounded-2xl overflow-hidden animate-float">
											<img
												src="/images/home/banner-1.webp"
												alt="Banner Image"
												width={440}
												height={440}
												className="w-full h-full object-cover"
												loading="lazy"
												decoding="async"
											/>
										</div>
									</div>
								</div>
							</div>
						) : slide.type === "event" ? (
							/* Event Type - Bundesliga 2026/2027 */

							<div className="relative z-10 w-full max-w-360 mx-auto px-6 sm:px-8 md:px-12 lg:px-16 xl:px-24 mt-3 md:mt-0 grid grid-cols-1 lg:grid-cols-12 gap-4 md:gap-8 items-center h-full">
								{/* Left Content: Typography & CTA */}

								<div className="lg:col-span-6 flex flex-col items-center md:items-start gap-3 md:gap-6">
									{/* Live Badge */}

									{slide.eventBadge && (
										<div className="inline-flex items-center gap-2 bg-primary/10 border border-primary/20 px-4 py-2 rounded-full mb-2">
											<span className="relative flex h-3 w-3">
												<span className="absolute inline-flex h-full w-full rounded-full bg-primary animate-ping opacity-75" />

												<span
													className={`relative inline-flex rounded-full h-3 w-3 ${isDark ? "bg-primary" : "bg-green-800"}`}
												/>
											</span>

											<span
												className={`text-xs font-bold uppercase tracking-widest ${isDark ? "text-primary" : "text-[#0a7c6e]"}`}
											>
												{slide.eventBadge}
											</span>
										</div>
									)}

									{/* Event Title */}

									{slide.eventTitle && (
										<h1 className="text-2xl md:text-5xl font-extrabold italic uppercase leading-none ">
											{slide.eventTitle.parts.map((part, i) => (
												<span
													key={i}
													className={
														part.color === "primary"
															? `${isDark ? "text-primary" : "text-[#0a7c6e]"} text-glow block`
															: isDark
																? "text-white"
																: "text-[#1a1a1a]"
													}
												>
													{part.text}
												</span>
											))}
										</h1>
									)}

									{/* Description */}

									{slide.eventDescription && (
										<p
											className={`text-sm md:text-lg font-medium max-w-xl text-center md:text-left px-3 ${isDark ? "text-on-surface-variant" : "text-[#3a3a3a]"}`}
										>
											{slide.eventDescription}
										</p>
									)}

									{/* CTA Buttons */}

									<div className="flex flex-row gap-4 mt-4">
										{slide.eventPrimaryCta && (
											<a
												href={slide.eventPrimaryCta.href}
												className="bg-primary text-on-primary text-[11px] md:text-sm font-extrabold px-4 md:px-8 py-3 md:py-4 rounded-sm hover:shadow-[0_0_20px_rgba(67,222,204,0.6)] transition-all duration-300 active:scale-95 uppercase tracking-widest"
											>
												{slide.eventPrimaryCta.text}
											</a>
										)}

										{slide.eventSecondaryCta && (
											<a
												href={slide.eventSecondaryCta.href}
												className={`${isDark ? "glass-panel text-primary" : "bg-white/70 backdrop-blur-md border-gray-200 shadow-md text-[#0A7C6E]"} border-primary border-2  text-[11px] md:text-sm font-extrabold px-4 md:px-8 py-3 md:py-4 rounded-sm hover:bg-primary/10 transition-all duration-300 active:scale-95 uppercase tracking-widest`}
											>
												{slide.eventSecondaryCta.text}
											</a>
										)}
									</div>
								</div>

								{/* Right Content: Reward Showcase */}

								{slide.eventRewardImage && (
									<div className="lg:col-span-6 relative flex flex-col items-center justify-center h-full pt-0 pb-12 lg:py-20 -mt-27.5 lg:mt-0">
										{/* Ambient glow */}

										<div className="absolute inset-0 bg-primary/5 rounded-full blur-[120px] opacity-40" />

										{/* Background shapes to highlight the prize image */}

										<div
											aria-hidden
											className="absolute z-0 w-72 h-72 sm:w-96 sm:h-96 rounded-full pointer-events-none"
											style={{
												background:
													"radial-gradient(circle, rgba(0, 194, 177, 0.35) 0%, rgba(0, 194, 177, 0.12) 45%, transparent 70%)",
												filter: "blur(40px)",
											}}
										/>

										<div
											aria-hidden
											className="absolute z-0 -bottom-6 -right-6 w-56 h-56 rounded-full pointer-events-none"
											style={{
												background:
													"radial-gradient(circle, rgba(67, 222, 204, 0.25) 0%, transparent 65%)",
												filter: "blur(30px)",
											}}
										/>

										<div
											aria-hidden
											className="absolute z-0 -top-6 -left-6 w-44 h-44 rounded-full pointer-events-none"
											style={{
												background:
													"radial-gradient(circle, rgba(0, 194, 177, 0.22) 0%, transparent 65%)",
												filter: "blur(30px)",
											}}
										/>

										<div
											aria-hidden
											className="absolute z-0 inset-0 m-auto w-64 h-64 sm:w-80 sm:h-80 rounded-full border-2 border-primary/20 pointer-events-none"
										/>

										<div
											aria-hidden
											className="absolute z-0 inset-0 m-auto w-44 h-44 sm:w-56 sm:h-56 rounded-full border border-primary/30 pointer-events-none"
										/>

										{/* Reward Image */}
										<div className="relative z-20">
											<img
												alt={slide.eventRewardImageAlt || "Prize"}
												src={slide.eventRewardImage}
												className="h-100 md:h-135 object-contain drop-shadow-[0_0_40px_rgba(67,222,204,0.35)]"
												loading="lazy"
												width={540}
												height={540}
												decoding="async"
											/>
										</div>
									</div>
								)}
							</div>
						) : slide.heroPlayLayout ? (
							/* HeroPlay Right-Aligned Layout */
							<div className="relative z-10 w-full h-full flex items-center">
								<div className="relative z-20 w-full px-6 md:px-12 mr-auto ml-4 md:mr-16 lg:mr-32 text-center md:text-right mt-66 md:mt-0">
									{/* Title with highlighted word */}
									<h2 className="text-3xl md:text-3xl lg:text-[44px] font-bold uppercase leading-none mb-2 md:mb-4">
										{slide.heroPlayLayout.titleLines.map((line, lineIdx) => {
											const hasHighlight =
												slide.heroPlayLayout!.highlightedLineIndex === lineIdx;
											const targetWords = (
												slide.heroPlayLayout!.highlightedWord ?? ""
											).split(" ");
											return (
												<span key={lineIdx} className="block">
													{line.split(" ").map((word, wordIdx, arr) => {
														const isHighlighted =
															hasHighlight && targetWords.includes(word);
														return (
															<span
																key={wordIdx}
																className={
																	isHighlighted
																		? "text-[#1FE6DA]"
																		: "text-white"
																}
															>
																{word}
																{wordIdx < arr.length - 1 && " "}
															</span>
														);
													})}
												</span>
											);
										})}
									</h2>
									{/* Description */}
									{slide.heroPlayLayout.description && (
										<p className="text-base md:text-xl mb-4 md:mb-6 mx-auto md:mx-0">
											{(isMobile && slide.heroPlayLayout.descriptionMobile
												? slide.heroPlayLayout.descriptionMobile
												: slide.heroPlayLayout.description
											)
												.split("\n")
												.map((line, i, arr) => (
													<span key={i}>
														{line}
														{i < arr.length - 1 && <br />}
													</span>
												))}
										</p>
									)}
									{/* Button */}
									{slide.heroPlayLayout.buttonText &&
										slide.heroPlayLayout.buttonHref && (
											<a
												href={slide.heroPlayLayout.buttonHref}
												target="_blank"
												className="inline-flex items-center justify-center gap-2 px-12 py-4 rounded-xl font-bold tracking-wide text-sm md:text-base bg-[#1FE6DA] text-black shadow-[0_8px_10px_0_rgba(0,0,0,0.5)] hover:scale-105 active:scale-95 transition-all duration-300"
											>
												{slide.heroPlayLayout.buttonText}!
											</a>
										)}
								</div>
							</div>
						) : slide.type === "cta" ? (
							/* CTA Type */
							<div className="relative z-10 w-full h-full flex items-center">
								<div
									className={`relative z-20 mt-30 md:mt-0 ${
										slide.videoSrc
											? "w-full max-w-2xl lg:max-w-4xl px-14 md:px-0 mr-auto ml-4 md:ml-16 lg:ml-32 text-center md:text-left"
											: "w-full max-w-2xl lg:max-w-4xl px-14 md:px-8 ml-auto mr-4 md:mr-16 lg:mr-32 text-center md:text-right"
									}`}
								>
									{slide.ctaTitle && (
										<h2
											className={`${
												slide.videoSrc
													? "text-3xl md:text-[42px] lg:text-[56px] uppercase italic leading-tight md:leading-[1.1] mb-4 md:mb-4"
													: "text-xl md:text-[42px] lg:text-[48px] font-black uppercase leading-tight md:leading-[1.1] mb-4 md:mb-6"
											}`}
										>
											{slide.ctaTitle.split("\n").map((line, i) => (
												<span
													key={i}
													className={`block last:mb-0 ${
														slide.videoSrc
															? i === 0
																? "font-black text-primary"
																: "font-black text-white"
															: "font-black text-white"
													}`}
												>
													{line}
												</span>
											))}
										</h2>
									)}
									{slide.ctaSubtitle && (
										<p className="text-sm md:text-lg leading-relaxed mb-6 md:mb-8 max-w-lg mr-auto text-white">
											{slide.ctaSubtitle}
										</p>
									)}
									{slide.ctaCtaText && slide.ctaCtaHref && (
										<a
											data-gtm-cta="DAFTAR SEKARANG!"
											href={slide.ctaCtaHref}
											target="_blank"
											rel="noopener noreferrer"
											className="group relative inline-flex items-center gap-3 px-8 py-4 rounded-2xl text-xs md:text-base font-black uppercase tracking-wide transition-all duration-300 overflow-hidden bg-linear-to-r from-primary-container to-[#00a89a] text-black shadow-[0_0_30px_rgba(0,194,177,0.5)] hover:shadow-[0_0_50px_rgba(0,194,177,0.8)] hover:scale-105 active:scale-95 border border-primary-container/40"
										>
											<span className="relative z-10 flex items-center gap-3">
												{slide.ctaCtaText}
											</span>
											<div className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-700 bg-linear-to-r from-transparent via-white/30 to-transparent" />
										</a>
									)}
									{slide.ctaTerms && (
										<Link
											href="/syarat-dan-ketentuan-football-city-battle"
											className="flex justify-center md:justify-end gap-2 text-sm mt-3 text-[#ffaa00]"
										>
											{slide.ctaTerms}
										</Link>
									)}
								</div>
							</div>
						) : (
							/* Article Type */

							<div className="relative z-10 w-full max-w-4xl px-18 md:px-16 lg:px-24 xl:px-32 mt-20 md:mt-0 h-full flex flex-col justify-center">
								{slide.title && (
									<h1 className="text-xl md:text-[46px] lg:text-5xl font-bold uppercase italic leading-none mb-3 md:mb-6">
										{slide.title.parts.map((part, i) => {
											const color =
												slide.title?.colors?.[i] ||
												(i === 0 ? "primary" : "white");

											return (
												<span
													key={i}
													className={
														color === "primary"
															? `${
																	isDark ? "text-primary" : "text-[#0a7c6e]"
																} text-glow block`
															: color === "accent"
																? "text-secondary-container"
																: isDark
																	? "text-white"
																	: "text-[#1a1a1a]"
													}
												>
													{part}

													{i < slide.title!.parts.length - 1 && " "}
												</span>
											);
										})}
									</h1>
								)}

								<p
									className={`text-base md:text-lg max-w-xl mb-6 line-clamp-2 md:line-clamp-3 ${
										isDark ? "text-on-surface-variant" : "text-[#5a5a5a]"
									}`}
								>
									{slide.excerpt}
								</p>

								{slide.ctaButtons?.primary?.href && (
									<Link
										href={slide.ctaButtons.primary.href}
										className="inline-flex items-center gap-2 w-fit px-6 py-3 bg-primary text-on-primary font-bold uppercase tracking-widest text-sm rounded-full hover:bg-[#5eebe8] hover:scale-105 transition-all group"
									>
										{slide.ctaButtons.primary.text || "Baca Selengkapnya!"}

										<ArrowRight className="size-4 group-hover:translate-x-1 transition-transform" />
									</Link>
								)}
							</div>
						)}
					</SwiperSlide>
				))}
			</Swiper>

			{/* Custom Navigation Arrows */}

			{showNavigation && showControls && (
				<>
					<button
						onClick={() => swiperRef.current?.swiper.slidePrev()}
						className={`absolute left-4 md:left-8 top-1/2 -translate-y-1/2 z-20 w-10 h-10 md:w-12 md:h-12 rounded-full flex items-center justify-center hover:scale-110 transition-all group ${
							isDark
								? "glass-panel hover:bg-primary/20"
								: "bg-white/80 hover:bg-white shadow-lg border border-gray-200"
						}`}
						aria-label="Previous slide"
					>
						<ChevronLeft
							className={`size-5 md:size-6 group-hover:scale-110 transition-transform ${
								isDark ? "text-primary" : "text-[#0a7c6e]"
							}`}
						/>
					</button>

					<button
						onClick={() => swiperRef.current?.swiper.slideNext()}
						className={`absolute right-4 md:right-8 top-1/2 -translate-y-1/2 z-20 w-10 h-10 md:w-12 md:h-12 rounded-full flex items-center justify-center hover:scale-110 transition-all group ${
							isDark
								? "glass-panel hover:bg-primary/20"
								: "bg-white/80 hover:bg-white shadow-lg border border-gray-200"
						}`}
						aria-label="Next slide"
					>
						<ChevronRight
							className={`size-5 md:size-6 group-hover:scale-110 transition-transform ${
								isDark ? "text-primary" : "text-[#0a7c6e]"
							}`}
						/>
					</button>
				</>
			)}

			{/* Custom Swiper Styles */}

			<style jsx global>{`
				.banner-slider {
					width: 100%;

					height: 100%;
				}

				.banner-slider .swiper-wrapper {
					height: 100% !important;
				}

				.banner-slider .swiper-slide {
					width: 100% !important;

					height: 100% !important;

					flex-shrink: 0 !important;
				}

				.banner-slider .swiper-button-next,
				.banner-slider .swiper-button-prev {
					display: none !important;
				}

				.banner-slider .swiper-lazy-preloader {
					display: none !important;
				}

				.banner-slider .swiper-fade .swiper-slide {
					pointer-events: none;
				}

				.banner-slider .swiper-fade .swiper-slide-active {
					pointer-events: auto;
				}

				.banner-slider .swiper-fade .swiper-slide-active .animate-float {
					animation: floatIn 0.8s ease-out 0.3s both;
				}

				.banner-slider .swiper-fade .swiper-slide-active h1 {
					animation: slideUp 0.6s ease-out 0.2s both;
				}

				.banner-slider .swiper-fade .swiper-slide-active p {
					animation: slideUp 0.6s ease-out 0.4s both;
				}

				.banner-slider .swiper-fade .swiper-slide-active span {
					animation: fadeIn 0.5s ease-out 0.1s both;
				}

				@keyframes floatIn {
					from {
						opacity: 0;

						transform: translateX(50px) scale(0.9);
					}

					to {
						opacity: 1;

						transform: translateX(0) scale(1);
					}
				}

				@keyframes slideUp {
					from {
						opacity: 0;

						transform: translateY(30px);
					}

					to {
						opacity: 1;

						transform: translateY(0);
					}
				}

				@keyframes fadeIn {
					from {
						opacity: 0;

						transform: scale(0.9);
					}

					to {
						opacity: 1;

						transform: scale(1);
					}
				}

				.animate-float {
					animation: float 3s ease-in-out infinite;
				}

				@keyframes float {
					0%,
					100% {
						transform: translateY(0px);
					}

					50% {
						transform: translateY(-15px);
					}
				}
			`}</style>
		</div>
	);
}

export default BannerSlider;
