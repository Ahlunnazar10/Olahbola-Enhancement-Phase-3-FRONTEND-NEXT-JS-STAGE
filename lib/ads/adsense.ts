// Singleton AdSense SDK loader.
//
// Why this exists:
// - React StrictMode in dev mounts components twice. Mounting <Script> per-AdSlot
//   re-injects the SDK and we lose the onLoad callback for the second mount,
//   which makes scriptReady false forever.
// - When the user navigates away and back (Next.js client routing), the page is
//   re-rendered. The new <AdSlot> instances should not have to re-load the SDK.
// - We need a single, idempotent place to inject the AdSense script and notify
//   every AdSlot when it's actually ready.
//
// The contract is:
//   loadAdsense(client)         → inject <script src="...adsbygoogle.js"> exactly once
//   whenAdsenseReady(cb)        → call cb once the SDK has initialised window.adsbygoogle
//   adsbyPush(options)          → push a fill request onto the SDK queue
//
// After the SDK loads, window.adsbygoogle is a real array whose push()
// enqueues fill requests; the SDK drains the queue on its own.

declare global {
	interface Window {
		adsbygoogle: any[];
	}
}

let injected = false;
let ready = false;
const readyWaiters: Array<() => void> = [];

const ADSENSE_SRC_PREFIX = "https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js";

export function loadAdsense(client: string): void {
	if (typeof window === "undefined" || !client) return;

	// Already injected (either by us or by another component / past session).
	if (injected) return;
	if (
		document.getElementById("adsbygoogle-script") ||
		document.querySelector(`script[src^="${ADSENSE_SRC_PREFIX}"]`)
	) {
		injected = true;
		markReadyWhenPresent();
		return;
	}

	injected = true;

	const script = document.createElement("script");
	script.id = "adsbygoogle-script";
	script.async = true;
	script.src = `${ADSENSE_SRC_PREFIX}?client=${client}`;
	script.crossOrigin = "anonymous";

	script.addEventListener("load", () => {
		// AdSense defines window.adsbygoogle when it finishes loading. It may
		// already exist as a queue (we initialise it ourselves below) so we
		// simply notify waiters.
		markReady();
	});

	script.addEventListener("error", () => {
		console.error("[adsense] script failed to load");
	});

	// Initialise the queue so any pushes before the SDK loads aren't lost.
	window.adsbygoogle = window.adsbygoogle || [];
	markReadyWhenPresent();
}

function markReadyWhenPresent() {
	// The SDK sets up window.adsbygoogle synchronously on load; once it's an
	// array (not undefined) we know we're safe to push. We poll a few times to
	// handle the case where the SDK is loaded but not yet fully initialised.
	let tries = 0;
	const check = () => {
		if (Array.isArray(window.adsbygoogle)) {
			markReady();
			return;
		}
		if (++tries < 50) setTimeout(check, 100);
	};
	check();
}

function markReady() {
	if (ready) return;
	ready = true;
	const ws = readyWaiters.splice(0);
	ws.forEach((cb) => {
		try {
			cb();
		} catch (err) {
			console.error("[adsense] ready callback failed", err);
		}
	});
}

export function isAdsenseReady(): boolean {
	return ready && Array.isArray(window.adsbygoogle);
}

export function whenAdsenseReady(cb: () => void): void {
	if (isAdsenseReady()) {
		cb();
		return;
	}
	readyWaiters.push(cb);
}

export function adsbyPush(options: Record<string, unknown> = {}): boolean {
	if (typeof window === "undefined") return false;
	if (!isAdsenseReady()) {
		// Queue the push — the SDK drains the queue when it initialises.
		window.adsbygoogle = window.adsbygoogle || [];
		window.adsbygoogle.push(options);
		return false;
	}
	try {
		(window.adsbygoogle as any[]).push(options);
		return true;
	} catch (err) {
		console.error("[adsense] push failed", err);
		return false;
	}
}