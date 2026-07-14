"use client";

import { useEffect, useRef, useState } from "react";
import {
	adsbyPush,
	isAdsenseReady,
	loadAdsense,
	whenAdsenseReady,
} from "@/lib/ads/adsense";

type AdFormat =
	| "auto"
	| "horizontal"
	| "vertical"
	| "rectangle"
	| "fluid"
	| "in-article";

interface AdSlotProps {
	slot: string;
	client?: string;
	format?: AdFormat;
	className?: string;
	style?: React.CSSProperties;
	responsive?: boolean;
	label?: string;
	lazyLoad?: boolean;
	fallback?: React.ReactNode;
	minHeight?: number;
}

export const ADSENSE_CONSENT_EVENT = "olahbola:consent-changed";

function hasAcceptedConsent(): boolean {
	if (typeof window === "undefined") return false;
	try {
		const v =
			localStorage.getItem("cookie_consent_given") ||
			localStorage.getItem("olahbola-cookie-consent");
		return v === "accepted" || v === "accept";
	} catch {
		return false;
	}
}

function hasDeclinedConsent(): boolean {
	if (typeof window === "undefined") return false;
	try {
		const v =
			localStorage.getItem("cookie_consent_given") ||
			localStorage.getItem("olahbola-cookie-consent");
		return v === "declined" || v === "decline";
	} catch {
		return false;
	}
}

export default function AdSlot({
	slot,
	client = process.env.NEXT_PUBLIC_ADSENSE_CLIENT,
	format = "auto",
	className = "",
	style,
	responsive = true,
	label = "Advertisement",
	lazyLoad = false,
	fallback,
	minHeight = 90,
}: AdSlotProps) {
	const insRef = useRef<HTMLModElement>(null);
	const pushedRef = useRef(false);
	const [hasConsent, setHasConsent] = useState(true);
	const [shouldRender, setShouldRender] = useState(!lazyLoad);
	const [slotWidth, setSlotWidth] = useState(0);

	// Track consent. Default to true (ads show) — only block when
	// user has explicitly clicked "TOLAK" (declined) via the cookie banner.
	useEffect(() => {
		setHasConsent(!hasDeclinedConsent());
		const onConsent = () => setHasConsent(!hasDeclinedConsent());
		window.addEventListener(ADSENSE_CONSENT_EVENT, onConsent);
		window.addEventListener("storage", onConsent);
		return () => {
			window.removeEventListener(ADSENSE_CONSENT_EVENT, onConsent);
			window.removeEventListener("storage", onConsent);
		};
	}, []);

	// Make sure the AdSense SDK is loaded exactly once. Safe to call from every
	// mount — the loader short-circuits if it's already injected.
	useEffect(() => {
		if (!client) return;
		loadAdsense(client);
	}, [client]);

	// Lazy render via IntersectionObserver — give generous rootMargin so the
	// slot is rendered well before it scrolls into view.
	useEffect(() => {
		if (!lazyLoad) return;
		const el = insRef.current?.parentElement;
		if (!el || typeof IntersectionObserver === "undefined") {
			setShouldRender(true);
			return;
		}
		const observer = new IntersectionObserver(
			(entries) => {
				if (entries.some((e) => e.isIntersecting)) {
					setShouldRender(true);
					observer.disconnect();
				}
			},
			{ rootMargin: "300px" },
		);
		observer.observe(el);
		return () => observer.disconnect();
	}, [lazyLoad]);

	// Measure the actual rendered width. Responsive AdSense slots need a real
	// non-zero width before they can pick a size. We use ResizeObserver so
	// layout changes (orientation, container reflow) re-trigger the push.
	useEffect(() => {
		const el = insRef.current;
		if (!el) return;
		const measure = () => {
			const w = el.offsetWidth || el.getBoundingClientRect().width || 0;
			setSlotWidth(w);
		};
		measure();
		const ro = new ResizeObserver(measure);
		ro.observe(el);
		window.addEventListener("resize", measure);
		return () => {
			ro.disconnect();
			window.removeEventListener("resize", measure);
		};
	}, []);

	// Push once when: rendered, consented, width is valid, and AdSense
	// hasn't already filled this slot. The push itself is queued in the
	// singleton loader, so calling it before the SDK is ready is safe.
	// We attempt push as soon as `shouldRender` becomes true. On the first
	// render we try immediately; if the SDK isn't ready yet we schedule it
	// after a microtask timeout so the browser has time to finish loading
	// the `beforeInteractive` script injected in layout.
	useEffect(() => {
		if (!shouldRender || !hasConsent || !client) return;
		if (pushedRef.current) return;
		const el = insRef.current;
		if (!el) return;

		// Skip if AdSense already filled this slot in a previous push.
		const status = el.getAttribute("data-adsbygoogle-status");
		if (status === "done" || status === "filled") {
			pushedRef.current = true;
			return;
		}

		// Responsive ads need a real layout width before AdSense can size them.
		if (responsive && format === "auto" && slotWidth < 120) return;

		const tryPush = () => {
			if (pushedRef.current) return;
			const current = insRef.current;
			if (!current) return;
			const s = current.getAttribute("data-adsbygoogle-status");
			if (s === "done" || s === "filled") {
				pushedRef.current = true;
				return;
			}
			adsbyPush({});
			pushedRef.current = true;
			if (process.env.NODE_ENV !== "production") {
				console.info(`[AdSlot:${slot}] pushed`, { width: slotWidth });
			}
		};

		// Direct push if SDK is already ready.
		if (isAdsenseReady()) {
			tryPush();
		} else {
			// The `next/script` `beforeInteractive` script will finish loading
			// shortly. Use a microtask fallback (setTimeout 0) to retry once
			// after the current render cycle so the browser has time to process
			// the SDK load. If still not ready, fall back to whenAdsenseReady.
			setTimeout(() => {
				if (pushedRef.current) return;
				if (isAdsenseReady()) {
					tryPush();
				} else {
					whenAdsenseReady(tryPush);
				}
			}, 0);
		}
	}, [shouldRender, hasConsent, client, slotWidth, slot, format, responsive]);

	// Reset push guard if consent was revoked so the slot can re-push on accept.
	useEffect(() => {
		if (!hasConsent) pushedRef.current = false;
	}, [hasConsent]);

	if (!client) {
		return fallback ? <div className={className}>{fallback}</div> : null;
	}

	return (
		<div className={`ad-slot my-4 w-full ${className}`} style={style}>
			{label && (
				<div className="text-[10px] uppercase tracking-widest text-zinc-500 dark:text-zinc-400 mb-2 text-center">
					{label}
				</div>
			)}

			<ins
				ref={insRef}
				className="adsbygoogle block w-full text-center mx-auto"
				style={{ display: "block", width: "100%", ...style }}
				data-ad-client={client}
				data-ad-slot={slot}
				data-ad-format={format}
				data-full-width-responsive={responsive ? "true" : "false"}
			/>

			{/* Reserve layout space below the <ins> so the page doesn't jump when
			    AdSense fills the slot. Placed as a sibling (not on the <ins>) so
			    we never override AdSense's own sizing. */}
			<div style={{ minHeight }} aria-hidden />

			{fallback && <div className="mt-2">{fallback}</div>}
		</div>
	);
}
