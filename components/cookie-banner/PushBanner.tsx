"use client";

import { useEffect, useState } from "react";
import { useUIStore } from "@/stores/uiStore";
import { usePushSubscription } from "@/hooks/usePushSubscription";
import { Bell, Check, X } from "lucide-react";
import { toast } from "sonner";

const PUSH_DISMISSED_KEY = "push_banner_dismissed";

export default function PushBanner() {
	const { theme } = useUIStore();
	const isDark = theme === "dark";
	const [show, setShow] = useState(false);
	const { state, registering, subscribe, unsubscribe } = usePushSubscription();

	const isGranted = state === "granted";
	const isDenied = state === "denied" && !isGranted;
	const isUnsupported = state === "unsupported";

	useEffect(() => {
		try {
			const dismissed = localStorage.getItem(PUSH_DISMISSED_KEY);
			const already = localStorage.getItem("push_subscribed") === "true";
			if (already || dismissed === "forever") return;
			setShow(true);
		} catch {}
	}, []);

	// Re-open daily if they dismissed earlier but haven't subscribed.
	useEffect(() => {
		const id = setInterval(() => {
			try {
				const until = localStorage.getItem(PUSH_DISMISSED_KEY);
				const already = localStorage.getItem("push_subscribed") === "true";
				if (until === "forever" || already) return;
				if (until && Number(until) < Date.now() && !already) setShow(true);
			} catch {}
		}, 30_000);
		return () => clearInterval(id);
	}, []);

	// Auto-hide the success banner 3s after subscribing.
	useEffect(() => {
		if (!isGranted) return;
		const id = setTimeout(() => {
			setShow(false);
			try {
				localStorage.setItem("push_subscribed", "true");
			} catch {}
		}, 3000);
		return () => clearTimeout(id);
	}, [isGranted]);

	// On denied: toast then dismiss permanently.
	useEffect(() => {
		if (!isDenied) return;
		toast(
			"Notifikasi diblokir — Tanpa itu kamu akan ketinggalan semua informasi terbaru dari kami.",
			{
				duration: 6000,
			},
		);
		const id = setTimeout(() => {
			setShow(false);
			try {
				localStorage.setItem(PUSH_DISMISSED_KEY, "forever");
			} catch {}
		}, 4000);
		return () => clearTimeout(id);
	}, [isDenied]);

	// If user later re-grants via browser settings, clear the forever flag.
	useEffect(() => {
		if (!isGranted) return;
		try {
			localStorage.removeItem(PUSH_DISMISSED_KEY);
		} catch {}
	}, [isGranted]);

	if (!show) return null;

	const handleSubscribe = async () => {
		await subscribe();
		try {
			if (Notification.permission === "granted") {
				localStorage.setItem("push_subscribed", "true");
				localStorage.removeItem(PUSH_DISMISSED_KEY);
			}
		} catch {}
	};

	const handleClose = () => {
		setShow(false);
		try {
			localStorage.setItem(
				PUSH_DISMISSED_KEY,
				String(Date.now() + 24 * 60 * 60 * 1000),
			);
		} catch {}
	};

	return (
		<div
			className={`fixed bottom-0 left-0 right-0 z-10001 p-4 md:p-6 transition-all duration-500`}
		>
			<div
				className={`max-w-6xl mx-auto rounded-2xl p-5 md:p-6 shadow-2xl border ${
					isDark
						? "bg-[#0f1412]/95 backdrop-blur-xl border-primary/20"
						: "bg-white/95 backdrop-blur-xl border-[#0a7c6e]/15"
				}`}
			>
				<div className="flex flex-col md:flex-row items-center gap-4">
					<div
						className={`shrink-0 w-12 h-12 rounded-full flex items-center justify-center ${
							isDark
								? "bg-primary/20 text-primary"
								: "bg-[#0a7c6e]/10 text-[#0a7c6e]"
						}`}
					>
						{isGranted ? (
							<Check className="w-6 h-6" />
						) : (
							<Bell className="w-6 h-6" />
						)}
					</div>

					<div className="flex-1 text-center md:text-left">
						{isGranted ? (
							<>
								<p
									className={`text-base font-bold ${isDark ? "text-white" : "text-gray-900"}`}
								>
									Notifikasi aktif — kamu akan menerima update artikel, hasil &
									jadwal pertandingan terbaru.
								</p>
							</>
						) : (
							<>
								<p
									className={`text-base font-bold ${isDark ? "text-white" : "text-gray-900"}`}
								>
									{isUnsupported
										? "Browser-mu tidak mendukung notifikasi."
										: isDenied
											? "Notifikasi diblokir — Tanpa itu kamu akan ketinggalan semua informasi terbaru dari kami."
											: "Jangan sampai ketinggalan informasi. Aktifkan notifikasi langsung masuk ke perangkatmu."}
								</p>
								<p
									className={`text-sm mt-1 ${isDark ? "text-on-surface-variant" : "text-gray-500"}`}
								>
									{!isUnsupported && !isDenied && (
										<span>
											Aktifkan notifikasi biar kamu ga ketinggalan informasi
											event, prediksi skor, dan hasil pertandingan. Ratusan
											pengguna lain sudah menerima update lebih dulu.
										</span>
									)}
								</p>
							</>
						)}
					</div>

					<div className="flex items-center gap-2 shrink-0">
						{!isGranted && !isUnsupported && !isDenied && (
							<button
								onClick={handleSubscribe}
								disabled={registering}
								className={`px-5 py-2.5 rounded-full text-sm font-bold uppercase tracking-wider transition-all active:scale-95 disabled:opacity-50 ${
									isDark
										? "bg-primary text-on-primary hover:bg-primary/80"
										: "bg-[#0a7c6e] text-white hover:bg-[#08655a]"
								}`}
							>
								{registering ? "Mengaktifkan..." : "AKTIFKAN SEKARANG"}
							</button>
						)}
						{!isGranted && !isUnsupported && !isDenied && (
							<button
								onClick={handleClose}
								className="p-2 rounded-full transition-colors text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
								aria-label="Dismiss"
							>
								<X className="w-5 h-5" />
							</button>
						)}
					</div>
				</div>
			</div>
		</div>
	);
}
