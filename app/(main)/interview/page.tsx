"use client";

import { useState, useEffect, useMemo, useRef } from "react";
import { Suspense } from "react";
import { Loader2, Play, ChevronRight } from "lucide-react";
import { useInterviews } from "@/hooks/queries/useContent";
import { useUIStore } from "@/stores/uiStore";

function InterviewContent() {
	const { theme } = useUIStore();
	const isDark = theme === "dark";

	const [page, setPage] = useState(1);
	const [displayedInterviews, setDisplayedInterviews] = useState<any[]>([]);
	const [isLoadingMore, setIsLoadingMore] = useState(false);
	const [hasMore, setHasMore] = useState(false);
	const [isInitialized, setIsInitialized] = useState(false);
	const dataSectionRef = useRef<HTMLDivElement>(null);

	const { data, isLoading, isFetching } = useInterviews(page, 12);
	const interviews = data?.data || [];
	const totalPages = data?.metadata?.total_pages || 1;

	useEffect(() => {
		if (isInitialized) return;
		if (interviews.length > 0) {
			setDisplayedInterviews(interviews);
			setHasMore(page < totalPages);
			setIsInitialized(true);
		}
	}, [interviews, page, totalPages, isInitialized]);

	useEffect(() => {
		if (!isInitialized) return;
		if (page === 1) return;
		if (interviews.length > 0) {
			setDisplayedInterviews((prev) => {
				const existingIds = new Set(prev.map((item: any) => item.id));
				const uniqueNew = interviews.filter(
					(item: any) => !existingIds.has(item.id),
				);
				if (uniqueNew.length === 0) return prev;
				return [...prev, ...uniqueNew];
			});
		}
	}, [interviews, page, isInitialized]);

	useEffect(() => {
		setHasMore(page < totalPages);
	}, [page, totalPages]);

	const handleNextPage = () => {
		if (!hasMore || isLoadingMore) return;
		setIsLoadingMore(true);
		setPage((p) => p + 1);
	};

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

	useEffect(() => {
		if (!isFetching && isLoadingMore) {
			setIsLoadingMore(false);
		}
	}, [isFetching, isLoadingMore]);

	return (
		<>
			{/* Background Layers */}
			<div className="fixed inset-0 pointer-events-none ">
				<div
					className="absolute top-[-10%] right-[-10%] w-125 h-125 rounded-full"
					style={{
						background: isDark ? "#00C2B1" : "#0a7c6e",
						filter: "blur(80px)",
						opacity: isDark ? 0.2 : 0.15,
					}}
				/>
				<div
					className="absolute top-[50%] bottom-[-10%] left-[-10%] w-150 h-150 rounded-full"
					style={{
						background: isDark ? "#fe9d00" : "#b8860b",
						filter: "blur(80px)",
						opacity: isDark ? 0.2 : 0.15,
					}}
				/>
			</div>

			<main className="py-8 md:py-24 pb-28 px-6 max-w-screen-2xl mx-auto">
				{/* Hero Header */}
				<section className="mb-8 md:mb-16 text-center">
					<div
						className={`inline-block mb-4 px-4 py-1 rounded-full border text-sm font-semibold uppercase tracking-widest ${isDark ? "border-[#d8531a]/40 bg-[#d8531a]/20 text-[#d8531a]" : "border-[#b3461a]/40 bg-[#b3461a]/20 text-[#b3461a]"}`}
					>
						Exclusive
					</div>
					<h1
						className={`text-3xl md:text-7xl font-bold uppercase italic tracking-tighter mb-4 ${isDark ? "text-white" : "text-[#1a1a1a]"}`}
						style={{
							textShadow: isDark
								? "0 0 20px rgba(0, 194, 177, 0.6)"
								: "0 0 10px rgba(10, 124, 110, 0.4)",
							lineHeight: "1.1",
							letterSpacing: "-0.04em",
						}}
					>
						Voices of the{" "}
						<span className={isDark ? "text-green" : "text-[#0a7c6e]"}>
							Game
						</span>
					</h1>
					<p
						className={`text-md max-w-2xl mx-auto leading-relaxed ${isDark ? "text-[#bbcac6]" : "text-[#5a5a5a]"}`}
					>
						Interview legenda dan bintang Eropa, buat kamu yang mau tahu isi
						kepala para jagoan bola!
					</p>
				</section>

				{/* Bento Grid Video Gallery */}
				<div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-stretch">
					{/* Featured Card (Large) - col-span-8 */}
					<div className="md:col-span-8 group relative overflow-hidden rounded-xl glass-panel glowing-border transition-all duration-500 flex items-stretch">
						<div
							className="relative overflow-hidden w-full"
							style={{ aspectRatio: "16/9" }}
						>
							{displayedInterviews[0] ? (
								<img
									src={`${process.env.NEXT_PUBLIC_API_URL}/storage/${displayedInterviews[0].image}`}
									alt={displayedInterviews[0].title || "Featured Interview"}
									className="w-full h-full object-cover object-[40%_30%] group-hover:scale-105 transition-transform duration-700"
								/>
							) : (
								<div className="w-full h-full bg-linear-to-br from-[#1c211e] to-[#0f1412]" />
							)}
							<div className="absolute inset-0 bg-linear-to-t from-black via-black/20 to-transparent" />
						</div>
					</div>

					{/* Side Card - col-span-4 */}
					<div className="md:col-span-4 group glass-panel rounded-xl glowing-border transition-all duration-300 flex flex-col">
						<div className="relative overflow-hidden rounded-xl w-full">
							{displayedInterviews[1] ? (
								<img
									src={`${process.env.NEXT_PUBLIC_API_URL}/storage/${displayedInterviews[1].image}`}
									alt={displayedInterviews[1].title || "Interview"}
									className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
								/>
							) : (
								<div className="w-full h-full bg-linear-to-br from-[#1c211e] to-[#0f1412]" />
							)}
							<div className="absolute inset-0 bg-black/40 group-hover:bg-black/20 transition-colors" />
						</div>
					</div>

					{/* Gallery Row - 3 cards */}
					{displayedInterviews
						.slice(2, 5)
						.map((interview: any, idx: number) => (
							<div
								key={interview.id || idx}
								className="md:col-span-4 group glass-panel rounded-xl glowing-border transition-all duration-300"
							>
								<div className="relative overflow-hidden aspect-square rounded-xl w-full">
									<img
										src={`${process.env.NEXT_PUBLIC_API_URL}/storage/${interview.image}`}
										alt={interview.title || "Interview"}
										className="w-full h-full object-cover object-[40%_30%] group-hover:scale-110 transition-transform duration-500 rounded-xl"
									/>
									<div className="absolute inset-0 bg-black/30" />
								</div>
							</div>
						))}

					{/* Fallback cards when loading */}
					{isLoading && displayedInterviews.length === 0 && (
						<>
							{[...Array(3)].map((_, idx) => (
								<div
									key={`fallback-${idx}`}
									className="md:col-span-4 glass-panel rounded-xl animate-pulse"
								>
									<div className="aspect-video bg-[#1c211e] rounded-t-xl" />
								</div>
							))}
						</>
					)}
				</div>

				{/* Additional Interviews Grid */}
				{displayedInterviews.length > 3 && (
					<div
						ref={dataSectionRef}
						className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-6"
					>
						{displayedInterviews.slice(3).map((interview: any, idx: number) => (
							<div
								key={interview.id}
								className="group glass-panel rounded-xl glowing-border transition-all duration-300"
							>
								<div className="relative overflow-hidden rounded-xl w-full aspect-square">
									<img
										src={`${process.env.NEXT_PUBLIC_API_URL}/storage/${interview.image}`}
										alt={interview.title || "Interview"}
										className="w-full h-full object-cover object-[40%_30%] group-hover:scale-110 transition-transform duration-500 rounded-xl"
									/>
									<div className="absolute inset-0 bg-black/30 group-hover:bg-black/20 transition-colors" />
								</div>
							</div>
						))}
					</div>
				)}

				{/* Pagination/Load More */}
				<div className="mt-16 flex justify-center">
					{hasMore ? (
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
								<>Unlock More Stories</>
							)}
						</button>
					) : displayedInterviews.length > 0 ? (
						<div
							className={`text-center py-8 ${isDark ? "text-[#bbcac6]" : "text-[#5a5a5a]"}`}
						>
							<p>Kamu udah lihat semua data interview sob!</p>
						</div>
					) : null}
				</div>
			</main>
		</>
	);
}

