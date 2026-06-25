"use client";

import Script from "next/script";
import { useEffect, useRef, useState } from "react";
import { usePathname } from "next/navigation";

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
	fallback,
	minHeight = 90,
}: AdSlotProps) {
	const adRef = useRef<HTMLModElement>(null);
	const pathname = usePathname();
	const [hasConsent, setHasConsent] = useState(false);
	const [shouldRender, setShouldRender] = useState(!lazyLoad);

	useEffect(() => {
		try {
			/* Check BOTH keys — cookie-banner stores "cookie_consent_given" OR "olahbola-cookie-consent",
			   old cookie-consent stored "accept/accept", new cookie-banner stores "accepted/declined" */
			const modern = localStorage.getItem("olahbola-cookie-consent");
			const legacy = localStorage.getItem("cookie_consent_given");
			const isAccepted = modern === "accept" || modern === "accepted" || legacy === "accepted";
			setHasConsent(isAccepted);
		} catch (e) {
			setHasConsent(false);
		}
	}, []);

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

		try {
			(window.adsbygoogle = window.adsbygoogle || []).push({});
		} catch (err) {
			console.error("AdSense push failed:", err);
		}
	}, [pathname, shouldRender, hasConsent, client]);

	if (!client) {
		return fallback ? <div className={className}>{fallback}</div> : null;
	}

	return (
		<div
			className={`ad-slot my-4 ${className}`}
			style={{ minHeight: `${minHeight}px`, ...style }}
		>
			{label && (
				<div className="text-[10px] uppercase tracking-widest text-zinc-500 dark:text-zinc-400 mb-2 text-center">
					{label}
				</div>
			)}

			<Script
				async
				src={`https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${client}`}
				strategy="afterInteractive"
				crossOrigin="anonymous"
			/>

			<ins
				ref={adRef}
				className="adsbygoogle"
				style={{
					display: "block",
					textAlign: "center",
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