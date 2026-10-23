"use client";

import { useEffect, useRef, type RefObject } from "react";

export function useMarquee(
	enabled: boolean,
	trackRef: RefObject<HTMLDivElement | null>,
	containerRef: RefObject<HTMLDivElement | null>,
	slidesRef: RefObject<HTMLDivElement[]>,
) {
	const stepRef = useRef(0);
	const timerRef = useRef<ReturnType<typeof setTimeout>>(undefined);

	useEffect(() => {
		const el = containerRef.current;
		if (!el) return;
		el.style.overflowX = enabled ? "hidden" : "";
		return () => {
			el.style.overflowX = "";
		};
	}, [enabled, containerRef]);

	useEffect(() => {
		if (!enabled) {
			// Mode manual: reset track ke posisi awal
			stepRef.current = 0;
			clearTimeout(timerRef.current);
			const track = trackRef.current;
			if (track) {
				track.style.transition = "none";
				track.style.transform = "translateX(0)";
			}
			return;
		}

		let active = true;

		const tick = () => {
			if (!active) return;

			const track = trackRef.current;
			const slides = slidesRef.current;
			if (!track || slides.length === 0) {
				// Data masih loading — coba lagi
				timerRef.current = setTimeout(tick, 400);
				return;
			}

			const slideW = slides[0].offsetWidth;
			if (slideW === 0) {
				timerRef.current = setTimeout(tick, 100);
				return;
			}

			// slides.length = N (asli) + N (duplikat) = 2N
			// Batas reset = slide ke-N (batas asli → duplikat)
			const halfCount = slides.length / 2;
			const next = stepRef.current + 1;

			if (next > halfCount) {
				// Reset ke 0 tanpa transisi, force reflow, baru geser
				track.style.transition = "none";
				track.style.transform = "translateX(0)";
				void track.offsetHeight;
				stepRef.current = 0;
			}

			stepRef.current += 1;
			const offset = stepRef.current * slideW;
			track.style.transition = "transform 1.2s cubic-bezier(0.4, 0, 0.2, 1)";
			track.style.transform = `translateX(${-offset}px)`;

			// Jeda 1.8s setelah transisi selesai, baru slide berikutnya
			const onEnd = () => {
				if (!active) return;
				track.removeEventListener("transitionend", onEnd);
				timerRef.current = setTimeout(tick, 1800);
			};
			track.addEventListener("transitionend", onEnd, { once: true });
		};

		timerRef.current = setTimeout(tick, 800);
		return () => {
			active = false;
			clearTimeout(timerRef.current);
		};
	}, [enabled, trackRef, slidesRef, containerRef]);
}
