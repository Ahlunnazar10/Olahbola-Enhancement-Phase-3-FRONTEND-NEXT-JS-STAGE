// src/utils/translate-cleanup.ts
export const cleanupGoogleTranslate = () => {
	// Clear cookies
	document.cookie = "googtrans=; path=/; max-age=0";

	// Clear hash
	if (typeof window !== "undefined") {
		window.location.hash = "";
	}

	// Remove widget
	const widget = document.getElementById("google_translate_element");
	if (widget) {
		widget.innerHTML = "";
	}

	// Remove all Google Translate elements
	const selectors = [
		".goog-te-banner-frame",
		".goog-te-menu-frame",
		".skiptranslate",
		".goog-te-banner",
		".goog-te-spinner-pos",
		".goog-te-gadget",
	];

	selectors.forEach((selector) => {
		document.querySelectorAll(selector).forEach((el) => {
			if (el.parentNode) {
				el.parentNode.removeChild(el);
			}
		});
	});

	// Remove iframes
	document.querySelectorAll("iframe").forEach((iframe) => {
		if (iframe.src.includes("translate.google")) {
			iframe.parentNode?.removeChild(iframe);
		}
	});

	// Remove styles
	document.querySelectorAll("style, link").forEach((el) => {
		if (
			el.innerHTML.includes("goog") ||
			(el as HTMLLinkElement).href?.includes("translate.google")
		) {
			el.parentNode?.removeChild(el);
		}
	});

	// Remove Google Translate scripts
	document.querySelectorAll("script").forEach((script) => {
		if (script.src.includes("translate.google.com")) {
			script.parentNode?.removeChild(script);
		}
	});

	// Reset HTML lang attribute
	document.documentElement.lang = "id";

	// Force reflow to ensure cleanup
	document.body.style.display = "none";
	document.body.offsetHeight; // Trigger reflow
	document.body.style.display = "";
};