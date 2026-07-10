"use client";

import { useEffect, useRef, useState } from "react";
import Script from "next/script";

declare global {
	interface Window {
		adsbygoogle: any[];
	}
}

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
	loadScript?: boolean;
	fallback?: React.ReactNode;
	minHeight?: number;
}

export const ADSENSE_CONSENT_EVENT = "olahbola:consent-changed";

function hasAcceptedConsent(): boolean {
	if (typeof window === "undefined") return false;
	try {
		return (
			localStorage.getItem("cookie_consent_given") === "accepted" ||
			localStorage.getItem("olahbola-cookie-consent") === "accepted" ||
			localStorage.getItem("olahbola-cookie-consent") === "accept"
		);
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
	loadScript = false,
	fallback,
	minHeight = 90,
}: AdSlotProps) {
	const insRef = useRef<HTMLModElement>(null);
	const pushedRef = useRef(false);
	const [hasConsent, setHasConsent] = useState(false);
	const [shouldRender, setShouldRender] = useState(!lazyLoad);
	const [scriptReady, setScriptReady] = useState(false);
	const [slotWidth, setSlotWidth] = useState(0);

	// Track consent. We poll once on mount AND listen for changes so any slot
	// (even ones mounted before consent is given) re-evaluates when user accepts.
	useEffect(() => {
		setHasConsent(hasAcceptedConsent());
		const onConsent = () => setHasConsent(hasAcceptedConsent());
		window.addEventListener(ADSENSE_CONSENT_EVENT, onConsent);
		window.addEventListener("storage", onConsent);
		return () => {
			window.removeEventListener(ADSENSE_CONSENT_EVENT, onConsent);
			window.removeEventListener("storage", onConsent);
		};
	}, []);

	// Detect when adsbyglobal script has loaded (either via LazyScripts or this slot's Script tag)
	useEffect(() => {
		if (loadScript) return; // onLoad on <Script> below will flip state
		let cancelled = false;
		const tick = () => {
			if (cancelled) return;
			if (Array.isArray(window.adsbygoogle)) {
				setScriptReady(true);
				return;
			}
			setTimeout(tick, 100);
		};
		tick();
		return () => {
			cancelled = true;
		};
	}, [loadScript]);

	// IntersectionObserver for lazy slots
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
			{ rootMargin: "200px" },
		);
		observer.observe(el);
		return () => observer.disconnect();
	}, [lazyLoad]);

	// Measure width so format="auto" has a real value to size against
	useEffect(() => {
		const el = insRef.current;
		if (!el) return;
		const measure = () => setSlotWidth(el.offsetWidth || 0);
		measure();
		const ro = new ResizeObserver(measure);
		ro.observe(el);
		window.addEventListener("resize", measure);
		return () => {
			ro.disconnect();
			window.removeEventListener("resize", measure);
		};
	}, []);

	// Push once when ready, consented, and width is valid
	useEffect(() => {
		if (!shouldRender || !hasConsent || !client) return;
		if (!scriptReady || pushedRef.current) return;
		const el = insRef.current;
		if (!el) return;

		// Don't double-push if AdSense already filled this slot
		const status = el.getAttribute("data-adsbygoogle-status");
		if (status === "done" || status === "filled") {
			pushedRef.current = true;
			return;
		}

		// For responsive ads, AdSense requires the slot to have layout size
		if (responsive && format === "auto" && slotWidth < 120) {
			return;
		}

		try {
			(window.adsbygoogle = window.adsbygoogle || []).push({});
			pushedRef.current = true;
			if (process.env.NODE_ENV !== "production") {
				console.info(`[AdSlot:${slot}] pushed`, { width: slotWidth });
			}
		} catch (err) {
			console.error("[AdSlot]", slot, "push failed:", err);
		}
	}, [
		shouldRender,
		hasConsent,
		client,
		scriptReady,
		slotWidth,
		slot,
		format,
		responsive,
	]);

	// Reset push guard if consent was revoked — so the slot can re-push on next accept
	useEffect(() => {
		if (!hasConsent) pushedRef.current = false;
	}, [hasConsent]);

	if (!client) {
		return fallback ? <div className={className}>{fallback}</div> : null;
	}

	return (
		<div
			className={`ad-slot my-4 w-full ${className}`}
			style={{ minHeight: `${minHeight}px`, ...style }}
		>
			{loadScript && (
				<Script
					async
					src={`https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${client}`}
					strategy="afterInteractive"
					crossOrigin="anonymous"
					onLoad={() => setScriptReady(true)}
					onError={() => console.error("[AdSlot] AdSense SDK failed to load")}
				/>
			)}

			{label && (
				<div className="text-[10px] uppercase tracking-widest text-zinc-500 dark:text-zinc-400 mb-2 text-center">
					{label}
				</div>
			)}

			<ins
				ref={insRef}
				className="adsbygoogle block w-full text-center mx-auto"
				style={{
					display: "block",
					width: "100%",
					minHeight: `${minHeight}px`,
					...style,
				}}
				data-ad-client={client}
				data-ad-slot={slot}
				data-ad-format={format}
				data-full-width-responsive={responsive ? "true" : "false"}
			/>

			{fallback && <div className="mt-2">{fallback}</div>}
		</div>
	);
}
