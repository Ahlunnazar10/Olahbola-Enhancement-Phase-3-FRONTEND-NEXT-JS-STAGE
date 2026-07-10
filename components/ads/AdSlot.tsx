"use client";

import Script from "next/script";
import { useEffect, useRef, useState } from "react";

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
	loadScript = true,
	fallback,
	minHeight = 90,
}: AdSlotProps) {
	const insRef = useRef<HTMLModElement>(null);
	const pushedRef = useRef(false);
	const [hasConsent, setHasConsent] = useState(false);
	const [shouldRender, setShouldRender] = useState(!lazyLoad);
	const [scriptReady, setScriptReady] = useState(false);
	const [slotWidth, setSlotWidth] = useState(0);

	// Track consent. Poll on mount AND listen for changes so slots mounted
	// before user accepts re-evaluate when consent is given.
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

	// When this AdSlot owns the <Script>, wait for its onLoad.
	// When another component (LazyScripts) loaded the SDK, poll for it.
	useEffect(() => {
		if (loadScript) return;
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

	// Lazy render via IntersectionObserver — also give a generous rootMargin so
	// the slot is rendered well before it scrolls into view.
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

	// Measure the actual rendered width. For format="auto" AdSense needs a real
	// non-zero width to determine which ad size to serve. We use ResizeObserver
	// so layout changes (orientation, container reflow) re-trigger the push.
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

	// Push once when ready, consented, and width is valid.
	useEffect(() => {
		if (!shouldRender || !hasConsent || !client) return;
		if (!scriptReady || pushedRef.current) return;
		const el = insRef.current;
		if (!el) return;

		// Skip if AdSense already filled this slot (auto-fill mode marked it)
		const status = el.getAttribute("data-adsbygoogle-status");
		if (status === "done" || status === "filled") {
			pushedRef.current = true;
			return;
		}

		// Responsive ads need a real layout width before AdSense can size them.
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

	// Reset push guard if consent was revoked so the slot can re-push on accept.
	useEffect(() => {
		if (!hasConsent) pushedRef.current = false;
	}, [hasConsent]);

	if (!client) {
		return fallback ? <div className={className}>{fallback}</div> : null;
	}

	return (
		<div className={`ad-slot my-4 w-full ${className}`} style={style}>
			{loadScript && (
				<Script
					async
					src={`https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${client}`}
					strategy="afterInteractive"
					crossOrigin="anonymous"
					onLoad={() => setScriptReady(true)}
					onError={() =>
						console.error("[AdSlot] AdSense SDK failed to load")
					}
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
					...style,
				}}
				data-ad-client={client}
				data-ad-slot={slot}
				data-ad-format={format}
				data-full-width-responsive={responsive ? "true" : "false"}
			/>

			{/* Reserve a tiny bit of layout space so the <ins> has dimensions
			    before AdSense fills it. Done as a sibling rather than a
			    style on the <ins> so we don't override AdSense's own sizing. */}
			<div style={{ minHeight }} aria-hidden />

			{fallback && <div className="mt-2">{fallback}</div>}
		</div>
	);
}