function LoadingSkeleton() {
	return (
		<div className="flex items-center justify-center min-h-screen">
			<Loader2 className="size-10 animate-spin text-[#00C2B1]" />
		</div>
	);
}

export default function InterviewPage() {
	const { theme } = useUIStore();
	const isDark = theme === "dark";

	return (
		<div
			className={`min-h-screen transition-colors duration-300 ${isDark ? "bg-[#0f1412] text-[#dfe4e0]" : "bg-[#f5f5f5] text-[#1a1a1a]"}`}
		>
			<style jsx global>{`
				@import url("https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@300..700&family=Lexend:wght@300..800&display=swap");

				.glass-panel {
					background: ${isDark
						? "rgba(255, 255, 255, 0.05)"
						: "rgba(255, 255, 255, 0.8)"};
					backdrop-filter: blur(20px);
					border: 1px solid
						${isDark ? "rgba(255, 255, 255, 0.1)" : "rgba(0, 0, 0, 0.1)"};
				}

				.glowing-border:hover {
					border-color: ${isDark ? "#00c2b1" : "#0a7c6e"};
					box-shadow:
						0 0 15px
							${isDark ? "rgba(0, 194, 177, 0.3)" : "rgba(10, 124, 110, 0.3)"},
						inset 0 0 5px
							${isDark ? "rgba(0, 194, 177, 0.2)" : "rgba(10, 124, 110, 0.2)"};
				}

				body {
					font-family: "Lexend", sans-serif;
				}
			`}</style>
			<Suspense fallback={<LoadingSkeleton />}>
				<InterviewContent />
			</Suspense>
		</div>
	);
}
