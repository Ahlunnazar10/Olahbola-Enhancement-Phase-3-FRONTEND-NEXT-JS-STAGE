"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import {
	Play,
	Pause,
	VolumeX,
	Volume2,
	ChevronUp,
	ChevronDown,
	X,
} from "lucide-react";
import type { Video } from "@/hooks/queries/useOlahflix";
import {
	trackVideoPlay,
	trackVideoPause,
	trackVideoProgress,
	trackVideoMute,
	trackVideoSeek,
	trackVideoComplete,
	trackVideoClose,
} from "@/lib/analytics";
import { formatRelativeTime, formatClock } from "@/lib/utils";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "https://cms.olahbola.com";

function videoUrl(path: string) {
	return `${API_BASE}/storage/${path}`;
}

function thumbnailUrl(path: string) {
	return `${API_BASE}/storage/${path}`;
}

interface OlahflixModalProps {
	videos: Video[];
	activeIndex: number;
	hasMore: boolean;
	onNavigate: (index: number) => void;
	onClose: () => void;
}

export function OlahflixModal({
	videos,
	activeIndex,
	hasMore,
	onNavigate,
	onClose,
}: OlahflixModalProps) {
	const active = videos[activeIndex];
	const next = videos[activeIndex + 1];

	const videoRef = useRef<HTMLVideoElement>(null);
	const [isPlaying, setIsPlaying] = useState(false);
	const isPlayingRef = useRef(false);
	isPlayingRef.current = isPlaying;
	// Default mute saat modal buka; persist ke seluruh video dalam sesi modal ini
	const [muted, setMuted] = useState(true);
	const mutedRef = useRef(true);
	mutedRef.current = muted;
	const [currentTime, setCurrentTime] = useState(0);
	const [duration, setDuration] = useState(0);
	const durationRef = useRef(0);
	durationRef.current = duration;
	const [isBuffering, setIsBuffering] = useState(false);
	const [showControls, setShowControls] = useState(true);
	const hideTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
	const wasPausedByVisibilityRef = useRef(false);

	// Swipe state — pakai ref untuk offset (always latest), state untuk re-render visual
	const touchStartY = useRef(0);
	const touchStartX = useRef(0);
	const swipeOffsetRef = useRef(0);
	const [swipeOffset, setSwipeOffset] = useState(0);
	const isSwipingRef = useRef(false);

	const prevIndex = Math.max(0, activeIndex - 1);
	// Jika di video terakhir page dan masih ada page berikutnya, signal page dengan index out-of-bounds
	const nextIndex = activeIndex + 1;
	const canGoPrev = activeIndex > 0;
	const canGoNext = activeIndex < videos.length - 1 || hasMore;

	// Reset saat activeIndex berubah: replay, track, reset swipe visual
	useEffect(() => {
		const v = videoRef.current;
		if (!v) return;
		v.muted = mutedRef.current;
		v.currentTime = 0;
		setCurrentTime(0);
		setIsBuffering(true);
		wasPausedByVisibilityRef.current = false;
		swipeOffsetRef.current = 0;
		isSwipingRef.current = false;
		setSwipeOffset(0);
		v.play().catch(() => {
			setIsPlaying(false);
		});
		if (active) trackVideoPlay(active.id, active.title, 0, active.duration);
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [activeIndex]);

	// Progress tracking setiap 5 detik, hanya saat playing
	useEffect(() => {
		if (!isPlaying) return;
		const id = setInterval(() => {
			// Guard: pause sudah terjadi tapi re-render belum selesai — skip tick
			if (!isPlayingRef.current) return;
			const v = videoRef.current;
			if (!v || v.paused) return;
			const d = durationRef.current;
			if (!d || d <= 0) return;
			const vid = videos[activeIndex];
			if (!vid) return;
			trackVideoProgress(vid.id, vid.title, v.currentTime, d);
		}, 5000);
		return () => clearInterval(id);
	}, [isPlaying, activeIndex, videos]);

	// Tab visibility: pause fisik + stop tracking saat hidden; resume otomatis saat visible
	useEffect(() => {
		const handler = () => {
			const v = videoRef.current;
			if (!v) return;
			if (document.visibilityState === "hidden") {
				if (isPlayingRef.current) {
					v.pause();
					setIsPlaying(false);
					wasPausedByVisibilityRef.current = true;
					const vid = videos[activeIndex];
					if (vid)
						trackVideoPause(
							vid.id,
							vid.title,
							v.currentTime,
							durationRef.current || undefined,
						);
				}
			} else if (wasPausedByVisibilityRef.current) {
				v.play().catch(() => {});
				setIsPlaying(true);
				wasPausedByVisibilityRef.current = false;
			}
		};
		document.addEventListener("visibilitychange", handler);
		return () => document.removeEventListener("visibilitychange", handler);
	}, [videos, activeIndex]);

	// Auto-hide controls
	const resetControlsTimer = useCallback(() => {
		setShowControls(true);
		if (hideTimer.current) clearTimeout(hideTimer.current);
		hideTimer.current = setTimeout(() => setShowControls(false), 3000);
	}, []);

	useEffect(() => {
		return () => {
			if (hideTimer.current) clearTimeout(hideTimer.current);
		};
	}, []);

	const togglePlay = useCallback(() => {
		const v = videoRef.current;
		const vid = videos[activeIndex];
		if (!v || !vid) return;
		if (v.paused) {
			v.play().catch(() => {});
			setIsPlaying(true);
			wasPausedByVisibilityRef.current = false;
			trackVideoPlay(
				vid.id,
				vid.title,
				v.currentTime,
				durationRef.current || undefined,
			);
		} else {
			v.pause();
			setIsPlaying(false);
			trackVideoPause(
				vid.id,
				vid.title,
				v.currentTime,
				durationRef.current || undefined,
			);
		}
	}, [videos, activeIndex]);

	const toggleMute = useCallback(() => {
		const v = videoRef.current;
		const vid = videos[activeIndex];
		if (!v || !vid) return;
		const next = !v.muted;
		v.muted = next;
		setMuted(next);
		trackVideoMute(vid.id, vid.title, next);
	}, [videos, activeIndex]);

	const handleSeek = useCallback(
		(ratio: number) => {
			const v = videoRef.current;
			const vid = videos[activeIndex];
			if (!v || !vid) return;
			const d = v.duration || 0;
			if (!d) return;
			const toTime = ratio * d;
			v.currentTime = toTime;
			setCurrentTime(toTime);
			trackVideoSeek(vid.id, vid.title, toTime, d);
		},
		[videos, activeIndex],
	);

	const handleClose = useCallback(() => {
		const v = videoRef.current;
		const vid = videos[activeIndex];
		if (vid) {
			trackVideoClose(
				vid.id,
				vid.title,
				v?.currentTime || 0,
				durationRef.current,
			);
		}
		onClose();
	}, [videos, activeIndex, onClose]);

	const goPrev = useCallback(() => {
		if (canGoPrev) onNavigate(prevIndex);
	}, [canGoPrev, onNavigate, prevIndex]);

	const goNext = useCallback(() => {
		if (canGoNext) onNavigate(nextIndex);
	}, [canGoNext, onNavigate, nextIndex]);

	// Keyboard
	useEffect(() => {
		const handler = (e: KeyboardEvent) => {
			if (e.key === "ArrowUp") {
				e.preventDefault();
				goPrev();
			} else if (e.key === "ArrowDown") {
				e.preventDefault();
				goNext();
			} else if (e.key === "Escape") {
				handleClose();
			} else if (e.key === " ") {
				e.preventDefault();
				togglePlay();
			} else if (e.key === "m" || e.key === "M") {
				toggleMute();
			}
		};
		window.addEventListener("keydown", handler);
		return () => window.removeEventListener("keydown", handler);
	}, [goPrev, goNext, handleClose, togglePlay, toggleMute]);

	// Seek drag state
	const seekBarRef = useRef<HTMLDivElement>(null);
	const isSeekingRef = useRef(false);

	const seekFromEvent = useCallback(
		(clientX: number) => {
			const bar = seekBarRef.current;
			if (!bar) return;
			const rect = bar.getBoundingClientRect();
			const ratio = Math.min(
				1,
				Math.max(0, (clientX - rect.left) / rect.width),
			);
			handleSeek(ratio);
		},
		[handleSeek],
	);

	const onSeekPointerDown = useCallback(
		(e: React.PointerEvent<HTMLDivElement>) => {
			e.stopPropagation();
			(e.currentTarget as HTMLDivElement).setPointerCapture(e.pointerId);
			isSeekingRef.current = true;
			seekFromEvent(e.clientX);
		},
		[seekFromEvent],
	);

	const onSeekPointerMove = useCallback(
		(e: React.PointerEvent<HTMLDivElement>) => {
			if (!isSeekingRef.current) return;
			e.stopPropagation();
			seekFromEvent(e.clientX);
		},
		[seekFromEvent],
	);

	const onSeekPointerUp = useCallback(
		(e: React.PointerEvent<HTMLDivElement>) => {
			isSeekingRef.current = false;
			(e.currentTarget as HTMLDivElement).releasePointerCapture(e.pointerId);
		},
		[],
	);

	// Touch swipe (mobile) — visual: translate Y, snap / pindah video
	const onTouchStart = (e: React.TouchEvent) => {
		touchStartY.current = e.touches[0].clientY;
		touchStartX.current = e.touches[0].clientX;
		isSwipingRef.current = true;
	};

	const onTouchMove = (e: React.TouchEvent) => {
		if (!isSwipingRef.current) return;
		const dy = e.touches[0].clientY - touchStartY.current;
		const dx = e.touches[0].clientX - touchStartX.current;
		if (Math.abs(dy) > Math.abs(dx)) {
			swipeOffsetRef.current = dy;
			setSwipeOffset(dy);
		} else {
			// Horizontal swipe dominan — batalkan vertical swipe
			isSwipingRef.current = false;
			swipeOffsetRef.current = 0;
			setSwipeOffset(0);
		}
	};

	const onTouchEnd = () => {
		const threshold = 80;
		const offset = swipeOffsetRef.current;
		if (offset < -threshold && canGoNext) {
			goNext();
		} else if (offset > threshold && canGoPrev) {
			goPrev();
		}
		swipeOffsetRef.current = 0;
		isSwipingRef.current = false;
		// Transition back untuk snap; saat navigate index berubah, reset via useEffect
		setSwipeOffset(0);
	};

	if (!active) return null;

	const progress = duration ? currentTime / duration : 0;

	return (
		<div
			className="fixed inset-0 z-9990 flex items-center justify-center"
			role="dialog"
			aria-modal="true"
		>
			{/* Backdrop */}
			<div
				className="absolute inset-0 bg-black/60 backdrop-blur-sm"
				onClick={handleClose}
			/>

			{/* Content: [title left] [video center with overlay controls] [arrows right] */}
			<div
				className="relative flex flex-col md:flex-row items-center justify-center gap-3 md:gap-6 p-3 md:p-6 w-full h-dvh md:h-[80vh]"
				onClick={(e) => e.stopPropagation()}
				onTouchStart={onTouchStart}
				onTouchMove={onTouchMove}
				onTouchEnd={onTouchEnd}
			>
				{/* ===== WRAPPER CENTER: membungkus title + video + arrows agar grup selalu rata tengah horizontal ===== */}
				<div className="flex flex-col md:flex-row items-center justify-center gap-3 md:gap-6 w-full max-w-6xl md:mr-[38%]">
					{/* ===== TITLE (kiri, desktop) / di atas (mobile) ===== */}
					<div className="md:w-56 lg:w-150 pl-0 md:pl-50 shrink-0 order-first md:order-0 flex flex-col gap-1.5 md:gap-2 md:justify-center max-h-full overflow-y-auto p-1 md:text-left text-center md:items-start items-center">
						<h3 className="text-white md:font-semibold text-[14px] md:text-lg leading-snug px-3 md:px-0">
							{active.title}
						</h3>
						<div className="flex items-center gap-2 justify-center md:justify-start">
							<span className="text-[#00C2B1] text-[10px] font-bold uppercase tracking-wider">
								{active.status}
							</span>
							<span className="text-white/50 text-[12px]">
								{formatRelativeTime(active.created_at)}
							</span>
						</div>
					</div>

					{/* ===== VIDEO + ARROWS ===== */}
					<div
						className="flex flex-col md:flex-row gap-2 md:gap-3 items-center justify-center w-full"
						style={
							swipeOffset !== 0
								? { transform: `translateY(${swipeOffset * 0.4}px)`, transition: "none" }
								: undefined
						}
					>
						{/* ===== VIDEO PLAYER (tengah, control overlay) ===== */}
						<div
							className="relative flex-1 min-w-0 aspect-auto w-90 h-[90vh] max-w-88 max-h-[90vh] rounded-xl overflow-hidden bg-black shadow-2xl transition-transform duration-300"
							style={swipeOffset !== 0 ? { opacity: 0.85 } : undefined}
						>
							<video
								ref={videoRef}
								src={videoUrl(active.video)}
								poster={thumbnailUrl(active.image)}
								controls={false}
								autoPlay
								muted={muted}
								playsInline
								preload="auto"
								className="w-full h-full object-contain cursor-pointer"
								onClick={(e) => {
									e.stopPropagation();
									togglePlay();
									resetControlsTimer();
								}}
								onMouseMove={resetControlsTimer}
								onTouchStartCapture={resetControlsTimer}
								onWaiting={() => setIsBuffering(true)}
								onPlaying={() => {
									setIsBuffering(false);
									setIsPlaying(true);
								}}
								onPause={() => {
									setIsPlaying(false);
									setShowControls(true);
								}}
								onTimeUpdate={(e) => {
									const v = e.currentTarget;
									setCurrentTime(v.currentTime);
								}}
								onLoadedMetadata={(e) => {
									const v = e.currentTarget;
									setDuration(v.duration || 0);
									setIsBuffering(false);
								}}
								onEnded={() => {
									trackVideoComplete(active.id, active.title, duration);
									if (activeIndex < videos.length - 1 || hasMore) {
										onNavigate(activeIndex + 1);
									} else {
										onClose();
									}
								}}
								onError={() => setIsBuffering(false)}
							/>

							{/* Preload next */}
							{next && (
								<video
									src={videoUrl(next.video)}
									preload="metadata"
									className="hidden"
									aria-hidden
								/>
							)}

							{/* Overlay controls: tampil saat paused atau showControls */}
							{(showControls || !isPlaying) && (
								<div className="absolute inset-x-0 bottom-0 p-3 bg-linear-to-t from-black/70 to-transparent">
									{/* Seekbar */}
									<div
										ref={seekBarRef}
										className="relative h-4 flex items-center cursor-pointer mb-1 group/seek touch-none select-none"
										onPointerDown={onSeekPointerDown}
										onPointerMove={onSeekPointerMove}
										onPointerUp={onSeekPointerUp}
									>
										<div className="relative w-full h-1 rounded-full bg-white/20 overflow-hidden">
											<div
												className="h-full rounded-full bg-[#00C2B1]"
												style={{
													width: `${Math.min(100, progress * 100)}%`,
												}}
											/>
										</div>
										<div
											className="absolute w-3 h-3 rounded-full bg-white shadow -translate-x-1/2 opacity-0 group-hover/seek:opacity-100 transition-opacity"
											style={{
												left: `${Math.min(100, progress * 100)}%`,
											}}
										/>
									</div>

									{/* Buttons bar */}
									<div className="flex items-center justify-between">
										<div className="flex items-center gap-3">
											<button
												aria-label={isPlaying ? "Pause" : "Play"}
												onClick={(e) => {
													e.stopPropagation();
													togglePlay();
												}}
												className="w-9 h-9 rounded-full bg-white/10 flex items-center justify-center text-white hover:bg-white/20 transition-colors"
											>
												{isPlaying ? (
													<Pause className="w-4 h-4" fill="currentColor" />
												) : (
													<Play className="w-4 h-4" fill="currentColor" />
												)}
											</button>
											<button
												aria-label={muted ? "Unmute" : "Mute"}
												onClick={(e) => {
													e.stopPropagation();
													toggleMute();
												}}
												className="w-9 h-9 rounded-full bg-white/10 flex items-center justify-center text-white hover:bg-white/20 transition-colors"
											>
												{muted ? (
													<VolumeX className="w-4 h-4" />
												) : (
													<Volume2 className="w-4 h-4" />
												)}
											</button>
										</div>
										<span className="text-white/70 text-[11px] font-mono">
											{formatClock(currentTime)} /{" "}
											{formatClock(duration || active.duration)}
										</span>
									</div>
								</div>
							)}

							{/* Buffering spinner */}
							{isBuffering && (
								<div className="absolute inset-0 flex items-center justify-center pointer-events-none">
									<div className="w-10 h-10 rounded-full border-2 border-white/30 border-t-white animate-spin" />
								</div>
							)}

							{/* Big play overlay saat paused */}
							{!isPlaying && !isBuffering && (
								<button
									aria-label="Play"
									className="absolute inset-0 flex items-center justify-center"
									onClick={(e) => {
										e.stopPropagation();
										togglePlay();
									}}
								>
									<div className="w-14 h-14 rounded-full bg-black/50 flex items-center justify-center">
										<Play className="w-7 h-7 text-white" fill="currentColor" />
									</div>
								</button>
							)}
						</div>

						{/* ===== ARROWS (kanan desktop / bawah mobile) ===== */}
						<div className="md:w-14 shrink-0 flex flex-row md:flex-col items-center justify-center gap-3 md:gap-4 order-last md:order-0">
							<button
								aria-label="Video sebelumnya"
								disabled={!canGoPrev}
								onClick={goPrev}
								className="w-11 h-11 rounded-full bg-white/10 flex items-center justify-center text-white hover:bg-white/20 transition-colors disabled:opacity-20 disabled:cursor-not-allowed"
							>
								<ChevronUp className="w-5 h-5" />
							</button>
							<button
								aria-label="Video berikutnya"
								disabled={!canGoNext}
								onClick={goNext}
								className="w-11 h-11 rounded-full bg-white/10 flex items-center justify-center text-white hover:bg-white/20 transition-colors disabled:opacity-20 disabled:cursor-not-allowed"
							>
								<ChevronDown className="w-5 h-5" />
							</button>
						</div>
					</div>
				</div>

				{/* Close button */}
				<button
					aria-label="Tutup"
					onClick={handleClose}
					className="absolute top-3 right-3 md:-top-15 md:right-3 w-11 h-11 md:w-12 md:h-12 rounded-full bg-white/20 md:bg-primary/70 backdrop-blur-sm flex items-center justify-center text-white hover:bg-white/30 md:hover:bg-primary transition-colors z-20"
				>
					<X className="w-5 h-5 md:w-6 md:h-6" />
				</button>
			</div>
		</div>
	);
}
