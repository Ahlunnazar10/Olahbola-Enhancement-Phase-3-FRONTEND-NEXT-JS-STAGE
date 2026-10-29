"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useOlahflixVideos, type Video } from "@/hooks/queries/useOlahflix";
import { OlahflixModal } from "@/components/olahflix/OlahflixModal";
import { useUIStore } from "@/stores/uiStore";
import { formatRelativeTime, formatClock } from "@/lib/utils";
import {
	trackPageVisit,
	trackVideoPreviewPlay,
	trackEvent,
} from "@/lib/analytics";
import { PlayIcon } from "lucide-react";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "https://cms.olahbola.com";
const PREVIEW_DURATION = 3;

/* ─────────────────────────────────────────────
   Helpers
───────────────────────────────────────────── */
function formatViews(video: Video): string {
	const kb = (video.file_size || 0) / 1024 / 1024;
	return kb >= 1 ? `${Math.round(kb)}K` : "0";
}

/* ─────────────────────────────────────────────
   Card
───────────────────────────────────────────── */
function VideoPreviewCard({
	video,
	index,
	onClick,
}: {
	video: Video;
	index: number;
	onClick: () => void;
}) {
	const [isHovered, setIsHovered] = useState(false);
	const videoRef = useRef<HTMLVideoElement>(null);

	const handleEnter = useCallback(() => {
		setIsHovered(true);
		trackVideoPreviewPlay(video.id, video.title);
		const v = videoRef.current;
		if (v) {
			v.currentTime = 0;
			v.play().catch(() => {});
		}
	}, [video.id, video.title]);

	const handleLeave = useCallback(() => {
		setIsHovered(false);
		const v = videoRef.current;
		if (v) {
			v.pause();
			v.currentTime = 0;
		}
	}, []);

	const handleTimeUpdate = useCallback(() => {
		const v = videoRef.current;
		if (!v) return;
		if (v.currentTime >= PREVIEW_DURATION) {
			v.pause();
			v.currentTime = 0;
		}
	}, []);

	return (
		<button
			onClick={onClick}
			aria-label={`Putar video: ${video.title}`}
			onMouseEnter={handleEnter}
			onMouseLeave={handleLeave}
			style={{ animation: `cardFadeIn 0.4s ease ${index * 0.06}s both` }}
			className="group relative rounded-xl overflow-hidden bg-surface-container-low flex flex-col justify-between
				surface-xl transition-all duration-300 hover:-translate-y-1.5  cursor-pointer
				w-full h-full text-left focus:outline-none"
		>
			{/* Thumbnail */}
			<img
				src={`${API_BASE}/storage/${video.image}`}
				alt={video.title}
				loading="lazy"
				className="absolute inset-0 w-full h-full object-cover
					transition-transform duration-500 group-hover:scale-105"
			/>

			{/* Video preview */}
			<video
				ref={videoRef}
				src={`${API_BASE}/api/v1/video/file/${video.video}`}
				muted
				playsInline
				preload="none"
				onTimeUpdate={handleTimeUpdate}
				className={`absolute inset-0 w-full h-full object-cover z-10 transition-opacity duration-200 ${
					isHovered ? "opacity-100" : "opacity-60"
				}`}
			/>

			{/* Gradient overlay */}
			<div className="absolute inset-0 bg-linear-to-t from-surface-container-lowest via-surface-container-lowest/50 to-surface-dim/40" />
			<div className="absolute inset-0 bg-primary/0 group-hover:bg-primary/5 transition-colors" />

			{/* Center: play button */}
			<div className="relative z-20 flex items-center justify-center my-auto">
				{!isHovered && (
					<div
						className="w-11 h-11 rounded-full bg-surface-dim/70 backdrop-blur-xl flex items-center justify-center
						text-primary group-hover:bg-primary-container group-hover:text-on-primary-container group-hover:scale-110
						shadow-[0_0_16px_rgba(67,222,204,0.45)] transition-all duration-300"
					>
						<svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
							<path d="M8 5v14l11-7z" />
						</svg>
					</div>
				)}
			</div>

			{/* Bottom meta */}
			<div className="relative z-20 p-3 bg-linear-to-t from-surface-container-lowest via-surface-container-lowest/90 to-transparent flex flex-col gap-1.5">
				<div className="flex items-center justify-between font-label-bold text-[11px] text-on-surface-variant">
					<span className="flex items-center gap-1 text-primary">
						<PlayIcon className="w-3.5 h-3.5" />
						{formatClock(video.duration)}
					</span>
					<span className="flex items-center gap-0.5">
						<svg
							width="13"
							height="13"
							viewBox="0 0 24 24"
							fill="none"
							stroke="currentColor"
							strokeWidth="2"
						>
							<path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
							<circle cx="12" cy="12" r="3" />
						</svg>
						{formatViews(video)}
					</span>
				</div>
				<h2 className="text-base font-bold text-on-surface leading-snug line-clamp-2 group-hover:text-primary transition-colors">
					{video.title}
				</h2>
				<div className="text-[10px] text-outline font-body-sm">
					<span>{formatRelativeTime(video.created_at)}</span>
				</div>
			</div>
		</button>
	);
}

