"use client";

import Link from "next/link";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation, Autoplay, EffectFade } from "swiper/modules";
import { ChevronRight, ChevronLeft, ArrowRight } from "lucide-react";
import { useRef } from "react";

// Import Swiper styles - use string path to avoid type resolution issues
// @ts-ignore
import "swiper/css";
// @ts-ignore
import "swiper/css/effect-fade";

export interface BannerSlide {
	id: string;
	type: "article" | "static" | "cta";
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
	const totalSlides = slides.length;
	const showControls = totalSlides > 1;
	const isAutoPlaying = showControls && autoPlay;

	return (
		<div className={`relative w-full h-full ${className}`}>
			<Swiper
				ref={swiperRef}
				modules={[Navigation, Autoplay, EffectFade]}
				slidesPerView={1}
				spaceBetween={0}
				effect="fade"
				fadeEffect={{ crossFade: true }}
				autoplay={
					isAutoPlaying
						? {
								delay: autoPlayInterval,
								disableOnInteraction: false,
								pauseOnMouseEnter: true,
							}
						: false
				}
				navigation={showControls}
				className="banner-slider w-full! h-full!"
				speed={800}
				loop={showControls}
				watchOverflow={true}
			>
				{slides.map((slide, index) => (
					<SwiperSlide key={slide.id} className="w-full! h-full! list-none!">
						{/* Background - First slide loads eagerly, others lazy */}
						<div className="absolute inset-0 w-full h-full">
							{(
								slide.type === "article" ? slide.image : slide.imageFallback
							) ? (
								<img
									src={
										slide.type === "article"
											? `${process.env.NEXT_PUBLIC_API_URL}/storage/${slide.image}`
											: isMobile
												? slide.imageMobileFallback || slide.imageFallback
												: slide.imageFallback
									}
									alt={
										slide.ctaTitle || slide.title?.parts?.join(" ") || "Banner"
									}
									className={`w-full h-full object-cover object-top ${
										isDark
											? "grayscale-[0.2] contrast-125"
											: "grayscale-[0.1] contrast-105"
									}`}
									fetchPriority={index === 0 ? "high" : "low"}
									decoding="async"
									loading={index === 0 ? "eager" : "lazy"}
								/>
							) : (
								<div className="w-full h-full bg-linear-to-br from-[#0f1412] via-[#141a17] to-[#0f1412]" />
							)}
						</div>

						{/* Overlays */}
						<div
							className={`absolute inset-0 ${
								slide.type === "cta"
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
										: `bg-linear-to-r ${
												isDark
													? "from-black via-[#0f1412]/60 to-transparent"
													: "from-[#f5f5f5]/95 via-[#f5f5f5]/20 to-transparent"
											}`
							}`}
						/>

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
																	isDark ? "text-[#43decc]" : "text-[#0a7c6e]"
																} text-glow block`
															: part.color === "accent"
																? "text-[#fe9d00]"
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
											isDark ? "text-[#bbcac6]" : "text-[#5a5a5a]"
										}`}
									>
										{slide.description}
									</p>
								</div>

								<div className="flex items-center justify-center order-1 md:order-2 w-full md:w-5/12 lg:w-1/2 md:justify-end">
									<div className="relative w-70 h-70 md:w-56 md:h-56 lg:w-110 lg:h-110">
										<div className="absolute inset-0 bg-linear-to-br from-[#43decc]/20 to-[#fe9d00]/20 rounded-full blur-3xl" />
										<div className="relative w-full h-full rounded-2xl overflow-hidden animate-float">
											<img
												src="/images/home/banner-1.webp"
												alt="Banner Image"
												className="w-full h-full object-cover"
												loading="lazy"
											/>
										</div>
									</div>
								</div>
							</div>
						) : slide.type === "cta" ? (
							/* CTA Type */
							<div className="relative z-10 w-full h-full flex items-center">
								<div className="relative z-20 w-full max-w-2xl lg:max-w-4xl px-14 md:px-8 ml-auto mr-4 md:mr-16 lg:mr-32 text-center md:text-right mt-50 md:mt-0">
									{slide.ctaTitle && (
										<h2 className="text-xl md:text-[42px] lg:text-[48px] font-black uppercase leading-tight md:leading-[1.1] mb-4 md:mb-6 text-white">
											{slide.ctaTitle.split("\n").map((line, i) => (
												<span key={i} className="block last:mb-0">
													{line}
												</span>
											))}
										</h2>
									)}
									{slide.ctaSubtitle && (
										<p className="text-sm md:text-lg font-semibold leading-relaxed mb-6 md:mb-8 max-w-lg ml-auto">
											<span className="text-[#43decc]">
												{slide.ctaSubtitle}
											</span>
										</p>
									)}
									{slide.ctaCtaText && slide.ctaCtaHref && (
										<a
											href={slide.ctaCtaHref}
											target="_blank"
											rel="noopener noreferrer"
											className="group relative inline-flex items-center gap-3 px-8 py-4 rounded-2xl text-xs md:text-lg font-black uppercase tracking-wide transition-all duration-300 overflow-hidden bg-linear-to-r from-[#00c2b1] to-[#00a89a] text-black shadow-[0_0_30px_rgba(0,194,177,0.5)] hover:shadow-[0_0_50px_rgba(0,194,177,0.8)] hover:scale-105 active:scale-95 border border-[#00c2b1]/40"
										>
											<span className="relative z-10 flex items-center gap-3">
												<svg
													className="w-5 h-5 md:w-6 md:h-6"
													fill="none"
													stroke="currentColor"
													viewBox="0 0 24 24"
												>
													<path
														strokeLinecap="round"
														strokeLinejoin="round"
														strokeWidth={2}
														d="M13 10V3L4 14h7v7l9-11h-7z"
													/>
												</svg>
												{slide.ctaCtaText}
											</span>
											<div className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-700 bg-linear-to-r from-transparent via-white/30 to-transparent" />
										</a>
									)}
									{slide.ctaTerms && (
										<p className="text-sm mt-3 text-[#ffaa00]">
											{slide.ctaTerms}
										</p>
									)}
								</div>
							</div>
						) : (
							/* Article Type */
							<div className="relative z-10 w-full max-w-4xl px-18 md:px-16 lg:px-24 xl:px-32 mt-24 md:mt-0 h-full flex flex-col justify-center">
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
																	isDark ? "text-[#43decc]" : "text-[#0a7c6e]"
																} text-glow block`
															: color === "accent"
																? "text-[#fe9d00]"
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
										isDark ? "text-[#bbcac6]" : "text-[#5a5a5a]"
									}`}
								>
									{slide.excerpt}
								</p>
								{slide.ctaButtons?.primary?.href && (
									<Link
										href={slide.ctaButtons.primary.href}
										className="inline-flex items-center gap-2 w-fit px-6 py-3 bg-[#43decc] text-[#003732] font-bold uppercase tracking-widest text-sm rounded-full hover:bg-[#5eebe8] hover:scale-105 transition-all group"
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
								? "glass-panel hover:bg-[#43decc]/20"
								: "bg-white/80 hover:bg-white shadow-lg border border-gray-200"
						}`}
						aria-label="Previous slide"
					>
						<ChevronLeft
							className={`size-5 md:size-6 group-hover:scale-110 transition-transform ${
								isDark ? "text-[#43decc]" : "text-[#0a7c6e]"
							}`}
						/>
					</button>
					<button
						onClick={() => swiperRef.current?.swiper.slideNext()}
						className={`absolute right-4 md:right-8 top-1/2 -translate-y-1/2 z-20 w-10 h-10 md:w-12 md:h-12 rounded-full flex items-center justify-center hover:scale-110 transition-all group ${
							isDark
								? "glass-panel hover:bg-[#43decc]/20"
								: "bg-white/80 hover:bg-white shadow-lg border border-gray-200"
						}`}
						aria-label="Next slide"
					>
						<ChevronRight
							className={`size-5 md:size-6 group-hover:scale-110 transition-transform ${
								isDark ? "text-[#43decc]" : "text-[#0a7c6e]"
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
