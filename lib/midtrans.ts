export function loadMidtransSnap(url: string): Promise<void> {
	return new Promise((resolve, reject) => {
		if (typeof document === "undefined") {
			reject(new Error("Midtrans Snap: document not available"));
			return;
		}

		if (document.querySelector(`script[src="${url}"]`)) {
			resolve();
			return;
		}

		const script = document.createElement("script");
		script.src = url;
		script.async = true;
		script.onload = () => resolve();
		script.onerror = () =>
			reject(new Error("Failed to load Midtrans Snap.js"));
		document.head.appendChild(script);
	});
}
