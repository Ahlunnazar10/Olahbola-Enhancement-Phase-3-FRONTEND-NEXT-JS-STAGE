"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useUIStore } from "@/stores/uiStore";
import { Cookie, X } from "lucide-react";

const COOKIE_CONSENT_KEY = "cookie_consent_given";
/* Cookie-banner stores cookie_consent_given; old AdSlot/cookie-consent reads olahbola-cookie-consent.
   We mirror both keys so ads are pushed regardless of which key is checked. */
const COPIED_KEY = "olahbola-cookie-consent";

function setConsent(value: "accepted" | "declined") {
	localStorage.setItem(COOKIE_CONSENT_KEY, value);
	localStorage.setItem(COPIED_KEY, value);
	// Trigger a soft navigation to re-evaluate consent state
	// We use a tiny setTimeout so the state update batches correctly
	setTimeout(() => {
		window.location.reload();
	}, 0);

	// Push AdSense ad slots if accepted
	if (value === "accepted" && typeof window !== "undefined") {
		try {
			(window.adsbygoogle = window.adsbygoogle || []).push({});
		} catch (e) {
			console.error("AdSense push failed:", e);
		}
	}
}

export default function CookieBanner() {
	const { theme } = useUIStore();
	const isDark = theme === "dark";
	const [showBanner, setShowBanner] = useState(false);

	useEffect(() => {
		const consent = localStorage.getItem(COOKIE_CONSENT_KEY);
		if (!consent) {
			setShowBanner(true);
		}
	}, []);

	if (!showBanner) return null;

	return (
		<div
			className={`fixed bottom-0 left-0 right-0 z-[10000] p-4 md:p-6 transition-all duration-500 ${
				showBanner ? "translate-y-0 opacity-100" : "translate-y-full opacity-0"
			}`}
		>
			<div
				className={`max-w-6xl mx-auto rounded-2xl p-5 md:p-6 shadow-2xl border ${
					isDark
						? "bg-[#0f1412]/95 backdrop-blur-xl border-white/10"
						: "bg-white/95 backdrop-blur-xl border-gray-200"
				}`}
			>
				<div className="flex flex-col md:flex-row items-center gap-4">
					{/* Icon */}
					<div
						className={`flex-shrink-0 w-12 h-12 rounded-full flex items-center justify-center ${
							isDark
								? "bg-[#43decc]/20 text-[#43decc]"
								: "bg-[#0a7c6e]/10 text-[#0a7c6e]"
						}`}
					>
						<Cookie className="w-6 h-6" />
					</div>

					{/* Text */}
					<p
						className={`text-sm leading-relaxed flex-1 text-center md:text-left ${
							isDark ? "text-[#bbcac6]" : "text-[#4a4a4a]"
						}`}
					>
						Situs ini menggunakan{" "}
						<span className="font-semibold">cookie</span> dan teknologi pelacakan serupa untuk
						meningkatkan pengalaman browsing, menganalisis lalu lintas, dan menampilkan konten yang
						relevan. Dengan melanjutkan penggunaan situs ini, Anda menyetujui penggunaan cookie
						seperti yang diuraikan dalam{" "}
						<Link
							href="/kebijakan-privasi"
							className={`underline font-medium hover:no-underline ${
								isDark ? "text-[#43decc]" : "text-[#0a7c6e]"
							}`}
						>
							Kebijakan Privasi
						</Link>{" "}
						kami.
					</p>

					{/* Buttons */}
					<div className="flex items-center gap-2 flex-shrink-0">
						<button
							onClick={() => setConsent("accepted")}
							className={`px-5 py-2.5 rounded-full text-sm font-bold uppercase tracking-wider transition-all active:scale-95 ${
								isDark
									? "bg-[#43decc] text-[#003732] hover:bg-[#3cc2b2]"
									: "bg-[#0a7c6e] text-white hover:bg-[#08655a]"
							}`}
						>
							TERIMA
						</button>
						<button
							onClick={() => setConsent("declined")}
							className={`px-5 py-2.5 rounded-full text-sm font-bold uppercase tracking-wider transition-all border active:scale-95 ${
								isDark
									? "border-white/20 text-[#bbcac6] hover:bg-white/5"
									: "border-gray-300 text-gray-600 hover:bg-gray-50"
							}`}
						>
							TOLAK
						</button>
						<button
							onClick={() => setConsent("declined")}
							className={`p-2.5 rounded-full transition-all ${
								isDark ? "hover:bg-white/5 text-white/50" : "hover:bg-gray-100 text-gray-400"
							}`}
							aria-label="Tutup banner"
						>
							<X className="w-4 h-4" />
						</button>
					</div>
				</div>
			</div>
		</div>
	);
}
