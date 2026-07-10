"use client";

import { useEffect, useRef, useState } from "react";
import Script from "next/script";
import { usePathname } from "next/navigation";

declare global {
	interface Window {
		adsbygoogle: any[];
	}
}

export const ADSENSE_CONSENT_EVENT = "olahbola:consent-changed";

function isSdkReady(): boolean {
	if (typeof window === "undefined") return false;
	// adsbygoogle.js defines window.adsbygoogle as an array AND when fully loaded
	// the SDK exposes a non-array object with push/loaded flags. We treat it as
	// ready as soon as the array exists (script tag injected).
	return Array.isArray(window.adsbygoogle);
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
	const adRef = useRef<HTMLModElement>(null);
	const pushedRef = useRef<{ pushed: boolean; lastWidth: number }>({
		pushed: false,
		lastWidth: 0,
	});
	const pathname = usePathname();
	const [hasConsent, setHasConsent] = useState(false);
	const [shouldRender, setShouldRender] = useState(!lazyLoad);
	const [scriptReady, setScriptReady] = useState(false);
	const [slotWidth, setSlotWidth] = useState(0);

	useEffect(() => {
		const checkConsent = () => {
			try {
				const modern = localStorage.getItem("olahbola-cookie-consent");
				const legacy = localStorage.getItem("cookie_consent_given");
				const isAccepted =
					modern === "accept" ||
					modern === "accepted" ||
					legacy === "accepted";
				setHasConsent(isAccepted);
			} catch {
				setHasConsent(false);
			}
		};

		checkConsent();
		window.addEventListener(ADSENSE_CONSENT_EVENT, checkConsent);
		return () =>
			window.removeEventListener(ADSENSE_CONSENT_EVENT, checkConsent);
	}, []);

	// Detect when the global SDK is ready (in case LazyScripts loaded it before this component mounted)
	useEffect(() => {
		if (loadScript) return; // we own the Script tag — onLoad handler will flip state

		let cancelled = false;
		const check = () => {
			if (cancelled) return;
			if (isSdkReady()) {
				setScriptReady(true);
				return;
			}
			setTimeout(check, 200);
		};
		check();
		return () => {
			cancelled = true;
		};
	}, [loadScript]);

	useEffect(() => {
		if (!lazyLoad || !adRef.current) return;

		const observer = new IntersectionObserver(
			(entries) => {
				entries.forEach((entry) => {
					if (entry.isIntersecting) {
						setShouldRender(true);
						observer.disconnect();
					}
				});
			},
			{ rootMargin: "200px" },
		);

		observer.observe(adRef.current);

		return () => observer.disconnect();
	}, [lazyLoad]);

	// Measure the actual rendered width of the <ins> element.
	// format="auto" needs a real width — pushing into a 0-width container makes
	// AdSense return no fill and leaves the slot empty.
	useEffect(() => {
		const el = adRef.current;
		if (!el) return;

		const measure = () => {
			// offsetWidth includes padding+border; getBoundingClientRect().width does
			// not. For a properly-laid-out <ins> with width:100%, offsetWidth gives
			// the actual visible width that AdSense will inherit.
			const w = el.offsetWidth || el.getBoundingClientRect().width || 0;
			setSlotWidth(w);
		};

		// Delay first measurement to next frame so layout has settled
		const raf = requestAnimationFrame(measure);

		const ro = new ResizeObserver(measure);
		ro.observe(el);

		window.addEventListener("resize", measure);
		return () => {
			cancelAnimationFrame(raf);
			ro.disconnect();
			window.removeEventListener("resize", measure);
		};
	}, []);

	useEffect(() => {
		if (!shouldRender || !hasConsent || !client) return;
		if (!scriptReady) return;
		if (!adRef.current) return;
		if (pushedRef.current.pushed) return;

		// If AdSense's auto-fill mode already filled this slot (via a previous
		// push from elsewhere on the page), the SDK marks the <ins> with
		// data-adsbygoogle-status="done". Pushing again throws
		// "All 'ins' elements ... already have ads in them".
		const status = adRef.current.getAttribute("data-adsbygoogle-status");
		if (status === "done" || status === "filled") {
			pushedRef.current.pushed = true;
			console.info(`[AdSlot:${slot}] already filled (status=${status})`);
			return;
		}

		// For "auto" format, AdSense requires a non-zero width to determine ad size.
		// If parent container has 0 width (e.g. inside a collapsed flex/grid),
		// skip the push — the ResizeObserver will retrigger when it grows.
		if (format === "auto" && slotWidth < 100) {
			console.info(
				`[AdSlot:${slot}] waiting for width (current=${slotWidth})`,
			);
			return;
		}

		try {
			(window.adsbygoogle = window.adsbygoogle || []).push({});
			pushedRef.current.pushed = true;
			pushedRef.current.lastWidth = slotWidth;
			console.info(`[AdSlot:${slot}] pushed`, {
				hasConsent,
				scriptReady,
				width: slotWidth,
				client: client?.slice(0, 12),
			});
		} catch (err) {
			console.error("AdSense push failed:", err);
		}
	}, [pathname, shouldRender, hasConsent, client, scriptReady, slotWidth, slot, format]);

	// Reset push guard if consent was revoked — so the slot can re-push on next accept
	useEffect(() => {
		if (!hasConsent) {
			pushedRef.current.pushed = false;
			pushedRef.current.lastWidth = 0;
		}
	}, [hasConsent]);

	// Re-push when width grows past what we initially pushed with.
	// This handles cases where the container reflows after the first push
	// (e.g. responsive breakpoint changes, mobile rotation).
	useEffect(() => {
		if (pushedRef.current.pushed && slotWidth > 100) {
			if (Math.abs(slotWidth - pushedRef.current.lastWidth) > 50) {
				pushedRef.current.pushed = false;
			}
		}
	}, [slotWidth]);

	const handleScriptLoad = () => {
		setScriptReady(true);
	};

	const handleScriptError = () => {
		console.error("AdSense SDK failed to load");
	};

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
					onLoad={handleScriptLoad}
					onError={handleScriptError}
				/>
			)}

			{label && (
				<div className="text-[10px] uppercase tracking-widest text-zinc-500 dark:text-zinc-400 mb-2 text-center">
					{label}
				</div>
			)}

			<ins
				ref={adRef}
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
				data-full-width-responsive={responsive.toString()}
			/>

			{fallback && <div className="mt-2">{fallback}</div>}
		</div>
	);
}