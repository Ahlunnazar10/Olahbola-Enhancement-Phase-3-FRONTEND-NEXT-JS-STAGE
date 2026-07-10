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
	const pushedRef = useRef(false);
	const pathname = usePathname();
	const [hasConsent, setHasConsent] = useState(false);
	const [shouldRender, setShouldRender] = useState(!lazyLoad);
	const [scriptReady, setScriptReady] = useState(false);

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

	useEffect(() => {
		if (!shouldRender || !hasConsent || !client) return;
		if (!scriptReady) return;
		if (!adRef.current) return;
		if (pushedRef.current) return;

		try {
			(window.adsbygoogle = window.adsbygoogle || []).push({});
			pushedRef.current = true;
			console.info(`[AdSlot:${slot}] pushed`, {
				hasConsent,
				scriptReady,
				client: client?.slice(0, 12),
			});
		} catch (err) {
			console.error("AdSense push failed:", err);
		}
	}, [pathname, shouldRender, hasConsent, client, scriptReady, slot]);

	// Reset push guard if consent was revoked — so the slot can re-push on next accept
	useEffect(() => {
		if (!hasConsent) {
			pushedRef.current = false;
		}
	}, [hasConsent]);

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