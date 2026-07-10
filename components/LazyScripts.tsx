"use client";

import { useEffect } from "react";

type AnalyticsScriptsProps = {
	gtmId: string;
	gtmDelay?: number;
};

function injectScript(src: string, id?: string) {
	if (id && document.getElementById(id)) return;
	if (document.querySelector(`script[src="${src}"]`)) return;

	const s = document.createElement("script");
	s.src = src;
	if (id) s.id = id;
	s.async = true;
	document.head.appendChild(s);
}

function scheduleAfterIdleOrDelay(
	src: string,
	id: string | undefined,
	delay: number,
	userTriggered: { triggered: boolean },
	onTrigger: () => void,
) {
	if (typeof window === "undefined") return;

	const tryLoad = () => injectScript(src, id);

	const ric =
		(window as any).requestIdleCallback ||
		((cb: IdleRequestCallback) =>
			setTimeout(
				() => cb({ didTimeout: false, timeRemaining: () => 50 } as IdleDeadline),
				1,
			));

	let idleId: number | undefined;
	let timerId: ReturnType<typeof setTimeout> | undefined;

	const start = () => {
		if (userTriggered.triggered) {
			tryLoad();
			return;
		}
		idleId = ric(() => tryLoad());
	};

	timerId = setTimeout(start, delay);

	const events: Array<keyof WindowEventMap> = [
		"scroll",
		"keydown",
		"pointerdown",
		"touchstart",
	];

	const onUserInteract = () => {
		userTriggered.triggered = true;
		if (timerId) clearTimeout(timerId);
		if (idleId !== undefined && (window as any).cancelIdleCallback) {
			(window as any).cancelIdleCallback(idleId);
		}
		tryLoad();
		events.forEach((ev) => window.removeEventListener(ev, onUserInteract));
		onTrigger();
	};

	events.forEach((ev) =>
		window.addEventListener(ev, onUserInteract, {
			once: true,
			passive: true,
		}),
	);
}

/**
 * Loads analytics scripts (GTM) lazily — after idle or user interaction.
 * AdSense is loaded directly by each AdSlot via next/script onLoad, so it
 * matches Google's official guidance and avoids race conditions where
 * AdSlot pushes before the SDK script has loaded.
 */
export function LazyScripts({
	gtmId,
	gtmDelay = 6500,
}: AnalyticsScriptsProps) {
	useEffect(() => {
		if (typeof window === "undefined") return;

		if (!("IntersectionObserver" in window)) {
			injectScript(
				`https://www.googletagmanager.com/gtm.js?id=${gtmId}`,
				"gtm-script",
			);
			return;
		}

		const gtmScriptSrc = `https://www.googletagmanager.com/gtm.js?id=${gtmId}`;
		const gtmTriggered = { triggered: false };

		scheduleAfterIdleOrDelay(
			gtmScriptSrc,
			"gtm-script",
			gtmDelay,
			gtmTriggered,
			() => {
				gtmTriggered.triggered = true;
			},
		);
	}, [gtmId, gtmDelay]);

	return null;
}