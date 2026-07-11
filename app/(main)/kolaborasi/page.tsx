"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { Suspense } from "react";
import { Loader2, ChevronRight } from "lucide-react";
import { useKolaborasis } from "@/hooks/queries/useContent";
import { useUIStore } from "@/stores/uiStore";
import AdSlot from "@/components/ads/AdSlot";

function KolaborasiContent() {
	const { theme } = useUIStore();
	const isDark = theme === "dark";

	const [page, setPage] = useState(1);
	const [displayedKolaborasis, setDisplayedKolaborasis] = useState<any[]>([]);
	const [isLoadingMore, setIsLoadingMore] = useState(false);
	const [hasMore, setHasMore] = useState(false);
	const [isInitialized, setIsInitialized] = useState(false);
	const dataSectionRef = useRef<HTMLDivElement>(null);

	const { data, isLoading, isFetching } = useKolaborasis(page, 10);
	const kolaborasis = data?.data || [];
	const totalPages = data?.metadata?.total_pages || 1;

	// Initialize page 1 data
	useEffect(() => {
		if (isInitialized) return;

		if (kolaborasis.length > 0) {
			setDisplayedKolaborasis(kolaborasis);
			setHasMore(page < totalPages);
			setIsInitialized(true);
		}
	}, [kolaborasis, page, totalPages, isInitialized]);

	// Handle pagination for page > 1
	useEffect(() => {
		if (!isInitialized) return;
		if (page === 1) return;

		if (kolaborasis.length > 0) {
			setDisplayedKolaborasis((prev) => {
				const existingIds = new Set(prev.map((item: any) => item.id));
				const uniqueNew = kolaborasis.filter(
					(item: any) => !existingIds.has(item.id),
				);
				if (uniqueNew.length === 0) return prev;
				return [...prev, ...uniqueNew];
			});
		}
	}, [kolaborasis, page, isInitialized]);

	// Sync hasMore
	useEffect(() => {
		setHasMore(page < totalPages);
	}, [page, totalPages]);

	const handleNextPage = () => {
		if (!hasMore || isLoadingMore) return;
		setIsLoadingMore(true);
		setPage((p) => p + 1);
	};

	// Scroll to data section after new page data loads
	useEffect(() => {
		if (!isLoadingMore) return;

		const timer = setTimeout(() => {
			if (dataSectionRef.current) {
				dataSectionRef.current.scrollIntoView({
					behavior: "smooth",
					block: "start",
				});
			}
		}, 300);

		return () => clearTimeout(timer);
	}, [isLoadingMore]);

	// Reset loading state
	useEffect(() => {
		if (!isFetching && isLoadingMore) {
			setIsLoadingMore(false);
		}
	}, [isFetching, isLoadingMore]);

	return (
		<>
			{/* Partners Section */}
			<section className={`py-8 md:py-24 px-8 pb-16 min-h-screen relative transition-colors duration-300 ${isDark ? "bg-[#0f1412]" : "bg-[#f5f5f5]"}`}>
				{/* Background Effects */}
				<div className={`absolute inset-0 ${isDark ? "bg-[linear-gradient(rgba(15,20,18,0.85),rgba(15,20,18,0.85)),url('/images/kolaborasi/kolaborasi-bg.webp')]" : "bg-[linear-gradient(rgba(245,245,245,0.9),rgba(245,245,245,0.9)),url('/images/kolaborasi/kolaborasi-bg.webp')]"} bg-cover bg-center bg-fixed opacity-50`}></div>
				<div className="absolute top-0 right-0 w-100 h-100 z-0">
					<div className={`absolute top-0 right-0 w-full h-full rounded-full blur-[120px] ${isDark ? "bg-[#0D645F]/20" : "bg-[#0D645F]/10"}`}></div>
				</div>
				<div className="absolute bottom-0 left-0 w-100 h-100 z-0">
					<div className={`absolute bottom-0 left-0 w-full h-full rounded-full blur-[120px] ${isDark ? "bg-[#d8531a]/10" : "bg-[#d8531a]/5"}`}></div>
				</div>

				<div className="max-w-7xl mx-auto relative z-10">
					{/* Hero Text Section */}
					<div className="text-center md:text-left flex flex-col md:flex-row items-center gap-12 mb-16">
						<div className="flex-1 space-y-6">
							<div className={`inline-block px-4 py-1 rounded-full border text-xs font-bold uppercase tracking-[0.2em] ${isDark ? "bg-[#d8531a]/20 border-[#d8531a]/40 text-[#d8531a]" : "bg-[#b3461a]/20 border-[#b3461a]/40 text-[#b3461a]"}`}>
								Our Network
							</div>
							<h1 className={`text-4xl md:text-5xl lg:text-6xl font-bold uppercase leading-none ${isDark ? "text-white" : "text-[#1a1a1a]"}`}>
								They Scored Big with{" "}
								<span className={`drop-shadow-[0_0_10px_rgba(13,100,95,0.5)] ${isDark ? "text-green" : "text-[#0a7c6e]"}`}>
									OlahBola
								</span>
							</h1>
							<p className={`text-lg max-w-xl ${isDark ? "text-white/60" : "text-[#5a5a5a]"}`}>
								Di balik tiap logo, ada cerita kolaborasi yang bikin sepak bola
								makin seru. Klik dan temukan kisahnya!
							</p>
						</div>
						<div className="flex-1 w-full max-w-md">
							<div
								className={`p-8 rounded-3xl border relative overflow-hidden ${isDark ? "border-white/10" : "border-black/10"}`}
								style={{
									background: isDark ? "rgba(255,255,255,0.03)" : "rgba(255,255,255,0.8)",
									backdropFilter: "blur(20px)",
								}}
							>
								<div className={`absolute -top-24 -right-24 w-64 h-64 blur-[80px] rounded-full ${isDark ? "bg-[#0D645F]/20" : "bg-[#0D645F]/10"}`}></div>
								<div className="relative z-10 space-y-2">
									<div className={`font-bold text-3xl ${isDark ? "text-green" : "text-[#0a7c6e]"}`}>30+</div>
									<div className={`font-bold uppercase tracking-widest text-sm ${isDark ? "text-white/60" : "text-[#5a5a5a]"}`}>
										Brand Partners
									</div>
									<p className={`text-xs italic ${isDark ? "text-white/40" : "text-[#6a6a6a]"}`}>
										Brand-brand terkemuka telah bergabung. Sekarang giliran
										Kamu!
									</p>
								</div>
							</div>
						</div>
					</div>

					{/* Partner Grid */}
					{isLoading && displayedKolaborasis.length === 0 ? (
						<div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6">
							{[...Array(10)].map((_, i) => (
								<div
									key={i}
									className="animate-pulse rounded-2xl flex items-center justify-center h-40"
									style={{ background: isDark ? "rgba(255,255,255,0.03)" : "rgba(255,255,255,0.8)" }}
								>
									<div className={`w-20 h-20 rounded-xl ${isDark ? "bg-white/10" : "bg-black/10"}`}></div>
								</div>
							))}
						</div>
					) : displayedKolaborasis.length === 0 ? (
						<div className={`text-center py-20 ${isDark ? "text-white/40" : "text-[#5a5a5a]"}`}>
							<p>Belum ada kolaborasi</p>
						</div>
					) : (
						<>
							<div
								ref={dataSectionRef}
								className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6 mb-16"
							>
								{displayedKolaborasis.map((kolaborasi: any) => (
									<Link
										key={kolaborasi.id}
										href={`/kolaborasi/${kolaborasi.slug}`}
										className="group p-8 rounded-2xl flex items-center justify-center h-40 transition-all duration-300 cursor-pointer"
										style={{
											background: isDark ? "rgba(255,255,255,0.03)" : "rgba(255,255,255,0.8)",
											backdropFilter: "blur(20px)",
											border: isDark ? "1px solid rgba(255,255,255,0.08)" : "1px solid rgba(0,0,0,0.08)",
										}}
										onMouseEnter={(e) => {
											e.currentTarget.style.boxShadow =
												isDark ? "0 0 30px rgba(13,100,95,0.3)" : "0 0 30px rgba(10,124,110,0.3)";
											e.currentTarget.style.borderColor = isDark ? "rgba(13,100,95,0.4)" : "rgba(10,124,110,0.4)";
										}}
										onMouseLeave={(e) => {
											e.currentTarget.style.boxShadow = "";
											e.currentTarget.style.borderColor = isDark ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.08)";
										}}
									>
										<div className="text-center">
											<img
												src={`${process.env.NEXT_PUBLIC_API_URL}/storage/${kolaborasi.sponsor_image}`}
												alt={kolaborasi.slug || "Partner"}
												className="w-full h-16 object-contain transition-all duration-300 group-hover:scale-125"
											/>
										</div>
									</Link>
								))}
							</div>

							{/* Kolaborasi Display Ads */}
							<div className="max-w-7xl mx-auto mb-12">
								<AdSlot
									client="ca-pub-8005120082355722"
									slot="4580524784"
									format="auto"
									minHeight={120}
								/>
							</div>

							{/* Next Page Button */}
							{hasMore && (
								<div className="flex justify-center py-4">
									<button
										onClick={handleNextPage}
										disabled={isLoadingMore}
										className={`px-12 py-4 bg-transparent border-2 font-semibold uppercase tracking-widest transition-all duration-300 rounded-sm flex items-center gap-2 ${isDark ? "border-[#00C2B1] text-[#00C2B1] hover:bg-[#00C2B1] hover:text-[#003732]" : "border-[#0a7c6e] text-[#0a7c6e] hover:bg-[#0a7c6e] hover:text-white"}`}
									>
										{isLoadingMore ? (
											<>
												<Loader2 className="size-5 animate-spin" />
												Memuat...
											</>
										) : (
											<>
												Selanjutnya
												<ChevronRight className="size-5" />
											</>
										)}
									</button>
								</div>
							)}

							{/* End of content */}
							{!hasMore && displayedKolaborasis.length > 0 && (
								<div className={`text-center py-8 ${isDark ? "text-white/40" : "text-[#5a5a5a]"}`}>
									<p>Anda telah melihat semua partner</p>
								</div>
							)}
						</>
					)}

					{/* CTA Section */}
					<div
						className="p-12 rounded-4xl text-center relative overflow-hidden mt-16"
						style={{
							background: isDark ? "rgba(255,255,255,0.03)" : "rgba(255,255,255,0.8)",
							backdropFilter: "blur(20px)",
							border: isDark ? "1px solid rgba(13,100,95,0.2)" : "1px solid rgba(10,124,110,0.2)",
						}}
					>
						<div className={`absolute inset-0 ${isDark ? "bg-linear-to-tr from-[#0D645F]/10 to-transparent" : "bg-linear-to-tr from-[#0a7c6e]/10 to-transparent"}`}></div>
						<div className="relative z-10 space-y-8">
							<h2 className={`text-3xl md:text-4xl font-bold uppercase italic ${isDark ? "text-white" : "text-[#1a1a1a]"}`}>
								Jadi Bagian dari Kami?
							</h2>
							<p className={`text-sm md:text-lg max-w-xl mx-auto ${isDark ? "text-white/60" : "text-[#5a5a5a]"}`}>
								Bergabung dengan kami! Jangkau jutaan fans, creators, dan
								penggemar bola di seluruh dunia.
							</p>
							<div className="flex justify-center">
								<Link
									href="/sapa"
									className={`px-12 py-5 rounded-full font-bold text-xs md:text-lg uppercase tracking-[0.2em] transition-all hover:scale-105 ${isDark ? "bg-[#0D645F] text-white" : "bg-[#0a7c6e] text-white"}`}
									style={{ boxShadow: isDark ? "0 0 30px rgba(13,100,95,0.5)" : "0 0 30px rgba(10,124,110,0.4)" }}
								>
									HUBUNGI KAMI
								</Link>
							</div>
						</div>
					</div>
				</div>

				{/* Kolaborasi Display Ads - Footer */}
				<div className="max-w-7xl mx-auto pb-16 px-8">
					<AdSlot
						client="ca-pub-8005120082355722"
						slot="4580524784"
						format="auto"
						minHeight={120}
					/>
				</div>
			</section>
		</>
	);
}

function LoadingSkeleton() {
	return (
		<div className="flex items-center justify-center min-h-100">
			<Loader2 className="size-10 animate-spin text-[#0D645F]" />
		</div>
	);
}

export default function KolaborasiPage() {
	const { theme } = useUIStore();
	const isDark = theme === "dark";

	return (
		<div className={`min-h-screen transition-colors duration-300 ${isDark ? "bg-[#0f1412]" : "bg-[#f5f5f5]"}`}>
			<Suspense fallback={<LoadingSkeleton />}>
				<KolaborasiContent />
			</Suspense>
		</div>
	);
}