/* ──────────────────────���──────────────────────
   Skeleton
───────────────────────────────────────────── */
function SkeletonCard() {
	return (
		<div
			className="h-full rounded-xl bg-surface-container-low animate-pulse"
			aria-hidden
		/>
	);
}

/* ─────────────────────────────────────────────
   Content
───────────────────────────────────────────── */
function OlahflixContent() {
	const { theme } = useUIStore();
	const isDark = theme === "dark";

	const [page, setPage] = useState(1);
	const [modalIndex, setModalIndex] = useState<number | null>(null);

	useEffect(() => {
		trackPageVisit("OlahFlix");
	}, []);

	const { data, isLoading } = useOlahflixVideos(page, 6);
	const videos: Video[] = data?.data || [];
	const totalPages = data?.metadata?.total_pages || 1;
	const totalVideos = data?.metadata?.total || 0;

	useEffect(() => {
		if (page > 1) {
			const tp = data?.metadata?.total_pages || 1;
			trackEvent("video_page_change", "olahflix", { page, total_pages: tp });
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [page]);

	useEffect(() => {
		setModalIndex(null);
	}, [page]);

	useEffect(() => {
		if (modalIndex !== null) {
			const prev = document.body.style.overflow;
			document.body.style.overflow = "hidden";
			return () => {
				document.body.style.overflow = prev;
			};
		}
	}, [modalIndex]);

	const activeVideo = modalIndex !== null ? videos[modalIndex] : null;

	const rangeStart = (page - 1) * 6 + 1;
	const rangeEnd = (page - 1) * 6 + videos.length;

	return (
		<>
			<style>{`
				@keyframes cardFadeIn {
					from { opacity: 0; transform: translateY(12px); }
					to   { opacity: 1; transform: translateY(0); }
				}
			`}</style>

			<div className="relative w-full h-350 md:h-150 flex flex-col overflow-hidden select-none justify-between px-4 md:px-6">
				{/* ── Header ── */}
				<div className="relative z-10 flex flex-col gap-2 shrink-0 mt-8 mb-6">
					<div className="flex items-center justify-between gap-4">
						<div className="flex items-center gap-2">
							<h1
								className="text-3xl md:text-4xl font-extrabold italic tracking-tight leading-none
								bg-linear-to-r from-on-surface via-primary-fixed to-primary bg-clip-text text-transparent w-38 md:w-46"
							>
								OLAHFLIX
							</h1>
							<span className="text-outline-variant font-body-md text-base">
								/
							</span>
							<p className="text-xs md:text-base text-on-surface-variant truncate max-w-xl font-bold">
								Semua Cerita Sepak Bola, dalam Video.
							</p>
						</div>
					</div>
				</div>

				{/* ── Grid: 6 portrait cards, 1 row ── */}
				<div className="relative z-10 grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-3.5 flex-1 min-h-0 items-stretch my-1">
					{isLoading && videos.length === 0
						? [...Array(6)].map((_, i) => <SkeletonCard key={i} />)
						: videos.map((video, idx) => (
								<VideoPreviewCard
									key={video.id}
									video={video}
									index={idx}
									onClick={() => setModalIndex(idx)}
								/>
							))}
				</div>

				{/* ── Bottom control bar ── */}
				<div
					className="relative z-10 flex items-center justify-between gap-4
					 backdrop-blur-md px-4 py-4 rounded-xl shrink-0"
				>
					{/* Left: status */}
					<div className="flex items-center gap-3">
						<span className="font-body-md text-[13px] text-on-surface-variant">
							Menampilkan{" "}
							<span className="font-label-bold text-on-surface">
								{rangeStart} - {rangeEnd}
							</span>{" "}
							dari{" "}
							<span className="font-label-bold text-primary">
								{totalVideos} Shorts
							</span>
						</span>
					</div>

					{/* Center: pagination */}
					{totalPages > 1 && (
						<div className="flex items-center gap-1.5">
							<button
								aria-label="Previous Page"
								onClick={() => page > 1 && setPage(page - 1)}
								disabled={page === 1}
								className="w-8 h-8 rounded-lg bg-surface-container-high hover:bg-surface-bright
									flex items-center justify-center text-on-surface-variant hover:text-on-surface
									transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
							>
								<svg
									width="18"
									height="18"
									viewBox="0 0 24 24"
									fill="none"
									stroke="currentColor"
									strokeWidth="2"
								>
									<path d="M15 18l-6-6 6-6" />
								</svg>
							</button>

							{Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
								<button
									key={p}
									onClick={() => p !== page && setPage(p)}
									aria-current={p === page ? "page" : undefined}
									className={`w-8 h-8 rounded-lg font-label-bold text-[13px] transition-colors ${
										p === page
											? "bg-primary-container text-on-primary-container shadow-[0_0_12px_rgba(0,194,177,0.4)]"
											: "bg-surface-container-high hover:bg-surface-bright text-on-surface-variant hover:text-on-surface"
									}`}
								>
									{p}
								</button>
							))}

							<button
								aria-label="Next Page"
								onClick={() => page < totalPages && setPage(page + 1)}
								disabled={page === totalPages}
								className="w-8 h-8 rounded-lg bg-surface-container-high hover:bg-surface-bright
									flex items-center justify-center text-on-surface-variant hover:text-on-surface
									transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
							>
								<svg
									width="18"
									height="18"
									viewBox="0 0 24 24"
									fill="none"
									stroke="currentColor"
									strokeWidth="2"
								>
									<path d="M9 18l6-6-6-6" />
								</svg>
							</button>
						</div>
					)}
				</div>
			</div>

			{/* Modal */}
			{modalIndex !== null && activeVideo && (
				<OlahflixModal
					videos={videos}
					activeIndex={modalIndex}
					hasMore={page < totalPages}
					onNavigate={(i) => {
						if (i >= videos.length && page < totalPages) {
							setPage((p) => p + 1);
							setModalIndex(0);
						} else {
							setModalIndex(i);
						}
					}}
					onClose={() => setModalIndex(null)}
				/>
			)}
		</>
	);
}

/* ─────────────────────────────────────────────
   Page
───────────────────────────────────────────── */
export default function OlahflixPage() {
	const { theme } = useUIStore();
	const isDark = theme === "dark";

	return (
		<div
			className={`h-full pb-20 overflow-hidden transition-colors duration-300 ${
				isDark ? "bg-surface text-on-surface" : "bg-surface text-on-surface"
			}`}
		>
			<OlahflixContent />
		</div>
	);
}
